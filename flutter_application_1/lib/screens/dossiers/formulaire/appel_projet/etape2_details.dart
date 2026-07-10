import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/app_colors.dart';
import '../../../../widgets/auth_widgets.dart';
import '../../../../widgets/form_widgets.dart';
import '../../../../utils/form_validators.dart';

class Etape2Details extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final Map<String, dynamic> formData;
  const Etape2Details({super.key, required this.formKey, required this.formData});

  @override
  State<Etape2Details> createState() => _Etape2DetailsState();
}

class _Etape2DetailsState extends State<Etape2Details> {
  late final TextEditingController _objectifsCtrl;
  late final TextEditingController _importanceCtrl;
  late final TextEditingController _impactsCtrl;
  late final TextEditingController _potentielCtrl;
  late final TextEditingController _localisationCtrl;
  late final TextEditingController _beneficiairesCtrl;
  late final TextEditingController _perennisationCtrl;
  late final TextEditingController _descriptionCtrl;

  @override
  void initState() {
    super.initState();
    _objectifsCtrl = TextEditingController(text: widget.formData['objectifs_globaux'] ?? '');
    _importanceCtrl = TextEditingController(text: widget.formData['importance_territoire'] ?? '');
    _impactsCtrl = TextEditingController(text: widget.formData['impacts_economiques'] ?? '');
    _potentielCtrl = TextEditingController(text: widget.formData['potentiel_reussite'] ?? '');
    _localisationCtrl = TextEditingController(text: widget.formData['localisation'] ?? '');
    _beneficiairesCtrl = TextEditingController(text: widget.formData['beneficiaires'] ?? '');
    _perennisationCtrl = TextEditingController(text: widget.formData['plan_perennisation'] ?? '');
    _descriptionCtrl = TextEditingController(text: widget.formData['description_produit'] ?? '');

    _objectifsCtrl.addListener(() => widget.formData['objectifs_globaux'] = _objectifsCtrl.text);
    _importanceCtrl.addListener(() => widget.formData['importance_territoire'] = _importanceCtrl.text);
    _impactsCtrl.addListener(() => widget.formData['impacts_economiques'] = _impactsCtrl.text);
    _potentielCtrl.addListener(() => widget.formData['potentiel_reussite'] = _potentielCtrl.text);
    _localisationCtrl.addListener(() => widget.formData['localisation'] = _localisationCtrl.text);
    _beneficiairesCtrl.addListener(() => widget.formData['beneficiaires'] = _beneficiairesCtrl.text);
    _perennisationCtrl.addListener(() => widget.formData['plan_perennisation'] = _perennisationCtrl.text);
    _descriptionCtrl.addListener(() => widget.formData['description_produit'] = _descriptionCtrl.text);
  }

  void _ajouterMembre() {
    if ((widget.formData['equipe'] as List).length >= 3) return;
    setState(() {
      (widget.formData['equipe'] as List).add({'poste': '', 'prenom': '', 'nom': '', 'telephone': ''});
    });
  }

  void _supprimerMembre(int index) {
    setState(() {
      (widget.formData['equipe'] as List).removeAt(index);
    });
  }

