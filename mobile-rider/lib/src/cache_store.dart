import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'models.dart';

class CacheStore {
  static const _availableKey = 'available_orders';
  static const _activeKey = 'active_order';

  Future<void> saveAvailable(List<Order> orders) async {
    final prefs = await SharedPreferences.getInstance();
    final payload = jsonEncode(orders.map((order) => order.toJson()).toList());
    await prefs.setString(_availableKey, payload);
  }

  Future<List<Order>> loadAvailable() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_availableKey);
    if (raw == null) return [];
    final decoded = jsonDecode(raw) as List<dynamic>;
    return decoded
        .map((item) => Order.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<void> saveActive(Order order) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_activeKey, jsonEncode(order.toJson()));
  }

  Future<Order?> loadActive() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_activeKey);
    if (raw == null) return null;
    return Order.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }

  Future<void> clearActive() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_activeKey);
  }
}
