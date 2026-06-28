import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/app_colors.dart';
import '../../core/theme_provider.dart';
import '../../core/constants.dart';
import '../../models/appel_a_projet.dart';
import '../../services/api_service.dart';

import '../appels/appels_screen.dart';
import '../dossiers/mes_dossiers_screen.dart';
import '../profil/profil_screen.dart';
import '../appels/appel_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  final bool hideBottomNav;
  const HomeScreen({super.key, this.hideBottomNav = false});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  void _switchTab(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDark;
    final colors = AppColors(isDark);

    return Scaffold(
      backgroundColor: colors.bgPrimary,
      body: Column(
        children: [
          Expanded(
            child: IndexedStack(
              index: _currentIndex,
              children: [
                _HomeDashboardContent(
                  onNavigateToTab: _switchTab,
                  themeProvider: themeProvider,
                  colors: colors,
                ),
                const AppelsScreen(hideBottomNav: true),
                const MesDossiersScreen(),
                const ProfilScreen(),
              ],
            ),
          ),
          if (!widget.hideBottomNav)
            FDCBottomNav(
              currentIndex: _currentIndex,
              onTap: _switchTab,
              colors: colors,
            ),
        ],
      ),
    );
  }
}

class _HomeDashboardContent extends StatefulWidget {
  final ValueChanged<int> onNavigateToTab;
  final ThemeProvider themeProvider;
  final AppColors colors;

  const _HomeDashboardContent({
    required this.onNavigateToTab,
    required this.themeProvider,
    required this.colors,
  });

  @override
  State<_HomeDashboardContent> createState() => _HomeDashboardContentState();
}

class _HomeDashboardContentState extends State<_HomeDashboardContent> {
  Map<String, dynamic>? _user;
  List<AppelAProjet> _appelsOuverts = [];
  Map<String, dynamic>? _programmeMobilite;
  int _notifCount = 0;
  int _totalDossiers = 0;
  int _dossiersEnCours = 0;
  int _dossiersAcceptes = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userStr = prefs.getString('user');
      if (userStr != null) _user = jsonDecode(userStr);

      try {
        final rawAppels = await ApiService.getAppelsOuverts();
        _appelsOuverts = rawAppels.map((e) => AppelAProjet(
          id: e['id'] ?? 0,
          titre: e['titre'] ?? 'Sans titre',
          description: e['description'] ?? '',
          typeProjet: e['type_projet'],
          dateDebut: e['date_debut'] ?? e['date_ouverture'] ?? '',
          dateFin: e['date_fin'] ?? e['date_cloture'] ?? '',
          statut: e['statut'] ?? 'fermé',
          criteres: e['criteres'] ?? e['criteres_eligibilite'] ?? '',
        )).toList();
      } catch (e) {
        debugPrint('Erreur appels ouverts: $e');
      }

      try {
        _programmeMobilite = await ApiService.getProgrammeMobilite();
      } catch (_) {}

