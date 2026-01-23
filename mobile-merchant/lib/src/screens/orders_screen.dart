import 'package:flutter/material.dart';

import '../api_client.dart';
import '../cache_store.dart';
import '../models.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key, required this.client, required this.cache});

  final ApiClient client;
  final CacheStore cache;

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
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
    final cached = await widget.cache.loadOrders();
    if (cached.isNotEmpty) {
      setState(() {
        _orders = cached;
      });
    }
  }

  Future<void> _fetchOrders() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final orders = await widget.client.listOrders();
      setState(() {
        _orders = orders;
      });
      await widget.cache.saveOrders(orders);
    } catch (_) {
      setState(() {
        _error = 'Unable to load orders.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _updateStatus(Order order, String status) async {
    try {
      final updated = await widget.client.updateOrderStatus(order.id, status);
      setState(() {
        _orders = _orders.map((item) => item.id == order.id ? updated : item).toList();
      });
    } catch (_) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to update order status.')),
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
          if (_loading) const LinearProgressIndicator(),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(_error!, style: const TextStyle(color: Colors.redAccent)),
            ),
          if (_orders.isEmpty && !_loading)
            const Text('No orders yet.'),
          ..._orders.map(
            (order) => Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Order #${order.id}', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 4),
                    Text('Pickup: ${order.pickupAddress}'),
                    Text('Dropoff: ${order.dropoffAddress}'),
                    Text('Status: ${order.status}'),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: [
                        ElevatedButton(
                          onPressed: order.status == 'CREATED'
                              ? () => _updateStatus(order, 'CONFIRMED')
                              : null,
                          child: const Text('Confirm'),
                        ),
                        ElevatedButton(
                          onPressed: order.status != 'CANCELED' && order.status != 'DELIVERED'
                              ? () => _updateStatus(order, 'CANCELED')
                              : null,
                          child: const Text('Cancel'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
