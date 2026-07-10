import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import '../../../../core/theme.dart';
import '../../../../widgets/step_progress_bar.dart';
import '../../../../services/api_service.dart';
import '../../../../core/app_colors.dart';
import 'package:google_fonts/google_fonts.dart';
import 'etape4_documents.dart';
import 'etape1_infos.dart';
import 'etape2_contexte.dart';
import 'etape3_programme.dart';
import 'etape5_recapitulatif.dart';
import '../../../../models/projet_mobilite.dart';
/// Conteneur principal du formulaire Mobilité (5 étapes).
class MobiliteFormScreen extends StatefulWidget {
  const MobiliteFormScreen({super.key});

  @override
  State<MobiliteFormScreen> createState() => _MobiliteFormScreenState();
}

class _MobiliteFormScreenState extends State<MobiliteFormScreen> {
  static const int _totalSteps = 5;

  late PageController _pageController;
  int _currentStep = 1;
  bool _isSubmitting = false;
  int? _projetId;

  // Données du formulaire partagées entre les étapes
  final Map<String, dynamic> formData = {
    // Étape 1
    'nom_structure': '',
    'discipline': null,
    'date_depart': null,
    'date_arrivee': null,
    'pays_destination': null,
    'region_destination': null,
    // Étape 2
    'Presentation_succincte': '',
    'opportunite': '',
    'pertinence': '',
    'objectifs_generaux': '',
    'objectifs_specifiques': '',
    // Étape 3
    'programme_sejour_detaille_du_sejour': '',
    'activites_prevues': '',
    'resultats_attendus': '',
    'impacts': '',
    // Étape 4
    'documents': <String, String?>{},
  };

  // Clés de formulaire par étape pour validation
  final List<GlobalKey<FormState>> _formKeys = List.generate(
    _totalSteps,
    (_) => GlobalKey<FormState>(),
  );

