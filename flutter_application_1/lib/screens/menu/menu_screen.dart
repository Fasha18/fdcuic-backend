import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

import '../../core/app_colors.dart';
import '../../core/theme_provider.dart';
import '../../core/constants.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
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
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Déconnexion', style: GoogleFonts.sora(fontWeight: FontWeight.w600)),
        content: Text('Voulez-vous vraiment vous déconnecter ?', style: GoogleFonts.sora()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Annuler', style: GoogleFonts.sora(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('Déconnexion', style: GoogleFonts.sora(color: Colors.red, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('token');
      await prefs.remove('user');
      if (mounted) {
        Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDark;
    final c = AppColors(isDark);

    final nom = _user?['nom'] as String? ?? '';
    final prenom = _user?['prenom'] as String? ?? '';
    final email = _user?['email'] as String? ?? '';
    final initial = nom.isNotEmpty ? nom.substring(0, 1).toUpperCase() : 'U';

    return Scaffold(
      backgroundColor: c.bgPrimary,
      body: SafeArea(
        child: Column(
          children: [
            // Header: close button
            Padding(
              padding: EdgeInsets.fromLTRB(24, 16, 24, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Container(
                      width: 42.w,
                      height: 42.h,
                      decoration: BoxDecoration(
                        color: c.bgCard,
                        borderRadius: BorderRadius.circular(13),
                        border: Border.all(color: c.borderMain),
                      ),
                      child: Icon(Icons.close_rounded, color: c.txtPrimary, size: 22),
                    ),
                  ),
                ],
              ),
            ),
            
            // Profil Info (cliquable)
            GestureDetector(
              onTap: () {
                // Remplacer "ProfilScreen" route si elle existe, ou Navigator.push
                Navigator.pushNamed(context, '/profil'); 
              },
              child: Container(
                margin: EdgeInsets.symmetric(horizontal: 24, vertical: 24),
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: c.bgCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: c.borderMain),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 56.w, height: 56.h,
                      decoration: BoxDecoration(
                        color: c.accentPurple,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(initial,
                          style: GoogleFonts.sora(fontSize: 22.sp, fontWeight: FontWeight.w700, color: Colors.white)),
                      ),
                    ),
                    SizedBox(width: 16.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('$prenom $nom',
                            style: GoogleFonts.sora(fontSize: 16.sp, fontWeight: FontWeight.w700, color: c.txtPrimary)),
                          SizedBox(height: 4.h),
                          Text(email,
                            style: GoogleFonts.sora(fontSize: 12.sp, color: c.txtSecondary),
                            maxLines: 1, overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                    Icon(Icons.chevron_right_rounded, color: c.txtSecondary),
                  ],
                ),
              ),
            ),

            // Liste des liens
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  children: [
                    _MenuItem(
                      icon: Icons.home_outlined,
                      label: "Accueil",
                      c: c,
                      onTap: () => Navigator.pop(context),
                    ),
                    _MenuItem(
                      icon: Icons.explore_outlined,
                      label: "Explorer",
                      c: c,
                      onTap: () {
                        // TODO: naviguer vers explorer
                        Navigator.pop(context);
                      },
                    ),
                    _MenuItem(
                      icon: Icons.folder_outlined,
                      label: "Mes Dossiers",
                      c: c,
                      onTap: () {
                        Navigator.pop(context);
                      },
                    ),
                    _MenuItem(
                      icon: Icons.flight_takeoff_rounded,
                      label: "Programme Mobilité",
                      c: c,
                      onTap: () {
                        // TODO
                      },
                    ),
                    _MenuItem(
                      icon: Icons.description_outlined,
                      label: "Documents importants",
                      c: c,
                      onTap: () {
                        // TODO
                      },
                    ),
                    _MenuItem(
                      icon: Icons.notifications_none_rounded,
                      label: "Notifications",
                      c: c,
                      onTap: () {
                        Navigator.pushNamed(context, '/notifications');
                      },
                    ),
                    _MenuItem(
                      icon: Icons.settings_outlined,
                      label: "Paramètres du compte",
                      c: c,
                      onTap: () {
                        Navigator.pushNamed(context, '/profil');
                      },
                    ),

                    SizedBox(height: 24.h),
                    Divider(color: c.borderMain),
                    SizedBox(height: 24.h),

                    _MenuItem(
                      icon: Icons.help_outline_rounded,
                      label: "Aide & Support",
                      c: c,
                      onTap: () {
                        // TODO
                      },
                    ),
                    _MenuItem(
                      icon: Icons.logout_rounded,
                      label: "Se déconnecter",
                      c: c,
                      isDestructive: true,
                      onTap: _logout,
                    ),
                    SizedBox(height: 40.h),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final AppColors c;
  final bool isDestructive;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.label,
    required this.c,
    this.isDestructive = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = isDestructive ? const Color(0xFFEF4444) : c.txtPrimary;
    final iconBg = isDestructive ? const Color(0xFFFEE2E2) : c.bgAccent;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        margin: EdgeInsets.only(bottom: 16.h),
        child: Row(
          children: [
            Container(
              width: 44.w, height: 44.h,
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: isDestructive ? color : c.accentPurple, size: 20),
            ),
            SizedBox(width: 16.w),
            Expanded(
              child: Text(label, style: GoogleFonts.sora(fontSize: 15.sp, fontWeight: FontWeight.w600, color: color)),
            ),
            Icon(Icons.chevron_right_rounded, color: c.txtSecondary, size: 20),
          ],
        ),
      ),
    );
  }
}
