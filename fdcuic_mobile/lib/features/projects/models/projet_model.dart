class ProjetModel {
  final int id;
  final String titre;
  final String description;
  final String? typeProjetCode;
  final String? secteurActiviteCode;
  final int budgetPrevisionnel;
  final String statut;
  final String? region;
  final String? departement;

  ProjetModel({
    required this.id,
    required this.titre,
    required this.description,
    this.typeProjetCode,
    this.secteurActiviteCode,
    required this.budgetPrevisionnel,
    required this.statut,
    this.region,
    this.departement,
  });

  factory ProjetModel.fromJson(Map<String, dynamic> json) {
    return ProjetModel(
      id: json['id'],
      titre: json['titre'],
      description: json['description'] ?? '',
      typeProjetCode: json['type_projet_code'],
      secteurActiviteCode: json['secteur_activite_code'],
      budgetPrevisionnel: json['budget_previsionnel'] ?? 0,
      statut: json['statut'] ?? 'brouillon',
      region: json['region'],
      departement: json['departement'],
    );
  }
}