  @override
  void dispose() {
    _objectifsCtrl.dispose();
    _importanceCtrl.dispose();
    _impactsCtrl.dispose();
    _potentielCtrl.dispose();
    _localisationCtrl.dispose();
    _beneficiairesCtrl.dispose();
    _perennisationCtrl.dispose();
    _descriptionCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = AppColors(isDark);
    final equipe = widget.formData['equipe'] as List;

    return Form(
      key: widget.formKey,
      child: SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(20, 24, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FDLabel('Phase du projet *'),
            SizedBox(height: 10.h),
            Row(
              children: [
                _ToggleOption(
                  label: 'Idéation',
                  selected: widget.formData['phase_ideation'] == true,
                  onTap: () => setState(() {
                    widget.formData['phase_ideation'] = true;
                    widget.formData['phase_execution'] = false;
                  }),
                ),
                SizedBox(width: 10.w),
                _ToggleOption(
                  label: 'Exécution',
                  selected: widget.formData['phase_execution'] == true,
                  onTap: () => setState(() {
                    widget.formData['phase_execution'] = true;
                    widget.formData['phase_ideation'] = false;
                  }),
                ),
              ],
            ),
            SizedBox(height: 20.h),

            FDChampTexte('Objectifs globaux', _objectifsCtrl, 'Quels sont les objectifs principaux de votre projet ?', validator: FormValidators.textArea),
            FDChampTexte('Importance sur le territoire', _importanceCtrl, 'En quoi votre offre est-elle innovante ou nouvelle ?', validator: FormValidators.textArea),
            FDChampTexte("Impacts économiques", _impactsCtrl, "Création ou renforcement d'emplois attendus...", validator: FormValidators.textArea),
            FDChampTexte('Potentiel de réussite', _potentielCtrl, 'Quels sont vos atouts pour réussir ?', validator: FormValidators.textArea),
            FDChampTexte('Localisation', _localisationCtrl, 'Où se déroulera le projet ?', validator: FormValidators.text),
            FDChampTexte('Bénéficiaires', _beneficiairesCtrl, 'Qui sont les bénéficiaires directs ?', validator: FormValidators.text),
            FDChampTexte('Plan de pérennisation', _perennisationCtrl, 'Comment le projet sera-t-il pérennisé ?', validator: FormValidators.textArea),
            FDChampTexte('Description du produit / service', _descriptionCtrl, 'Décrivez votre produit ou service en détail...', validator: FormValidators.textArea),

            SizedBox(height: 8.h),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                FDLabel('Membres de l\'équipe (1 à 3 membres) *'),
                if (equipe.length < 3)
                  GestureDetector(
                    onTap: _ajouterMembre,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: c.accentPurple.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: c.accentPurple.withValues(alpha: 0.2)),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.add_circle_outline_rounded, size: 14, color: c.accentPurple),
                          SizedBox(width: 6.w),
                          Text(
                            'Ajouter',
                            style: GoogleFonts.sora(
                              fontSize: 11.sp,
                              color: c.accentPurple,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
            SizedBox(height: 12.h),

            if (equipe.isEmpty)
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.errorBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.error.withValues(alpha: 0.2)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, size: 16, color: AppColors.error),
                    SizedBox(width: 8.w),
                    Expanded(
                      child: Text(
                        "Ajoutez au moins 1 membre d'équipe (requis).",
                        style: GoogleFonts.sora(
                          color: AppColors.error,
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

            ...equipe.asMap().entries.map((entry) {
              return _MembreCard(
                index: entry.key,
                membre: entry.value as Map<String, dynamic>,
                onSupprimer: () => _supprimerMembre(entry.key),
              );
            }),
          ],
        ),
      ),
    );
  }
}

class _ToggleOption extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _ToggleOption({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = AppColors(isDark);

    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: EdgeInsets.symmetric(vertical: 14.h),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: selected ? c.accentPurple.withValues(alpha: 0.08) : c.bgCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: selected ? c.accentPurple : c.borderMain,
              width: selected ? 2.0 : 1.0,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                selected ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded,
                color: selected ? c.accentPurple : c.txtSecondary,
                size: 18,
              ),
              SizedBox(width: 8.w),
              Text(
                label,
                style: GoogleFonts.sora(
                  fontSize: 13.sp,
                  fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                  color: selected ? c.accentPurple : c.txtPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MembreCard extends StatefulWidget {
  final int index;
  final Map<String, dynamic> membre;
  final VoidCallback onSupprimer;

  const _MembreCard({required this.index, required this.membre, required this.onSupprimer});

  @override
  State<_MembreCard> createState() => _MembreCardState();
}

class _MembreCardState extends State<_MembreCard> {
  late final TextEditingController _prenomCtrl;
  late final TextEditingController _nomCtrl;
  late final TextEditingController _posteCtrl;
  late final TextEditingController _telCtrl;

  @override
  void initState() {
    super.initState();
    _prenomCtrl = TextEditingController(text: widget.membre['prenom'] ?? '');
    _nomCtrl = TextEditingController(text: widget.membre['nom'] ?? '');
    _posteCtrl = TextEditingController(text: widget.membre['poste'] ?? '');
    _telCtrl = TextEditingController(text: widget.membre['telephone'] ?? '');

    _prenomCtrl.addListener(() => widget.membre['prenom'] = _prenomCtrl.text);
    _nomCtrl.addListener(() => widget.membre['nom'] = _nomCtrl.text);
    _posteCtrl.addListener(() => widget.membre['poste'] = _posteCtrl.text);
    _telCtrl.addListener(() => widget.membre['telephone'] = _telCtrl.text);
  }

  @override
  void dispose() {
    _prenomCtrl.dispose();
    _nomCtrl.dispose();
    _posteCtrl.dispose();
    _telCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = AppColors(isDark);

    return Container(
      margin: EdgeInsets.only(bottom: 16.h),
      decoration: BoxDecoration(
        color: c.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: c.borderMain, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header of the card
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: c.bgPrimary,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(15),
                topRight: Radius.circular(15),
              ),
              border: Border(bottom: BorderSide(color: c.borderMain)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.person_rounded, size: 16, color: c.accentPurple),
                    SizedBox(width: 8.w),
                    Text(
                      'Membre ${widget.index + 1}',
                      style: GoogleFonts.sora(
                        fontSize: 13.sp,
                        fontWeight: FontWeight.w700,
                        color: c.txtPrimary,
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: widget.onSupprimer,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: AppColors.error.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.close_rounded,
                      size: 16,
                      color: AppColors.error,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Form body of the card
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          FDLabel('Prénom'),
                          SizedBox(height: 6.h),
                          FDTextField(
                            controller: _prenomCtrl,
                            hint: 'Prénom',
                            icon: Icons.person_outline_rounded,
                            validator: FormValidators.text,
                          ),
                        ],
                      ),
                    ),
                    SizedBox(width: 12.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          FDLabel('Nom'),
                          SizedBox(height: 6.h),
                          FDTextField(
                            controller: _nomCtrl,
                            hint: 'Nom',
                            icon: Icons.person_outline_rounded,
                            validator: FormValidators.text,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 12.h),
                FDLabel('Poste'),
                SizedBox(height: 6.h),
                FDTextField(
                  controller: _posteCtrl,
                  hint: 'Ex: Directeur artistique',
                  icon: Icons.work_outline_rounded,
                  validator: FormValidators.text,
                ),
                SizedBox(height: 12.h),
                FDLabel('Téléphone'),
                SizedBox(height: 6.h),
                FDTextField(
                  controller: _telCtrl,
                  hint: '+221 77 000 00 00',
                  icon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  validator: FormValidators.phone,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
