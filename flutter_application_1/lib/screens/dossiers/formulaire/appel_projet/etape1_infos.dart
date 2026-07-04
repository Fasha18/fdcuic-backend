import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import '../../../../widgets/auth_widgets.dart';
import '../../../../widgets/form_widgets.dart';
import '../../../../services/api_service.dart';
import '../../../../core/theme.dart';
import '../../../../utils/form_validators.dart';

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
  final List<String> _regions = ['Dakar', 'Thiès', 'Diourbel', 'Fatick', 'Kaolack', 'Kaffrine', 'Saint-Louis', 'Louga', 'Matam', 'Tambacounda', 'Kédougou', 'Kolda', 'Ziguinchor', 'Sédhiou'];
  
  List<Map<String, String>> _secteursDyn = [];
  bool _isLoadingSecteurs = true;

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

    _loadSecteurs();
  }

  Future<void> _loadSecteurs() async {
    try {
      final res = await ApiService.getSecteursPublic();
      if (mounted) {
        setState(() {
          _secteursDyn = res.map<Map<String, String>>((e) => {
            'code': e['code'] as String,
            'label': e['label'] as String,
          }).toList();
          _isLoadingSecteurs = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingSecteurs = false;
          // Fallback just in case
          _secteursDyn = [
            {'code': 'claque', 'label': 'Claque'},
            {'code': 'danse_urbaine', 'label': 'Danse urbaine'},
            {'code': 'art_vivant', 'label': 'Art vivant'},
          ];
        });
      }
    }
  }

  String _labelType(String t) {
    switch (t) {
      case 'structuration': return 'Structuration';
      case 'formation': return 'Formation';
      case 'evenementiel': return 'Événementiel';
      default: return t;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: widget.formKey,
      child: SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(20, 24, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FDLabel('Prénom et nom du porteur'),
            SizedBox(height: 6.h),
            FDTextField(
              controller: _prenomNomCtrl, 
              hint: 'Ex: Aminata Diallo', 
              icon: Icons.person_outline_rounded,
              validator: FormValidators.text,
            ),
            SizedBox(height: 16.h),

            FDLabel('Nom de la structure'),
            SizedBox(height: 6.h),
            FDTextField(
              controller: _nomStructureCtrl, 
              hint: 'Ex: Collectif Dakar Urban', 
              icon: Icons.business_outlined,
              validator: FormValidators.text,
            ),
            SizedBox(height: 16.h),

            FDLabel('Type de projet'),
            SizedBox(height: 6.h),
            FDDropdown(
              hint: 'Sélectionner le type',
              value: widget.formData['type_projet'],
              items: _typesProjet,
              labelBuilder: _labelType,
              onChanged: (v) => setState(() => widget.formData['type_projet'] = v),
              validator: FormValidators.requiredField,
            ),
            SizedBox(height: 16.h),

            FDLabel("Secteur d'activité"),
            SizedBox(height: 6.h),
            if (_isLoadingSecteurs)
              Center(child: Padding(
                padding: EdgeInsets.all(8.0),
                child: SizedBox(height: 20.h, width: 20.w, child: CircularProgressIndicator(strokeWidth: 2, color: FDColors.royal)),
              ))
            else
              FDDropdown(
                hint: 'Sélectionner le secteur',
                value: widget.formData['secteur_activite'],
                items: _secteursDyn.map((e) => e['code'] as String).toList(),
                labelBuilder: (code) {
                  final s = _secteursDyn.firstWhere((e) => e['code'] == code, orElse: () => {'label': code});
                  return s['label'] ?? code;
                },
                onChanged: (v) => setState(() => widget.formData['secteur_activite'] = v),
                validator: FormValidators.requiredField,
              ),
            SizedBox(height: 16.h),

            FDLabel('Région'),
            SizedBox(height: 6.h),
            FDDropdown(
              hint: 'Sélectionner la région',
              value: widget.formData['region'],
              items: _regions,
              labelBuilder: (r) => r,
              onChanged: (v) => setState(() => widget.formData['region'] = v),
              validator: FormValidators.requiredField,
            ),
            SizedBox(height: 16.h),

            FDChampTexte(
              "Activité de l'entreprise", 
              _activiteCtrl, 
              "Décrivez l'activité principale de votre structure...",
              validator: FormValidators.textArea,
            ),
            FDChampTexte(
              'Nature du projet', 
              _natureCtrl, 
              'Décrivez la nature de votre projet...',
              validator: FormValidators.textArea,
            ),
          ],
        ),
      ),
    );
  }
}
