import 'package:flutter/material.dart';
import '../../../../widgets/auth_widgets.dart';
import '../../../../widgets/form_widgets.dart';
import '../../../../utils/form_validators.dart';

class Etape2ContexteMob extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final Map<String, dynamic> formData;
  const Etape2ContexteMob({super.key, required this.formKey, required this.formData});
  @override
  State<Etape2ContexteMob> createState() => _Etape2ContexteMobState();
}

class _Etape2ContexteMobState extends State<Etape2ContexteMob> {
  late final TextEditingController _presentationCtrl;
  late final TextEditingController _opportuniteCtrl;
  late final TextEditingController _pertinenceCtrl;
  late final TextEditingController _objGenCtrl;
  late final TextEditingController _objSpecCtrl;

  @override
  void initState() {
    super.initState();
    _presentationCtrl = TextEditingController(text: widget.formData['presentation_succincte'] ?? '');
    _opportuniteCtrl = TextEditingController(text: widget.formData['opportunite'] ?? '');
    _pertinenceCtrl = TextEditingController(text: widget.formData['pertinence'] ?? '');
    _objGenCtrl = TextEditingController(text: widget.formData['objectifs_generaux'] ?? '');
    _objSpecCtrl = TextEditingController(text: widget.formData['objectifs_specifiques'] ?? '');

    _presentationCtrl.addListener(() => widget.formData['presentation_succincte'] = _presentationCtrl.text);
    _opportuniteCtrl.addListener(() => widget.formData['opportunite'] = _opportuniteCtrl.text);
    _pertinenceCtrl.addListener(() => widget.formData['pertinence'] = _pertinenceCtrl.text);
    _objGenCtrl.addListener(() => widget.formData['objectifs_generaux'] = _objGenCtrl.text);
    _objSpecCtrl.addListener(() => widget.formData['objectifs_specifiques'] = _objSpecCtrl.text);
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
            FDChampTexte(
              'Présentation succincte de la structure / l\'artiste', 
              _presentationCtrl, 
              'Présentez brièvement votre parcours et vos réalisations...',
              validator: FormValidators.textArea,
            ),
            FDChampTexte(
              'Opportunité de la mobilité', 
              _opportuniteCtrl, 
              'Pourquoi cette mobilité est-elle opportune à ce stade de votre carrière ?',
              validator: FormValidators.textArea,
            ),
            FDChampTexte(
              'Pertinence de la mobilité', 
              _pertinenceCtrl, 
              'En quoi cette mobilité est-elle pertinente pour votre développement ?',
              validator: FormValidators.textArea,
            ),
            FDChampTexte(
              'Objectifs généraux', 
              _objGenCtrl, 
              'Quels sont les objectifs généraux visés par ce séjour ?',
              validator: FormValidators.textArea,
            ),
            FDChampTexte(
              'Objectifs spécifiques', 
              _objSpecCtrl, 
              'Quels sont les résultats concrets et spécifiques que vous souhaitez atteindre ?',
              validator: FormValidators.textArea,
            ),
          ],
        ),
      ),
    );
  }
}
