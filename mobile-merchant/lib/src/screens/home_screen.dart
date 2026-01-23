import 'package:flutter/material.dart';

import '../api_client.dart';
import '../auth_store.dart';
import '../cache_store.dart';
import 'orders_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.onLogout});

  final VoidCallback onLogout;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _index = 0;
  final _client = ApiClient(authStore: AuthStore());
  final _cache = CacheStore();

  @override
  Widget build(BuildContext context) {
    final pages = [
      OrdersScreen(client: _client, cache: _cache),
      _AccountPane(onLogout: widget.onLogout),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Rush Express Merchant')),
      body: pages[_index],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (value) => setState(() => _index = value),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.list), label: 'Orders'),
          BottomNavigationBarItem(icon: Icon(Icons.store), label: 'Account'),
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
          const Text('Your latest orders remain available when offline.'),
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
