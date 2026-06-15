import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/theme/app_colors.dart';

class MobilityApplicationScreen extends StatefulWidget {
  const MobilityApplicationScreen({super.key});

  @override
  State<MobilityApplicationScreen> createState() =>
      _MobilityApplicationScreenState();
}

class _MobilityApplicationScreenState
    extends State<MobilityApplicationScreen> {
  int _currentStep = 0;
  static const int _totalSteps = 3;

  // Form State - controllers vivent dans le State, jamais recréés
  final _destinationController = TextEditingController();
  final _motivationController = TextEditingController();
  final _destinationFocusNode = FocusNode();
  final _motivationFocusNode = FocusNode();

  String _englishLevel = 'B2';
  String? _uploadedFileName;

  @override
  void initState() {
    super.initState();
    _loadDraft();
  }

  @override
  void dispose() {
    _destinationController.dispose();
    _motivationController.dispose();
    _destinationFocusNode.dispose();
    _motivationFocusNode.dispose();
    super.dispose();
  }

  Future<void> _loadDraft() async {
    final prefs = await SharedPreferences.getInstance();
    // On met à jour les controllers directement, sans setState pour les champs texte
    _destinationController.text = prefs.getString('draft_mob_dest') ?? '';
    _motivationController.text = prefs.getString('draft_mob_mot') ?? '';
    final level = prefs.getString('draft_mob_eng') ?? 'B2';
    final file = prefs.getString('draft_mob_file');
    // setState seulement pour les valeurs non-text
    if (mounted) {
      setState(() {
        _englishLevel = level;
        _uploadedFileName = file;
      });
    }
  }

  Future<void> _saveDraft() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('draft_mob_dest', _destinationController.text);
    await prefs.setString('draft_mob_mot', _motivationController.text);
    await prefs.setString('draft_mob_eng', _englishLevel);
    if (_uploadedFileName != null) {
      await prefs.setString('draft_mob_file', _uploadedFileName!);
    }
  }

  void _goToStep(int step) {
    _saveDraft();
    setState(() => _currentStep = step);
  }

  void _nextStep() {
    if (_currentStep < _totalSteps - 1) {
      _goToStep(_currentStep + 1);
    } else {
      _submitApplication();
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      _goToStep(_currentStep - 1);
    } else {
      _saveDraft();
      context.pop();
    }
  }

  Future<void> _submitApplication() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('draft_mob_dest');
    await prefs.remove('draft_mob_mot');
    await prefs.remove('draft_mob_eng');
    await prefs.remove('draft_mob_file');

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Candidature Mobilité soumise avec succès !')),
      );
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.close, color: AppColors.textPrimary),
          onPressed: () {
            _saveDraft();
            context.pop();
          },
        ),
        title: Text(
          'Dossier de mobilité',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        backgroundColor: AppColors.background,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Indicateur d'étapes custom (stable, ne rebuild pas les champs)
          _buildStepIndicator(),
          // IndexedStack preserve l'état de tous les enfants, évite la perte de focus
          Expanded(
            child: IndexedStack(
              index: _currentStep,
              children: [
                _buildStep0(),
                _buildStep1(),
                _buildStep2(),
              ],
            ),
          ),
          // Boutons de navigation
          _buildNavigationButtons(),
        ],
      ),
    );
  }

  Widget _buildStepIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      color: AppColors.background,
      child: Row(
        children: List.generate(_totalSteps, (index) {
          final isCompleted = index < _currentStep;
          final isActive = index == _currentStep;
          return Expanded(
            child: Row(
              children: [
                GestureDetector(
                  onTap: index < _currentStep ? () => _goToStep(index) : null,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isCompleted
                          ? AppColors.secondary
                          : isActive
                              ? AppColors.primary
                              : const Color(0xFFE2E8F0),
                    ),
                    child: Center(
                      child: isCompleted
                          ? const Icon(Icons.check, size: 16, color: Colors.white)
                          : Text(
                              '${index + 1}',
                              style: TextStyle(
                                color: isActive
                                    ? Colors.white
                                    : AppColors.textSecondary,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                    ),
                  ),
                ),
                if (index < _totalSteps - 1)
                  Expanded(
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      height: 2,
                      color: isCompleted
                          ? AppColors.secondary
                          : const Color(0xFFE2E8F0),
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }

  // Étape 0 — widget STABLE, jamais détruit grâce à IndexedStack
  Widget _buildStep0() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: _buildCard(
        title: 'Choix & Motivation',
        child: Column(
          children: [
            TextField(
              controller: _destinationController,
              focusNode: _destinationFocusNode,
              textInputAction: TextInputAction.next,
              onSubmitted: (_) =>
                  FocusScope.of(context).requestFocus(_motivationFocusNode),
              decoration: const InputDecoration(
                labelText: 'Destination souhaitée (Canada, France, Singapour)',
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _motivationController,
              focusNode: _motivationFocusNode,
              maxLines: 5,
              textInputAction: TextInputAction.done,
              decoration: const InputDecoration(
                labelText: 'Lettre de motivation (Pourquoi cette destination ?)',
                alignLabelWithHint: true,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Étape 1 — Niveau d'anglais
  Widget _buildStep1() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: _buildCard(
        title: "Niveau d'anglais",
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Évaluez votre niveau d'anglais actuel",
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            _buildRadioOption('B2', 'Intermédiaire avancé'),
            const SizedBox(height: 12),
            _buildRadioOption('C1', 'Autonome'),
            const SizedBox(height: 12),
            _buildRadioOption('C2', 'Bilingue'),
          ],
        ),
      ),
    );
  }

  // Étape 2 — Documents
  Widget _buildStep2() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: _buildCard(
        title: 'Documents',
        child: _uploadedFileName != null
            ? _buildFilePreview()
            : _buildFileUploadArea(),
      ),
    );
  }

  Widget _buildFilePreview() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.secondary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.secondary.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          const Icon(Icons.file_present, color: AppColors.secondary),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              _uploadedFileName!,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: AppColors.error),
            onPressed: () {
              setState(() => _uploadedFileName = null);
              _saveDraft();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildFileUploadArea() {
    return InkWell(
      onTap: () {
        setState(() => _uploadedFileName = 'cv_mobilite_2026.pdf');
        _saveDraft();
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: AppColors.surfaceElevated,
          borderRadius: BorderRadius.circular(16),
          border:
              Border.all(color: const Color(0xFFE2E8F0), style: BorderStyle.solid),
        ),
        child: Center(
          child: Column(
            children: [
              Icon(Icons.upload_file,
                  size: 48, color: AppColors.textSecondary.withOpacity(0.5)),
              const SizedBox(height: 16),
              Text(
                'Cliquez pour téléverser votre CV',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavigationButtons() {
    final isLastStep = _currentStep == _totalSteps - 1;
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
      color: AppColors.background,
      child: Row(
        children: [
          Expanded(
            child: ElevatedButton(
              onPressed: _nextStep,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.secondary,
              ),
              child: Text(isLastStep ? 'Soumettre' : 'Continuer'),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: OutlinedButton(
              onPressed: _previousStep,
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.secondary,
                side: const BorderSide(color: AppColors.secondary, width: 2),
              ),
              child: Text(_currentStep == 0 ? 'Annuler' : 'Retour'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard({required String title, required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.textPrimary.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 24),
          child,
        ],
      ),
    );
  }

  Widget _buildRadioOption(String value, String subtitle) {
    final bool isSelected = _englishLevel == value;
    return InkWell(
      onTap: () {
        setState(() => _englishLevel = value);
        _saveDraft();
      },
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.secondary.withOpacity(0.05) : Colors.transparent,
          border: Border.all(
            color: isSelected ? AppColors.secondary : const Color(0xFFE2E8F0),
            width: 2,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Radio<String>(
              value: value,
              groupValue: _englishLevel,
              activeColor: AppColors.secondary,
              onChanged: (String? newValue) {
                if (newValue != null) {
                  setState(() => _englishLevel = newValue);
                  _saveDraft();
                }
              },
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 12),
                  Text(
                    value,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isSelected
                          ? AppColors.secondary
                          : AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontSize: 12,
                        ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
