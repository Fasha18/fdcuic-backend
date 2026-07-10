import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../widgets/auth_widgets.dart';
import '../../../../widgets/form_widgets.dart';
import '../../../../utils/form_validators.dart';
import '../../../../services/api_service.dart';
import '../../../../core/app_colors.dart';

// Même liste statique de régions pour le Sénégal que sur le web
const _kRegionsMob = [
  'Dakar', 'Thiès', 'Diourbel', 'Fatick', 'Kaolack', 'Kaffrine',
  'Saint-Louis', 'Louga', 'Matam', 'Tambacounda', 'Kédougou',
  'Kolda', 'Ziguinchor', 'Sédhiou'
];

// Même liste statique de pays que sur le web
const _kCountriesMob = [
  "Sénégal", "France", "Belgique", "Suisse", "Canada", "Maroc", "Côte d'Ivoire", "Mali", "Guinée", "Mauritanie",
  "Algérie", "Tunisie", "Cameroun", "Gabon", "Togo", "Bénin", "Burkina Faso", "Niger", "Tchad", "Congo",
  "RDC", "Madagascar", "États-Unis", "Royaume-Uni", "Allemagne", "Espagne", "Italie", "Portugal", "Pays-Bas",
  "Suède", "Norvège", "Danemark", "Finlande", "Japon", "Chine", "Corée du Sud", "Inde", "Brésil", "Argentine",
  "Mexique", "Colombie", "Chili", "Pérou", "Australie", "Nouvelle-Zélande", "Afrique du Sud", "Égypte", "Nigéria",
  "Kenya", "Ghana", "Somalie", "Éthiopie", "Rwanda", "Ouganda", "Zambie", "Zimbabwe", "Angola", "Mozambique"
];

class Etape1InfosMob extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final Map<String, dynamic> formData;
  const Etape1InfosMob({super.key, required this.formKey, required this.formData});
  @override
  State<Etape1InfosMob> createState() => _Etape1InfosMobState();
}

class _Etape1InfosMobState extends State<Etape1InfosMob> {
  late final TextEditingController _structureCtrl;
  late final TextEditingController _disciplineCtrl;
  late final TextEditingController _regionCtrl;

  List<String> _paysDyn = _kCountriesMob;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _structureCtrl = TextEditingController(text: widget.formData['nom_structure'] ?? '');
    _disciplineCtrl = TextEditingController(text: widget.formData['discipline'] ?? '');
    _regionCtrl = TextEditingController(text: widget.formData['region_destination'] ?? '');

    _structureCtrl.addListener(() => widget.formData['nom_structure'] = _structureCtrl.text);
    _disciplineCtrl.addListener(() => widget.formData['discipline'] = _disciplineCtrl.text);
    _regionCtrl.addListener(() => widget.formData['region_destination'] = _regionCtrl.text);

