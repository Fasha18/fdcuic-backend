class AppelModel {
  final int id;
  final String titre;
  final String description;
  final String? typeProjet;
  final String dateDebut;
  final String dateFin;
  final String statut;
  final String? criteres;
  final String? imageCouverture;

  AppelModel({
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

  factory AppelModel.fromJson(Map<String, dynamic> json) {
    return AppelModel(
      id: json['id'],
      titre: json['titre'],
      description: json['description'] ?? '',
      typeProjet: json['type_projet'],
      dateDebut: json['date_debut'],
      dateFin: json['date_fin'],
      statut: json['statut'] ?? 'ouvert',
      criteres: json['criteres'],
      imageCouverture: json['image_couverture'],
    );
  }
}
