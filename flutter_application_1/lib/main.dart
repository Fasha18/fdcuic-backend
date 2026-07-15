import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme_provider.dart';
import 'core/app_colors.dart';
import 'core/theme.dart'; // L'ancien theme si utilisé ailleurs
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
import 'screens/profil/profil_screen.dart';
import 'screens/ressources/ressources_screen.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

void main() {
  runApp(const FDCUICApp());
}

class FDCUICApp extends StatelessWidget {
  const FDCUICApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (ctx, theme, _) => ScreenUtilInit(
          designSize: const Size(390, 844), // iPhone 13/14 format
          minTextAdapt: true,
          splitScreenMode: true,
          builder: (context, child) {
            return MaterialApp(
              title: AppStrings.appName,
              debugShowCheckedModeBanner: false,
              themeMode: theme.mode,
              theme: AppTheme.light,
              darkTheme: AppTheme.dark,
              initialRoute: AppRoutes.welcome,
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
                '/profil': (context) => const ProfilScreen(),
                AppRoutes.ressources: (context) => const RessourcesScreen(),
              },
            );
          },
        ),
      ),
    );
  }
}
