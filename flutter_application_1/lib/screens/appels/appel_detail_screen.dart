import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/app_colors.dart';
import '../../models/appel_a_projet.dart';

class AppelDetailScreen extends StatelessWidget {
  final AppelAProjet appel;
  const AppelDetailScreen({super.key, required this.appel});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = AppColors(isDark);

    return Scaffold(
      backgroundColor: c.bgPrimary,
      body: Column(
        children: [
          // ── HEADER avec retour ─────────────────────────
          Container(
            color: c.bgHeader,
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: EdgeInsets.fromLTRB(8, 8, 20, 20),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(Icons.arrow_back_ios_new_rounded,
                          color: c.txtPrimary, size: 18),
                    ),
                    Expanded(
                      child: Text(
                        appel.typeProjet ?? 'Appel à projets',
                        style: GoogleFonts.sora(
                          color: c.txtSecondary,
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: appel.estOuvert
                            ? AppColors.successBg
                            : c.bgCard,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: appel.estOuvert ? AppColors.success : c.borderMain),
                      ),
                      child: Text(
                        appel.estOuvert ? '● Ouvert' : '● Fermé',
                        style: GoogleFonts.sora(
                          fontSize: 11.sp,
                          fontWeight: FontWeight.w700,
                          color: appel.estOuvert
                              ? AppColors.success
                              : c.txtSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // ── CONTENU ────────────────────────────────────
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(20),
              child: Container(
                padding: EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: c.bgCard,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: c.borderMain),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(appel.titre, style: GoogleFonts.sora(fontSize: 22.sp, fontWeight: FontWeight.w700, color: c.txtPrimary)),
                    SizedBox(height: 16.h),

                    // Dates
                    _InfoRow(
                      icon: Icons.date_range_outlined,
                      label: 'Période',
                      value: '${_fmt(appel.dateDebut)} → ${_fmt(appel.dateFin)}',
                    ),
                    SizedBox(height: 10.h),
                    _InfoRow(
                      icon: Icons.category_outlined,
                      label: 'Type',
                      value: appel.typeProjet ?? '—',
                    ),
                    Divider(height: 28.h, color: c.borderMain),

                    // Description
                    Text('Description', style: GoogleFonts.sora(fontSize: 16.sp, fontWeight: FontWeight.w600, color: c.txtPrimary)),
                    SizedBox(height: 8.h),
                    Text(appel.description, style: GoogleFonts.sora(fontSize: 14.sp, color: c.txtSecondary, height: 1.5)),

                    if (appel.criteres != null) ...[
                      Divider(height: 28.h, color: c.borderMain),
                      Text('Critères d\'éligibilité', style: GoogleFonts.sora(fontSize: 16.sp, fontWeight: FontWeight.w600, color: c.txtPrimary)),
                      SizedBox(height: 8.h),
                      Text(appel.criteres!, style: GoogleFonts.sora(fontSize: 14.sp, color: c.txtSecondary, height: 1.5)),
                    ],

                    SizedBox(height: 32.h),

                    // Bouton postuler
                    if (appel.estOuvert)
                      SizedBox(
                        width: double.infinity,
                        height: 54.h,
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.pushNamed(
                              context,
                              '/formulaire-appel',
                              arguments: appel.id,
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: c.accentPurple,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text(
                            'Postuler à cet appel →',
                            style: GoogleFonts.sora(
                              color: Colors.white,
                              fontSize: 15.sp,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      )
                    else
                      Container(
                        width: double.infinity,
                        padding: EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: c.bgPrimary,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: c.borderMain),
                        ),
                        child: Text(
                          'Cet appel à projets est clôturé.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.sora(
                            color: c.txtSecondary,
                            fontSize: 13.sp,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _fmt(String date) {
    final p = date.split('-');
    if (p.length != 3) return date;
    const m = ['','jan.','fév.','mar.','avr.','mai','juin',
                'juil.','août','sep.','oct.','nov.','déc.'];
    return '${p[2]} ${m[int.parse(p[1])]} ${p[0]}';
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label, value;
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = AppColors(isDark);

    return Row(
      children: [
        Icon(icon, size: 16, color: c.txtSecondary),
        SizedBox(width: 8.w),
        Text('$label : ',
            style: GoogleFonts.sora(fontSize: 13.sp, fontWeight: FontWeight.w600, color: c.txtPrimary)),
        Expanded(
          child: Text(value, style: GoogleFonts.sora(fontSize: 13.sp, color: c.txtSecondary)),
        ),
      ],
    );
  }
}