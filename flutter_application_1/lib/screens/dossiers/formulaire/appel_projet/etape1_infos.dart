import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../widgets/auth_widgets.dart';
import '../../../../widgets/form_widgets.dart';
import '../../../../services/api_service.dart';
import '../../../../core/app_colors.dart';
import '../../../../utils/form_validators.dart';

const _kRegions = [
  'Dakar', 'Thiès', 'Diourbel', 'Fatick', 'Kaolack', 'Kaffrine',
  'Saint-Louis', 'Louga', 'Matam', 'Tambacounda', 'Kédougou',
  'Kolda', 'Ziguinchor', 'Sédhiou'
];

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

  // Fallbacks au cas où l'API est inaccessible (ex: Railway non déployé)
  static const List<Map<String, dynamic>> _defaultTypes = [
    {'code': 'structuration', 'label': 'Structuration'},
    {'code': 'formation', 'label': 'Formation'},
    {'code': 'evenementiel', 'label': 'Événementiel'},
  ];

  static const _defaultSecteurs = [
    'Art vivant',
    'Claque',
    'Conception',
    'Danse urbaine',
    'Graffiti',
    'Hiphop',
    'Mode',
    'Sport de rue',
  ];

  // Types: { 'code': ..., 'id': ..., 'label': ... }
  List<Map<String, dynamic>> _typesDyn = _defaultTypes;
  // Secteurs: valeur = nom (identique au web: value={s.nom})
  List<String> _secteursDyn = _defaultSecteurs;
  bool _isLoading = true;

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

    _loadData();
  }

  Future<void> _loadData() async {
    try {
      // GET /api/secteurs/public — le web utilise s.nom comme valeur
      try {
        final resSecteurs = await ApiService.getSecteursPublic();
        if (mounted) {
          setState(() {
            _secteursDyn = resSecteurs
                .map<String>((e) => (e['nom'] ?? e['code'] ?? '').toString())
                .where((n) => n.isNotEmpty)
                .toList();
          });
        }
      } catch (e) {
        debugPrint('Erreur secteurs: $e');
      }

      // GET /api/admin/types-projet/public
      try {
        final resTypes = await ApiService.getTypesProjetPublic();
        if (mounted) {
          setState(() {
            _typesDyn = resTypes.map<Map<String, dynamic>>((e) => {
              'code': e['code'] as String? ?? '',
              'id': e['id'],
              'label': (e['label'] ?? e['nom'] ?? e['code'] ?? '').toString(),
            }).toList();
          });
        }
      } catch (e) {
        debugPrint('Erreur types: $e');
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _prenomNomCtrl.dispose();
    _nomStructureCtrl.dispose();
    _activiteCtrl.dispose();
    _natureCtrl.dispose();
    super.dispose();
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
            if (_isLoading)
              _LoadingField()
            else
              FDDropdown<String>(
                hint: 'Sélectionner le type',
                value: widget.formData['type_projet'],
                items: _typesDyn.map((e) => e['code'] as String).toList(),
                labelBuilder: (code) {
                  final found = _typesDyn.firstWhere(
                    (e) => e['code'] == code,
                    orElse: () => <String, dynamic>{'label': code},
                  );
                  return (found['label'] as String?) ?? code;
                },
                onChanged: (v) {
                  setState(() {
                    widget.formData['type_projet'] = v;
                    final found = _typesDyn.firstWhere(
                      (e) => e['code'] == v,
                      orElse: () => <String, dynamic>{},
                    );
                    widget.formData['type_projet_id'] = found['id'];
                  });
                },
                validator: FormValidators.requiredField,
              ),
            SizedBox(height: 16.h),

            FDLabel("Secteur d'activité"),
            SizedBox(height: 6.h),
            if (_isLoading)
              _LoadingField()
            else
              FDDropdown<String>(
                hint: 'Sélectionner le secteur',
                value: widget.formData['secteur_activite'],
                items: _secteursDyn,
                labelBuilder: (nom) => nom,
                onChanged: (v) => setState(() => widget.formData['secteur_activite'] = v),
                validator: FormValidators.requiredField,
              ),
            SizedBox(height: 16.h),

            FDLabel('Région'),
            SizedBox(height: 6.h),
            FDDropdown<String>(
              hint: 'Sélectionner la région',
              value: widget.formData['region'],
              items: _kRegions,
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

class _LoadingField extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = AppColors(isDark);
    return Container(
      height: 52.h,
      decoration: BoxDecoration(
        color: c.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: c.borderMain),
      ),
      child: Center(
        child: SizedBox(
          height: 18.h,
          width: 18.w,
          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.lightAccent),
        ),
      ),
    );
  }
}
