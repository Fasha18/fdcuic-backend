import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/appel_projet_dossier.dart';
import '../../models/projet_mobilite.dart';
import '../../services/api_service.dart';

class MesDossiersScreen extends StatefulWidget {
  const MesDossiersScreen({super.key});
  @override
  State<MesDossiersScreen> createState() => _MesDossiersScreenState();
}

class _MesDossiersScreenState extends State<MesDossiersScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  List<AppelProjetDossier> _dossiers = [];
  List<ProjetMobilite> _projets = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final dossiersData = await ApiService.getMesDossiers();
      final projetsData = await ApiService.getMesProjets();

      if (mounted) {
        setState(() {
          _dossiers = dossiersData
              .map((e) => AppelProjetDossier.fromJson(e))
              .toList();

          _projets = projetsData
              .map((e) => ProjetMobilite.fromJson(e))
              .toList();
        });
      }
    } catch (e) {
      debugPrint('Erreur chargement dossiers: $e');
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
                          'Mes Dossiers',
                          style: TextStyle(
                            color: FDColors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        // Compteur total
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: FDColors.white.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(FDRadius.pill),
                          ),
                          child: Text(
                            '${_dossiers.length + _projets.length} dossiers',
                            style: const TextStyle(
                              color: FDColors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // ── TABS ────────────────────────────────
                  TabBar(
                    controller: _tabController,
                    indicatorColor: FDColors.white,
                    indicatorWeight: 3,
                    labelColor: FDColors.white,
                    unselectedLabelColor: FDColors.white.withValues(alpha: 0.5),
                    labelStyle: const TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w700),
                    unselectedLabelStyle: const TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w400),
                    tabs: [
                      Tab(text: 'Appels (${_dossiers.length})'),
                      Tab(text: 'Mobilité (${_projets.length})'),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // ── CONTENU ─────────────────────────────────────
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _DossiersTab(dossiers: _dossiers),
                _MobiliteTab(projets: _projets),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ════════════════════════════════════════════════
//  TAB 1 — DOSSIERS APPELS À PROJETS
// ════════════════════════════════════════════════
class _DossiersTab extends StatelessWidget {
  final List<AppelProjetDossier> dossiers;
  const _DossiersTab({required this.dossiers});

  @override
  Widget build(BuildContext context) {
    if (dossiers.isEmpty) {
      return const _EmptyState(
        icon: Icons.folder_open_outlined,
        message: 'Vous n\'avez pas encore de dossier.\nPostulez à un appel à projets !',
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
      itemCount: dossiers.length,
      itemBuilder: (context, i) => Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: _DossierCard(dossier: dossiers[i]),
      ),
    );
  }
}

// ════════════════════════════════════════════════
//  TAB 2 — PROJETS MOBILITÉ
// ════════════════════════════════════════════════
class _MobiliteTab extends StatelessWidget {
  final List<ProjetMobilite> projets;
  const _MobiliteTab({required this.projets});

  @override
  Widget build(BuildContext context) {
    if (projets.isEmpty) {
      return const _EmptyState(
        icon: Icons.flight_takeoff_outlined,
        message: 'Pas encore de dossier mobilité.\nDéposez votre candidature !',
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
      itemCount: projets.length,
      itemBuilder: (context, i) => Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: _MobiliteCard(projet: projets[i]),
      ),
    );
  }
}

// ════════════════════════════════════════════════
//  CARD — DOSSIER APPEL PROJET
// ════════════════════════════════════════════════
class _TypeConfig {
  final String label;
  final Color color;
  final Color bg;

  const _TypeConfig(this.label, this.color, this.bg);

  factory _TypeConfig.from(String? type) {
    switch (type) {
      case 'evenementiel':
        return _TypeConfig('Événementiel', FDColors.coral, FDColors.coral.withValues(alpha: 0.1));
      case 'structuration':
        return _TypeConfig('Structuration', FDColors.royal, FDColors.royal.withValues(alpha: 0.1));
      case 'formation':
        return _TypeConfig('Formation', FDColors.mint, FDColors.mint.withValues(alpha: 0.1));
      default:
        return _TypeConfig('Appel', FDColors.textSub, FDColors.ice);
    }
  }
}

class _DossierCard extends StatelessWidget {
  final AppelProjetDossier dossier;
  const _DossierCard({required this.dossier});

  // Nombre total d'étapes selon type
  int get _totalEtapes => 4;

  double get _progression =>
      dossier.etapeCourante / _totalEtapes;

  @override
  Widget build(BuildContext context) {
    final statut = _StatutConfig.from(dossier.statut);
    final typeCfg = _TypeConfig.from(dossier.typeProjet);
    final isSoumis = dossier.statut == 'soumis';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isSoumis ? FDColors.gold.withValues(alpha: 0.05) : FDColors.white,
        borderRadius: BorderRadius.circular(FDRadius.md),
        border: Border(
          left: BorderSide(color: statut.color, width: isSoumis ? 4 : 3),
          top: BorderSide(color: isSoumis ? FDColors.gold.withValues(alpha: 0.3) : FDColors.border, width: 0.5),
          right: BorderSide(color: isSoumis ? FDColors.gold.withValues(alpha: 0.3) : FDColors.border, width: 0.5),
          bottom: BorderSide(color: isSoumis ? FDColors.gold.withValues(alpha: 0.3) : FDColors.border, width: 0.5),
        ),
        boxShadow: FDShadow.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Ligne 1 : type + statut
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(Icons.folder_special, size: 14, color: typeCfg.color),
                  const SizedBox(width: 6),
                  _MiniTag(
                    typeCfg.label,
                    typeCfg.color,
                    typeCfg.bg,
                  ),
                ],
              ),
              _StatutBadge(statut: statut),
            ],
          ),
          const SizedBox(height: 10),

          // Titre Appel
          Text(
            dossier.appel?.titre ?? 'Appel introuvable',
            style: FDText.h3,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          
          // Structure / Secteur
          Text(
            dossier.nomStructure != null && dossier.nomStructure!.isNotEmpty
                ? dossier.nomStructure!
                : 'Structure non renseignée',
            style: FDText.bodySub.copyWith(fontWeight: FontWeight.w600, color: FDColors.textPrimary),
          ),
          const SizedBox(height: 2),
          Text(
            '${dossier.secteurActivite ?? 'Secteur inconnu'} · ${dossier.region ?? 'Région inconnue'}',
            style: FDText.bodySub,
          ),
          const SizedBox(height: 12),

          if (isSoumis)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: FDColors.gold.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(FDRadius.sm),
                border: Border.all(color: FDColors.gold.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: FDColors.gold, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Candidature transmise et en attente d\'examen.',
                      style: FDText.bodySub.copyWith(color: FDColors.gold, fontWeight: FontWeight.w600, fontSize: 11),
                    ),
                  ),
                ],
              ),
            ),

          // Barre de progression (seulement si brouillon)
          if (dossier.statut == 'brouillon') ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Étape ${dossier.etapeCourante} sur $_totalEtapes',
                  style: FDText.bodySub.copyWith(fontSize: 11),
                ),
                Text(
                  '${(_progression * 100).toInt()}%',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: FDColors.royal,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: _progression,
                backgroundColor: FDColors.ice,
                valueColor:
                    const AlwaysStoppedAnimation(FDColors.royal),
                minHeight: 5,
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Bas de carte
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.calendar_today_outlined,
                      size: 12, color: FDColors.textSub),
                  const SizedBox(width: 4),
                  Text(
                    _formatDate(dossier.createdAt ?? ''),
                    style: FDText.bodySub.copyWith(fontSize: 11),
                  ),
                ],
              ),

              // Bouton action selon statut
              if (dossier.statut == 'brouillon')
                _ActionButton(
                  label: 'Continuer →',
                  onTap: () => Navigator.pushNamed(
                    context,
                    '/formulaire-appel',
                    arguments: dossier.id,
                  ),
                )
              else
                _ActionButton(
                  label: 'Voir le dossier',
                  onTap: () {},
                  outline: true,
                ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatDate(String date) {
    if (date.isEmpty) return '—';
    try {
      final dt = DateTime.parse(date);
      const m = ['','jan.','fév.','mar.','avr.','mai','juin','juil.','août','sep.','oct.','nov.','déc.'];
      return '${dt.day} ${m[dt.month]} ${dt.year}';
    } catch (e) {
      return date.split('T')[0];
    }
  }
}

