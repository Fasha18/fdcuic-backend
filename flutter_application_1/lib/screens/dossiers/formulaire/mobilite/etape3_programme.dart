import 'package:flutter/material.dart';
import '../../../../widgets/auth_widgets.dart';
import '../../../../widgets/form_widgets.dart';
import '../../../../utils/form_validators.dart';

class Etape3ProgrammeMob extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final Map<String, dynamic> formData;
  const Etape3ProgrammeMob({super.key, required this.formKey, required this.formData});
  @override
  State<Etape3ProgrammeMob> createState() => _Etape3ProgrammeMobState();
}

class _Etape3ProgrammeMobState extends State<Etape3ProgrammeMob> {
  late final TextEditingController _programmeCtrl;
  late final TextEditingController _activitesCtrl;
  late final TextEditingController _resultatsCtrl;
  late final TextEditingController _impactsCtrl;

  @override
  void initState() {
    super.initState();
    _programmeCtrl = TextEditingController(text: widget.formData['programme_sejour_detaille_du_sejour'] ?? '');
    _activitesCtrl = TextEditingController(text: widget.formData['activites_prevues'] ?? '');
    _resultatsCtrl = TextEditingController(text: widget.formData['resultats_attendus'] ?? '');
    _impactsCtrl = TextEditingController(text: widget.formData['impacts'] ?? '');

    _programmeCtrl.addListener(() => widget.formData['programme_sejour_detaille_du_sejour'] = _programmeCtrl.text);
    _activitesCtrl.addListener(() => widget.formData['activites_prevues'] = _activitesCtrl.text);
    _resultatsCtrl.addListener(() => widget.formData['resultats_attendus'] = _resultatsCtrl.text);
    _impactsCtrl.addListener(() => widget.formData['impacts'] = _impactsCtrl.text);
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
            FDChampTexte(
              'Programme détaillé du séjour', 
              _programmeCtrl, 
              'Décrivez jour par jour ou semaine par semaine votre programme...',
              validator: FormValidators.textArea,
            ),
            FDChampTexte(
              'Activités prévues', 
              _activitesCtrl, 
              'Quelles sont les activités spécifiques prévues lors de cette mobilité ?',
              validator: FormValidators.textArea,
            ),
            FDChampTexte(
              'Résultats attendus', 
              _resultatsCtrl, 
              'Quels résultats concrets espérez-vous à la fin de ce séjour ?',
              validator: FormValidators.textArea,
            ),
            FDChampTexte(
              'Impacts', 
              _impactsCtrl, 
              'Quel sera l\'impact de cette mobilité sur votre structure ou votre carrière ?',
              validator: FormValidators.textArea,
            ),
          ],
        ),
      ),
    );
  }
}
