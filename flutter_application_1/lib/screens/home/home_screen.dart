import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:animated_bottom_navigation_bar/animated_bottom_navigation_bar.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme.dart';
import '../../core/constants.dart';
import '../../services/api_service.dart';
import '../appels/appels_screen.dart';
import '../dossiers/mes_dossiers_screen.dart';
import '../profil/profil_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _bottomNavIndex = 0;

  final List<IconData> _icons = [
    Icons.home_outlined,
    Icons.search_rounded,
    Icons.folder_outlined,
    Icons.person_outline_rounded,
  ];

  final List<Widget> _pages = [
    const _HomeDashboard(),
    const AppelsScreen(hideBottomNav: true), // We need to update AppelsScreen to optionally hide its header if we put it here, or we just let it show its header.
    const MesDossiersScreen(),
    const ProfilScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FDColors.skyBg,
      body: _bottomNavIndex == 0 ? const _HomeDashboard() : _pages[_bottomNavIndex],
      
      // ── FAB CENTRE ──────────────────────────
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          setState(() {
            _bottomNavIndex = 1; // Aller vers "Explorer"
          });
        },
        backgroundColor: FDColors.royal,
        elevation: 4,
        shape: const CircleBorder(),
        child: const Icon(Icons.add, color: FDColors.white, size: 28),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,

      // ── BOTTOM NAV ANIMÉE ───────────────────
      bottomNavigationBar: AnimatedBottomNavigationBar.builder(
        itemCount: _icons.length,
        tabBuilder: (int index, bool isActive) {
          return Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                _icons[index],
                size: 24,
                color: isActive ? FDColors.royal : FDColors.textHint,
              ),
              const SizedBox(height: 2),
              Text(
                ['Accueil', 'Explorer', 'Dossiers', 'Profil'][index],
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                  color: isActive ? FDColors.royal : FDColors.textHint,
                ),
              ),
            ],
          );
        },
        activeIndex: _bottomNavIndex,
        gapLocation: GapLocation.center,
        notchSmoothness: NotchSmoothness.verySmoothEdge,
        leftCornerRadius: 32,
        rightCornerRadius: 32,
        backgroundColor: FDColors.white,
        splashColor: FDColors.ice,
        splashSpeedInMilliseconds: 200,
        onTap: (index) => setState(() => _bottomNavIndex = index),
        shadow: BoxShadow(
          color: FDColors.navy.withValues(alpha: 0.08),
          blurRadius: 20,
          offset: const Offset(0, -4),
        ),
      ),
    );
  }
}

class _HomeDashboard extends StatefulWidget {
  const _HomeDashboard();

  @override
  State<_HomeDashboard> createState() => _HomeDashboardState();
}

