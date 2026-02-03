import 'dart:convert';

import 'package:http/http.dart' as http;

import 'auth_store.dart';
import 'models.dart';

class ApiClient {
  ApiClient({required this.authStore});

  final AuthStore authStore;

  static const String baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://10.0.2.2:8000',
  );

  Future<AuthTokens> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return AuthTokens.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
    }
    throw Exception('Login failed');
  }

  Future<AuthTokens> register(Map<String, dynamic> payload) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return AuthTokens.fromJson(data);
    }
    throw Exception('Registration failed');
  }

  Future<AuthTokens?> _refreshToken() async {
    final tokens = await authStore.loadTokens();
    if (tokens == null) return null;
    final response = await http.post(
      Uri.parse('$baseUrl/auth/refresh/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refresh': tokens.refresh}),
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final refreshed = AuthTokens.fromJson(
        jsonDecode(response.body) as Map<String, dynamic>,
      );
      await authStore.saveTokens(refreshed);
      return refreshed;
    }
    return null;
  }
  
  Future<http.Response> _authedRequest(Future<http.Response> Function(String token) handler) async {
    final tokens = await authStore.loadTokens();
    if (tokens == null) {
      throw Exception('Not authenticated');
    }
    var response = await handler(tokens.access);
    if (response.statusCode == 401) {
      final refreshed = await _refreshToken();
      if (refreshed != null) {
        response = await handler(refreshed.access);
      }
    }
    return response;
  }

  Future<List<Order>> listOrders() async {
    final response = await _authedRequest((token) {
      return http.get(
        Uri.parse('$baseUrl/api/customer/orders/history/'),
        headers: {'Authorization': 'Bearer $token'},
      );
    });
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final decoded = jsonDecode(response.body) as List<dynamic>;
      return decoded.map((item) => Order.fromJson(item as Map<String, dynamic>)).toList();
    }
    throw Exception('Failed to load orders');
  }

  Future<List<TrackingEvent>> trackingEvents(int orderId) async {
    final response = await _authedRequest((token) {
      return http.get(
        Uri.parse('$baseUrl/api/customer/orders/$orderId/tracking/'),
        headers: {'Authorization': 'Bearer $token'},
      );
    });
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final decoded = jsonDecode(response.body) as Map<String, dynamic>;
      final events = decoded['events'] as List<dynamic>? ?? [];
      return events
          .map((item) => TrackingEvent.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    throw Exception('Failed to load tracking events');
  }
}