// ════════════════════════════════════════════════
//  CARD — PROJET MOBILITÉ
// ════════════════════════════════════════════════
class _MobiliteCard extends StatelessWidget {
  final ProjetMobilite projet;
  const _MobiliteCard({required this.projet});

  double get _progression => projet.etapeCourante / 5;

  @override
  Widget build(BuildContext context) {
    final statut = _StatutConfig.from(projet.statut);
    final isSoumis = projet.statut == 'soumis';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isSoumis ? FDColors.gold.withValues(alpha: 0.05) : FDColors.white,
        borderRadius: BorderRadius.circular(FDRadius.md),
        border: Border(
          left: BorderSide(color: statut.color, width: isSoumis ? 4 : 3),
          top: BorderSide(color: isSoumis ? FDColors.gold.withValues(alpha: 0.3) : FDColors.border, width: 0.5),
          right: BorderSide(color: isSoumis ? FDColors.gold.withValues(alpha: 0.3) : FDColors.border, width: 0.5),
          bottom: BorderSide(color: isSoumis ? FDColors.gold.withValues(alpha: 0.3) : FDColors.border, width: 0.5),
        ),
        boxShadow: FDShadow.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Ligne 1
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(Icons.flight_takeoff, size: 14, color: FDColors.violet),
                  const SizedBox(width: 6),
                  _MiniTag('Mobilité', FDColors.violet, FDColors.violet.withValues(alpha: 0.1)),
                ],
              ),
              _StatutBadge(statut: statut),
            ],
          ),
          const SizedBox(height: 10),

          // Structure + destination
          Text(
            projet.nomStructure ?? 'Sans titre',
            style: FDText.h3,
          ),
          const SizedBox(height: 2),
          Row(
            children: [
              const Icon(Icons.flight_takeoff_outlined,
                  size: 13, color: FDColors.textSub),
              const SizedBox(width: 4),
              Text(
                '${projet.paysDestination ?? '—'} · ${projet.regionDestination ?? ''}',
                style: FDText.bodySub,
              ),
            ],
          ),
          const SizedBox(height: 4),
          if (projet.dateDepart != null)
            Row(
              children: [
                const Icon(Icons.date_range_outlined,
                    size: 13, color: FDColors.textSub),
                const SizedBox(width: 4),
                Text(
                  '${_fmt(projet.dateDepart!)} → ${_fmt(projet.dateArrivee ?? '')}',
                  style: FDText.bodySub.copyWith(fontSize: 11),
                ),
              ],
            ),
          const SizedBox(height: 12),

          // Progression si brouillon
          if (projet.statut == 'brouillon') ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Étape ${projet.etapeCourante} sur 5',
                  style: FDText.bodySub.copyWith(fontSize: 11),
                ),
                Text(
                  '${(_progression * 100).toInt()}%',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: FDColors.violet,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: _progression,
                backgroundColor: FDColors.ice,
                valueColor:
                    const AlwaysStoppedAnimation(FDColors.violet),
                minHeight: 5,
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Bouton
          Align(
            alignment: Alignment.centerRight,
            child: projet.statut == 'brouillon'
                ? _ActionButton(
                    label: 'Continuer →',
                    onTap: () => Navigator.pushNamed(
                      context,
                      '/formulaire-mobilite',
                      arguments: projet.id,
                    ),
                  )
                : _ActionButton(
                    label: 'Voir le dossier',
                    onTap: () {},
                    outline: true,
                  ),
          ),
        ],
      ),
    );
  }

  String _fmt(String date) {
    if (date.isEmpty) return '—';
    try {
      final dt = DateTime.parse(date);
      const m = ['','jan.','fév.','mar.','avr.','mai','juin','juil.','août','sep.','oct.','nov.','déc.'];
      return '${dt.day} ${m[dt.month]} ${dt.year}';
    } catch (e) {
      return date.split('T')[0];
    }
  }
}

