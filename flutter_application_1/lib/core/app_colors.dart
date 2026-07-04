import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  final bool isDark;
  const AppColors([this.isDark = false]);

  // ── COULEUR OFFICIELLE DU CLIENT ─────────────────────────
  // Extraite directement du logo FDCUIC
  static const brandBlue = Color(0xFF0045BE);

  // ── MODE CLAIR ───────────────────────────────────────────
  static const lightBgPrimary    = Color(0xFFF0F4FF); // fond lavande bleuté
  static const lightBgCard       = Color(0xFFFFFFFF); // fond cartes
  static const lightBgAccent     = Color(0xFFE0E8FF); // fond icônes bleu clair
  static const lightBgHeader     = Color(0xFFF0F4FF); // fond header

  static const lightTxtPrimary   = Color(0xFF060F2E); // texte principal
  static const lightTxtSecondary = Color(0xFF8A9BBD); // texte secondaire
  static const lightTxtMuted     = Color(0xFF4A5A80); // texte discret

  static const lightBorder       = Color(0xFFD0DBFF); // bordures cartes
  static const lightBorderAccent = Color(0xFF90AAEE); // bordures accentuées

  static const lightAccent       = Color(0xFF0045BE); // bleu logo = couleur principale
  static const lightAccentLight  = Color(0xFFE0E8FF); // bleu très clair
  static const lightAccentText   = Color(0xFF0045BE); // texte accent

  static const lightNavBg        = Color(0xFFFFFFFF);
  static const lightNavBorder    = Color(0xFFD0DBFF);
  static const lightNavActive    = Color(0xFF0045BE);
  static const lightNavInactive  = Color(0xFFB0BCDC);
  static const lightNavActiveBg  = Color(0xFFE0E8FF);

  // ── MODE SOMBRE ──────────────────────────────────────────
  static const darkBgPrimary     = Color(0xFF060C1F); // fond très sombre bleuté
  static const darkBgCard        = Color(0xFF0A1430); // fond cartes sombre
  static const darkBgAccent      = Color(0xFF0C1E48); // fond icônes sombre
  static const darkBgHeader      = Color(0xFF060C1F); // fond header sombre

  static const darkTxtPrimary    = Color(0xFFDEE8FF); // texte principal clair
  static const darkTxtSecondary  = Color(0xFF2E4470); // texte secondaire sombre
  static const darkTxtMuted      = Color(0xFF4A6090); // texte discret sombre

  static const darkBorder        = Color(0xFF122050); // bordures sombres
  static const darkBorderAccent  = Color(0xFF1E3A80); // bordures accentuées sombres

  static const darkAccent        = Color(0xFF4D7BF5); // bleu plus clair lisible sur fond sombre
  static const darkAccentLight   = Color(0xFF0C1E48); // bleu très sombre
  static const darkAccentText    = Color(0xFF4D7BF5); // texte accent sombre

  static const darkNavBg         = Color(0xFF060C1F);
  static const darkNavBorder     = Color(0xFF0E1A38);
  static const darkNavActive     = Color(0xFF4D7BF5);
  static const darkNavInactive   = Color(0xFF1A2E55);
  static const darkNavActiveBg   = Color(0xFF0C1E48);

  // ── COULEURS SÉMANTIQUES ─────────────────────────────────
  static const success           = Color(0xFF16A34A);
  static const successBg         = Color(0xFFDCFCE7);
  static const warning           = Color(0xFFCA8A04);
  static const warningBg         = Color(0xFFFEF9C3);
  static const error             = Color(0xFFDC2626);
  static const errorBg           = Color(0xFFFFE4E6);
  static const notifDot          = Color(0xFFFB7185);

  // ── COULEURS CATÉGORIES ──────────────────────────────────
  static const catFormation      = Color(0xFF0045BE);
  static const catFormationBgL   = Color(0xFFE0E8FF);
  static const catFormationBgD   = Color(0xFF0C1E48);

  static const catStructuration  = Color(0xFF0891B2);
  static const catStructBgL      = Color(0xFFE0F7FA);
  static const catStructBgD      = Color(0xFF071918);

  static const catEvenementiel   = Color(0xFFEA580C);
  static const catEventBgL       = Color(0xFFFFF0E8);
  static const catEventBgD       = Color(0xFF1A0E05);

  static const catMobilite       = Color(0xFF3B5FD4);
  static const catMobiliteBgL    = Color(0xFFECF0FF);
  static const catMobiliteBgD    = Color(0xFF0C1840);

  // ── RÉTROCOMPATIBILITÉ AVEC L'ANCIENNE CLASSE INSTANCIÉE ──
  Color get bgPrimary    => isDark ? darkBgPrimary : lightBgPrimary;
  Color get bgCard       => isDark ? darkBgCard : lightBgCard;
  Color get bgAccent     => isDark ? darkBgAccent : lightBgAccent;
  Color get bgHeader     => isDark ? darkBgHeader : lightBgHeader;

  Color get txtPrimary   => isDark ? darkTxtPrimary : lightTxtPrimary;
  Color get txtSecondary => isDark ? darkTxtSecondary : lightTxtSecondary;
  Color get txtMuted     => isDark ? darkTxtMuted : lightTxtMuted;

  Color get borderMain   => isDark ? darkBorder : lightBorder;
  Color get borderAccent => isDark ? darkBorderAccent : lightBorderAccent;

  // On garde le nom "accentPurple" pour ne pas casser le code existant qui l'appelle,
  // mais il retourne le nouveau bleu !
  Color get accentPurple => isDark ? darkAccent : lightAccent;
  Color get accentText   => isDark ? darkAccentText : lightAccentText;

  Color get navBg        => isDark ? darkNavBg : lightNavBg;
  Color get navBorder    => isDark ? darkNavBorder : lightNavBorder;
  Color get navActive    => isDark ? darkNavActive : lightNavActive;
  Color get navInactive  => isDark ? darkNavInactive : lightNavInactive;
  Color get navActiveBg  => isDark ? darkNavActiveBg : lightNavActiveBg;
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
          fontSize: 19.sp,
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
          fontSize: 19.sp,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
