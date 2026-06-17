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
            decoration: const BoxDecoration(gradient: FDGradients.header),
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(8, 8, 20, 20),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.arrow_back_ios_new_rounded,
                          color: FDColors.white, size: 18),
                    ),
                    Expanded(
                      child: Text(
                        appel.typeProjet ?? 'Appel à projets',
                        style: TextStyle(
                          color: FDColors.white.withValues(alpha: 0.7),
                          fontSize: 13,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
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
                          fontSize: 11,
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
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(appel.titre, style: FDText.h1),
                  const SizedBox(height: 16),

                  // Dates
                  _InfoRow(
                    icon: Icons.date_range_outlined,
                    label: 'Période',
                    value:
                        '${_fmt(appel.dateDebut)} → ${_fmt(appel.dateFin)}',
                  ),
                  const SizedBox(height: 10),
                  _InfoRow(
                    icon: Icons.category_outlined,
                    label: 'Type',
                    value: appel.typeProjet ?? '—',
                  ),
                  const Divider(height: 28),

                  // Description
                  const Text('Description', style: FDText.h3),
                  const SizedBox(height: 8),
                  Text(appel.description, style: FDText.body),

                  if (appel.criteres != null) ...[
                    const Divider(height: 28),
                    const Text('Critères d\'éligibilité', style: FDText.h3),
                    const SizedBox(height: 8),
                    Text(appel.criteres!, style: FDText.body),
                  ],

                  const SizedBox(height: 32),

                  // Bouton postuler
                  if (appel.estOuvert)
                    SizedBox(
                      width: double.infinity,
                      height: 54,
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
                          child: const Text(
                            'Postuler à cet appel →',
                            style: TextStyle(
                              color: FDColors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                    )
                  else
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: FDColors.ice,
                        borderRadius: BorderRadius.circular(FDRadius.sm),
                        border: Border.all(color: FDColors.border),
                      ),
                      child: const Text(
                        'Cet appel à projets est clôturé.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: FDColors.textSub,
                          fontSize: 13,
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
        const SizedBox(width: 8),
        Text('$label : ',
            style: FDText.bodySub.copyWith(fontWeight: FontWeight.w600)),
        Expanded(
          child: Text(value, style: FDText.bodySub),
        ),
      ],
    );
  }
}