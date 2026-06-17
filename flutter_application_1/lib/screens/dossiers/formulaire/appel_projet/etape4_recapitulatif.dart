import 'package:flutter/material.dart';
import '../../../../core/theme.dart';
import '../../../../widgets/form_widgets.dart';

class Etape4Recapitulatif extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final Map<String, dynamic> formData;
  final Function(int) onEditStep;
  
  const Etape4Recapitulatif({
    super.key,
    required this.formKey,
    required this.formData,
    required this.onEditStep,
  });

  @override
  State<Etape4Recapitulatif> createState() => _Etape4RecapitulatifState();
}

class _Etape4RecapitulatifState extends State<Etape4Recapitulatif> {
  bool _confirme = false;

  @override
  Widget build(BuildContext context) {
    return Form(
      key: widget.formKey,
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const FDRecapSection(
              titre: 'Étape 1 — Informations générales',
              icone: Icons.info_outline,
              complet: true,
            ),
            const SizedBox(height: 12),
            const FDRecapSection(
              titre: 'Étape 2 — Détails et impacts',
              icone: Icons.analytics_outlined,
              complet: true,
            ),
            const SizedBox(height: 12),
            const FDRecapSection(
              titre: 'Étape 3 — Documents',
              icone: Icons.folder_outlined,
              complet: true,
            ),
            const SizedBox(height: 16),

            GestureDetector(
              onTap: () {
                setState(() => _confirme = !_confirme);
              },
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
                        'Je certifie que les informations fournies sont exactes et complètes.',
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
