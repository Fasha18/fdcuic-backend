import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/app_colors.dart';
import '../models/appel_a_projet.dart';

class AppelCard extends StatelessWidget {
  final AppelAProjet appel;
  final bool isDark;
  final VoidCallback onTap;

  const AppelCard({
    super.key,
    required this.appel,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color catColor;
    Color catBg;
    IconData icon;

    final type = appel.typeProjet?.toLowerCase() ?? '';
    if (type.contains('structuration')) {
      catColor = AppColors.catStructuration;
      catBg = isDark ? AppColors.catStructBgD : AppColors.catStructBgL;
      icon = Icons.corporate_fare_outlined;
    } else if (type.contains('evenementiel') || type.contains('événe')) {
      catColor = AppColors.catEvenementiel;
      catBg = isDark ? AppColors.catEventBgD : AppColors.catEventBgL;
      icon = Icons.celebration_outlined;
    } else {
      // Default / Formation
      catColor = AppColors.catFormation;
      catBg = isDark ? AppColors.catFormationBgD : AppColors.catFormationBgL;
      icon = Icons.school_outlined;
    }

    final isOpen = appel.statut.toLowerCase() == 'ouvert';

    // Formatage basique de la date (ex: 22 juil.)
    String dateLabel = appel.dateFin;
    if (dateLabel.length > 10) dateLabel = dateLabel.substring(0, 10);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: EdgeInsets.fromLTRB(24, 0, 24, 12),
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkBgCard : AppColors.lightBgCard,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isDark ? AppColors.darkBorder : AppColors.lightBorder, 
            width: 1
          ),
        ),
        child: Stack(
          children: [
            Positioned(
              left: 0, top: 0, bottom: 0,
              child: Container(
                width: 4,
                decoration: BoxDecoration(
                  color: catColor,
                  borderRadius: BorderRadius.only(topLeft: Radius.circular(17), bottomLeft: Radius.circular(17)),
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.fromLTRB(18, 14, 14, 14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    width: 40.w, height: 40.h,
                    decoration: BoxDecoration(color: catBg, borderRadius: BorderRadius.circular(11)),
                    child: Icon(icon, color: catColor, size: 19),
                  ),
                  SizedBox(width: 14.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                appel.titre,
                                style: GoogleFonts.sora(
                                  fontSize: 13.sp, 
                                  fontWeight: FontWeight.w600, 
                                  color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary, 
                                  height: 1.35
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            SizedBox(width: 8.w),
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                              decoration: BoxDecoration(
                                color: isOpen ? AppColors.successBg : AppColors.warningBg,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                isOpen ? "Ouvert" : "Bientôt",
                                style: GoogleFonts.sora(
                                  fontSize: 10.sp,
                                  fontWeight: FontWeight.w700,
                                  color: isOpen ? AppColors.success : AppColors.warning
                                ),
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 6.h),
                        Row(
                          children: [
                            Text(
                              appel.typeProjet ?? 'Projet',
                              style: GoogleFonts.sora(fontSize: 11.sp, fontWeight: FontWeight.w600, color: catColor),
                            ),
                            SizedBox(width: 12.w),
                            Icon(Icons.calendar_today_outlined, size: 11, color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary),
                            SizedBox(width: 4.w),
                            Text(
                              dateLabel,
                              style: GoogleFonts.sora(fontSize: 11.sp, color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: 8.w),
                  Icon(Icons.chevron_right_rounded, color: isDark ? AppColors.darkBorder : AppColors.lightBorder, size: 18),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
