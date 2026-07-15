import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import '../../../../core/theme.dart';
import '../../../../widgets/step_progress_bar.dart';
import '../../../../services/api_service.dart';
import '../../../../core/app_colors.dart';
import 'package:google_fonts/google_fonts.dart';
import 'etape1_infos.dart';
import 'etape2_details.dart';
import 'etape3_documents.dart';
import 'etape4_recapitulatif.dart';
import 'etape4_recapitulatif.dart';
import '../../../../models/appel_projet_dossier.dart';

/// Conteneur principal du formulaire Appel à Projet (4 étapes).
class AppelFormScreen extends StatefulWidget {
  const AppelFormScreen({super.key});

  @override
  State<AppelFormScreen> createState() => _AppelFormScreenState();
}

class _AppelFormScreenState extends State<AppelFormScreen> {
  static const int _totalSteps = 4;

  late PageController _pageController;
  int _currentStep = 1;
  bool _isSubmitting = false;
  int? _dossierId;

  // Données du formulaire partagées entre les étapes
  final Map<String, dynamic> formData = {
    // Étape 1
    'prenom_nom_porteur': '',
    'nom_structure': '',
    'type_projet': null,
    'secteur_activite': null,
    'region': null,
    'activite_entreprise': '',
    'nature_projet': '',
    // Étape 2
    'phase_ideation': false,
    'phase_execution': false,
    'objectifs_globaux': '',
    'importance_territoire': '',
    'impacts_economiques': '',
    'potentiel_reussite': '',
    'localisation': '',
    'beneficiaires': '',
    'plan_perennisation': '',
    'description_produit': '',
    'equipe': <Map<String, dynamic>>[],
    // Étape 3
    'documents': <String, String?>{},
  };

  // Clés de formulaire par étape pour validation
  final List<GlobalKey<FormState>> _formKeys = List.generate(
    _totalSteps,
    (_) => GlobalKey<FormState>(),
  );

  static const List<String> _stepLabels = [
    'Infos',
    'Détails',
    'Documents',
    'Récap',
  ];

