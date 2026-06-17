import 'package:flutter/material.dart';
import '../../../../core/theme.dart';
import '../../../../widgets/auth_widgets.dart';
import '../../../../widgets/form_widgets.dart';

class Etape3ProgrammeMob extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final Map<String, dynamic> formData;
  const Etape3ProgrammeMob({super.key, required this.formKey, required this.formData});
  @override
  State<Etape3ProgrammeMob> createState() => _Etape3ProgrammeMobState();
}

class _Etape3ProgrammeMobState extends State<Etape3ProgrammeMob> {
  late final TextEditingController _departCtrl;
  late final TextEditingController _arriveeCtrl;
  late final TextEditingController _activitesCtrl;
  late final TextEditingController _partenairesCtrl;

  @override
  void initState() {
    super.initState();
    _departCtrl = TextEditingController(text: widget.formData['date_depart'] ?? '');
    _arriveeCtrl = TextEditingController(text: widget.formData['date_arrivee'] ?? '');
    _activitesCtrl = TextEditingController(text: widget.formData['activites_prevues'] ?? '');
    _partenairesCtrl = TextEditingController(text: widget.formData['partenaires_locaux'] ?? '');

    _departCtrl.addListener(() => widget.formData['date_depart'] = _departCtrl.text);
    _arriveeCtrl.addListener(() => widget.formData['date_arrivee'] = _arriveeCtrl.text);
    _activitesCtrl.addListener(() => widget.formData['activites_prevues'] = _activitesCtrl.text);
    _partenairesCtrl.addListener(() => widget.formData['partenaires_locaux'] = _partenairesCtrl.text);
  }

  Future<void> _selectDate(TextEditingController ctrl) async {
    final d = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2027),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(primary: FDColors.royal)),
        child: child!,
      ),
    );
    if (d != null) {
      ctrl.text = '${d.year}-${d.month.toString().padLeft(2,'0')}-${d.day.toString().padLeft(2,'0')}';
    }
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
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      FDLabel('Date de départ'),
                      const SizedBox(height: 6),
                      GestureDetector(
                        onTap: () => _selectDate(_departCtrl),
                        child: AbsorbPointer(
                          child: FDTextField(
                            controller: _departCtrl,
                            hint: 'AAAA-MM-JJ',
                            icon: Icons.calendar_today_outlined,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      FDLabel('Date de retour'),
                      const SizedBox(height: 6),
                      GestureDetector(
                        onTap: () => _selectDate(_arriveeCtrl),
                        child: AbsorbPointer(
                          child: FDTextField(
                            controller: _arriveeCtrl,
                            hint: 'AAAA-MM-JJ',
                            icon: Icons.calendar_today_outlined,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            FDChampTexte('Activités prévues', _activitesCtrl, 'Ateliers, résidences, rencontres...'),
            FDChampTexte('Partenaires locaux', _partenairesCtrl, 'Institutions ou collectifs avec qui vous collaborez...'),
          ],
        ),
      ),
    );
  }
}
