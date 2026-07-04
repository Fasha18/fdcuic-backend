import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/appel_a_projet.dart';

class AppelDetailScreen extends StatelessWidget {
  final AppelAProjet appel;
  const AppelDetailScreen({super.key, required this.appel});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FDColors.skyBg,
      body: Column(
        children: [
          // ── HEADER avec retour ─────────────────────────
          Container(
            decoration: BoxDecoration(gradient: FDGradients.header),
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: EdgeInsets.fromLTRB(8, 8, 20, 20),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(Icons.arrow_back_ios_new_rounded,
                          color: FDColors.white, size: 18),
                    ),
                    Expanded(
                      child: Text(
                        appel.typeProjet ?? 'Appel à projets',
                        style: TextStyle(
                          color: FDColors.white.withValues(alpha: 0.7),
                          fontSize: 13.sp,
                        ),
                      ),
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: appel.estOuvert
                            ? FDColors.mint.withValues(alpha: 0.2)
                            : FDColors.silver.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(FDRadius.xs),
                      ),
                      child: Text(
                        appel.estOuvert ? '● Ouvert' : '● Fermé',
                        style: TextStyle(
                          fontSize: 11.sp,
                          fontWeight: FontWeight.w700,
                          color: appel.estOuvert
                              ? FDColors.mint
                              : FDColors.silver,
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(appel.titre, style: FDText.h1),
                  SizedBox(height: 16.h),

                  // Dates
                  _InfoRow(
                    icon: Icons.date_range_outlined,
                    label: 'Période',
                    value:
                        '${_fmt(appel.dateDebut)} → ${_fmt(appel.dateFin)}',
                  ),
                  SizedBox(height: 10.h),
                  _InfoRow(
                    icon: Icons.category_outlined,
                    label: 'Type',
                    value: appel.typeProjet ?? '—',
                  ),
                  Divider(height: 28.h),

                  // Description
                  Text('Description', style: FDText.h3),
                  SizedBox(height: 8.h),
                  Text(appel.description, style: FDText.body),

                  if (appel.criteres != null) ...[
                    Divider(height: 28.h),
                    Text('Critères d\'éligibilité', style: FDText.h3),
                    SizedBox(height: 8.h),
                    Text(appel.criteres!, style: FDText.body),
                  ],

                  SizedBox(height: 32.h),

                  // Bouton postuler
                  if (appel.estOuvert)
                    SizedBox(
                      width: double.infinity,
                      height: 54.h,
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: FDGradients.ctaButton,
                          borderRadius: BorderRadius.circular(FDRadius.sm),
                          boxShadow: FDShadow.ctaButton,
                        ),
                        child: ElevatedButton(
                          onPressed: () {
                            // → Navigation vers formulaire appel projet
                            Navigator.pushNamed(
                              context,
                              '/formulaire-appel',
                              arguments: appel.id,
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(FDRadius.sm),
                            ),
                          ),
                          child: Text(
                            'Postuler à cet appel →',
                            style: TextStyle(
                              color: FDColors.white,
                              fontSize: 15.sp,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                    )
                  else
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: FDColors.ice,
                        borderRadius: BorderRadius.circular(FDRadius.sm),
                        border: Border.all(color: FDColors.border),
                      ),
                      child: Text(
                        'Cet appel à projets est clôturé.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: FDColors.textSub,
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                ],
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
    return Row(
      children: [
        Icon(icon, size: 16, color: FDColors.textSub),
        SizedBox(width: 8.w),
        Text('$label : ',
            style: FDText.bodySub.copyWith(fontWeight: FontWeight.w600)),
        Expanded(
          child: Text(value, style: FDText.bodySub),
        ),
      ],
    );
  }
}