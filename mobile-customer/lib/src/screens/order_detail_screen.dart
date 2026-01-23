import 'package:flutter/material.dart';

import '../api_client.dart';
import '../cache_store.dart';
import '../models.dart';

class OrderDetailScreen extends StatefulWidget {
  const OrderDetailScreen({
    super.key,
    required this.client,
    required this.cache,
    required this.order,
  });

  final ApiClient client;
  final CacheStore cache;
  final Order order;

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  bool _loading = true;
  String? _error;
  List<TrackingEvent> _events = [];

  @override
  void initState() {
    super.initState();
    _loadCached();
    _fetchEvents();
  }

  Future<void> _loadCached() async {
    final cached = await widget.cache.loadTracking(widget.order.id);
    if (cached.isNotEmpty) {
      setState(() {
        _events = cached;
      });
    }
  }

  Future<void> _fetchEvents() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final events = await widget.client.trackingEvents(widget.order.id);
      setState(() {
        _events = events;
      });
      await widget.cache.saveTracking(widget.order.id, events);
    } catch (error) {
      setState(() {
        _error = 'Unable to load tracking updates.';
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
    return Scaffold(
      appBar: AppBar(title: Text('Order #${widget.order.id}')),
      body: RefreshIndicator(
        onRefresh: _fetchEvents,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text('Status: ${widget.order.status}', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            Text('Dropoff: ${widget.order.dropoffAddress}'),
            const SizedBox(height: 12),
            if (_loading) const LinearProgressIndicator(),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Text(_error!, style: const TextStyle(color: Colors.redAccent)),
              ),
            const Text('Tracking timeline', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (_events.isEmpty && !_loading)
              const Text('No tracking events yet.'),
            ..._events.map(
              (event) => ListTile(
                leading: const Icon(Icons.local_shipping),
                title: Text(event.status),
                subtitle: Text(event.createdAt),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
