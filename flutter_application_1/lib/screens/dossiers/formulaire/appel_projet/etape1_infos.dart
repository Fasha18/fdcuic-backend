import 'package:flutter/material.dart';
import '../../../../widgets/auth_widgets.dart';
import '../../../../widgets/form_widgets.dart';

class Etape1Infos extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final Map<String, dynamic> formData;
  const Etape1Infos({super.key, required this.formKey, required this.formData});

  @override
  State<Etape1Infos> createState() => _Etape1InfosState();
}

class _Etape1InfosState extends State<Etape1Infos> {
  late final TextEditingController _prenomNomCtrl;
  late final TextEditingController _nomStructureCtrl;
  late final TextEditingController _activiteCtrl;
  late final TextEditingController _natureCtrl;

  final List<String> _typesProjet = ['structuration', 'formation', 'evenementiel'];
  final List<String> _secteurs = ['claque', 'danse_urbaine', 'conception', 'sport_de_rue', 'art_vivant', 'mode', 'hiphop', 'graffiti'];
  final List<String> _regions = ['Dakar', 'Thiès', 'Diourbel', 'Fatick', 'Kaolack', 'Kaffrine', 'Saint-Louis', 'Louga', 'Matam', 'Tambacounda', 'Kédougou', 'Kolda', 'Ziguinchor', 'Sédhiou'];

  @override
  void initState() {
    super.initState();
    _prenomNomCtrl = TextEditingController(text: widget.formData['prenom_nom_porteur'] ?? '');
    _nomStructureCtrl = TextEditingController(text: widget.formData['nom_structure'] ?? '');
    _activiteCtrl = TextEditingController(text: widget.formData['activite_entreprise'] ?? '');
    _natureCtrl = TextEditingController(text: widget.formData['nature_projet'] ?? '');

    _prenomNomCtrl.addListener(() => widget.formData['prenom_nom_porteur'] = _prenomNomCtrl.text);
    _nomStructureCtrl.addListener(() => widget.formData['nom_structure'] = _nomStructureCtrl.text);
    _activiteCtrl.addListener(() => widget.formData['activite_entreprise'] = _activiteCtrl.text);
    _natureCtrl.addListener(() => widget.formData['nature_projet'] = _natureCtrl.text);
  }

  String _labelType(String t) {
    switch (t) {
      case 'structuration': return 'Structuration';
      case 'formation': return 'Formation';
      case 'evenementiel': return 'Événementiel';
      default: return t;
    }
  }

  String _labelSecteur(String s) {
    switch (s) {
      case 'danse_urbaine': return 'Danse urbaine';
      case 'sport_de_rue': return 'Sport de rue';
      case 'art_vivant': return 'Art vivant';
      default: return s[0].toUpperCase() + s.substring(1);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: widget.formKey,
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FDLabel('Prénom et nom du porteur'),
            const SizedBox(height: 6),
            FDTextField(controller: _prenomNomCtrl, hint: 'Ex: Aminata Diallo', icon: Icons.person_outline_rounded),
            const SizedBox(height: 16),

            FDLabel('Nom de la structure'),
            const SizedBox(height: 6),
            FDTextField(controller: _nomStructureCtrl, hint: 'Ex: Collectif Dakar Urban', icon: Icons.business_outlined),
            const SizedBox(height: 16),

            FDLabel('Type de projet'),
            const SizedBox(height: 6),
            FDDropdown(
              hint: 'Sélectionner le type',
              value: widget.formData['type_projet'],
              items: _typesProjet,
              labelBuilder: _labelType,
              onChanged: (v) => setState(() => widget.formData['type_projet'] = v),
            ),
            const SizedBox(height: 16),

            FDLabel("Secteur d'activité"),
            const SizedBox(height: 6),
            FDDropdown(
              hint: 'Sélectionner le secteur',
              value: widget.formData['secteur_activite'],
              items: _secteurs,
              labelBuilder: _labelSecteur,
              onChanged: (v) => setState(() => widget.formData['secteur_activite'] = v),
            ),
            const SizedBox(height: 16),

            FDLabel('Région'),
            const SizedBox(height: 6),
            FDDropdown(
              hint: 'Sélectionner la région',
              value: widget.formData['region'],
              items: _regions,
              labelBuilder: (r) => r,
              onChanged: (v) => setState(() => widget.formData['region'] = v),
            ),
            const SizedBox(height: 16),

            FDChampTexte("Activité de l'entreprise", _activiteCtrl, "Décrivez l'activité principale de votre structure..."),
            FDChampTexte('Nature du projet', _natureCtrl, 'Décrivez la nature de votre projet...'),
          ],
        ),
      ),
    );
  }
}
