import 'package:flutter/material.dart';

import '../api_client.dart';
import '../cache_store.dart';
import '../models.dart';
import 'order_detail_screen.dart';

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
    } catch (error) {
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
              child: Text(
                _error!,
                style: const TextStyle(color: Colors.redAccent),
              ),
            ),
          if (_orders.isEmpty && !_loading)
            const Text('No orders yet. Your deliveries will appear here.'),
          ..._orders.map(
            (order) => Card(
              child: ListTile(
                title: Text('Order #${order.id}'),
                subtitle: Text('${order.dropoffAddress} • ${order.status}'),
                trailing: Text(order.total),
                onTap: () async {
                  await Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => OrderDetailScreen(
                        client: widget.client,
                        cache: widget.cache,
                        order: order,
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
