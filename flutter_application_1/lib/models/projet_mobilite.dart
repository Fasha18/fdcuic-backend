class ProjetMobilite {
  final int id;
  final int userId;
  final String? nomStructure;
  final String? discipline;
  final String? dateDepart;
  final String? dateArrivee;
  final String? paysDestination;
  final String? regionDestination;
  final int etapeCourante;
  final String statut;
  final String? createdAt;

  ProjetMobilite({
    required this.id,
    required this.userId,
    this.nomStructure,
    this.discipline,
    this.dateDepart,
    this.dateArrivee,
    this.paysDestination,
    this.regionDestination,
    required this.etapeCourante,
    required this.statut,
    this.createdAt,
  });

  factory ProjetMobilite.fromJson(Map<String, dynamic> json) {
    return ProjetMobilite(
      id:               json['id'],
      userId:           json['user_id'],
      nomStructure:     json['nom_structure'],
      discipline:       json['discipline'],
      dateDepart:       json['date_depart'],
      dateArrivee:      json['date_arrivee'],
      paysDestination:  json['pays_destination'],
      regionDestination: json['region_destination'],
      etapeCourante:    json['etape_courante'] ?? 1,
      statut:           json['statut'] ?? 'brouillon',
      createdAt:        json['createdAt'],
    );
  }
}