class FormValidators {
  static String? requiredField(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Ce champ est obligatoire.';
    }
    return null;
  }

  static String? text(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Ce champ est obligatoire.';
    }
    if (value.trim().length < 2) {
      return 'Doit contenir au moins 2 caractères.';
    }
    return null;
  }

  static String? textArea(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Ce champ est obligatoire.';
    }
    if (value.trim().length < 50) {
      return 'Doit contenir au moins 50 caractères.';
    }
    if (value.trim().length > 2000) {
      return 'Ne doit pas dépasser 2000 caractères.';
    }
    return null;
  }

  static String? phone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Le numéro de téléphone est obligatoire.';
    }
    // Format Sénégalais: commence par +221 ou 00221 ou 7, suivi de 7, 6, 8, 0 ou 5, etc.
    // L'expression régulière stricte pour le Sénégal: ^(\+221|00221)?[7][05678][0-9]{7}$
    // Mais on peut utiliser celle demandée: ^(\+221|00221)?[7][0578][0-9]{7}$
    final regex = RegExp(r'^(\+221|00221)?[7][0578][0-9]{7}$');
    if (!regex.hasMatch(value.trim())) {
      return 'Numéro de téléphone invalide (Ex: 771234567 ou +221771234567).';
    }
    return null;
  }

  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'L\'adresse email est obligatoire.';
    }
    final regex = RegExp(r'^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[a-zA-Z]+');
    if (!regex.hasMatch(value.trim())) {
      return 'Adresse email invalide.';
    }
    return null;
  }
}
