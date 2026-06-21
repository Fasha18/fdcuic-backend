

import 'package:flutter/material.dart';
import '../core/theme.dart';
import 'auth_widgets.dart';

// ── DROPDOWN ──────────────────────────────────────────────
class FDDropdown extends StatelessWidget {
  final String hint;
  final String? value;
  final List<String> items;
  final String Function(String) labelBuilder;
  final ValueChanged<String?> onChanged;
  final String? Function(String?)? validator;

  const FDDropdown({
    super.key,
    required this.hint,
    required this.value,
    required this.items,
    required this.labelBuilder,
    required this.onChanged,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      value: value,
      hint: Text(hint,
          style: FDText.bodySub.copyWith(color: FDColors.textHint)),
      isExpanded: true,
      icon: const Icon(Icons.keyboard_arrow_down_rounded,
          color: FDColors.textSub),
      style: FDText.body.copyWith(color: FDColors.textPrimary),
      dropdownColor: FDColors.white,
      decoration: InputDecoration(
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        filled: true,
        fillColor: FDColors.ice,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(FDRadius.sm),
          borderSide: BorderSide(color: FDColors.border, width: 0.8),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(FDRadius.sm),
          borderSide: BorderSide(color: FDColors.border, width: 0.8),
        ),
        errorMaxLines: 2,
      ),
      items: items.map((v) => DropdownMenuItem(
        value: v,
        child: Text(labelBuilder(v)),
      )).toList(),
      onChanged: onChanged,
      validator: validator,
    );
  }
}

// ── TEXTAREA ──────────────────────────────────────────────
class FDTextArea extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final int maxLines;
  final String? Function(String?)? validator;

  const FDTextArea({
    super.key,
    required this.controller,
    required this.hint,
    this.maxLines = 4,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      style: FDText.body.copyWith(color: FDColors.textPrimary),
      validator: validator,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: FDText.bodySub.copyWith(color: FDColors.textHint),
        alignLabelWithHint: true,
        errorMaxLines: 2,
      ),
    );
  }
}

// ── CHAMP + LABEL ─────────────────────────────────────────
class FDChampTexte extends StatelessWidget {
  final String label;
  final TextEditingController ctrl;
  final String hint;
  final int maxLines;
  final String? Function(String?)? validator;

  const FDChampTexte(this.label, this.ctrl, this.hint,
      {super.key, this.maxLines = 4, this.validator});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FDLabel(label),
          const SizedBox(height: 6),
          FDTextArea(controller: ctrl, hint: hint, maxLines: maxLines, validator: validator),
        ],
      ),
    );
  }
}

// ── BANNER INFO ───────────────────────────────────────────
class FDInfoBanner extends StatelessWidget {
  final String message;
  const FDInfoBanner(this.message, {super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: FDColors.electricBlue.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(FDRadius.sm),
        border: Border.all(color: FDColors.electricBlue.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline, size: 16, color: FDColors.electricBlue),
          const SizedBox(width: 8),
          Expanded(
            child: Text(message,
                style: FDText.bodySub.copyWith(color: FDColors.electricBlue)),
          ),
        ],
      ),
    );
  }
}

// ── DOC UPLOAD FIELD ──────────────────────────────────────
class FDDocUploadField extends StatelessWidget {
  final String label;
  final bool isRequis;
  final String? fichierNom;
  final VoidCallback onTap;
  final VoidCallback onSupprimer;

  const FDDocUploadField({
    super.key,
    required this.label,
    required this.isRequis,
    required this.fichierNom,
    required this.onTap,
    required this.onSupprimer,
  });

  @override
  Widget build(BuildContext context) {
    final uploaded = fichierNom != null;
    return GestureDetector(
      onTap: uploaded ? null : onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: uploaded ? FDColors.mint.withValues(alpha: 0.06) : FDColors.white,
          borderRadius: BorderRadius.circular(FDRadius.sm),
          border: Border.all(
            color: uploaded ? FDColors.mint : FDColors.border,
            width: uploaded ? 1 : 0.5,
          ),
          boxShadow: FDShadow.card,
        ),
        child: Row(
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                color: uploaded
                    ? FDColors.mint.withValues(alpha: 0.12)
                    : FDColors.ice,
                borderRadius: BorderRadius.circular(FDRadius.xs),
              ),
              child: Icon(
                uploaded ? Icons.check_circle_outline : Icons.upload_file_outlined,
                size: 20,
                color: uploaded ? FDColors.mint : FDColors.textSub,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(label, style: FDText.h3.copyWith(fontSize: 13)),
                      if (isRequis) ...[
                        const SizedBox(width: 4),
                        const Text('*',
                            style: TextStyle(
                                color: FDColors.coral,
                                fontSize: 13,
                                fontWeight: FontWeight.w700)),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    uploaded ? fichierNom! : 'Appuyer pour sélectionner',
                    style: FDText.bodySub.copyWith(
                      color: uploaded ? FDColors.mint : FDColors.textHint,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            if (uploaded)
              GestureDetector(
                onTap: onSupprimer,
                child: const Icon(Icons.close, size: 16, color: FDColors.coral),
              ),
          ],
        ),
      ),
    );
  }
}

// ── RECAP SECTION ─────────────────────────────────────────
class FDRecapSection extends StatelessWidget {
  final String titre;
  final IconData icone;
  final bool complet;

  const FDRecapSection({
    super.key,
    required this.titre,
    required this.icone,
    required this.complet,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: FDColors.white,
        borderRadius: BorderRadius.circular(FDRadius.sm),
        border: Border.all(color: FDColors.border, width: 0.5),
        boxShadow: FDShadow.card,
      ),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: complet ? FDColors.mint.withValues(alpha: 0.10) : FDColors.ice,
              borderRadius: BorderRadius.circular(FDRadius.xs),
            ),
            child: Icon(icone,
                size: 20,
                color: complet ? FDColors.mint : FDColors.silver),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(titre, style: FDText.h3.copyWith(fontSize: 13)),
          ),
          Icon(
            complet ? Icons.check_circle : Icons.radio_button_unchecked,
            color: complet ? FDColors.mint : FDColors.border,
            size: 20,
          ),
        ],
      ),
    );
  }
}

