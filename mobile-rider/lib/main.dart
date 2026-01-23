import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'src/auth_store.dart';
import 'src/screens/home_screen.dart';
import 'src/screens/login_screen.dart';
import 'src/screens/register_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
    await FirebaseMessaging.instance.requestPermission();
    await FirebaseMessaging.instance.getToken();
  } catch (_) {
    // Firebase not configured yet.
  }
  runApp(const RushRiderApp());
}

class RushRiderApp extends StatefulWidget {
  const RushRiderApp({super.key});

  @override
  State<RushRiderApp> createState() => _RushRiderAppState();
}

class _RushRiderAppState extends State<RushRiderApp> {
  final _authStore = AuthStore();
  bool _isAuthed = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    final tokens = await _authStore.loadTokens();
    setState(() {
      _isAuthed = tokens != null;
      _isLoading = false;
    });
  }

  void _handleLogout() async {
    await _authStore.clearTokens();
    setState(() {
      _isAuthed = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rush Express Rider',
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.orange),
      home: _isLoading
          ? const Scaffold(body: Center(child: CircularProgressIndicator()))
          : _isAuthed
              ? HomeScreen(onLogout: _handleLogout)
              : _AuthLanding(onAuthenticated: () {
                  setState(() {
                    _isAuthed = true;
                  });
                }),
    );
  }
}

class _AuthLanding extends StatefulWidget {
  const _AuthLanding({required this.onAuthenticated});

  final VoidCallback onAuthenticated;

  @override
  State<_AuthLanding> createState() => _AuthLandingState();
}

class _AuthLandingState extends State<_AuthLanding> {
  bool _showRegister = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rush Express Rider')),
      body: Column(
        children: [
          Expanded(
            child: _showRegister
                ? RegisterScreen(onRegistered: widget.onAuthenticated)
                : LoginScreen(onLogin: widget.onAuthenticated),
          ),
          TextButton(
            onPressed: () => setState(() => _showRegister = !_showRegister),
            child: Text(_showRegister ? 'Have an account? Sign in' : 'New rider? Register'),
          ),
        ],
      ),
    );
  }
}
