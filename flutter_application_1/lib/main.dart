import 'package:flutter/material.dart';
import 'core/theme.dart';
import 'core/constants.dart';
import 'screens/auth/welcome_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/appels/appels_screen.dart';
import 'screens/dossiers/mes_dossiers_screen.dart';
import 'screens/dossiers/formulaire/appel_projet/appel_form_screen.dart';
import 'screens/dossiers/formulaire/mobilite/mobilite_form_screen.dart';
import 'screens/notifications/notifications_screen.dart';

void main() {
  runApp(const FDCUICApp());
}

class FDCUICApp extends StatelessWidget {
  const FDCUICApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppStrings.appName, // ← AppStrings (pas FDStrings)
      debugShowCheckedModeBanner: false,
      theme: fdcuicTheme(),
      initialRoute: AppRoutes.welcome, // Started at home (Bypass Auth)
      routes: {
        AppRoutes.welcome: (context) => const WelcomeScreen(),
        AppRoutes.login: (context) => const LoginScreen(),
        AppRoutes.register: (context) => const RegisterScreen(),
        AppRoutes.home: (context) => const HomeScreen(),
        AppRoutes.appels: (context) => const AppelsScreen(),
        AppRoutes.dossiers: (context) => const MesDossiersScreen(),
        AppRoutes.formulaireAppel: (context) => const AppelFormScreen(),
        AppRoutes.formulaireMobilite: (context) => const MobiliteFormScreen(),
        AppRoutes.notifs: (context) => const NotificationsScreen(),
      },
    );
  }
}
