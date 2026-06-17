import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme.dart';
import '../../widgets/auth_widgets.dart';

class ProfilScreen extends StatefulWidget {
  const ProfilScreen({super.key});

  @override
  State<ProfilScreen> createState() => _ProfilScreenState();
}

class _ProfilScreenState extends State<ProfilScreen> {
  Map<String, dynamic>? _user;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString('user');
    if (userStr != null) {
      setState(() {
        _user = jsonDecode(userStr);
      });
    }
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
    if (mounted) {
      Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_user == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: FDColors.skyBg,
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.only(top: 60, bottom: 30),
            decoration: const BoxDecoration(gradient: FDGradients.header),
            child: Column(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: const BoxDecoration(
                    color: FDColors.white,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      _user!['nom']?.substring(0, 1).toUpperCase() ?? 'U',
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: FDColors.royal,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  '${_user!['prenom']} ${_user!['nom']}',
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: FDColors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _user!['email'],
                  style: TextStyle(
                    fontSize: 14,
                    color: FDColors.white.withValues(alpha: 0.8),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  _ProfilItem(
                    icon: Icons.phone_outlined,
                    title: 'Téléphone',
                    value: _user!['telephone'] ?? 'Non renseigné',
                  ),
                  const SizedBox(height: 16),
                  _ProfilItem(
                    icon: Icons.verified_user_outlined,
                    title: 'Rôle',
                    value: _user!['role'] ?? 'Candidat',
                  ),
                  const Spacer(),
                  FDButton(
                    label: 'Se déconnecter',
                    onTap: _logout,
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfilItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;

  const _ProfilItem({
    required this.icon,
    required this.title,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: FDColors.white,
        borderRadius: FDRadius.card,
        boxShadow: FDShadow.card,
        border: Border.all(color: FDColors.border, width: 0.5),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: FDColors.ice,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: FDColors.royal, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: FDText.label),
                const SizedBox(height: 2),
                Text(value, style: FDText.body),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