      final token = await ApiService.getToken();
      if (token != null) {
        List<dynamic> allDossiers = [];
        List<dynamic> allProjets = [];
        try { allDossiers = await ApiService.getMesDossiers(); } catch (_) {}
        try { allProjets = await ApiService.getMesProjets(); } catch (_) {}

        _totalDossiers = allDossiers.length + allProjets.length;
        _dossiersEnCours = allDossiers.where((d) => d['statut'] == 'brouillon' || d['statut'] == 'soumis' || d['statut'] == 'en_examen').length +
                           allProjets.where((p) => p['statut'] == 'brouillon' || p['statut'] == 'soumis' || p['statut'] == 'en_examen').length;
        _dossiersAcceptes = allDossiers.where((d) => d['statut'] == 'accepte').length +
                            allProjets.where((p) => p['statut'] == 'accepte').length;

        try {
          final notifs = await ApiService.getNotifications();
          _notifCount = notifs.where((n) => n['lu'] == false).length;
        } catch (_) {}
      }
    } catch (_) {} finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Center(child: CircularProgressIndicator(color: widget.colors.accentPurple));
    }

    final isDark = widget.themeProvider.isDark;
    final c = widget.colors;

    return Column(
      children: [
        // StatusBar Padding
        SizedBox(height: MediaQuery.of(context).padding.top),
        
        // ── 3.1 HEADER ───────────────────────
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 0, 24, 12),
          child: Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "FDCUIC",
                    style: GoogleFonts.sora(
                      fontSize: 19,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.05,
                      color: c.txtPrimary,
                    ),
                  ),
                  Text(
                    "ESPACE CANDIDAT",
                    style: GoogleFonts.sora(
                      fontSize: 9,
                      fontWeight: FontWeight.w600,
                      color: c.accentPurple,
                      letterSpacing: 0.12,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              // Toggle dark/light
              GestureDetector(
                onTap: () => widget.themeProvider.toggle(),
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: c.bgAccent,
                    borderRadius: BorderRadius.circular(11),
                    border: Border.all(color: c.borderMain),
                  ),
                  child: Icon(
                    isDark ? Icons.wb_sunny_outlined : Icons.nights_stay_outlined,
                    color: c.accentPurple,
                    size: 17,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Cloche notif
              GestureDetector(
                onTap: () => Navigator.pushNamed(context, AppRoutes.notifs),
                child: Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: c.bgCard,
                    borderRadius: BorderRadius.circular(13),
                    border: Border.all(color: c.borderMain),
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Icon(Icons.notifications_none_rounded, color: c.txtSecondary, size: 19),
                      if (_notifCount > 0)
                        Positioned(
                          top: 9,
                          right: 9,
                          child: Container(
                            width: 7,
                            height: 7,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFB7185),
                              borderRadius: BorderRadius.circular(50),
                              border: Border.all(color: c.bgPrimary, width: 1.5),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),

        // ── SCROLLABLE CONTENT ──────────────────
        Expanded(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── 3.2 HERO GREETING ─────────────
                Container(
                  padding: const EdgeInsets.fromLTRB(24, 8, 24, 20),
                  decoration: BoxDecoration(
                    color: c.bgHeader,
                    border: Border(bottom: BorderSide(color: c.borderMain, width: 1)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "TABLEAU DE BORD",
                        style: GoogleFonts.sora(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: c.txtSecondary,
                          letterSpacing: 0.1,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            "Bonjour,",
                            style: GoogleFonts.sora(
                              fontSize: 28,
                              fontWeight: FontWeight.w700,
                              color: c.txtPrimary,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
                            decoration: BoxDecoration(
                              color: c.bgAccent,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              _user?['prenom'] ?? 'Candidat',
                              style: GoogleFonts.sora(
                                fontSize: 28,
                                fontWeight: FontWeight.w700,
                                color: c.accentText,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "Suivez vos dossiers et découvrez les opportunités ouvertes.",
                        style: GoogleFonts.sora(
                          fontSize: 13,
                          color: c.txtSecondary,
                          height: 1.6,
                        ),
                        maxLines: 2,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // ── SECTION: MES DOSSIERS ─────────
                _SectionHeader(title: "Mes dossiers", actionText: "Voir tout", onTap: () => widget.onNavigateToTab(2), c: c),
                const SizedBox(height: 12),
                
                // ── 3.3 DOSSIER STAT ROW ──────────
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Row(
                    children: [
                      DossierStatCard(
                        label: "Dossiers soumis",
                        badge: "Total",
                        count: _totalDossiers,
                        accentColor: const Color(0xFF7C5CFC),
                        iconBg: isDark ? const Color(0xFF160E38) : const Color(0xFFEDE9FF),
                        icon: Icons.folder_outlined,
                        c: c,
                      ),
                      const SizedBox(width: 12),
                      DossierStatCard(
                        label: "En cours",
                        badge: "Actifs",
                        count: _dossiersEnCours,
                        accentColor: const Color(0xFFD97706),
                        iconBg: isDark ? const Color(0xFF1A1206) : const Color(0xFFFEF3C7),
                        icon: Icons.access_time_outlined,
                        c: c,
                      ),
                      const SizedBox(width: 12),
                      DossierStatCard(
                        label: "Accepté",
                        badge: "OK",
                        count: _dossiersAcceptes,
                        accentColor: const Color(0xFF16A34A),
                        iconBg: isDark ? const Color(0xFF071A12) : const Color(0xFFDCFCE7),
                        icon: Icons.check_circle_outline,
                        c: c,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),
                Divider(color: c.borderMain, thickness: 1, height: 1),
                const SizedBox(height: 16),

                // ── SECTION: APPEL EN VEDETTE ─────
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Row(
                    children: [
                      Text(
                        "Appel en vedette",
                        style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.w600, color: c.txtPrimary),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDCFCE7),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          "Ouvert",
                          style: GoogleFonts.sora(fontSize: 10, fontWeight: FontWeight.w700, color: const Color(0xFF16A34A)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // ── 3.4 FEATURED APPEL CARD ───────
                FeaturedAppelCard(
                  c: c,
                  isDark: isDark,
                  onTap: () {
                    if (_programmeMobilite != null) {
                      Navigator.push(context, MaterialPageRoute(
                        builder: (_) => AppelDetailScreen(
                          appel: AppelAProjet(
                            id: _programmeMobilite!['id'],
                            titre: _programmeMobilite!['titre'] ?? 'Programme de Mobilité',
                            description: _programmeMobilite!['description'] ?? '',
                            typeProjet: 'mobilite',
                            dateDebut: _programmeMobilite!['date_ouverture'] ?? '',
                            dateFin: _programmeMobilite!['date_cloture'] ?? '',
                            statut: _programmeMobilite!['statut'] ?? 'ouvert',
                            criteres: _programmeMobilite!['criteres_eligibilite'] ?? '',
                            imageCouverture: _programmeMobilite!['image_couverture'],
                          )
                        )
                      ));
                    }
                  },
                ),

                const SizedBox(height: 16),

                // ── SECTION: APPELS À PROJETS ─────
                _SectionHeader(title: "Appels à projets", actionText: "Voir tout", onTap: () => widget.onNavigateToTab(1), c: c),
                const SizedBox(height: 12),

                // ── 3.5 APPEL CARDS ───────────────
                if (_appelsOuverts.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Text("Aucun appel à projets pour le moment.", style: GoogleFonts.sora(color: c.txtSecondary)),
                  )
                else
                  ..._appelsOuverts.take(3).map((appel) => GestureDetector(
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(
                        builder: (_) => AppelDetailScreen(appel: appel)
                      ));
                    },
                    child: AppelCardUI(appel: appel, c: c, isDark: isDark),
                  )),

                const SizedBox(height: 30),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────
//  WIDGETS REUTILISABLES
// ─────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String title;
  final String actionText;
  final VoidCallback onTap;
  final AppColors c;

  const _SectionHeader({required this.title, required this.actionText, required this.onTap, required this.c});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: GoogleFonts.sora(fontSize: 16, fontWeight: FontWeight.w600, color: c.txtPrimary)),
          GestureDetector(
            onTap: onTap,
            child: Text(actionText, style: GoogleFonts.sora(fontSize: 13, fontWeight: FontWeight.w600, color: c.accentPurple)),
          ),
        ],
      ),
    );
  }
}

// ── 3.3 DOSSIER STAT CARD ──
class DossierStatCard extends StatelessWidget {
  final String label;
  final String badge;
  final int count;
  final Color accentColor;
  final Color iconBg;
  final IconData icon;
  final AppColors c;

  const DossierStatCard({
    super.key,
    required this.label,
    required this.badge,
    required this.count,
    required this.accentColor,
    required this.iconBg,
    required this.icon,
    required this.c,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 128,
      decoration: BoxDecoration(
        color: c.bgCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: c.borderMain, width: 1),
      ),
      child: Stack(
        children: [
          Positioned(
            left: 0, top: 0, bottom: 0,
            child: Container(
              width: 3,
              decoration: BoxDecoration(
                color: accentColor,
                borderRadius: const BorderRadius.only(topLeft: Radius.circular(17), bottomLeft: Radius.circular(17)),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 14, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      width: 32, height: 32,
                      decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(9)),
                      child: Icon(icon, color: accentColor, size: 16),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(20)),
                      child: Text(badge, style: GoogleFonts.sora(fontSize: 10, fontWeight: FontWeight.w600, color: accentColor)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  count.toString(),
                  style: GoogleFonts.sora(fontSize: 24, fontWeight: FontWeight.w700, color: c.txtPrimary, letterSpacing: -0.02),
                ),
                const SizedBox(height: 3),
                Text(
                  label,
                  style: GoogleFonts.sora(fontSize: 11, color: c.txtSecondary, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── 3.4 FEATURED APPEL CARD ──
class FeaturedAppelCard extends StatelessWidget {
  final AppColors c;
  final bool isDark;
  final VoidCallback onTap;

  const FeaturedAppelCard({super.key, required this.c, required this.isDark, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final mobBg = isDark ? const Color(0xFF110E2C) : Colors.white;
    final mobInner = isDark ? const Color(0xFF1E174A) : const Color(0xFFF3F0FF);
    final mobBorder = isDark ? const Color(0xFF2D1F6E) : const Color(0xFFC4B5FD);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 24),
        decoration: BoxDecoration(
          color: mobBg,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: mobBorder, width: 1),
        ),
        child: Stack(
          children: [
            Positioned(
              left: 0, top: 0, bottom: 0,
              child: Container(
                width: 3,
                decoration: BoxDecoration(
                  color: c.accentPurple,
                  borderRadius: const BorderRadius.only(topLeft: Radius.circular(17), bottomLeft: Radius.circular(17)),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 14, 14),
              child: Row(
                children: [
                  Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(color: mobInner, borderRadius: BorderRadius.circular(13)),
                    child: Icon(Icons.flight_takeoff_rounded, color: c.accentPurple, size: 21),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text("Mobilité", style: GoogleFonts.sora(fontSize: 15, fontWeight: FontWeight.w600, color: c.txtPrimary)),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                              decoration: BoxDecoration(color: c.accentPurple, borderRadius: BorderRadius.circular(20)),
                              child: Text(
                                "Ouvert",
                                style: GoogleFonts.sora(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white, letterSpacing: 0.04),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text("Soutien aux déplacements culturels", style: GoogleFonts.sora(fontSize: 12, color: c.txtSecondary)),
                      ],
                    ),
                  ),
                  const SizedBox(width: 14),
                  Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(color: c.accentPurple, borderRadius: BorderRadius.circular(11)),
                    child: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 17),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── 3.5 APPEL CARD ──
class AppelCardUI extends StatelessWidget {
  final AppelAProjet appel;
  final AppColors c;
  final bool isDark;

  const AppelCardUI({super.key, required this.appel, required this.c, required this.isDark});

  @override
  Widget build(BuildContext context) {
    Color catColor;
    Color catBg;
    IconData icon;

    final type = appel.typeProjet?.toLowerCase() ?? '';
    if (type.contains('structuration')) {
      catColor = const Color(0xFF0891B2);
      catBg = isDark ? const Color(0xFF071918) : const Color(0xFFE0F7FA);
      icon = Icons.corporate_fare_outlined;
    } else if (type.contains('evenementiel') || type.contains('événe')) {
      catColor = const Color(0xFFEA580C);
      catBg = isDark ? const Color(0xFF1A0E05) : const Color(0xFFFFF0E8);
      icon = Icons.celebration_outlined;
    } else {
      // Default / Formation
      catColor = c.accentPurple;
      catBg = isDark ? const Color(0xFF10103A) : const Color(0xFFEDE9FF);
      icon = Icons.school_outlined;
    }

    final isOpen = appel.statut.toLowerCase() == 'ouvert';

    // Formatage basique de la date (ex: 22 juil.)
    String dateLabel = appel.dateFin;
    if (dateLabel.length > 10) dateLabel = dateLabel.substring(0, 10);

    return Container(
      margin: const EdgeInsets.fromLTRB(24, 0, 24, 12),
      decoration: BoxDecoration(
        color: c.bgCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: c.borderMain, width: 1),
      ),
      child: Stack(
        children: [
          Positioned(
            left: 0, top: 0, bottom: 0,
            child: Container(
              width: 3,
              decoration: BoxDecoration(
                color: catColor,
                borderRadius: const BorderRadius.only(topLeft: Radius.circular(17), bottomLeft: Radius.circular(17)),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 14, 14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(color: catBg, borderRadius: BorderRadius.circular(11)),
                  child: Icon(icon, color: catColor, size: 19),
                ),
                const SizedBox(width: 14),
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
                              style: GoogleFonts.sora(fontSize: 13, fontWeight: FontWeight.w600, color: c.txtPrimary, height: 1.35),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                            decoration: BoxDecoration(
                              color: isOpen ? const Color(0xFFDCFCE7) : const Color(0xFFFEF9C3),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              isOpen ? "Ouvert" : "Bientôt",
                              style: GoogleFonts.sora(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: isOpen ? const Color(0xFF16A34A) : const Color(0xFFCA8A04)
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Text(
                            appel.typeProjet ?? 'Projet',
                            style: GoogleFonts.sora(fontSize: 11, fontWeight: FontWeight.w600, color: catColor),
                          ),
                          const SizedBox(width: 12),
                          Icon(Icons.calendar_today_outlined, size: 11, color: c.txtSecondary),
                          const SizedBox(width: 4),
                          Text(
                            dateLabel,
                            style: GoogleFonts.sora(fontSize: 11, color: c.txtSecondary),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Icon(Icons.chevron_right_rounded, color: c.borderMain, size: 18),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── 3.6 BOTTOM NAV BAR ──
class FDCBottomNav extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  final AppColors colors;

  const FDCBottomNav({super.key, required this.currentIndex, required this.onTap, required this.colors});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 74 + MediaQuery.of(context).padding.bottom,
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).padding.bottom),
      decoration: BoxDecoration(
        color: colors.navBg,
        border: Border(top: BorderSide(color: colors.navBorder, width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _NavItem(icon: Icons.home_rounded, label: "Accueil", index: 0, currentIndex: currentIndex, onTap: onTap, c: colors),
          _NavItem(icon: Icons.explore_outlined, label: "Explorer", index: 1, currentIndex: currentIndex, onTap: onTap, c: colors),
          _NavItem(icon: Icons.folder_outlined, label: "Dossiers", index: 2, currentIndex: currentIndex, onTap: onTap, c: colors),
          _NavItem(icon: Icons.person_outline_rounded, label: "Profil", index: 3, currentIndex: currentIndex, onTap: onTap, c: colors),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final int index;
  final int currentIndex;
  final Function(int) onTap;
  final AppColors c;

  const _NavItem({required this.icon, required this.label, required this.index, required this.currentIndex, required this.onTap, required this.c});

  @override
  Widget build(BuildContext context) {
    final isActive = currentIndex == index;
    return GestureDetector(
      onTap: () => onTap(index),
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 64,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 44, height: 34,
              decoration: BoxDecoration(
                color: isActive ? c.navActiveBg : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, size: 22, color: isActive ? c.navActive : c.navInactive),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: GoogleFonts.sora(
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                color: isActive ? c.navActive : c.navInactive,
                letterSpacing: 0.02,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
