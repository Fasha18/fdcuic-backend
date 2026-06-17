import 'package:flutter/material.dart';
import '../../../../widgets/auth_widgets.dart';
import '../../../../widgets/form_widgets.dart';

class Etape2ContexteMob extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final Map<String, dynamic> formData;
  const Etape2ContexteMob({super.key, required this.formKey, required this.formData});
  @override
  State<Etape2ContexteMob> createState() => _Etape2ContexteMobState();
}

class _Etape2ContexteMobState extends State<Etape2ContexteMob> {
  late final TextEditingController _paysCtrl;
  late final TextEditingController _regionCtrl;
  late final TextEditingController _motivationCtrl;
  late final TextEditingController _experienceCtrl;

  @override
  void initState() {
    super.initState();
    _paysCtrl = TextEditingController(text: widget.formData['pays_destination'] ?? '');
    _regionCtrl = TextEditingController(text: widget.formData['region_destination'] ?? '');
    _motivationCtrl = TextEditingController(text: widget.formData['motivation'] ?? '');
    _experienceCtrl = TextEditingController(text: widget.formData['experience_anterieure'] ?? '');

    _paysCtrl.addListener(() => widget.formData['pays_destination'] = _paysCtrl.text);
    _regionCtrl.addListener(() => widget.formData['region_destination'] = _regionCtrl.text);
    _motivationCtrl.addListener(() => widget.formData['motivation'] = _motivationCtrl.text);
    _experienceCtrl.addListener(() => widget.formData['experience_anterieure'] = _experienceCtrl.text);
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
            FDLabel('Pays de destination'),
            const SizedBox(height: 6),
            FDTextField(controller: _paysCtrl, hint: 'Ex: France', icon: Icons.public),
            const SizedBox(height: 16),
            
            FDLabel('Région de destination'),
            const SizedBox(height: 6),
            FDTextField(controller: _regionCtrl, hint: 'Ex: Île-de-France', icon: Icons.map_outlined),
            const SizedBox(height: 16),

            FDChampTexte('Motivation', _motivationCtrl, 'Pourquoi cette destination et ce projet ?'),
            FDChampTexte('Expérience antérieure', _experienceCtrl, 'Avez-vous déjà eu des expériences similaires ?'),
          ],
        ),
      ),
    );
  }
}
