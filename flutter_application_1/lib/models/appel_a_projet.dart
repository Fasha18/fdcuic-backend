class AppelAProjet {
  final int id;
  final String titre;
  final String description;
  final String? typeProjet; // structuration | formation | evenementiel
  final String dateDebut;
  final String dateFin;
  final String statut;     // ouvert | fermé
  final String? criteres;
  final String? imageCouverture;

  AppelAProjet({
    required this.id,
    required this.titre,
    required this.description,
    this.typeProjet,
    required this.dateDebut,
    required this.dateFin,
    required this.statut,
    this.criteres,
    this.imageCouverture,
  });

  bool get estOuvert => statut == 'ouvert';

  factory AppelAProjet.fromJson(Map<String, dynamic> json) {
    return AppelAProjet(
      id:             json['id'],
      titre:          json['titre'],
      description:    json['description'],
      typeProjet:     json['type_projet'],
      dateDebut:      json['date_debut'],
      dateFin:        json['date_fin'],
      statut:         json['statut'],
      criteres:       json['criteres'],
      imageCouverture: json['image_couverture'],
    );
  }
}