    _loadData();
  }

  Future<void> _loadData() async {
    // GET /api/referentiels/pays
    try {
      final resPays = await ApiService.getPays();
      if (resPays.isNotEmpty && mounted) {
        setState(() => _paysDyn = resPays);
      }
    } catch (e) {
      debugPrint('Erreur pays: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _pickDate(String key) async {
    final now = DateTime.now();
    DateTime firstDate = DateTime(now.year - 1);
    DateTime initialDate = now;

    // Si on choisit la date d'arrivée, elle doit être postérieure à la date de départ
    if (key == 'date_arrivee' && widget.formData['date_depart'] != null) {
      try {
        final depart = DateTime.parse(widget.formData['date_depart']);
        firstDate = depart.add(const Duration(days: 1));
        initialDate = firstDate;
      } catch (_) {}
    } else if (key == 'date_depart') {
      firstDate = now;
      initialDate = now;
    }

    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: firstDate,
      lastDate: DateTime(2030),
      builder: (context, child) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        final c = AppColors(isDark);
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: c.accentPurple,
              onPrimary: Colors.white,
              onSurface: c.txtPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        final formattedDate = "${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
        widget.formData[key] = formattedDate;

        // Si la date de départ change et est postérieure ou égale à la date d'arrivée actuelle, réinitialiser la date d'arrivée
        if (key == 'date_depart') {
          final arriveeStr = widget.formData['date_arrivee'];
          if (arriveeStr != null) {
            try {
              final arrivee = DateTime.parse(arriveeStr);
              if (picked.isAfter(arrivee) || picked.isAtSameMomentAs(arrivee)) {
                widget.formData['date_arrivee'] = null;
              }
            } catch (_) {}
          }
        }
      });
    }
  }

  @override
  void dispose() {
    _structureCtrl.dispose();
    _disciplineCtrl.dispose();
    _regionCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final paysSelectionne = widget.formData['pays_destination'];

    return Form(
      key: widget.formKey,
      child: SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(20, 24, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            FDLabel('Nom de la structure ou de l\'artiste *'),
            SizedBox(height: 6.h),
            FDTextField(
              controller: _structureCtrl,
              hint: 'Ex: Association Dakar Créatif',
              icon: Icons.business_outlined,
              validator: FormValidators.text,
            ),
            SizedBox(height: 16.h),

            FDLabel('Discipline artistique ou culturelle *'),
            SizedBox(height: 6.h),
            FDTextField(
              controller: _disciplineCtrl,
              hint: 'Ex: Danse contemporaine, Musique...',
              icon: Icons.theater_comedy_outlined,
              validator: FormValidators.text,
            ),
            SizedBox(height: 16.h),

            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      FDLabel('Date de départ prévue *'),
                      SizedBox(height: 6.h),
                      _MobDateField(
                        valeur: widget.formData['date_depart'],
                        hint: 'Sélectionner',
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
                      FDLabel("Date d'arrivée prévue *"),
                      SizedBox(height: 6.h),
                      _MobDateField(
                        valeur: widget.formData['date_arrivee'],
                        hint: 'Sélectionner',
                        onTap: () => _pickDate('date_arrivee'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 16.h),

            FDLabel('Pays de destination *'),
            SizedBox(height: 6.h),
            if (_isLoading)
              _MobLoadingField()
            else
              FDDropdown<String>(
                hint: 'Rechercher un pays...',
                value: paysSelectionne,
                items: _paysDyn,
                labelBuilder: (p) => p,
                onChanged: (v) => setState(() {
                  widget.formData['pays_destination'] = v;
                  widget.formData['region_destination'] = null;
                  _regionCtrl.text = '';
                }),
                validator: FormValidators.requiredField,
              ),
            SizedBox(height: 16.h),

            FDLabel('Région / Ville de destination *'),
            SizedBox(height: 6.h),
            if (paysSelectionne == 'Sénégal')
              FDDropdown<String>(
                hint: 'Sélectionner une région...',
                value: widget.formData['region_destination'],
                items: _kRegionsMob,
                labelBuilder: (r) => r,
                onChanged: (v) => setState(() {
                  widget.formData['region_destination'] = v;
                  if (v != null) _regionCtrl.text = v;
                }),
                validator: FormValidators.requiredField,
              )
            else
              FDTextField(
                controller: _regionCtrl,
                hint: paysSelectionne != null ? 'Saisir la ville ou région...' : 'Sélectionnez d\'abord un pays',
                icon: Icons.map_outlined,
                validator: FormValidators.text,
              ),
          ],
        ),
      ),
    );
  }
}

class _MobLoadingField extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = AppColors(isDark);
    return Container(
      height: 52.h,
      decoration: BoxDecoration(
        color: c.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: c.borderMain),
      ),
      child: Center(
        child: SizedBox(
          height: 18.h,
          width: 18.w,
          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.lightAccent),
        ),
      ),
    );
  }
}

class _MobDateField extends FormField<String> {
  _MobDateField({
    required String? valeur,
    required String hint,
    required VoidCallback onTap,
  }) : super(
          initialValue: valeur,
          validator: FormValidators.requiredField,
          builder: (FormFieldState<String> state) {
            if (valeur != state.value) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                state.didChange(valeur);
              });
            }
            return Builder(builder: (context) {
              final isDark = Theme.of(context).brightness == Brightness.dark;
              final c = AppColors(isDark);

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GestureDetector(
                    onTap: onTap,
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      decoration: BoxDecoration(
                        color: c.bgCard,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: state.hasError ? AppColors.error : c.borderMain,
                          width: 1.0,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.calendar_today_outlined, size: 18, color: c.txtSecondary),
                          SizedBox(width: 12.w),
                          Expanded(
                            child: Text(
                              valeur ?? hint,
                              style: GoogleFonts.sora(
                                fontSize: 14.sp,
                                color: valeur == null ? c.txtSecondary : c.txtPrimary,
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
                        style: GoogleFonts.sora(color: AppColors.error, fontSize: 12.sp),
                      ),
                    ),
                ],
              );
            });
          },
        );
}
