import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import '../../../../core/theme.dart';
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
  Widget build(BuildContext context) {
    final equipe = widget.formData['equipe'] as List;
    return Form(
      key: widget.formKey,
      child: SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(20, 24, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FDLabel('Phase du projet'),
            SizedBox(height: 10.h),
            Row(
              children: [
                _ToggleOption(
                  label: 'Idéation',
                  selected: widget.formData['phase_ideation'] == true,
                  onTap: () => setState(() => widget.formData['phase_ideation'] = !widget.formData['phase_ideation']),
                ),
                SizedBox(width: 10.w),
                _ToggleOption(
                  label: 'Exécution',
                  selected: widget.formData['phase_execution'] == true,
                  onTap: () => setState(() => widget.formData['phase_execution'] = !widget.formData['phase_execution']),
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
                FDLabel('Équipe (max 3 membres)'),
                if (equipe.length < 3)
                  GestureDetector(
                    onTap: _ajouterMembre,
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: FDColors.ice,
                        borderRadius: BorderRadius.circular(FDRadius.xs),
                        border: Border.all(color: FDColors.border),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.add, size: 14, color: FDColors.royal),
                          SizedBox(width: 4.w),
                          Text('Ajouter', style: TextStyle(fontSize: 12.sp, color: FDColors.royal, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
            SizedBox(height: 10.h),

            if (equipe.isEmpty)
              Container(
                padding: EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: FDColors.ice,
                  borderRadius: BorderRadius.circular(FDRadius.sm),
                  border: Border.all(color: FDColors.border, width: 0.5),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, size: 16, color: FDColors.textSub),
                    SizedBox(width: 8.w),
                    Expanded(child: Text("Ajoutez au moins 1 membre d'équipe.", style: FDText.bodySub)),
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
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 18, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? FDColors.royal.withValues(alpha: 0.10) : FDColors.ice,
          borderRadius: BorderRadius.circular(FDRadius.sm),
          border: Border.all(
            color: selected ? FDColors.royal : FDColors.border,
            width: selected ? 1.5 : 0.5,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13.sp,
            fontWeight: selected ? FontWeight.w700 : FontWeight.w400,
            color: selected ? FDColors.royal : FDColors.textSub,
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
    _prenomCtrl = TextEditingController(text: widget.membre['prenom']);
    _nomCtrl = TextEditingController(text: widget.membre['nom']);
    _posteCtrl = TextEditingController(text: widget.membre['poste']);
    _telCtrl = TextEditingController(text: widget.membre['telephone']);

    _prenomCtrl.addListener(() => widget.membre['prenom'] = _prenomCtrl.text);
    _nomCtrl.addListener(() => widget.membre['nom'] = _nomCtrl.text);
    _posteCtrl.addListener(() => widget.membre['poste'] = _posteCtrl.text);
    _telCtrl.addListener(() => widget.membre['telephone'] = _telCtrl.text);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: 12),
      padding: EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: FDColors.white,
        borderRadius: BorderRadius.circular(FDRadius.sm),
        border: Border.all(color: FDColors.border, width: 0.5),
        boxShadow: FDShadow.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Membre ', style: FDText.h3.copyWith(fontSize: 13.sp)),
              GestureDetector(
                onTap: widget.onSupprimer,
                child: Icon(Icons.close, size: 16, color: FDColors.coral),
              ),
            ],
          ),
          SizedBox(height: 12.h),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    FDLabel('Prénom'),
                    SizedBox(height: 4.h),
                    FDTextField(controller: _prenomCtrl, hint: 'Prénom', icon: Icons.person_outline_rounded, validator: FormValidators.text),
                  ],
                ),
              ),
              SizedBox(width: 10.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    FDLabel('Nom'),
                    SizedBox(height: 4.h),
                    FDTextField(controller: _nomCtrl, hint: 'Nom', icon: Icons.person_outline_rounded, validator: FormValidators.text),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 10.h),
          FDLabel('Poste'),
          SizedBox(height: 4.h),
          FDTextField(controller: _posteCtrl, hint: 'Ex: Directeur artistique', icon: Icons.work_outline_rounded, validator: FormValidators.text),
          SizedBox(height: 10.h),
          FDLabel('Téléphone'),
          SizedBox(height: 4.h),
          FDTextField(controller: _telCtrl, hint: '+221 77 000 00 00', icon: Icons.phone_outlined, keyboardType: TextInputType.phone, validator: FormValidators.phone),
        ],
      ),
    );
  }
}
