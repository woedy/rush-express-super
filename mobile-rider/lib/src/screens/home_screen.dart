import 'package:flutter/material.dart';

import '../api_client.dart';
import '../auth_store.dart';
import '../cache_store.dart';
import '../models.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.onLogout});

  final VoidCallback onLogout;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _client = ApiClient(authStore: AuthStore());
  final _cache = CacheStore();
  int _index = 0;
  bool _isOnline = true;
  bool _updatingAvailability = false;
  Order? _activeOrder;

  @override
  void initState() {
    super.initState();
    _loadActive();
  }

  Future<void> _loadActive() async {
    final cached = await _cache.loadActive();
    if (mounted) {
      setState(() {
        _activeOrder = cached;
      });
    }
  }

  Future<void> _setAvailability(bool value) async {
    setState(() {
      _updatingAvailability = true;
    });
    try {
      await _client.setAvailability(value);
      setState(() {
        _isOnline = value;
      });
    } finally {
      if (mounted) {
        setState(() {
          _updatingAvailability = false;
        });
      }
    }
  }

  void _setActiveOrder(Order order) async {
    await _cache.saveActive(order);
    setState(() {
      _activeOrder = order;
      _index = 1;
    });
  }

  void _clearActiveOrder() async {
    await _cache.clearActive();
    setState(() {
      _activeOrder = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      AvailableOrdersScreen(
        client: _client,
        cache: _cache,
        onAccept: _setActiveOrder,
        isOnline: _isOnline,
      ),
      ActiveOrderScreen(
        client: _client,
        order: _activeOrder,
        onComplete: _clearActiveOrder,
      ),
      _AccountPane(onLogout: widget.onLogout),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Rush Express Rider'),
        actions: [
          Row(
            children: [
              const Text('Online'),
              Switch(
                value: _isOnline,
                onChanged: _updatingAvailability ? null : _setAvailability,
              ),
              const SizedBox(width: 12),
            ],
          ),
        ],
      ),
      body: pages[_index],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (value) => setState(() => _index = value),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.list), label: 'Available'),
          BottomNavigationBarItem(icon: Icon(Icons.route), label: 'Active'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Account'),
        ],
      ),
    );
  }
}

class AvailableOrdersScreen extends StatefulWidget {
  const AvailableOrdersScreen({
    super.key,
    required this.client,
    required this.cache,
    required this.onAccept,
    required this.isOnline,
  });

  final ApiClient client;
  final CacheStore cache;
  final ValueChanged<Order> onAccept;
  final bool isOnline;

  @override
  State<AvailableOrdersScreen> createState() => _AvailableOrdersScreenState();
}

class _AvailableOrdersScreenState extends State<AvailableOrdersScreen> {
  bool _loading = true;
  String? _error;
  List<Order> _orders = [];

  @override
  void initState() {
    super.initState();
    _loadCached();
    _fetchOrders();
  }

  Future<void> _loadCached() async {
    final cached = await widget.cache.loadAvailable();
    if (cached.isNotEmpty) {
      setState(() {
        _orders = cached;
      });
    }
  }

  Future<void> _fetchOrders() async {
    if (!widget.isOnline) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final orders = await widget.client.listAvailableOrders();
      setState(() {
        _orders = orders;
      });
      await widget.cache.saveAvailable(orders);
    } catch (_) {
      setState(() {
        _error = 'Unable to load available orders.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _acceptOrder(Order order) async {
    try {
      final accepted = await widget.client.acceptOrder(order.id);
      widget.onAccept(accepted);
    } catch (_) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to accept order.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _fetchOrders,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (!widget.isOnline)
            const Text('Go online to receive orders.'),
          if (_loading) const LinearProgressIndicator(),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(_error!, style: const TextStyle(color: Colors.redAccent)),
            ),
          if (_orders.isEmpty && !_loading)
            const Text('No available orders yet.'),
          ..._orders.map(
            (order) => Card(
              child: ListTile(
                title: Text('Order #${order.id}'),
                subtitle: Text('${order.pickupAddress} → ${order.dropoffAddress}'),
                trailing: ElevatedButton(
                  onPressed: () => _acceptOrder(order),
                  child: const Text('Accept'),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ActiveOrderScreen extends StatefulWidget {
  const ActiveOrderScreen({
    super.key,
    required this.client,
    required this.order,
    required this.onComplete,
  });

  final ApiClient client;
  final Order? order;
  final VoidCallback onComplete;

  @override
  State<ActiveOrderScreen> createState() => _ActiveOrderScreenState();
}

class _ActiveOrderScreenState extends State<ActiveOrderScreen> {
  final _latController = TextEditingController();
  final _lngController = TextEditingController();
  bool _updating = false;

  @override
  void dispose() {
    _latController.dispose();
    _lngController.dispose();
    super.dispose();
  }

  Future<void> _updateStatus(String status) async {
    if (widget.order == null) return;
    setState(() {
      _updating = true;
    });
    try {
      final updated = await widget.client.updateStatus(widget.order!.id, status);
      if (status == 'DELIVERED') {
        widget.onComplete();
      } else {
        setState(() {
          // Keep on screen with latest status.
        });
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Status updated to ${updated.status}.')),
      );
    } catch (_) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to update status.')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _updating = false;
        });
      }
    }
  }

  Future<void> _sendLocation() async {
    if (_latController.text.isEmpty || _lngController.text.isEmpty) return;
    await widget.client.updateLocation(_latController.text, _lngController.text);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Location sent.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.order == null) {
      return const Center(child: Text('No active order.'));
    }
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Order #${widget.order!.id}', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text('Pickup: ${widget.order!.pickupAddress}'),
          const SizedBox(height: 4),
          Text('Dropoff: ${widget.order!.dropoffAddress}'),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            children: [
              ElevatedButton(
                onPressed: _updating ? null : () => _updateStatus('PICKED_UP'),
                child: const Text('Picked up'),
              ),
              ElevatedButton(
                onPressed: _updating ? null : () => _updateStatus('IN_TRANSIT'),
                child: const Text('In transit'),
              ),
              ElevatedButton(
                onPressed: _updating ? null : () => _updateStatus('DELIVERED'),
                child: const Text('Delivered'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text('Send location update'),
          const SizedBox(height: 8),
          TextField(
            controller: _latController,
            decoration: const InputDecoration(labelText: 'Latitude'),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _lngController,
            decoration: const InputDecoration(labelText: 'Longitude'),
          ),
          const SizedBox(height: 8),
          ElevatedButton(
            onPressed: _sendLocation,
            child: const Text('Send location'),
          ),
        ],
      ),
    );
  }
}

class _AccountPane extends StatelessWidget {
  const _AccountPane({required this.onLogout});

  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Offline cache', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Your last available and active orders are cached for offline access.'),
          const Spacer(),
          ElevatedButton.icon(
            onPressed: onLogout,
            icon: const Icon(Icons.logout),
            label: const Text('Sign out'),
          ),
        ],
      ),
    );
  }
}
