import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/app_colors.dart';
import 'auth_widgets.dart'; // Pour FDLabel

// ── DROPDOWN NATIF (DropdownButtonFormField) ──────────────
class FDDropdown<T> extends StatelessWidget {
  final String hint;
  final T? value;
  final List<T> items;
  final String Function(T) labelBuilder;
  final ValueChanged<T?> onChanged;
  final String? Function(T?)? validator;

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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = AppColors(isDark);

    // IMPORTANT: DropdownButtonFormField crashes with an assertion if the value
    // is not null AND not present in the items list. We sanitize here.
    final safeValue = (value != null && items.contains(value)) ? value : null;

    return DropdownButtonFormField<T>(
      value: safeValue,
      validator: validator,
      onChanged: onChanged,
      isExpanded: true,
      style: GoogleFonts.sora(
        color: c.txtPrimary,
        fontSize: 14.sp,
      ),
      icon: Icon(Icons.keyboard_arrow_down_rounded, color: c.txtSecondary, size: 20),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.sora(color: c.txtSecondary, fontSize: 14.sp),
        filled: true,
        fillColor: c.bgCard,
        contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: c.borderMain, width: 1.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: c.borderMain, width: 1.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: c.accentPurple, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.error, width: 1.0),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.error, width: 1.5),
        ),
        errorMaxLines: 2,
      ),
      dropdownColor: c.bgCard,
      borderRadius: BorderRadius.circular(12),
      items: items.map((item) {
        return DropdownMenuItem<T>(
          value: item,
          child: Text(
            labelBuilder(item),
            style: GoogleFonts.sora(
              color: c.txtPrimary,
              fontSize: 14.sp,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        );
      }).toList(),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = AppColors(isDark);

    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      style: GoogleFonts.sora(color: c.txtPrimary, fontSize: 14.sp),
      validator: validator,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.sora(color: c.txtSecondary, fontSize: 14.sp),
        alignLabelWithHint: true,
        filled: true,
        fillColor: c.bgPrimary,
        contentPadding: EdgeInsets.all(14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: c.borderMain, width: 1.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: c.borderMain, width: 1.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: c.accentPurple, width: 1.0),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.error, width: 1.0),
        ),
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
      padding: EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FDLabel(label),
          SizedBox(height: 6.h),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = AppColors(isDark);
    
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? c.accentPurple.withValues(alpha: 0.1) : AppColors.lightBgAccent,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? c.borderAccent : AppColors.lightBorderAccent),
      ),
      child: Row(
        children: [
          Icon(Icons.info_outline, size: 16, color: c.accentPurple),
          SizedBox(width: 8.w),
          Expanded(
            child: Text(message,
                style: GoogleFonts.sora(color: c.accentPurple, fontSize: 13.sp, fontWeight: FontWeight.w500)),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = AppColors(isDark);
    final uploaded = fichierNom != null;

    return GestureDetector(
      onTap: uploaded ? null : onTap,
      child: Container(
        padding: EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: uploaded ? AppColors.successBg : c.bgCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: uploaded ? AppColors.success : c.borderMain,
            width: uploaded ? 1 : 1.0,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 40.w, height: 40.h,
              decoration: BoxDecoration(
                color: uploaded ? AppColors.success.withValues(alpha: 0.2) : c.bgPrimary,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                uploaded ? Icons.check_circle_outline : Icons.upload_file_outlined,
                size: 20,
                color: uploaded ? AppColors.success : c.txtSecondary,
              ),
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(child: Text(label, style: GoogleFonts.sora(fontSize: 13.sp, fontWeight: FontWeight.w600, color: c.txtPrimary))),
                      if (isRequis) ...[
                        SizedBox(width: 4.w),
                        Text('*',
                            style: GoogleFonts.sora(
                                color: AppColors.error,
                                fontSize: 13.sp,
                                fontWeight: FontWeight.w700)),
                      ],
                    ],
                  ),
                  SizedBox(height: 2.h),
                  Text(
                    uploaded ? fichierNom! : 'Appuyer pour sélectionner',
                    style: GoogleFonts.sora(
                      color: uploaded ? AppColors.success : c.txtSecondary,
                      fontSize: 11.sp,
                    ),
                  ),
                ],
              ),
            ),
            if (uploaded)
              GestureDetector(
                onTap: onSupprimer,
                child: Icon(Icons.close, size: 16, color: AppColors.error),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = AppColors(isDark);

    return Container(
      padding: EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: c.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: c.borderMain, width: 1.0),
      ),
      child: Row(
        children: [
          Container(
            width: 40.w, height: 40.h,
            decoration: BoxDecoration(
              color: complet ? AppColors.successBg : c.bgPrimary,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icone,
                size: 20,
                color: complet ? AppColors.success : c.txtSecondary),
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: Text(titre, style: GoogleFonts.sora(fontSize: 13.sp, fontWeight: FontWeight.w600, color: c.txtPrimary)),
          ),
          Icon(
            complet ? Icons.check_circle : Icons.radio_button_unchecked,
            color: complet ? AppColors.success : c.borderMain,
            size: 20,
          ),
        ],
      ),
    );
  }
}
