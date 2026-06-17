class ProgrammeMobilite {
  final int id;
  final String titre;
  final String description;
  final String? criteresEligibilite;
  final String? imageCouverture;
  final String statut; // actif | inactif

  ProgrammeMobilite({
    required this.id,
    required this.titre,
    required this.description,
    this.criteresEligibilite,
    this.imageCouverture,
    required this.statut,
  });

  bool get estActif => statut == 'actif';

  factory ProgrammeMobilite.fromJson(Map<String, dynamic> json) {
    return ProgrammeMobilite(
      id:                   json['id'],
      titre:                json['titre'],
      description:          json['description'],
      criteresEligibilite:  json['criteres_eligibilite'],
      imageCouverture:      json['image_couverture'],
      statut:               json['statut'],
    );
  }
}