import 'dart:convert';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme.dart';
import '../../core/constants.dart';
import '../../services/api_service.dart';
import '../appels/appels_screen.dart';
import '../appels/appel_detail_screen.dart';
import '../dossiers/mes_dossiers_screen.dart';
import '../profil/profil_screen.dart';
import '../../models/appel_a_projet.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  void _switchTab(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FDColors.skyBg,
      extendBody: true, // Important pour le Glass NavBar
      body: IndexedStack(
        index: _currentIndex,
        children: [
          _HomeDashboard(onNavigateToTab: _switchTab),
          const AppelsScreen(hideBottomNav: true),
          const MesDossiersScreen(),
          const ProfilScreen(),
        ],
      ),
      bottomNavigationBar: _GlassNavBar(
        currentIndex: _currentIndex,
        onTap: _switchTab,
      ),
    );
  }
}

// ══════════════════════════════════════════════════
//  FLOATING GLASS NAV BAR (Restored)
// ══════════════════════════════════════════════════
class _GlassNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  const _GlassNavBar({required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
        24, 0, 24, MediaQuery.of(context).padding.bottom + 12,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
          child: Container(
            height: 64,
            decoration: BoxDecoration(
              color: FDColors.navy.withValues(alpha: 0.85),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: FDColors.white.withValues(alpha: 0.08),
                width: 0.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: FDColors.navy.withValues(alpha: 0.3),
                  blurRadius: 30,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _GlassNavItem(
                  icon: Icons.home_rounded,
                  label: 'Accueil',
                  isActive: currentIndex == 0,
                  onTap: () => onTap(0),
                ),
                _GlassNavItem(
                  icon: Icons.explore_outlined,
                  label: 'Explorer',
                  isActive: currentIndex == 1,
                  onTap: () => onTap(1),
                ),
                _GlassNavItem(
                  icon: Icons.folder_copy_outlined,
                  label: 'Dossiers',
                  isActive: currentIndex == 2,
                  onTap: () => onTap(2),
                ),
                _GlassNavItem(
                  icon: Icons.person_outline_rounded,
                  label: 'Profil',
                  isActive: currentIndex == 3,
                  onTap: () => onTap(3),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _GlassNavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;
  const _GlassNavItem({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 64,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: isActive
                    ? FDColors.white.withValues(alpha: 0.15)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                size: 22,
                color: isActive
                    ? FDColors.white
                    : FDColors.white.withValues(alpha: 0.35),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 9,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                color: isActive
                    ? FDColors.white
                    : FDColors.white.withValues(alpha: 0.35),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ══════════════════════════════════════════════════
//  HOME DASHBOARD
// ══════════════════════════════════════════════════
class _HomeDashboard extends StatefulWidget {
  final ValueChanged<int> onNavigateToTab;
  const _HomeDashboard({required this.onNavigateToTab});
  @override
  State<_HomeDashboard> createState() => _HomeDashboardState();
}

class _HomeDashboardState extends State<_HomeDashboard> with TickerProviderStateMixin {
  Map<String, dynamic>? _user;
  List<AppelAProjet> _appelsOuverts = [];
  Map<String, dynamic>? _programmeMobilite;
  Map<String, dynamic>? _dossierEnCours;
  String? _dossierEnCoursType;
  int _notifCount = 0;
  int _totalDossiers = 0;
  int _dossiersEnCours = 0;
  int _dossiersAcceptes = 0;
  bool _isLoading = true;

  late PageController _carouselController;
  double _carouselPage = 0;

  late AnimationController _breathingController;

  @override
  void initState() {
    super.initState();
    _carouselController = PageController(viewportFraction: 0.82, initialPage: 0);
    _carouselController.addListener(() {
      setState(() => _carouselPage = _carouselController.page ?? 0);
    });

    // Animation de respiration pour le header
    _breathingController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 15),
    )..repeat(reverse: true);

    _loadData();
  }

  @override
  void dispose() {
    _carouselController.dispose();
    _breathingController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userStr = prefs.getString('user');
      if (userStr != null) _user = jsonDecode(userStr);

      try { 
        final rawAppels = await ApiService.getAppelsOuverts(); 
        _appelsOuverts = rawAppels.map((e) => AppelAProjet(
            id: e['id'],
            titre: e['titre'],
            description: e['description'] ?? '',
            typeProjet: e['type_projet'],
            dateDebut: e['date_debut'] ?? e['date_ouverture'] ?? '',
            dateFin: e['date_fin'] ?? e['date_cloture'] ?? '',
            statut: e['statut'],
            criteres: e['criteres'] ?? e['criteres_eligibilite'] ?? '',
        )).toList();
      } catch (e) {
        debugPrint('Erreur appels: $e');
      }
      try { _programmeMobilite = await ApiService.getProgrammeMobilite(); } catch (_) {}

      final token = await ApiService.getToken();
      if (token != null) {
        List<dynamic> allDossiers = [];
        List<dynamic> allProjets = [];
        try { allDossiers = await ApiService.getMesDossiers(); } catch (_) {}
        try { allProjets = await ApiService.getMesProjets(); } catch (_) {}

        _totalDossiers = allDossiers.length + allProjets.length;
        _dossiersEnCours = allDossiers.where((d) =>
            d['statut'] == 'brouillon' || d['statut'] == 'soumis' || d['statut'] == 'en_examen').length
            + allProjets.where((p) =>
            p['statut'] == 'brouillon' || p['statut'] == 'soumis' || p['statut'] == 'en_examen').length;
        _dossiersAcceptes = allDossiers.where((d) => d['statut'] == 'accepte').length
            + allProjets.where((p) => p['statut'] == 'accepte').length;

        final brouillonAppel = allDossiers.cast<Map<String, dynamic>?>().firstWhere(
          (d) => d?['statut'] == 'brouillon', orElse: () => null);
        if (brouillonAppel != null) {
          _dossierEnCours = brouillonAppel;
          _dossierEnCoursType = 'appel';
        } else {
          final brouillonMob = allProjets.cast<Map<String, dynamic>?>().firstWhere(
            (p) => p?['statut'] == 'brouillon', orElse: () => null);
          if (brouillonMob != null) {
            _dossierEnCours = brouillonMob;
            _dossierEnCoursType = 'mobilite';
          }
        }

        try {
          final notifs = await ApiService.getNotifications();
          _notifCount = notifs.where((n) => n['lu'] == false).length;
        } catch (_) {}
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ── DONNÉES CAROUSEL (Nouveaux contenus) ─────────────────
  List<_CarouselCardData> get _carouselCards {
    final cards = <_CarouselCardData>[];

    // Card 1: Dossier en cours (s'il y en a un)
    if (_dossierEnCours != null) {
      final totalEtapes = _dossierEnCoursType == 'mobilite' ? 5 : 4;
      final etape = _dossierEnCours!['etape_courante'] ?? 1;
      cards.add(_CarouselCardData(
        type: 'brouillon',
        gradient: const [Color(0xFFF5A623), Color(0xFFE8920A)],
        icon: Icons.edit_note_rounded,
        title: 'Brouillon en cours',
        subtitle: _dossierEnCours!['nom_structure'] ?? 'Sans titre',
        meta: 'Étape $etape sur $totalEtapes',
        progress: etape / totalEtapes,
      ));
    }

    // Card 2: Statistiques Dossiers
    cards.add(_CarouselCardData(
      type: 'dossiers',
      gradient: const [Color(0xFF0A1F4E), Color(0xFF1E5FD8)],
      icon: Icons.folder_copy_rounded,
      title: 'Vos dossiers soumis',
      subtitle: '$_totalDossiers dossier${_totalDossiers > 1 ? 's' : ''} au total',
      meta: '$_dossiersEnCours en cours · $_dossiersAcceptes accepté${_dossiersAcceptes > 1 ? 's' : ''}',
    ));

    // Card 3: Guide du candidat
    cards.add(const _CarouselCardData(
      type: 'guide',
      gradient: [Color(0xFF0095FF), Color(0xFF00C6FF)],
      icon: Icons.menu_book_rounded,
      title: 'Astuce du jour',
      subtitle: 'Guide du candidat',
      meta: 'Découvrez comment optimiser votre dossier',
    ));

    // Card 4: Actualités
    cards.add(const _CarouselCardData(
      type: 'news',
      gradient: [Color(0xFFE52E71), Color(0xFFFF8A00)],
      icon: Icons.newspaper_rounded,
      title: 'Actualités',
      subtitle: 'Nouveau Programme 2026',
      meta: 'Le Fonds s\'agrandit avec de nouveaux axes',
    ));

    return cards;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: FDColors.royal));
    }

    final cards = _carouselCards;

    return CustomScrollView(
      physics: const BouncingScrollPhysics(),
      slivers: [
        // ── NOUVEAU HEADER (Sticky) ─────────────
        SliverAppBar(
          expandedHeight: 210.0,
          floating: false,
          pinned: true,
          backgroundColor: FDColors.navy,
          elevation: 0,
          title: const Text(
            'FDCUIC',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: FDColors.white,
              letterSpacing: 1.5,
            ),
          ),
          actions: [
            GestureDetector(
              onTap: () => Navigator.pushNamed(context, AppRoutes.notifs),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    margin: const EdgeInsets.only(right: 16),
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: FDColors.white.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: FDColors.white.withValues(alpha: 0.2)),
                    ),
                    child: const Icon(Icons.notifications_outlined, color: FDColors.white, size: 22),
                  ),
                  if (_notifCount > 0)
                    Positioned(
                      right: 16,
                      top: 10,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: FDColors.coral,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          _notifCount > 9 ? '9+' : '$_notifCount',
                          style: const TextStyle(
                            color: FDColors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
          flexibleSpace: FlexibleSpaceBar(
            background: Container(
              decoration: const BoxDecoration(
                gradient: FDGradients.header,
              ),
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 60, 20, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        'Bonjour ${_user?['prenom'] ?? ''} 👋',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          color: FDColors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Votre espace candidat est prêt. Suivez vos dossiers et découvrez de nouvelles opportunités.',
                        style: TextStyle(
                          fontSize: 14,
                          color: FDColors.white.withValues(alpha: 0.9),
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),

        // ── CONTENU DE LA PAGE ─────────────
        SliverToBoxAdapter(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 24),

              // ── CAROUSEL HORIZONTAL ──────────
          SizedBox(
            height: 180, // Hauteur des cartes
            child: PageView.builder(
              controller: _carouselController,
              itemCount: cards.length,
              physics: const BouncingScrollPhysics(),
              itemBuilder: (context, index) {
                return _buildCarouselCard(index, cards[index]);
              },
            ),
          ),
          
          // ── INDICATEURS CAROUSEL ──────
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(cards.length, (i) {
              final distance = (_carouselPage - i).abs();
              final scale = (1 - distance.clamp(0.0, 1.0)) * 0.6 + 0.4;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: distance < 0.5 ? 24 : 8,
                height: 6,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(3),
                  color: FDColors.royal.withValues(alpha: scale),
                ),
              );
            }),
          ),

          const SizedBox(height: 30),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: const Text('Mobilité', 
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: FDColors.navy)),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: _buildMobiliteCard(),
          ),
          const SizedBox(height: 28),

          // ── APPELS À PROJETS (Restauré) ─────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Appels à projets', 
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: FDColors.navy)),
                GestureDetector(
                  onTap: () => widget.onNavigateToTab(1),
                  child: const Text('Voir tout', 
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: FDColors.royal)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: _buildAppelsList(),
          ),

              SizedBox(height: MediaQuery.of(context).padding.bottom + 100),
            ],
          ),
        ),
      ],
    );
  }



  // ────────────────────────────────────────────
  //  CAROUSEL CARD
  // ────────────────────────────────────────────
  Widget _buildCarouselCard(int index, _CarouselCardData data) {
    final diff = (_carouselPage - index);
    final absDiff = diff.abs().clamp(0.0, 1.0);
    final scale = 1.0 - (absDiff * 0.10);
    final opacity = 1.0 - (absDiff * 0.4);

    return Transform.scale(
      scale: scale,
      child: Opacity(
        opacity: opacity.clamp(0.0, 1.0),
        child: GestureDetector(
          onTap: () => _onCarouselCardTap(data.type),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: data.gradient,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: data.gradient.last.withValues(alpha: 0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: FDColors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(data.icon, color: FDColors.white, size: 24),
                    ),
                    if (data.progress != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: FDColors.white,
                          borderRadius: BorderRadius.circular(FDRadius.pill),
                        ),
                        child: Text(
                          '${(data.progress! * 100).toInt()}%',
                          style: TextStyle(
                            color: data.gradient.first,
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      )
                    else
                      Icon(Icons.arrow_outward_rounded,
                          color: FDColors.white.withValues(alpha: 0.6), size: 24),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      data.title,
                      style: TextStyle(
                        color: FDColors.white.withValues(alpha: 0.8),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      data.subtitle,
                      style: const TextStyle(
                        color: FDColors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.5,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (data.progress != null) ...[
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(3),
                        child: LinearProgressIndicator(
                          value: data.progress!,
                          backgroundColor: FDColors.white.withValues(alpha: 0.2),
                          valueColor: const AlwaysStoppedAnimation(FDColors.white),
                          minHeight: 5,
                        ),
                      ),
                    ],
                    const SizedBox(height: 6),
                    Text(
                      data.meta,
                      style: TextStyle(
                        color: FDColors.white.withValues(alpha: 0.6),
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _onCarouselCardTap(String type) {
    switch (type) {
      case 'brouillon':
        if (_dossierEnCoursType == 'appel') {
          Navigator.pushNamed(context, AppRoutes.formulaireAppel,
              arguments: _dossierEnCours!['appel_id'] ?? _dossierEnCours!['id']);
        } else {
          Navigator.pushNamed(context, AppRoutes.formulaireMobilite,
              arguments: _dossierEnCours!['id']);
        }
        break;
      case 'dossiers':
        widget.onNavigateToTab(2);
        break;
      case 'guide':
      case 'news':
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Bientôt disponible !'),
          backgroundColor: FDColors.royal,
        ));
        break;
    }
  }

  // ────────────────────────────────────────────
  //  MOBILITÉ CARD
  // ────────────────────────────────────────────
  Widget _buildMobiliteCard() {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, AppRoutes.formulaireMobilite),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF7B61FF), Color(0xFF9B85FF)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: FDColors.violet.withValues(alpha: 0.3),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 52, height: 52,
              decoration: BoxDecoration(
                color: FDColors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(Icons.flight_takeoff_rounded,
                  color: FDColors.white, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          _programmeMobilite?['titre'] ?? 'Mobilité',
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: FDColors.white,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: FDColors.white,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('Ouvert',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                            color: FDColors.violet,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _programmeMobilite?['description'] ?? 'Postulez pour un soutien aux déplacements.',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12,
                      color: FDColors.white.withValues(alpha: 0.8),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(
                color: FDColors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.arrow_forward_rounded,
                  size: 16, color: FDColors.white),
            ),
          ],
        ),
      ),
    );
  }

  // ────────────────────────────────────────────
  //  APPELS LIST
  // ────────────────────────────────────────────
  Widget _buildAppelsList() {
    if (_appelsOuverts.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: FDColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: FDColors.border),
        ),
        child: const Text(
          'Aucun appel à projet ouvert pour le moment.',
          style: TextStyle(color: FDColors.textSub),
          textAlign: TextAlign.center,
        ),
      );
    }

    return Column(
      children: _appelsOuverts.take(3).map((appel) {
        return GestureDetector(
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => AppelDetailScreen(appel: appel),
            ),
          ),
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: FDColors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: FDColors.border),
              boxShadow: FDShadow.card,
            ),
            child: Row(
              children: [
                // Icône
                Container(
                  width: 48, height: 48,
                  decoration: BoxDecoration(
                    color: FDColors.royal.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.description_outlined,
                      color: FDColors.royal),
                ),
                const SizedBox(width: 16),
                
                // Textes
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        appel.titre,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: FDColors.navy,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Date limite : ${appel.dateFin.isNotEmpty ? (appel.dateFin.length > 10 ? appel.dateFin.substring(0, 10) : appel.dateFin) : 'Non définie'}',
                        style: TextStyle(
                          fontSize: 12,
                          color: FDColors.textSub,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

// ══════════════════════════════════════════════════
//  DATA CLASSES
// ══════════════════════════════════════════════════
class _CarouselCardData {
  final String type;
  final List<Color> gradient;
  final IconData icon;
  final String title;
  final String subtitle;
  final String meta;
  final double? progress;

  const _CarouselCardData({
    required this.type,
    required this.gradient,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.meta,
    this.progress,
  });
}