class _HomeDashboardState extends State<_HomeDashboard> {
  Map<String, dynamic>? _user;
  List<dynamic> _appelsOuverts = [];
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
      if (userStr != null) {
        _user = jsonDecode(userStr);
      }
      _appelsOuverts = await ApiService.getAppelsOuverts();
    } catch (e) {
      debugPrint('Erreur HomeDashboard: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return Stack(
      children: [
        // ── FOND BLEU (header gradient) ──────────────
        Container(
          height: 260,
          decoration: const BoxDecoration(gradient: FDGradients.header),
        ),

        // ── FEUILLE BLANCHE ARRONDIE ──────────────────
        Column(
          children: [
            _Header(user: _user),
            Expanded(
              child: Container(
                decoration: const BoxDecoration(
                  color: FDColors.skyBg,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(28),
                    topRight: Radius.circular(28),
                  ),
                ),
                clipBehavior: Clip.hardEdge,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(16, 20, 16, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Ici on pourrait mettre le vrai dossier en cours si l'API le permet.
                      // _SectionHeader('Dossier en cours', 'Voir tout'),
                      // const SizedBox(height: 10),
                      // _DossierCard(),
                      // const SizedBox(height: 20),
                      
                      const _SectionHeader('Appels à projets ouverts', 'Tous'),
                      const SizedBox(height: 10),
                      _AppelFeatured(),
                      const SizedBox(height: 10),
                      
                      if (_appelsOuverts.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 20),
                          child: Center(child: Text("Aucun appel ouvert pour le moment.")),
                        )
                      else
                        ..._appelsOuverts.take(3).map((appel) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: _AppelCard(
                              icon: Icons.calendar_today_outlined, // TODO: dynamique
                              type: appel['type_projet'] ?? 'Appel',
                              titre: appel['titre'] ?? 'Sans titre',
                              cloture: appel['date_cloture'] ?? '',
                              ouvert: true,
                            ),
                          );
                        }),
                      const SizedBox(height: 80),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// ── HEADER ────────────────────────────────────
class _Header extends StatelessWidget {
  final Map<String, dynamic>? user;
  const _Header({this.user});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(color: Colors.transparent),
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: FDColors.royal,
                      borderRadius: BorderRadius.circular(5),
                    ),
                    child: const Text('FDCUIC',
                      style: TextStyle(color: FDColors.white,
                        fontSize: 10, fontWeight: FontWeight.w700,
                        letterSpacing: 0.12)),
                  ),
                  GestureDetector(
                    onTap: () {
                      Navigator.pushNamed(context, AppRoutes.notifs);
                    },
                    child: Container(
                      width: 36, height: 36,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.notifications_outlined,
                        color: FDColors.white, size: 18),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: RichText(
                  text: TextSpan(
                    style: FDText.greetingName,
                    children: [
                      const TextSpan(text: 'Bonjour,\n'),
                      TextSpan(text: '${user?['prenom'] ?? 'Candidat'} ',
                        style: const TextStyle(
                          color: FDColors.iceBlue,
                          fontStyle: FontStyle.italic,
                          fontWeight: FontWeight.w400)),
                      const TextSpan(text: '👋'),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text('Votre espace candidat · FDCUIC',
                  style: FDText.bodySub.copyWith(color: FDColors.silver)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── SECTION HEADER ────────────────────────────
class _SectionHeader extends StatelessWidget {
  final String title, link;
  const _SectionHeader(this.title, this.link);
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: FDText.h3),
        Text(link, style: FDText.label.copyWith(color: FDColors.royal, fontSize: 12)),
      ],
    );
  }
}

// ── APPEL FEATURED ────────────────────────────
class _AppelFeatured extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: FDGradients.featuredCard,
        borderRadius: FDRadius.cardLg,
        boxShadow: FDShadow.ice,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('⭐ Toujours ouvert · Mobilité',
            style: FDText.labelCaps.copyWith(color: FDColors.white.withValues(alpha: 0.5))),
          const SizedBox(height: 6),
          const Text('Résidence & mobilité\nartistique internationale',
            style: TextStyle(color: FDColors.white,
              fontSize: 16, fontWeight: FontWeight.w700, height: 1.3)),
          const SizedBox(height: 4),
          Text('Résidences, festivals, partenariats à l\'étranger',
            style: FDText.label.copyWith(color: FDColors.white.withValues(alpha: 0.5))),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Ouvert toute l\'année',
                style: FDText.label.copyWith(color: FDColors.white.withValues(alpha: 0.4))),
              GestureDetector(
                onTap: () {
                  // TODO: Aller à la mobilité
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    color: FDColors.white,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text('Postuler →',
                    style: TextStyle(color: FDColors.royal,
                      fontSize: 12, fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── APPEL CARD ────────────────────────────────
class _AppelCard extends StatelessWidget {
  final IconData icon;
  final String type, titre, cloture;
  final bool ouvert;
  const _AppelCard({required this.icon, required this.type,
    required this.titre, required this.cloture, required this.ouvert});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: FDColors.white,
        borderRadius: FDRadius.card,
        border: Border.all(color: FDColors.border, width: 0.5),
        boxShadow: FDShadow.card,
      ),
      child: Row(
        children: [
          Container(
            width: 42, height: 42,
            decoration: BoxDecoration(
              color: ouvert ? FDColors.mint.withValues(alpha: 0.12) : FDColors.ice,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon,
              color: ouvert ? FDColors.mint : FDColors.silver, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  _Badge(type, FDColors.royal, FDColors.ice),
                  const SizedBox(width: 5),
                  _Badge(
                    ouvert ? 'Ouvert' : 'Bientôt fermé',
                    ouvert ? FDColors.mint : FDColors.gold,
                    ouvert ? FDColors.mint.withValues(alpha: 0.12)
                           : FDColors.gold.withValues(alpha: 0.12),
                  ),
                ]),
                const SizedBox(height: 4),
                Text(titre, style: FDText.h3.copyWith(fontSize: 13)),
                const SizedBox(height: 2),
                Text('Clôture: $cloture', style: FDText.label),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded,
            color: FDColors.border, size: 20),
        ],
      ),
    );
  }
}

// ── BADGE ─────────────────────────────────────
class _Badge extends StatelessWidget {
  final String text;
  final Color color, bg;
  const _Badge(this.text, this.color, this.bg);
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(color: bg, borderRadius: FDRadius.badge),
      child: Text(text,
        style: FDText.labelCaps.copyWith(color: color, fontSize: 9)),
    );
  }
}
