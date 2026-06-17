// ─────────────────────────────────────────────
//  FDCUIC — Constants
// ─────────────────────────────────────────────

class AppRoutes {
  AppRoutes._();
  static const String splash = '/';
  // Dans constants.dart, dans AppRoutes :
  static const String welcome = '/welcome';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/home';
  static const String appels = '/appels';
  static const String appelDetail = '/appel-detail';
  static const String dossiers = '/dossiers';
  static const String formulaire = '/formulaire';
  static const String formulaireAppel = '/formulaire-appel';
  static const String formulaireMobilite = '/formulaire-mobilite';
  static const String notifs = '/notifications';
  static const String profil = '/profil';
}

class AppStrings {
  AppStrings._();
  static const String appName = 'FDCUIC';
  static const String tagline = 'Fonds de Développement des Cultures Urbaines';
  static const String loginTitle = 'Bienvenue';
  static const String loginSub = 'Connectez-vous à votre espace candidat';
  static const String homeGreeting = 'Bonjour,';
  static const String homeSub = 'Votre espace candidat';
}

class AppAssets {
  AppAssets._();
  static const String logo = 'assets/images/logo.png';
  static const String logoWhite = 'assets/images/logo_white.png';
  static const String splash = 'assets/images/splash_bg.png';
}

// Types de projets
enum ProjetType { mobilite, evenementiel, structuration, formation }

extension ProjetTypeExt on ProjetType {
  String get label {
    switch (this) {
      case ProjetType.mobilite:
        return 'Mobilité';
      case ProjetType.evenementiel:
        return 'Événementiel';
      case ProjetType.structuration:
        return 'Structuration';
      case ProjetType.formation:
        return 'Formation';
    }
  }

  int get nbEtapes {
    switch (this) {
      case ProjetType.mobilite:
        return 5;
      default:
        return 4;
    }
  }
}

// Statuts dossier
enum DossierStatut { brouillon, soumis, enExamen, accepte, rejete }

extension DossierStatutExt on DossierStatut {
  String get label {
    switch (this) {
      case DossierStatut.brouillon:
        return 'Brouillon';
      case DossierStatut.soumis:
        return 'Soumis';
      case DossierStatut.enExamen:
        return 'En examen';
      case DossierStatut.accepte:
        return 'Accepté';
      case DossierStatut.rejete:
        return 'Rejeté';
    }
  }
}
