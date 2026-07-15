import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final token = await ApiService.getToken();
    if (token != null && mounted) {
      Navigator.pushReplacementNamed(context, '/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFFEFF6FF), // bleu très clair
              Color(0xFFDBEAFE), // bleu ciel doux
              Color(0xFFBFDBFE), // bleu pastel
              Color(0xFFFFFFFF), // blanc pur — en bas
            ],
            stops: [0.0, 0.25, 0.5, 0.8], // le blanc arrive à 80% de la page
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // ── ZONE LOGO (occupe la majorité de l'écran) ──
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Logo
                    Image.asset(
                      'assets/images/FDCUIC_logo.png',
                      height: 60.h,
                    ),
                    SizedBox(height: 10.h),
                  ],
                ),
              ),

              // ── ZONE BOUTONS EN BAS ──────────────────────
              Padding(
                padding: EdgeInsets.fromLTRB(28, 0, 28, 48),
                child: Column(
                  children: [
                    // Tagline
                    Text(
                      'Votre espace de gestion de candidatures',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.black.withValues(alpha: 0.4),
                        fontSize: 12.sp,
                      ),
                    ),
                    SizedBox(height: 28.h),

                    // Bouton Se connecter (plein bleu)
                    SizedBox(
                      width: double.infinity,
                      height: 54.h,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pushNamed(context, '/login');
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1A3A8F),
                          foregroundColor: const Color(0xFF1A3A8F),
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: Text(
                          'Se connecter',
                          style: TextStyle(
                            fontSize: 15.sp,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                    SizedBox(height: 14.h),

                    // Bouton Créer un compte (contour bleu)
                    SizedBox(
                      width: double.infinity,
                      height: 54.h,
                      child: OutlinedButton(
                        onPressed: () {
                          Navigator.pushNamed(context, '/register');
                        },
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF1A3A8F),
                          side: const BorderSide(
                            color: Color(0xFF1A3A8F),
                            width: 1.5,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: Text(
                          'Créer un compte',
                          style: TextStyle(
                            fontSize: 15.sp,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
