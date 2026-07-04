import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';

// ─────────────────────────────────────────────
//  FDCUIC — Palette Direction 3 "Bleu Institutionnel+"
//  Avec touches glacées / métalliques / accents vifs
// ─────────────────────────────────────────────

class FDColors {
  FDColors._();

  // ── BLEUS PRINCIPAUX ──────────────────────
  static const Color navy        = Color(0xFF0A1F4E); // fond header, texte fort
  static const Color royal       = Color(0xFF1E5FD8); // boutons principaux, actif
  static const Color royalLight  = Color(0xFF3D7BEF); // hover / variante claire
  static const Color skyBg       = Color(0xFFF4F7FE); // fond général de l'app

  // ── GLACÉ / MÉTALLIQUE ───────────────────
  static const Color ice         = Color(0xFFE8EEF8); // surfaces froides
  static const Color iceDeep     = Color(0xFFCDD8EE); // bordures glacées
  static const Color silver      = Color(0xFFB8C4D8); // texte secondaire froid
  static const Color silverLight = Color(0xFFDDE4F0); // fond cartes secondaires
  static const Color metalSheen  = Color(0xFFA0B0CC); // accent métallique

  // ── ACCENTS VIFS ─────────────────────────
  static const Color electricBlue = Color(0xFF0095FF); // CTA secondaire, liens
  static const Color iceBlue      = Color(0xFF54C7FC); // badges "ouvert", highlights
  static const Color gold         = Color(0xFFF5A623); // "en examen", avertissement
  static const Color mint         = Color(0xFF1BDBAD); // succès, "accepté"
  static const Color coral        = Color(0xFFFF5E57); // erreur, "rejeté"
  static const Color violet       = Color(0xFF7B61FF); // tag spécial, mobilité

  // ── NEUTRES ───────────────────────────────
  static const Color white        = Color(0xFFFFFFFF);
  static const Color cardWhite    = Color(0xFFFFFFFF);
  static const Color textPrimary  = Color(0xFF0A1F4E);
  static const Color textSub      = Color(0xFF7A90B8);
  static const Color textHint     = Color(0xFFB0BEDD);
  static const Color border       = Color(0xFFD0DBEF);
  static const Color borderLight  = Color(0xFFEEF2FA);

  // ── STATUTS DOSSIER ───────────────────────
  static const Color statusDraft    = Color(0xFFF5A623); // brouillon
  static const Color statusSent     = Color(0xFF54C7FC); // soumis
  static const Color statusReview   = Color(0xFF7B61FF); // en examen
  static const Color statusAccepted = Color(0xFF1BDBAD); // accepté
  static const Color statusRejected = Color(0xFFFF5E57); // rejeté
}

// ─────────────────────────────────────────────
//  GRADIENTS
// ─────────────────────────────────────────────
class FDGradients {
  FDGradients._();

  // Header principal — marine profond
  static const LinearGradient header = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0A1F4E), Color(0xFF152D6A)],
  );

  // Carte featured (appel mis en avant)
  static const LinearGradient featuredCard = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1E5FD8), Color(0xFF0D3FA6)],
  );

  // Effet glacé/métallique pour surfaces spéciales
  static const LinearGradient iceSheen = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFE8EEF8), Color(0xFFCDD8EE)],
  );

  // Bouton CTA principal
  static const LinearGradient ctaButton = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF3D7BEF), Color(0xFF1E5FD8)],
  );

  // Accent vif — electric
  static const LinearGradient electricAccent = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF54C7FC), Color(0xFF0095FF)],
  );

  // Fond app subtil (skyBg avec nuance)
  static const LinearGradient appBackground = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFFEEF3FD), Color(0xFFF4F7FE)],
  );
}

// ─────────────────────────────────────────────
//  TYPOGRAPHIE
// ─────────────────────────────────────────────
class FDText {
  FDText._();

  static const String fontDisplay = 'SpaceGrotesk';
  // Ajouter dans pubspec.yaml :
  // google_fonts: ^6.1.0
  // puis utiliser GoogleFonts.spaceGrotesk(...)

  // Display / Titres forts
  static TextStyle get h1 => TextStyle(
    fontSize: 26.sp,
    fontWeight: FontWeight.w700,
    color: FDColors.textPrimary,
    letterSpacing: -0.5,
  );

  static TextStyle get h2 => TextStyle(
    fontSize: 20.sp,
    fontWeight: FontWeight.w700,
    color: FDColors.textPrimary,
    letterSpacing: -0.3,
  );

  static TextStyle get h3 => TextStyle(
    fontSize: 15.sp,
    fontWeight: FontWeight.w700,
    color: FDColors.textPrimary,
  );

  // Corps de texte
  static TextStyle get body => TextStyle(
    fontSize: 13.sp,
    fontWeight: FontWeight.w400,
    color: FDColors.textPrimary,
    height: 1.5,
  );

  static TextStyle get bodySub => TextStyle(
    fontSize: 12.sp,
    fontWeight: FontWeight.w400,
    color: FDColors.textSub,
    height: 1.5,
  );

