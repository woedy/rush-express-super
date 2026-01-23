import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'models.dart';

class CacheStore {
  static const _ordersKey = 'orders_cache';

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
    return decoded.map((item) => Order.fromJson(item as Map<String, dynamic>)).toList();
  }
}
