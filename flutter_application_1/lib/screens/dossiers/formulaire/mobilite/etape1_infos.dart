import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import '../../../../widgets/auth_widgets.dart';
import '../../../../widgets/form_widgets.dart';
import '../../../../utils/form_validators.dart';
import '../../../../core/theme.dart';

class Etape1InfosMob extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final Map<String, dynamic> formData;
  const Etape1InfosMob({super.key, required this.formKey, required this.formData});
  @override
  State<Etape1InfosMob> createState() => _Etape1InfosMobState();
}

class _Etape1InfosMobState extends State<Etape1InfosMob> {
  late final TextEditingController _structureCtrl;
  late final TextEditingController _paysCtrl;
  late final TextEditingController _regionCtrl;

  final _disciplines = ['danse_urbaine','hiphop','graffiti','mode','claque','sport_de_rue','art_vivant','conception'];

  String _lblDisc(String d) {
    const map = {'danse_urbaine':'Danse urbaine','sport_de_rue':'Sport de rue','art_vivant':'Art vivant'};
    return map[d] ?? d[0].toUpperCase() + d.substring(1);
  }

  @override
  void initState() {
    super.initState();
    _structureCtrl = TextEditingController(text: widget.formData['nom_structure'] ?? '');
    _paysCtrl = TextEditingController(text: widget.formData['pays_destination'] ?? '');
    _regionCtrl = TextEditingController(text: widget.formData['region_destination'] ?? '');

    _structureCtrl.addListener(() => widget.formData['nom_structure'] = _structureCtrl.text);
    _paysCtrl.addListener(() => widget.formData['pays_destination'] = _paysCtrl.text);
    _regionCtrl.addListener(() => widget.formData['region_destination'] = _regionCtrl.text);
  }

  Future<void> _pickDate(String key) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2030),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: FDColors.violet,
              onPrimary: FDColors.white,
              onSurface: FDColors.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        widget.formData[key] = "${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
      });
    }
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
            FDLabel('Nom de la structure / Artiste'),
            SizedBox(height: 6.h),
            FDTextField(
              controller: _structureCtrl, 
              hint: 'Ex: Collectif Dakar Urban', 
              icon: Icons.business_outlined,
              validator: FormValidators.text,
            ),
            SizedBox(height: 16.h),

            FDLabel('Discipline'),
            SizedBox(height: 6.h),
            FDDropdown(
              hint: 'Sélectionner la discipline',
              value: widget.formData['discipline'],
              items: _disciplines,
              labelBuilder: _lblDisc,
              onChanged: (v) => setState(() => widget.formData['discipline'] = v),
              validator: FormValidators.requiredField,
            ),
            SizedBox(height: 16.h),

            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      FDLabel('Date de départ'),
                      SizedBox(height: 6.h),
                      _DateField(
                        valeur: widget.formData['date_depart'],
                        hint: 'YYYY-MM-DD',
                        onTap: () => _pickDate('date_depart'),
                      ),
                    ],
                  ),
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      FDLabel("Date d'arrivée"),
                      SizedBox(height: 6.h),
                      _DateField(
                        valeur: widget.formData['date_arrivee'],
                        hint: 'YYYY-MM-DD',
                        onTap: () => _pickDate('date_arrivee'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 16.h),

            FDLabel('Pays de destination'),
            SizedBox(height: 6.h),
            FDTextField(
              controller: _paysCtrl, 
              hint: 'Ex: France', 
              icon: Icons.public_outlined,
              validator: FormValidators.text,
            ),
            SizedBox(height: 16.h),

            FDLabel('Région de destination'),
            SizedBox(height: 6.h),
            FDTextField(
              controller: _regionCtrl, 
              hint: 'Ex: Île-de-France', 
              icon: Icons.map_outlined,
              validator: FormValidators.text,
            ),
          ],
        ),
      ),
    );
  }
}

class _DateField extends FormField<String> {
  _DateField({
    required String? valeur,
    required String hint,
    required VoidCallback onTap,
  }) : super(
          initialValue: valeur,
          validator: FormValidators.requiredField,
          builder: (FormFieldState<String> state) {
            // Mise à jour de l'état du FormField quand la valeur change
            if (valeur != state.value) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                state.didChange(valeur);
              });
            }
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                GestureDetector(
                  onTap: onTap,
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                    decoration: BoxDecoration(
                      color: FDColors.ice,
                      borderRadius: BorderRadius.circular(FDRadius.sm),
                      border: Border.all(
                        color: state.hasError ? FDColors.coral : FDColors.border, 
                        width: state.hasError ? 1.0 : 0.8
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.calendar_today_outlined, size: 18, color: FDColors.textHint),
                        SizedBox(width: 12.w),
                        Expanded(
                          child: Text(
                            valeur ?? hint,
                            style: FDText.body.copyWith(
                              color: valeur == null ? FDColors.textHint : FDColors.textPrimary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                if (state.hasError)
                  Padding(
                    padding: EdgeInsets.only(top: 6, left: 14),
                    child: Text(
                      state.errorText!,
                      style: TextStyle(color: FDColors.coral, fontSize: 12.sp),
                    ),
                  ),
              ],
            );
          },
        );
}
