import 'package:flutter/material.dart';
import '../../../../core/theme.dart';
import '../../../../widgets/step_progress_bar.dart';
import '../../../../services/api_service.dart';
import 'etape1_infos.dart';
import 'etape2_details.dart';
import 'etape3_documents.dart';
import 'etape4_recapitulatif.dart';

/// Conteneur principal du formulaire Appel à Projet (4 étapes).
class AppelFormScreen extends StatefulWidget {
  const AppelFormScreen({super.key});

  @override
  State<AppelFormScreen> createState() => _AppelFormScreenState();
}

class _AppelFormScreenState extends State<AppelFormScreen> {
  static const int _totalSteps = 4;

  final PageController _pageController = PageController();
  int _currentStep = 1;
  bool _isSubmitting = false;

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

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _goToStep(int step) {
    if (step < 1 || step > _totalSteps) return;

    // Valider l'étape courante avant d'avancer
    if (step > _currentStep) {
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
    // Valider la dernière étape
    final formKey = _formKeys[_currentStep - 1];
    if (formKey.currentState != null && !formKey.currentState!.validate()) {
      return;
    }
    formKey.currentState?.save();

    setState(() => _isSubmitting = true);

    try {
      // 1. Créer le dossier (Etape 1)
      final dossierId = await ApiService.etape1Appel({
        'prenom_nom_porteur': formData['prenom_nom_porteur'],
        'nom_structure': formData['nom_structure'],
        'type_projet': formData['type_projet'],
        'secteur_activite': formData['secteur_activite'],
        'region': formData['region'],
        'activite_entreprise': formData['activite_entreprise'],
        'nature_projet': formData['nature_projet'],
      });

      // 2. Mettre à jour (Etape 2)
      await ApiService.etape2Appel(dossierId, {
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
        'equipe': formData['equipe'],
      });

      // 3. Uploader les documents (Etape 3)
      if (formData['documents'] != null) {
        final docs = Map<String, String?>.from(formData['documents']);
        await ApiService.etape3Appel(dossierId, docs);
      }

      // 4. Soumettre le dossier
      await ApiService.soumettreAppel(dossierId);

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
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: FDColors.mint.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle_outline,
                    color: FDColors.mint, size: 24),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text('Dossier soumis !', style: FDText.h3),
              ),
            ],
          ),
          content: const Text(
            'Votre dossier a été soumis avec succès. '
            'Vous pouvez suivre son avancement depuis « Mes Dossiers ».',
            style: FDText.body,
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop(); // ferme le dialog
                Navigator.of(context).pop(); // retour à mes dossiers
              },
              child: const Text('OK'),
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
    return Container(
      decoration: const BoxDecoration(gradient: FDGradients.header),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Titre + bouton retour
              Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: FDColors.white.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(FDRadius.sm),
                      ),
                      child: const Icon(
                        Icons.arrow_back_ios_new_rounded,
                        color: FDColors.white,
                        size: 18,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Appel à Projet',
                      style: TextStyle(
                        color: FDColors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  // Badge étape
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: FDColors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(FDRadius.pill),
                    ),
                    child: Text(
                      '$_currentStep / $_totalSteps',
                      style: const TextStyle(
                        color: FDColors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Barre d'étapes
              StepProgressBar(
                currentStep: _currentStep,
                totalSteps: _totalSteps,
                labels: _stepLabels,
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
                icon: const Icon(Icons.arrow_back_rounded, size: 18),
                label: const Text('Précédent'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: FDColors.royal,
                  side: const BorderSide(color: FDColors.royal, width: 1.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(FDRadius.sm),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            )
          else
            const Spacer(),

          const SizedBox(width: 12),

          // Bouton Suivant / Soumettre
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                gradient: _isSubmitting ? null : FDGradients.ctaButton,
                color: _isSubmitting ? FDColors.ice : null,
                borderRadius: BorderRadius.circular(FDRadius.sm),
                boxShadow: _isSubmitting ? null : FDShadow.ctaButton,
              ),
              child: ElevatedButton.icon(
                onPressed: _isSubmitting
                    ? null
                    : (_currentStep == _totalSteps ? _submitDossier : _nextStep),
                icon: _isSubmitting
                    ? const SizedBox(
                        width: 18,
                        height: 18,
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
                  padding: const EdgeInsets.symmetric(vertical: 14),
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