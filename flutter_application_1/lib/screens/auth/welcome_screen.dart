import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

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
              Color(0xFF0D1B4B), // bleu nuit — tout en haut
              Color(0xFF1A3A8F), // bleu royal
              Color(0xFF2563EB), // bleu vif
              Color(0xFFFFFFFF), // blanc pur — en bas
            ],
            stops: [0.0, 0.2, 0.45, 0.75], // le blanc arrive à 75% de la page
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

                    // Tagline → texte gris foncé
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
                        color: Colors.black.withValues(alpha: 0.4), // ← était blanc
                        fontSize: 12.sp,
                      ),
                    ),
                    SizedBox(height: 28.h),

                    // Bouton Se connecter (plein blanc)
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

                    // Bouton Créer un compte (contour blanc)
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
