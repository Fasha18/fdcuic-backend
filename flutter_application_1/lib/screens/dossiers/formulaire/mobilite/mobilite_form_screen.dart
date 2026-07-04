import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import '../../../../core/theme.dart';
import '../../../../widgets/step_progress_bar.dart';
import '../../../../services/api_service.dart';
import 'etape4_documents.dart';
import 'etape1_infos.dart';
import 'etape2_contexte.dart';
import 'etape3_programme.dart';
import 'etape5_recapitulatif.dart';
/// Conteneur principal du formulaire Mobilité (5 étapes).
class MobiliteFormScreen extends StatefulWidget {
  const MobiliteFormScreen({super.key});

  @override
  State<MobiliteFormScreen> createState() => _MobiliteFormScreenState();
}

class _MobiliteFormScreenState extends State<MobiliteFormScreen> {
  static const int _totalSteps = 5;

  final PageController _pageController = PageController();
  int _currentStep = 1;
  bool _isSubmitting = false;

  // Données du formulaire partagées entre les étapes
  final Map<String, dynamic> formData = {
    // Étape 1
    'nom_structure': '',
    'discipline': null,
    'date_depart': null,
    'date_arrivee': null,
    'pays_destination': '',
    'region_destination': '',
    // Étape 2
    'presentation_succincte': '',
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
      final req = ['presentation_succincte', 'opportunite', 'pertinence', 'objectifs_generaux', 'objectifs_specifiques'];
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
        backgroundColor: FDColors.coral,
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

  Future<void> _submitDossier() async {
    final formKey = _formKeys[_currentStep - 1];
    if (formKey.currentState != null && !formKey.currentState!.validate()) {
      return;
    }
    formKey.currentState?.save();

    setState(() => _isSubmitting = true);

    try {
      // 1. Etape 1
      final projetId = await ApiService.etape1Mobilite({
        'nom_structure': formData['nom_structure'],
        'discipline': formData['discipline'],
        'date_depart': formData['date_depart'],
        'date_arrivee': formData['date_arrivee'],
        'pays_destination': formData['pays_destination'],
        'region_destination': formData['region_destination'],
      });

      // 2. Etape 2
      await ApiService.etape2Mobilite(projetId, {
        'presentation_succincte': formData['presentation_succincte'],
        'opportunite': formData['opportunite'],
        'pertinence': formData['pertinence'],
        'objectifs_generaux': formData['objectifs_generaux'],
        'objectifs_specifiques': formData['objectifs_specifiques'],
      });

      // 3. Etape 3
      await ApiService.etape3Mobilite(projetId, {
        'programme_sejour_detaille_du_sejour': formData['programme_sejour_detaille_du_sejour'],
        'activites_prevues': formData['activites_prevues'],
        'resultats_attendus': formData['resultats_attendus'],
        'impacts': formData['impacts'],
      });

      // 4. Etape 4 - Documents
      if (formData['documents'] != null) {
        final docs = Map<String, String?>.from(formData['documents']);
        await ApiService.etape4Mobilite(projetId, docs);
      }

      // 5. Soumettre
      await ApiService.soumettreMobilite(projetId);

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
                Navigator.of(context).popUntil((route) => route.isFirst);
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
    return Scaffold(
      backgroundColor: FDColors.skyBg,
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
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            FDColors.navy,
            FDColors.violet.withValues(alpha: 0.8),
          ],
        ),
      ),
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
                        color: FDColors.white.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(FDRadius.sm),
                      ),
                      child: Icon(
                        Icons.arrow_back_ios_new_rounded,
                        color: FDColors.white,
                        size: 18,
                      ),
                    ),
                  ),
                  SizedBox(width: 12.w),
                  Expanded(
                    child: Text(
                      'Mobilité',
                      style: TextStyle(
                        color: FDColors.white,
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
                      color: FDColors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(FDRadius.pill),
                    ),
                    child: Text(
                      '$_currentStep / $_totalSteps',
                      style: TextStyle(
                        color: FDColors.white,
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
                activeColor: FDColors.violet,
                completedColor: FDColors.mint,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: EdgeInsets.fromLTRB(
        16,
        12,
        16,
        12 + MediaQuery.of(context).padding.bottom,
      ),
      decoration: BoxDecoration(
        color: FDColors.white,
        boxShadow: FDShadow.nav,
      ),
      child: Row(
        children: [
          // Bouton Précédent
          if (_currentStep > 1)
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _isSubmitting ? null : _prevStep,
                icon: Icon(Icons.arrow_back_rounded, size: 18),
                label: Text('Précédent'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: FDColors.violet,
                  side: const BorderSide(color: FDColors.violet, width: 1.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(FDRadius.sm),
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
                gradient: _isSubmitting ? null : LinearGradient(
                  colors: [FDColors.violet, FDColors.violet.withValues(alpha: 0.8)],
                ),
                color: _isSubmitting ? FDColors.ice : null,
                borderRadius: BorderRadius.circular(FDRadius.sm),
                boxShadow: _isSubmitting ? null : [
                  BoxShadow(
                    color: FDColors.violet.withValues(alpha: 0.35),
                    blurRadius: 14,
                    offset: const Offset(0, 6),
                  ),
                ],
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
                            color: FDColors.white, strokeWidth: 2),
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
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  foregroundColor: _isSubmitting ? FDColors.textSub : FDColors.white,
                  padding: EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(FDRadius.sm),
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