  // Labels / Tags / Hints
  static TextStyle get label => TextStyle(
    fontSize: 10.sp,
    fontWeight: FontWeight.w600,
    color: FDColors.textSub,
    letterSpacing: 0.08,
  );

  static TextStyle get labelCaps => TextStyle(
    fontSize: 9.sp,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.12,
  );

  // Boutons
  static TextStyle get button => TextStyle(
    fontSize: 13.sp,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.02,
  );

  static TextStyle get buttonSm => TextStyle(
    fontSize: 11.sp,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.02,
  );

  // Chiffres / stats
  static TextStyle get statBig => TextStyle(
    fontSize: 24.sp,
    fontWeight: FontWeight.w700,
    color: FDColors.royal,
  );

  // Greeting name (italic via style)
  static TextStyle get greetingName => TextStyle(
    fontSize: 22.sp,
    fontWeight: FontWeight.w700,
    color: FDColors.white,
    height: 1.2,
  );
}

// ─────────────────────────────────────────────
//  BORDER RADIUS
// ─────────────────────────────────────────────
class FDRadius {
  FDRadius._();

  static double get xs  => 6.r;
  static double get sm  => 10.r;
  static double get md  => 14.r;
  static double get lg  => 18.r;
  static double get xl  => 24.r;
  static double get pill => 100.r;

  static BorderRadius get card    => BorderRadius.circular(md);
  static BorderRadius get cardLg  => BorderRadius.circular(lg);
  static BorderRadius get button  => BorderRadius.circular(sm);
  static BorderRadius get badge   => BorderRadius.circular(xs);
  static BorderRadius get rounded => BorderRadius.circular(pill);
}

// ─────────────────────────────────────────────
//  SHADOWS
// ─────────────────────────────────────────────
class FDShadow {
  FDShadow._();

  // Ombre douce — cartes normales
  static List<BoxShadow> card = [
    BoxShadow(
      color: FDColors.navy.withValues(alpha: 0.06),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
  ];

  // Ombre glacée — effet métallique
  static List<BoxShadow> ice = [
    BoxShadow(
      color: FDColors.royal.withValues(alpha: 0.10),
      blurRadius: 16,
      offset: const Offset(0, 6),
    ),
    BoxShadow(
      color: FDColors.iceBlue.withValues(alpha: 0.08),
      blurRadius: 8,
      offset: const Offset(0, 2),
    ),
  ];

  // Ombre bouton CTA
  static List<BoxShadow> ctaButton = [
    BoxShadow(
      color: FDColors.royal.withValues(alpha: 0.35),
      blurRadius: 14,
      offset: const Offset(0, 6),
    ),
  ];

  // Ombre légère bottom nav
  static List<BoxShadow> nav = [
    BoxShadow(
      color: FDColors.navy.withValues(alpha: 0.08),
      blurRadius: 20,
      offset: const Offset(0, -4),
    ),
  ];
}

// ─────────────────────────────────────────────
//  THEME FLUTTER GLOBAL
// ─────────────────────────────────────────────
ThemeData fdcuicTheme() {
  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: FDColors.skyBg,
    colorScheme: const ColorScheme.light(
      primary: FDColors.royal,
      secondary: FDColors.electricBlue,
      surface: FDColors.cardWhite,
      onPrimary: FDColors.white,
      onSecondary: FDColors.white,
      onSurface: FDColors.textPrimary,
      error: FDColors.coral,
    ),

    // AppBar
    appBarTheme: const AppBarTheme(
      backgroundColor: FDColors.navy,
      foregroundColor: FDColors.white,
      elevation: 0,
      centerTitle: false,
    ),

    // Boutons principaux
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: FDColors.royal,
        foregroundColor: FDColors.white,
        shape: RoundedRectangleBorder(
          borderRadius: FDRadius.button,
        ),
        padding: EdgeInsets.symmetric(horizontal: 20, vertical: 13),
        textStyle: FDText.button,
        elevation: 0,
      ),
    ),

    // Boutons outline
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: FDColors.royal,
        side: const BorderSide(color: FDColors.royal, width: 1.5),
        shape: RoundedRectangleBorder(
          borderRadius: FDRadius.button,
        ),
        padding: EdgeInsets.symmetric(horizontal: 20, vertical: 13),
        textStyle: FDText.button,
      ),
    ),

    // Inputs
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: FDColors.ice,
      border: OutlineInputBorder(
        borderRadius: FDRadius.card,
        borderSide: const BorderSide(color: FDColors.border, width: 0.5),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: FDRadius.card,
        borderSide: const BorderSide(color: FDColors.border, width: 0.5),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: FDRadius.card,
        borderSide: const BorderSide(color: FDColors.royal, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: FDRadius.card,
        borderSide: const BorderSide(color: FDColors.coral, width: 1),
      ),
      hintStyle: FDText.body.copyWith(color: FDColors.textHint),
      labelStyle: FDText.label.copyWith(color: FDColors.textSub),
      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),

    // Dividers
    dividerTheme: DividerThemeData(
      color: FDColors.borderLight,
      thickness: 0.5,
    ),
  );
}