import 'package:flutter_screenutil/flutter_screenutil.dart';
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
import '../../widgets/appel_card.dart';

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
          padding: EdgeInsets.fromLTRB(24, 0, 24, 12),
          child: Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "FDCUIC",
                    style: GoogleFonts.sora(
                      fontSize: 19.sp,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.05,
                      color: c.txtPrimary,
                    ),
                  ),
                  Text(
                    "ESPACE CANDIDAT",
                    style: GoogleFonts.sora(
                      fontSize: 9.sp,
                      fontWeight: FontWeight.w600,
                      color: c.accentPurple,
                      letterSpacing: 0.12,
                    ),
                  ),
                ],
              ),
              Spacer(),
              // Toggle dark/light
              GestureDetector(
                onTap: () => widget.themeProvider.toggle(),
                child: Container(
                  width: 36.w,
                  height: 36.h,
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
              SizedBox(width: 10.w),
              // Cloche notif
              GestureDetector(
                onTap: () => Navigator.pushNamed(context, AppRoutes.notifs),
                child: Container(
                  width: 42.w,
                  height: 42.h,
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
                            width: 7.w,
                            height: 7.h,
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
                  padding: EdgeInsets.fromLTRB(24, 8, 24, 20),
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
                          fontSize: 11.sp,
                          fontWeight: FontWeight.w600,
                          color: c.txtSecondary,
                          letterSpacing: 0.1,
                        ),
                      ),
                      SizedBox(height: 8.h),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            "Bonjour,",
                            style: GoogleFonts.sora(
                              fontSize: 28.sp,
                              fontWeight: FontWeight.w700,
                              color: c.txtPrimary,
                            ),
                          ),
                          SizedBox(width: 10.w),
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 2),
                            decoration: BoxDecoration(
                              color: c.bgAccent,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              _user?['prenom'] ?? 'Candidat',
                              style: GoogleFonts.sora(
                                fontSize: 28.sp,
                                fontWeight: FontWeight.w700,
                                color: c.accentText,
                              ),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 8.h),
                      Text(
                        "Suivez vos dossiers et découvrez les opportunités ouvertes.",
                        style: GoogleFonts.sora(
                          fontSize: 13.sp,
                          color: c.txtSecondary,
                          height: 1.6,
                        ),
                        maxLines: 2,
                      ),
                    ],
                  ),
                ),

                SizedBox(height: 16.h),

                // ── SECTION: MES DOSSIERS ─────────
                _SectionHeader(title: "Mes dossiers", actionText: "Voir tout", onTap: () => widget.onNavigateToTab(2), c: c),
                SizedBox(height: 12.h),
                
                // ── 3.3 DOSSIER STAT ROW ──────────
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  padding: EdgeInsets.symmetric(horizontal: 24),
                  child: Row(
                    children: [
                      DossierStatCard(
                        label: "Dossiers soumis",
                        badge: "Total",
                        count: _totalDossiers,
                        accentColor: isDark ? AppColors.darkAccent : AppColors.lightAccent,
                        iconBg: isDark ? AppColors.darkBgAccent : AppColors.lightBgAccent,
                        icon: Icons.folder_outlined,
                        c: c,
                      ),
                      SizedBox(width: 12.w),
                      DossierStatCard(
                        label: "En cours",
                        badge: "Actifs",
                        count: _dossiersEnCours,
                        accentColor: const Color(0xFFD97706),
                        iconBg: isDark ? const Color(0xFF1A1206) : const Color(0xFFFEF3C7),
                        icon: Icons.access_time_outlined,
                        c: c,
                      ),
                      SizedBox(width: 12.w),
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

                SizedBox(height: 24.h),
                Divider(color: c.borderMain, thickness: 1, height: 1),
                SizedBox(height: 16.h),

                // ── SECTION: APPEL EN VEDETTE ─────
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 24),
                  child: Row(
                    children: [
                      Text(
                        "Appel en vedette",
                        style: GoogleFonts.sora(fontSize: 16.sp, fontWeight: FontWeight.w600, color: c.txtPrimary),
                      ),
                      Spacer(),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDCFCE7),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          "Ouvert",
                          style: GoogleFonts.sora(fontSize: 10.sp, fontWeight: FontWeight.w700, color: const Color(0xFF16A34A)),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 12.h),

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

                SizedBox(height: 16.h),

                // ── SECTION: APPELS À PROJETS ─────
                _SectionHeader(title: "Appels à projets", actionText: "Voir tout", onTap: () => widget.onNavigateToTab(1), c: c),
                SizedBox(height: 12.h),

                // ── 3.5 APPEL CARDS ───────────────
                if (_appelsOuverts.isEmpty)
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 24),
                    child: Text("Aucun appel à projets pour le moment.", style: GoogleFonts.sora(color: c.txtSecondary)),
                  )
                else
                  ..._appelsOuverts.take(3).map((appel) => AppelCard(
                    appel: appel,
                    isDark: isDark,
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(
                        builder: (_) => AppelDetailScreen(appel: appel)
                      ));
                    },
                  )),

                SizedBox(height: 30.h),
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
      padding: EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: GoogleFonts.sora(fontSize: 16.sp, fontWeight: FontWeight.w600, color: c.txtPrimary)),
          GestureDetector(
            onTap: onTap,
            child: Text(actionText, style: GoogleFonts.sora(fontSize: 13.sp, fontWeight: FontWeight.w600, color: c.accentPurple)),
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
      width: 128.w,
      clipBehavior: Clip.antiAlias,
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
              width: 4,
              decoration: BoxDecoration(
                color: accentColor,
                borderRadius: BorderRadius.only(topLeft: Radius.circular(17), bottomLeft: Radius.circular(17)),
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(18, 14, 14, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      width: 32.w, height: 32.h,
                      decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(9)),
                      child: Icon(icon, color: accentColor, size: 16),
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(20)),
                      child: Text(badge, style: GoogleFonts.sora(fontSize: 10.sp, fontWeight: FontWeight.w600, color: accentColor)),
                    ),
                  ],
                ),
                SizedBox(height: 12.h),
                Text(
                  count.toString(),
                  style: GoogleFonts.sora(fontSize: 24.sp, fontWeight: FontWeight.w700, color: c.txtPrimary, letterSpacing: -0.02),
                ),
                SizedBox(height: 3.h),
                Text(
                  label,
                  style: GoogleFonts.sora(fontSize: 11.sp, color: c.txtSecondary, fontWeight: FontWeight.w500),
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
        margin: EdgeInsets.symmetric(horizontal: 24),
        clipBehavior: Clip.antiAlias,
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
                width: 4,
                decoration: BoxDecoration(
                  color: c.accentPurple,
                  borderRadius: BorderRadius.only(topLeft: Radius.circular(17), bottomLeft: Radius.circular(17)),
                ),
              ),
            ),
            Padding(
            padding: EdgeInsets.fromLTRB(18, 16, 16, 16),
            child: Row(
              children: [
                Container(
                    width: 44.w, height: 44.h,
                    decoration: BoxDecoration(color: mobInner, borderRadius: BorderRadius.circular(13)),
                    child: Icon(Icons.flight_takeoff_rounded, color: c.accentPurple, size: 21),
                  ),
                  SizedBox(width: 14.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text("Mobilité", style: GoogleFonts.sora(fontSize: 15.sp, fontWeight: FontWeight.w600, color: c.txtPrimary)),
                            SizedBox(width: 8.w),
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                              decoration: BoxDecoration(color: c.accentPurple, borderRadius: BorderRadius.circular(20)),
                              child: Text(
                                "Ouvert",
                                style: GoogleFonts.sora(fontSize: 10.sp, fontWeight: FontWeight.w700, color: Colors.white, letterSpacing: 0.04),
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 4.h),
                        Text("Soutien aux déplacements culturels", style: GoogleFonts.sora(fontSize: 12.sp, color: c.txtSecondary)),
                      ],
                    ),
                  ),
                  SizedBox(width: 14.w),
                  Container(
                    width: 36.w, height: 36.h,
                    decoration: BoxDecoration(color: c.accentPurple, borderRadius: BorderRadius.circular(11)),
                    child: Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 17),
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



// ── 3.6 BOTTOM NAV BAR ──
class FDCBottomNav extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  final AppColors colors;

  const FDCBottomNav({super.key, required this.currentIndex, required this.onTap, required this.colors});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 74.h + MediaQuery.of(context).padding.bottom,
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
        width: 64.w,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 44.w, height: 34.h,
              decoration: BoxDecoration(
                color: isActive ? c.navActiveBg : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, size: 22, color: isActive ? c.navActive : c.navInactive),
            ),
            SizedBox(height: 4.h),
            Text(
              label,
              style: GoogleFonts.sora(
                fontSize: 10.sp,
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
