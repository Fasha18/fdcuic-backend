import 'package:flutter_application_1/models/appel_a_projet.dart';

class AppelProjetDossier {
  final int id;
  final int userId;
  final int appelId;
  final String? nomStructure;
  final String? typeProjet;
  final String? secteurActivite;
  final String? region;
  final int etapeCourante;
  final String statut; // brouillon | soumis | en_examen | accepte | rejete
  final String? createdAt;

  // Relation
  final AppelAProjet? appel;

  AppelProjetDossier({
    required this.id,
    required this.userId,
    required this.appelId,
    this.nomStructure,
    this.typeProjet,
    this.secteurActivite,
    this.region,
    required this.etapeCourante,
    required this.statut,
    this.createdAt,
    this.appel,
  });

  factory AppelProjetDossier.fromJson(Map<String, dynamic> json) {
    return AppelProjetDossier(
      id:             json['id'],
      userId:         json['user_id'],
      appelId:        json['appel_id'],
      nomStructure:   json['nom_structure'],
      typeProjet:     json['type_projet'],
      secteurActivite: json['secteur_activite'],
      region:         json['region'],
      etapeCourante:  json['etape_courante'] ?? 1,
      statut:         json['statut'] ?? 'brouillon',
      createdAt:      json['createdAt'],
      appel: json['appel'] != null
          ? AppelAProjet.fromJson(json['appel'])
          : null,
    );
  }
}