  static const List<String> _stepLabels = [
    'Infos',
    'Contexte',
    'Programme',
    'Docs',
    'Récap',
  ];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is int) {
      _projetId = args;
    } else if (args is ProjetMobilite) {
      _projetId = args.id;
      _currentStep = args.etapeCourante == 0 ? 1 : args.etapeCourante;
      if (args.rawJson != null) {
        final json = args.rawJson!;
        formData['nom_structure'] = json['nom_structure'] ?? '';
        formData['discipline'] = json['discipline'];
        formData['date_depart'] = json['date_depart'];
        formData['date_arrivee'] = json['date_arrivee'];
        formData['pays_destination'] = json['pays_destination'];
        formData['region_destination'] = json['region_destination'];
        
        formData['Presentation_succincte'] = json['Presentation_succincte'] ?? '';
        formData['opportunite'] = json['opportunite'] ?? '';
        formData['pertinence'] = json['pertinence'] ?? '';
        formData['objectifs_generaux'] = json['objectifs_generaux'] ?? '';
        formData['objectifs_specifiques'] = json['objectifs_specifiques'] ?? '';
        
        formData['programme_sejour_detaille_du_sejour'] = json['programme_sejour_detaille_du_sejour'] ?? '';
        formData['activites_prevues'] = json['activites_prevues'] ?? '';
        formData['resultats_attendus'] = json['resultats_attendus'] ?? '';
        formData['impacts'] = json['impacts'] ?? '';
        
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
      final req = ['nom_structure', 'discipline', 'date_depart', 'date_arrivee', 'pays_destination', 'region_destination'];
      for (var k in req) {
        if (formData[k] == null || formData[k].toString().trim().isEmpty) isValid = false;
      }
    } else if (_currentStep == 2) {
      final req = ['Presentation_succincte', 'opportunite', 'pertinence', 'objectifs_generaux', 'objectifs_specifiques'];
      for (var k in req) {
        if (formData[k] == null || formData[k].toString().trim().isEmpty) isValid = false;
      }
    } else if (_currentStep == 3) {
      final req = ['programme_sejour_detaille_du_sejour', 'activites_prevues', 'resultats_attendus', 'impacts'];
      for (var k in req) {
        if (formData[k] == null || formData[k].toString().trim().isEmpty) isValid = false;
      }
    } else if (_currentStep == 4) {
      final docs = formData['documents'] as Map<String, String?>;
      if (docs['doc_ninea'] == null ||
          docs['doc_recepisse'] == null ||
          docs['doc_invitation'] == null) {
        isValid = false;
      }
    }
    
    if (!isValid) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Veuillez remplir tous les champs obligatoires pour continuer.'),
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
    int pId;
    if (_projetId != null) {
      pId = _projetId!;
    } else {
      // Sync étape 1
      pId = await ApiService.etape1Mobilite({
        'nom_structure': formData['nom_structure'],
        'discipline': formData['discipline'],
        'date_depart': formData['date_depart'],
        'date_arrivee': formData['date_arrivee'],
        'pays_destination': formData['pays_destination'],
        'region_destination': formData['region_destination'],
      });
      _projetId = pId;
    }

    // Sync étape 2 si valide
    if (_formKeys[1].currentState?.validate() ?? false) {
      _formKeys[1].currentState?.save();
      await ApiService.etape2Mobilite(pId, {
        'Presentation_succincte': formData['Presentation_succincte'],
        'opportunite': formData['opportunite'],
        'pertinence': formData['pertinence'],
        'objectifs_generaux': formData['objectifs_generaux'],
        'objectifs_specifiques': formData['objectifs_specifiques'],
      });
    }

    // Sync étape 3 si valide
    if (_formKeys[2].currentState?.validate() ?? false) {
      _formKeys[2].currentState?.save();
      await ApiService.etape3Mobilite(pId, {
        'programme_sejour_detaille_du_sejour': formData['programme_sejour_detaille_du_sejour'],
        'activites_prevues': formData['activites_prevues'],
        'resultats_attendus': formData['resultats_attendus'],
        'impacts': formData['impacts'],
      });
    }

    // Sync étape 4 (Documents) si on a passé l'étape 4
    if (_currentStep > 4 || (_currentStep == 4 && _formKeys[3].currentState != null)) {
      final docs = formData['documents'] as Map<String, String?>?;
      if (docs != null && docs.isNotEmpty) {
        try {
          await ApiService.etape4Mobilite(pId, docs);
        } catch (e) {
          throw Exception('Échec Upload Documents (Etape 4): $e');
        }
      }
    }

    return pId;
  }

  Future<void> _submitDossier() async {
    final formKey = _formKeys[_currentStep - 1];
    if (formKey.currentState != null && !formKey.currentState!.validate()) {
      return;
    }
    formKey.currentState?.save();

    setState(() => _isSubmitting = true);

    try {
      // Synchroniser le brouillon pour s'assurer que toutes les données texte sont à jour
      final pId = await _syncDraft();

      // 4. Etape 4 - Documents (ignorer, upload immédiat déjà fait)
      
      // 5. Soumettre le dossier final
      await ApiService.soumettreMobilite(pId);

      if (!mounted) return;

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
                  color: FDColors.violet.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.flight_takeoff_rounded,
                    color: FDColors.violet, size: 24),
              ),
              SizedBox(width: 12.w),
              Expanded(
                child: Text('Dossier soumis !', style: FDText.h3),
              ),
            ],
          ),
          content: Text(
            'Votre dossier de mobilité a été soumis avec succès. '
            'Vous pouvez suivre son avancement depuis « Mes Dossiers ».',
            style: FDText.body,
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: FDColors.violet,
              ),
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
                Etape1InfosMob(
                  formKey: _formKeys[0],
                  formData: formData,
                ),
                Etape2ContexteMob(
                  formKey: _formKeys[1],
                  formData: formData,
                ),
                Etape3ProgrammeMob(
                  formKey: _formKeys[2],
                  formData: formData,
                ),
                MobiliteEtape4Documents(
                  formKey: _formKeys[3],
                  formData: formData,
                  onSyncDraft: _syncDraft,
                ),
                Etape5RecapMob(
                  formKey: _formKeys[4],
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
                      'Mobilité',
                      style: GoogleFonts.sora(
                        color: c.txtPrimary,
                        fontSize: 20.sp,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
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