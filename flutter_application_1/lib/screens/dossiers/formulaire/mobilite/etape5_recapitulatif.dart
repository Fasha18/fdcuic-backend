import 'package:flutter/material.dart';
import '../../../../core/theme.dart';
import '../../../../widgets/form_widgets.dart';

class Etape5RecapMob extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final Map<String, dynamic> formData;
  final Function(int) onEditStep;
  const Etape5RecapMob({super.key, required this.formKey, required this.formData, required this.onEditStep});
  @override
  State<Etape5RecapMob> createState() => _Etape5RecapMobState();
}

class _Etape5RecapMobState extends State<Etape5RecapMob> {
  bool _confirme = false;

  static const _etapes = [
    {'titre': 'Informations générales',  'icone': 'info'},
    {'titre': 'Contexte et objectifs',   'icone': 'analytics'},
    {'titre': 'Programme et impact',     'icone': 'map'},
    {'titre': 'Documents et annexes',    'icone': 'folder'},
  ];

  IconData _iconFor(String s) {
    switch (s) {
      case 'analytics': return Icons.analytics_outlined;
      case 'map':       return Icons.map_outlined;
      case 'folder':    return Icons.folder_outlined;
      default:          return Icons.info_outline;
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
            ..._etapes.map((e) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: FDRecapSection(
                titre: e['titre']!,
                icone: _iconFor(e['icone']!),
                complet: true,
              ),
            )),
            const SizedBox(height: 16),

            GestureDetector(
              onTap: () => setState(() => _confirme = !_confirme),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: _confirme ? FDColors.mint.withValues(alpha: 0.06) : FDColors.white,
                  borderRadius: BorderRadius.circular(FDRadius.sm),
                  border: Border.all(
                    color: _confirme ? FDColors.mint : FDColors.border,
                    width: _confirme ? 1 : 0.5,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      _confirme ? Icons.check_box_outlined : Icons.check_box_outline_blank,
                      color: _confirme ? FDColors.mint : FDColors.silver,
                      size: 20,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Je certifie que les informations fournies sont exactes.',
                        style: FDText.body.copyWith(fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