  int? _appelId;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is int) {
      _appelId = args;
    } else if (args is AppelProjetDossier) {
      _appelId = args.appel?.id;
      _dossierId = args.id;
      _currentStep = args.etapeCourante == 0 ? 1 : args.etapeCourante;
      if (args.rawJson != null) {
        final json = args.rawJson!;
        formData['prenom_nom_porteur'] = json['prenom_nom_porteur'] ?? '';
        formData['nom_structure'] = json['nom_structure'] ?? '';
        formData['type_projet'] = json['type_projet'];
        formData['secteur_activite'] = json['secteur_activite'];
        formData['region'] = json['region'];
        formData['activite_entreprise'] = json['activite_entreprise'] ?? '';
        formData['nature_projet'] = json['nature_projet'] ?? '';
        
        formData['phase_ideation'] = json['phase_ideation'] == true;
        formData['phase_execution'] = json['phase_execution'] == true;
        formData['objectifs_globaux'] = json['objectifs_globaux'] ?? '';
        formData['importance_territoire'] = json['importance_territoire'] ?? '';
        formData['impacts_economiques'] = json['impacts_economiques'] ?? '';
        formData['potentiel_reussite'] = json['potentiel_reussite'] ?? '';
        formData['localisation'] = json['localisation'] ?? '';
        formData['beneficiaires'] = json['beneficiaires'] ?? '';
        formData['plan_perennisation'] = json['plan_perennisation'] ?? '';
        formData['description_produit'] = json['description_produit'] ?? '';
        
        if (json['equipe'] is List) {
          formData['equipe'] = List<Map<String, dynamic>>.from(json['equipe']);
        }
        
        if (json['documents_soumis'] is List) {
          final docs = <String, String?>{};
          for (var doc in json['documents_soumis']) {
            if (doc is Map) {
              docs[doc['nom_document']] = doc['chemin_fichier'] ?? doc['label'];
            }
          }
          formData['documents'] = docs;
        }
      }
    }
    _pageController = PageController(initialPage: _currentStep - 1);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  bool _validateCurrentStep() {
    bool isValid = true;
    if (_currentStep == 1) {
      final req = ['prenom_nom_porteur', 'nom_structure', 'type_projet', 'secteur_activite', 'region', 'activite_entreprise', 'nature_projet'];
      for (var k in req) {
        if (formData[k] == null || formData[k].toString().trim().isEmpty) isValid = false;
      }
    } else if (_currentStep == 2) {
      final req = ['objectifs_globaux', 'importance_territoire', 'impacts_economiques', 'potentiel_reussite', 'localisation', 'beneficiaires', 'plan_perennisation', 'description_produit'];
      for (var k in req) {
        if (formData[k] == null || formData[k].toString().trim().isEmpty) isValid = false;
      }
      if (formData['phase_ideation'] != true && formData['phase_execution'] != true) {
        isValid = false;
      }
      final equipe = formData['equipe'] as List?;
      if (equipe == null || equipe.isEmpty) {
        isValid = false;
      } else {
        for (var member in equipe) {
          if (member is Map) {
            final prenom = member['prenom']?.toString().trim() ?? '';
            final nom = member['nom']?.toString().trim() ?? '';
            final poste = member['poste']?.toString().trim() ?? '';
            final telephone = member['telephone']?.toString().trim() ?? '';
            if (prenom.isEmpty || nom.isEmpty || poste.isEmpty || telephone.isEmpty) {
              isValid = false;
              break;
            }
          }
        }
      }
    }
    
    if (!isValid) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Veuillez remplir tous les champs de cette étape pour continuer.'),
        backgroundColor: AppColors.error,
        duration: Duration(seconds: 2),
      ));
    }
    return isValid;
  }

  void _goToStep(int step) {
    if (step < 1 || step > _totalSteps) return;

    // Valider l'étape courante avant d'avancer
    if (step > _currentStep) {
      if (!_validateCurrentStep()) return;
      
      final formKey = _formKeys[_currentStep - 1];
      if (formKey.currentState != null && !formKey.currentState!.validate()) {
        return;
      }
      formKey.currentState?.save();
    }

    setState(() => _currentStep = step);
    _pageController.animateToPage(
      step - 1,
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeInOut,
    );
  }

  void _nextStep() => _goToStep(_currentStep + 1);
  void _prevStep() => _goToStep(_currentStep - 1);

  Future<int> _syncDraft() async {
    int dId;

    if (_dossierId != null) {
      dId = _dossierId!;
    } else {
      // Créer le brouillon (étape 1) 
      try {
        dId = await ApiService.etape1Appel({
          'appel_id': _appelId,
          'prenom_nom_porteur': formData['prenom_nom_porteur'],
          'nom_structure': formData['nom_structure'],
          'type_projet': formData['type_projet'],
          'secteur_activite': formData['secteur_activite'],
          'region': formData['region'],
          'activite_entreprise': formData['activite_entreprise'],
          'nature_projet': formData['nature_projet'],
        });
        setState(() {
          _dossierId = dId;
        });
      } catch (e) {
        throw Exception('Échec Etape 1: $e');
      }
    }

    // Sync étape 2 si valide
    if (_formKeys[1].currentState?.validate() ?? false) {
      _formKeys[1].currentState?.save();
      
      final sanitizedEquipe = (formData['equipe'] as List).map((m) {
        final member = Map<String, dynamic>.from(m);
        if (member['telephone'] != null) {
          member['telephone'] = member['telephone'].toString().replaceAll(RegExp(r'\s+'), '');
        }
        return member;
      }).toList();

      try {
        await ApiService.etape2Appel(dId, {
          'phase_ideation': formData['phase_ideation'],
          'phase_execution': formData['phase_execution'],
          'objectifs_globaux': formData['objectifs_globaux'],
          'importance_territoire': formData['importance_territoire'],
          'impacts_economiques': formData['impacts_economiques'],
          'potentiel_reussite': formData['potentiel_reussite'],
          'localisation': formData['localisation'],
          'beneficiaires': formData['beneficiaires'],
          'plan_perennisation': formData['plan_perennisation'],
          'description_produit': formData['description_produit'],
          'equipe': sanitizedEquipe,
        });
      } catch (e) {
        throw Exception('Échec Etape 2: $e');
      }
    }

    // L'étape 3 (Documents) est ignorée ici car les documents sont
    // uploadés individuellement de façon immédiate via uploadDocumentUniqueAppel.
    
    return dId;
  }

  Future<void> _submitDossier() async {
    // Valider la dernière étape
    final formKey = _formKeys[_currentStep - 1];
    if (formKey.currentState != null && !formKey.currentState!.validate()) {
      return;
    }
    formKey.currentState?.save();

    setState(() => _isSubmitting = true);

    try {
      // Synchroniser le brouillon complet
      final dId = await _syncDraft();

      // 4. Soumettre le dossier final
      await ApiService.soumettreAppel(dId);

      if (!mounted) return;

      // Afficher succès
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(FDRadius.md),
          ),
          title: Row(
            children: [
              Container(
                padding: EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: FDColors.mint.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.check_circle_outline,
                    color: FDColors.mint, size: 24),
              ),
              SizedBox(width: 12.w),
              Expanded(
                child: Text('Dossier soumis !', style: FDText.h3),
              ),
            ],
          ),
          content: Text(
            'Votre dossier a été soumis avec succès. '
            'Vous pouvez suivre son avancement depuis « Mes Dossiers ».',
            style: FDText.body,
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
              },
              child: Text('OK'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Erreur: $e'),
        backgroundColor: FDColors.coral,
      ));
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = AppColors(isDark);

    return Scaffold(
      backgroundColor: c.bgPrimary,
      body: Column(
        children: [
          // ── HEADER ────────────────────────────────────────
          _buildHeader(),

          // ── CONTENU ÉTAPES ────────────────────────────────
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                Etape1Infos(
                  formKey: _formKeys[0],
                  formData: formData,
                ),
                Etape2Details(
                  formKey: _formKeys[1],
                  formData: formData,
                ),
                Etape3Documents(
                  formKey: _formKeys[2],
                  formData: formData,
                  typeProjetCode: formData['type_projet'],
                  onSyncDraft: _syncDraft,
                ),
                Etape4Recapitulatif(
                  formKey: _formKeys[3],
                  formData: formData,
                  onEditStep: _goToStep,
                ),
              ],
            ),
          ),

          // ── BOUTONS NAVIGATION ────────────────────────────
          _buildBottomBar(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = AppColors(isDark);

    return Container(
      color: c.bgHeader,
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: EdgeInsets.fromLTRB(16, 12, 16, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Titre + bouton retour
              Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      padding: EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: c.bgCard,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: c.borderMain),
                      ),
                      child: Icon(
                        Icons.arrow_back_ios_new_rounded,
                        color: c.txtPrimary,
                        size: 18,
                      ),
                    ),
                  ),
                  SizedBox(width: 12.w),
                  Expanded(
                    child: Text(
                      'Appel à Projet',
                      style: GoogleFonts.sora(
                        color: c.txtPrimary,
                        fontSize: 20.sp,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  // Badge étape
                  Container(
                    padding: EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: c.accentPurple.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: c.accentPurple.withValues(alpha: 0.3)),
                    ),
                    child: Text(
                      '$_currentStep / $_totalSteps',
                      style: GoogleFonts.sora(
                        color: c.accentPurple,
                        fontSize: 11.sp,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 20.h),

              // Barre d'étapes
              StepProgressBar(
                currentStep: _currentStep,
                totalSteps: _totalSteps,
                labels: _stepLabels,
                activeColor: c.accentPurple,
                inactiveColor: c.txtSecondary,
                completedColor: AppColors.success,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomBar() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = AppColors(isDark);
    
    return Container(
      padding: EdgeInsets.fromLTRB(
        16,
        12,
        16,
        12 + MediaQuery.of(context).padding.bottom,
      ),
      decoration: BoxDecoration(
        color: c.bgPrimary,
        border: Border(top: BorderSide(color: c.borderMain)),
      ),
      child: Row(
        children: [
          // Bouton Précédent
          if (_currentStep > 1)
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _isSubmitting ? null : _prevStep,
                icon: Icon(Icons.arrow_back_rounded, size: 18),
                label: Text('Précédent', style: GoogleFonts.sora()),
                style: OutlinedButton.styleFrom(
                  foregroundColor: c.txtPrimary,
                  side: BorderSide(color: c.borderMain, width: 1.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            )
          else
            Spacer(),

          SizedBox(width: 12.w),

          // Bouton Suivant / Soumettre
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: _isSubmitting ? c.bgCard : c.accentPurple,
                borderRadius: BorderRadius.circular(12),
              ),
              child: ElevatedButton.icon(
                onPressed: _isSubmitting
                    ? null
                    : (_currentStep == _totalSteps ? _submitDossier : _nextStep),
                icon: _isSubmitting
                    ? SizedBox(
                        width: 18.w,
                        height: 18.h,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2),
                      )
                    : Icon(
                        _currentStep == _totalSteps
                            ? Icons.send_rounded
                            : Icons.arrow_forward_rounded,
                        size: 18,
                      ),
                label: Text(
                  _isSubmitting
                      ? 'Envoi...'
                      : (_currentStep == _totalSteps ? 'Soumettre' : 'Suivant'),
                  style: GoogleFonts.sora(),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  foregroundColor: _isSubmitting ? c.txtSecondary : Colors.white,
                  padding: EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}