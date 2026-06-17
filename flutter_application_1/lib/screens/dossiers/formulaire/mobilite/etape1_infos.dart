import 'package:flutter/material.dart';
import '../../../../widgets/auth_widgets.dart';
import '../../../../widgets/form_widgets.dart';

class Etape1InfosMob extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final Map<String, dynamic> formData;
  const Etape1InfosMob({super.key, required this.formKey, required this.formData});
  @override
  State<Etape1InfosMob> createState() => _Etape1InfosMobState();
}

class _Etape1InfosMobState extends State<Etape1InfosMob> {
  late final TextEditingController _structureCtrl;
  late final TextEditingController _responsableCtrl;
  late final TextEditingController _emailCtrl;
  late final TextEditingController _telephoneCtrl;

  final _disciplines = ['danse_urbaine','hiphop','graffiti','mode','claque','sport_de_rue','art_vivant','conception'];

  String _lblDisc(String d) {
    const map = {'danse_urbaine':'Danse urbaine','sport_de_rue':'Sport de rue','art_vivant':'Art vivant'};
    return map[d] ?? d[0].toUpperCase() + d.substring(1);
  }

  @override
  void initState() {
    super.initState();
    _structureCtrl = TextEditingController(text: widget.formData['nom_structure'] ?? '');
    _responsableCtrl = TextEditingController(text: widget.formData['nom_responsable'] ?? '');
    _emailCtrl = TextEditingController(text: widget.formData['email'] ?? '');
    _telephoneCtrl = TextEditingController(text: widget.formData['telephone'] ?? '');

    _structureCtrl.addListener(() => widget.formData['nom_structure'] = _structureCtrl.text);
    _responsableCtrl.addListener(() => widget.formData['nom_responsable'] = _responsableCtrl.text);
    _emailCtrl.addListener(() => widget.formData['email'] = _emailCtrl.text);
    _telephoneCtrl.addListener(() => widget.formData['telephone'] = _telephoneCtrl.text);
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
            FDLabel('Nom de la structure / Artiste'),
            const SizedBox(height: 6),
            FDTextField(controller: _structureCtrl, hint: 'Ex: Collectif Dakar Urban', icon: Icons.business_outlined),
            const SizedBox(height: 16),

            FDLabel('Discipline'),
            const SizedBox(height: 6),
            FDDropdown(
              hint: 'Sélectionner la discipline',
              value: widget.formData['discipline'],
              items: _disciplines,
              labelBuilder: _lblDisc,
              onChanged: (v) => setState(() => widget.formData['discipline'] = v),
            ),
            const SizedBox(height: 16),

            FDLabel('Nom du responsable'),
            const SizedBox(height: 6),
            FDTextField(controller: _responsableCtrl, hint: 'Ex: Alioune Fall', icon: Icons.person_outline_rounded),
            const SizedBox(height: 16),

            FDLabel('Email'),
            const SizedBox(height: 6),
            FDTextField(controller: _emailCtrl, hint: 'contact@exemple.com', icon: Icons.email_outlined, keyboardType: TextInputType.emailAddress),
            const SizedBox(height: 16),

            FDLabel('Téléphone'),
            const SizedBox(height: 6),
            FDTextField(controller: _telephoneCtrl, hint: '+221 77 000 00 00', icon: Icons.phone_outlined, keyboardType: TextInputType.phone),
          ],
        ),
      ),
    );
  }
}
