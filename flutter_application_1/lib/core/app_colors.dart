import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  final bool isDark;
  const AppColors(this.isDark);

  // Backgrounds
  Color get bgPrimary => isDark ? const Color(0xFF060917) : const Color(0xFFF0F2FF);
  Color get bgCard    => isDark ? const Color(0xFF0B0F26) : const Color(0xFFFFFFFF);
  Color get bgAccent  => isDark ? const Color(0xFF160E38) : const Color(0xFFEDE9FF);
  Color get bgHeader  => isDark ? const Color(0xFF060917) : const Color(0xFFF0F2FF);

  // Textes
  Color get txtPrimary   => isDark ? const Color(0xFFE2E8FF) : const Color(0xFF0D1135);
  Color get txtSecondary => isDark ? const Color(0xFF3D4870) : const Color(0xFF9AA3C4);
  Color get txtMuted     => isDark ? const Color(0xFF6B7BA4) : const Color(0xFF3D4870);

  // Bordures
  Color get borderMain   => isDark ? const Color(0xFF161D3A) : const Color(0xFFDDE1F5);
  Color get borderAccent => isDark ? const Color(0xFF2D1F6E) : const Color(0xFFC4B5FD);

  // Accents
  Color get accentPurple => isDark ? const Color(0xFFA78BFA) : const Color(0xFF7C5CFC);
  Color get accentText   => isDark ? const Color(0xFFA78BFA) : const Color(0xFF7C5CFC);

  // Navigation
  Color get navBg       => isDark ? const Color(0xFF07091A) : const Color(0xFFFFFFFF);
  Color get navBorder   => isDark ? const Color(0xFF0E1228) : const Color(0xFFDDE1F5);
  Color get navActive   => isDark ? const Color(0xFFA78BFA) : const Color(0xFF7C5CFC);
  Color get navInactive => isDark ? const Color(0xFF1C2A4A) : const Color(0xFFC4CAE0);
  Color get navActiveBg => isDark ? const Color(0xFF160E38) : const Color(0xFFEDE9FF);
}

class AppTheme {
  AppTheme._();

  static ThemeData get light {
    final colors = const AppColors(false);
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: colors.bgPrimary,
      primaryColor: colors.accentPurple,
      textTheme: GoogleFonts.soraTextTheme().apply(
        bodyColor: colors.txtPrimary,
        displayColor: colors.txtPrimary,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: colors.bgHeader,
        elevation: 0,
        iconTheme: IconThemeData(color: colors.txtPrimary),
        titleTextStyle: GoogleFonts.sora(
          color: colors.txtPrimary,
          fontSize: 19,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  static ThemeData get dark {
    final colors = const AppColors(true);
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: colors.bgPrimary,
      primaryColor: colors.accentPurple,
      brightness: Brightness.dark,
      textTheme: GoogleFonts.soraTextTheme(ThemeData.dark().textTheme).apply(
        bodyColor: colors.txtPrimary,
        displayColor: colors.txtPrimary,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: colors.bgHeader,
        elevation: 0,
        iconTheme: IconThemeData(color: colors.txtPrimary),
        titleTextStyle: GoogleFonts.sora(
          color: colors.txtPrimary,
          fontSize: 19,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
