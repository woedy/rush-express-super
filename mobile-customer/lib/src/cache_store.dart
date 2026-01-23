import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'models.dart';

class CacheStore {
  static const _ordersKey = 'orders_cache';
  static const _trackingPrefix = 'tracking_cache_';

  Future<void> saveOrders(List<Order> orders) async {
    final prefs = await SharedPreferences.getInstance();
    final payload = jsonEncode(orders.map((order) => order.toJson()).toList());
    await prefs.setString(_ordersKey, payload);
  }

  Future<List<Order>> loadOrders() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_ordersKey);
    if (raw == null) return [];
    final decoded = jsonDecode(raw) as List<dynamic>;
    return decoded
        .map((item) => Order.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> saveTracking(int orderId, List<TrackingEvent> events) async {
    final prefs = await SharedPreferences.getInstance();
    final payload = jsonEncode(events.map((event) => event.toJson()).toList());
    await prefs.setString('$_trackingPrefix$orderId', payload);
  }

  Future<List<TrackingEvent>> loadTracking(int orderId) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('$_trackingPrefix$orderId');
    if (raw == null) return [];
    final decoded = jsonDecode(raw) as List<dynamic>;
    return decoded
        .map((item) => TrackingEvent.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