// ════════════════════════════════════════════════
//  STATUT CONFIG — couleurs & labels centralisés
// ════════════════════════════════════════════════
class _StatutConfig {
  final String label;
  final Color color;
  final Color bg;

  const _StatutConfig({
    required this.label,
    required this.color,
    required this.bg,
  });

  factory _StatutConfig.from(String statut) {
    switch (statut) {
      case 'brouillon':
        return _StatutConfig(
          label: '● Brouillon',
          color: FDColors.textSub,
          bg: FDColors.ice,
        );
      case 'soumis':
        return _StatutConfig(
          label: '● Soumis',
          color: FDColors.gold,
          bg: FDColors.gold.withValues(alpha: 0.12),
        );
      case 'en_examen':
        return _StatutConfig(
          label: '● En examen',
          color: FDColors.electricBlue,
          bg: FDColors.electricBlue.withValues(alpha: 0.10),
        );
      case 'accepte':
        return _StatutConfig(
          label: '● Accepté',
          color: FDColors.mint,
          bg: FDColors.mint.withValues(alpha: 0.10),
        );
      case 'rejete':
        return _StatutConfig(
          label: '● Rejeté',
          color: FDColors.coral,
          bg: FDColors.coral.withValues(alpha: 0.10),
        );
      default:
        return _StatutConfig(
          label: statut,
          color: FDColors.silver,
          bg: FDColors.ice,
        );
    }
  }
}

// ════════════════════════════════════════════════
//  WIDGETS LOCAUX
// ════════════════════════════════════════════════
class _StatutBadge extends StatelessWidget {
  final _StatutConfig statut;
  const _StatutBadge({required this.statut});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: statut.bg,
        borderRadius: BorderRadius.circular(FDRadius.xs),
      ),
      child: Text(
        statut.label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: statut.color,
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

class _ActionButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final bool outline;
  const _ActionButton({
    required this.label,
    required this.onTap,
    this.outline = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          gradient: outline ? null : FDGradients.ctaButton,
          color: outline ? Colors.transparent : null,
          borderRadius: BorderRadius.circular(FDRadius.sm),
          border: outline
              ? Border.all(color: FDColors.royal, width: 1)
              : null,
          boxShadow: outline ? null : FDShadow.ctaButton,
        ),
        child: Text(
          label,
          style: TextStyle(
            color: outline ? FDColors.royal : FDColors.white,
            fontSize: 12,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String message;
  const _EmptyState({required this.icon, required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 52, color: FDColors.border),
          const SizedBox(height: 14),
          Text(
            message,
            style: FDText.bodySub,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}