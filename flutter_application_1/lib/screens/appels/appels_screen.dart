import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/appel_a_projet.dart';
import '../../models/programme_mobilite.dart';
import '../../services/api_service.dart';
import 'appel_detail_screen.dart';

class AppelsScreen extends StatefulWidget {
  final bool hideBottomNav;
  const AppelsScreen({super.key, this.hideBottomNav = false});
  @override
  State<AppelsScreen> createState() => _AppelsScreenState();
}

class _AppelsScreenState extends State<AppelsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  List<AppelAProjet> _appels = [];
  ProgrammeMobilite? _mobilite;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final appelsData = await ApiService.getTousLesAppels();
      final mobiliteData = await ApiService.getProgrammeMobilite();

      if (mounted) {
        setState(() {
          _appels = appelsData.map((e) => AppelAProjet(
            id: e['id'],
            titre: e['titre'],
            description: e['description'] ?? '',
            typeProjet: e['type_projet'],
            dateDebut: e['date_debut'] ?? e['date_ouverture'] ?? '',
            dateFin: e['date_fin'] ?? e['date_cloture'] ?? '',
            statut: e['statut'],
            criteres: e['criteres'] ?? e['criteres_eligibilite'] ?? '',
          )).toList();

          _mobilite = ProgrammeMobilite(
            id: mobiliteData['id'],
            titre: mobiliteData['titre'],
            description: mobiliteData['description'] ?? '',
            criteresEligibilite: mobiliteData['criteres_eligibilite'],
            statut: mobiliteData['statut'],
          );
        });
      }
    } catch (e) {
      debugPrint('Erreur de chargement: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: FDColors.skyBg,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: FDColors.skyBg,
      body: Column(
        children: [
          // ── HEADER ──────────────────────────────────────
          Container(
            decoration: const BoxDecoration(gradient: FDGradients.header),
            child: SafeArea(
              bottom: false,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Explorer',
                          style: TextStyle(
                            color: FDColors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        Container(
                          width: 36, height: 36,
                          decoration: BoxDecoration(
                            color: FDColors.white.withValues(alpha: 0.12),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.search_rounded,
                            color: FDColors.white,
                            size: 18,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // ── TABS ──────────────────────────────────
                  TabBar(
                    controller: _tabController,
                    indicatorColor: FDColors.white,
                    indicatorWeight: 3,
                    labelColor: FDColors.white,
                    unselectedLabelColor: FDColors.white.withValues(alpha: 0.5),
                    labelStyle: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                    unselectedLabelStyle: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w400,
                    ),
                    tabs: const [
                      Tab(text: 'Appels à projets'),
                      Tab(text: 'Mobilité'),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // ── CONTENU TABS ─────────────────────────────────
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _AppelsTab(appels: _appels),
                if (_mobilite != null)
                  _MobiliteTab(programme: _mobilite!)
                else
                  const _EmptyState(message: 'Aucun programme de mobilité trouvé.'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ════════════════════════════════════════════════
//  TAB 1 — APPELS À PROJETS
// ════════════════════════════════════════════════
class _AppelsTab extends StatefulWidget {
  final List<AppelAProjet> appels;
  const _AppelsTab({required this.appels});

  @override
  State<_AppelsTab> createState() => _AppelsTabState();
}

class _AppelsTabState extends State<_AppelsTab> {
  String _filtre = 'tous'; // tous | ouvert | fermé

  List<AppelAProjet> get _filtres {
    if (_filtre == 'tous') return widget.appels;
    return widget.appels.where((a) => a.statut == _filtre).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // ── FILTRES ─────────────────────────────────────
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Row(
            children: [
              _FiltreChip(
                label: 'Tous',
                actif: _filtre == 'tous',
                onTap: () => setState(() => _filtre = 'tous'),
              ),
              const SizedBox(width: 8),
              _FiltreChip(
                label: 'Ouverts',
                actif: _filtre == 'ouvert',
                onTap: () => setState(() => _filtre = 'ouvert'),
                color: FDColors.mint,
              ),
              const SizedBox(width: 8),
              _FiltreChip(
                label: 'Fermés',
                actif: _filtre == 'fermé',
                onTap: () => setState(() => _filtre = 'fermé'),
                color: FDColors.silver,
              ),
            ],
          ),
        ),

        // ── LISTE ────────────────────────────────────────
        Expanded(
          child: _filtres.isEmpty
              ? _EmptyState(
                  message: 'Aucun appel ${_filtre == "ouvert" ? "ouvert" : "fermé"} pour le moment.',
                )
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                  itemCount: _filtres.length,
                  itemBuilder: (context, i) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _AppelCard(
                      appel: _filtres[i],
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              AppelDetailScreen(appel: _filtres[i]),
                        ),
                      ),
                    ),
                  ),
                ),
        ),
      ],
    );
  }
}

// ════════════════════════════════════════════════
//  TAB 2 — MOBILITÉ
// ════════════════════════════════════════════════
class _MobiliteTab extends StatelessWidget {
  final ProgrammeMobilite programme;
  const _MobiliteTab({required this.programme});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── CARTE HERO ────────────────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: FDGradients.featuredCard,
              borderRadius: BorderRadius.circular(FDRadius.lg),
              boxShadow: FDShadow.ice,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: FDColors.mint.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(FDRadius.xs),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 6, height: 6,
                            decoration: const BoxDecoration(
                              color: FDColors.mint,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 5),
                          const Text(
                            'Ouvert toute l\'année',
                            style: TextStyle(
                              color: FDColors.mint,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Text(
                  programme.titre,
                  style: const TextStyle(
                    color: FDColors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  programme.description,
                  style: TextStyle(
                    color: FDColors.white.withValues(alpha: 0.65),
                    fontSize: 13,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: ElevatedButton(
                    onPressed: () {
                      // → Navigation vers formulaire mobilité
                      Navigator.pushNamed(context, '/formulaire-mobilite');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: FDColors.white,
                      foregroundColor: FDColors.navy,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(FDRadius.sm),
                      ),
                    ),
                    child: const Text(
                      'Déposer ma candidature →',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ── CRITÈRES D'ÉLIGIBILITÉ ────────────────────
          if (programme.criteresEligibilite != null) ...[
            const Text(
              'Critères d\'éligibilité',
              style: FDText.h3,
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: FDColors.white,
                borderRadius: BorderRadius.circular(FDRadius.md),
                border: Border.all(color: FDColors.border, width: 0.5),
                boxShadow: FDShadow.card,
              ),
              child: Column(
                children: programme.criteresEligibilite!
                    .split('·')
                    .where((c) => c.trim().isNotEmpty)
                    .map((critere) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 6),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 6, height: 6,
                                margin: const EdgeInsets.only(top: 5, right: 10),
                                decoration: const BoxDecoration(
                                  color: FDColors.royal,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              Expanded(
                                child: Text(
                                  critere.trim(),
                                  style: FDText.body,
                                ),
                              ),
                            ],
                          ),
                        ))
                    .toList(),
              ),
            ),
            const SizedBox(height: 24),
          ],

          // ── ÉTAPES DU FORMULAIRE ──────────────────────
          const Text('Le formulaire en 5 étapes', style: FDText.h3),
          const SizedBox(height: 12),
          ..._etapesMobilite.asMap().entries.map((entry) {
            final i = entry.key;
            final etape = entry.value;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                children: [
                  Container(
                    width: 32, height: 32,
                    decoration: BoxDecoration(
                      color: FDColors.ice,
                      shape: BoxShape.circle,
                      border: Border.all(
                          color: FDColors.border, width: 0.5),
                    ),
                    child: Center(
                      child: Text(
                        '${i + 1}',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: FDColors.royal,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(etape['titre']!,
                            style: FDText.h3.copyWith(fontSize: 13)),
                        Text(etape['desc']!, style: FDText.bodySub),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  static const _etapesMobilite = [
    {'titre': 'Informations générales', 'desc': 'Structure, discipline, dates, destination'},
    {'titre': 'Contexte et objectifs', 'desc': 'Présentation, pertinence, objectifs'},
    {'titre': 'Programme et impact', 'desc': 'Activités prévues, résultats attendus'},
    {'titre': 'Documents et annexes', 'desc': 'NINEA, invitation, CV/portfolio'},
    {'titre': 'Récapitulatif', 'desc': 'Vérification et soumission du dossier'},
  ];
}

// ════════════════════════════════════════════════
//  WIDGETS LOCAUX
// ════════════════════════════════════════════════

class _AppelCard extends StatelessWidget {
  final AppelAProjet appel;
  final VoidCallback onTap;
  const _AppelCard({required this.appel, required this.onTap});

  IconData get _icon {
    switch (appel.typeProjet) {
      case 'evenementiel': return Icons.calendar_today_outlined;
      case 'structuration': return Icons.business_outlined;
      case 'formation': return Icons.school_outlined;
      default: return Icons.folder_outlined;
    }
  }

  Color get _typeColor {
    switch (appel.typeProjet) {
      case 'evenementiel': return FDColors.violet;
      case 'structuration': return FDColors.royal;
      case 'formation': return FDColors.electricBlue;
      default: return FDColors.silver;
    }
  }

  String get _typeLabel {
    switch (appel.typeProjet) {
      case 'evenementiel': return 'Événementiel';
      case 'structuration': return 'Structuration';
      case 'formation': return 'Formation';
      default: return 'Appel';
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: FDColors.white,
          borderRadius: BorderRadius.circular(FDRadius.md),
          border: Border.all(color: FDColors.border, width: 0.5),
          boxShadow: FDShadow.card,
        ),
        child: Row(
          children: [
            // Icône type
            Container(
              width: 46, height: 46,
              decoration: BoxDecoration(
                color: appel.estOuvert
                    ? _typeColor.withValues(alpha: 0.10)
                    : FDColors.ice,
                borderRadius: BorderRadius.circular(FDRadius.sm),
              ),
              child: Icon(
                _icon,
                color: appel.estOuvert ? _typeColor : FDColors.silver,
                size: 22,
              ),
            ),
            const SizedBox(width: 14),

            // Infos
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _MiniTag(_typeLabel, _typeColor,
                          _typeColor.withValues(alpha: 0.10)),
                      const SizedBox(width: 6),
                      _MiniTag(
                        appel.estOuvert ? 'Ouvert' : 'Fermé',
                        appel.estOuvert ? FDColors.mint : FDColors.silver,
                        appel.estOuvert
                            ? FDColors.mint.withValues(alpha: 0.10)
                            : FDColors.ice,
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(appel.titre,
                      style: FDText.h3.copyWith(fontSize: 14)),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      Icon(Icons.access_time_rounded,
                          size: 12, color: FDColors.textSub),
                      const SizedBox(width: 4),
                      Text(
                        'Clôture : ${_formatDate(appel.dateFin)}',
                        style: FDText.bodySub.copyWith(fontSize: 11),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            Icon(Icons.chevron_right_rounded,
                color: FDColors.border, size: 20),
          ],
        ),
      ),
    );
  }

  String _formatDate(String date) {
    final parts = date.split('-');
    if (parts.length != 3) return date;
    const mois = [
      '', 'jan.', 'fév.', 'mar.', 'avr.', 'mai', 'juin',
      'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.'
    ];
    return '${parts[2]} ${mois[int.parse(parts[1])]} ${parts[0]}';
  }
}

class _FiltreChip extends StatelessWidget {
  final String label;
  final bool actif;
  final VoidCallback onTap;
  final Color color;
  const _FiltreChip({
    required this.label,
    required this.actif,
    required this.onTap,
    this.color = FDColors.royal,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: actif ? color.withValues(alpha: 0.12) : FDColors.white,
          borderRadius: BorderRadius.circular(FDRadius.pill),
          border: Border.all(
            color: actif ? color : FDColors.border,
            width: actif ? 1.5 : 0.5,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: actif ? FontWeight.w700 : FontWeight.w400,
            color: actif ? color : FDColors.textSub,
          ),
        ),
      ),
    );
  }
}

class _MiniTag extends StatelessWidget {
  final String text;
  final Color color, bg;
  const _MiniTag(this.text, this.color, this.bg);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(FDRadius.xs),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.w700,
          color: color,
          letterSpacing: 0.1,
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final String message;
  const _EmptyState({required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inbox_outlined, size: 48, color: FDColors.border),
          const SizedBox(height: 12),
          Text(message,
              style: FDText.bodySub, textAlign: TextAlign.center),
        ],
      ),
    );
  }
}