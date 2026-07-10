import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/app_colors.dart';
import '../../models/appel_a_projet.dart';
import '../../models/programme_mobilite.dart';
import '../../services/api_service.dart';
import 'appel_detail_screen.dart';
import '../../widgets/appel_card.dart';

class AppelsScreen extends StatefulWidget {
  final bool hideBottomNav;
  const AppelsScreen({super.key, this.hideBottomNav = false});
  @override
  State<AppelsScreen> createState() => _AppelsScreenState();
}

class _AppelsScreenState extends State<AppelsScreen> {
  String _currentTab = 'Appels à projets';
  
  List<AppelAProjet> _appels = [];
  ProgrammeMobilite? _mobilite;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    
    // Charger les appels
    try {
      final appelsData = await ApiService.getTousLesAppels();
      if (mounted) {
        setState(() {
          _appels = appelsData.map((e) => AppelAProjet(
            id: e['id'] ?? 0,
            titre: e['titre'] ?? 'Sans titre',
            description: e['description'] ?? '',
            typeProjet: e['type_projet'],
            dateDebut: e['date_debut'] ?? e['date_ouverture'] ?? '',
            dateFin: e['date_fin'] ?? e['date_cloture'] ?? '',
            statut: e['statut'] ?? 'fermé',
            criteres: e['criteres'] ?? e['criteres_eligibilite'] ?? '',
          )).toList();
        });
      }
    } catch (e) {
      debugPrint('Erreur chargement appels: $e');
      if (mounted) {
        setState(() {
          _appels = [
            AppelAProjet(
              id: -1,
              titre: 'ERREUR',
              description: e.toString(),
              dateDebut: '',
              dateFin: '',
              statut: 'ouvert'
            )
          ];
        });
      }
    }

    // Charger la mobilité
    try {
      final mobiliteData = await ApiService.getProgrammeMobilite();
      if (mounted) {
        setState(() {
          _mobilite = ProgrammeMobilite(
            id: mobiliteData['id'] ?? 0,
            titre: mobiliteData['titre'] ?? 'Mobilité',
            description: mobiliteData['description'] ?? '',
            criteresEligibilite: mobiliteData['criteres_eligibilite'],
            statut: mobiliteData['statut'] ?? 'ouvert',
          );
        });
      }
    } catch (e) {
      debugPrint('Erreur chargement mobilité: $e');
    }

    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_isLoading) {
      return Scaffold(
        backgroundColor: isDark ? AppColors.darkBgPrimary : AppColors.lightBgPrimary,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBgPrimary : AppColors.lightBgPrimary,
      body: Column(
        children: [
          // HEADER
          Container(
            color: isDark ? AppColors.darkBgHeader : AppColors.lightBgHeader,
            padding: EdgeInsets.fromLTRB(24, 0, 24, 16),
            child: SafeArea(
              bottom: false,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Explorer',
                        style: GoogleFonts.sora(fontSize: 22.sp, fontWeight: FontWeight.w700,
                          color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary)),
                      Container(
                        width: 36.w, height: 36.h,
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkBgAccent : AppColors.lightBgAccent,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.search_rounded,
                          color: isDark ? AppColors.darkAccent : AppColors.lightAccent,
                          size: 18,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 16.h),

                  // Onglets
                  Row(
                    children: ['Appels à projets', 'Mobilité'].map((tab) {
                      final isActive = _currentTab == tab;
                      return GestureDetector(
                        onTap: () => setState(() => _currentTab = tab),
                        child: Container(
                          margin: EdgeInsets.only(right: 8),
                          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: isActive
                              ? (isDark ? AppColors.darkBgAccent : AppColors.lightBgAccent)
                              : Colors.transparent,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isActive
                                ? (isDark ? AppColors.darkAccent : AppColors.lightAccent)
                                : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                              width: 1,
                            ),
                          ),
                          child: Text(tab,
                            style: GoogleFonts.sora(
                              fontSize: 13.sp, fontWeight: FontWeight.w600,
                              color: isActive
                                ? (isDark ? AppColors.darkAccent : AppColors.lightAccent)
                                : (isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary),
                            )),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ),

          // Séparateur
          Divider(height: 1, color: isDark ? AppColors.darkBorder : AppColors.lightBorder),

          // Corps
          Expanded(
            child: _currentTab == 'Appels à projets'
                ? _AppelsTab(appels: _appels, isDark: isDark)
                : _MobiliteTab(programme: _mobilite, isDark: isDark),
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
  final bool isDark;
  const _AppelsTab({required this.appels, required this.isDark});

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
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── FILTRES ─────────────────────────────────────
        Padding(
          padding: EdgeInsets.fromLTRB(24, 16, 24, 8),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _FiltreChip(
                  label: 'Tous',
                  actif: _filtre == 'tous',
                  onTap: () => setState(() => _filtre = 'tous'),
                  color: widget.isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary,
                  isDark: widget.isDark,
                ),
                SizedBox(width: 8.w),
                _FiltreChip(
                  label: 'Ouverts',
                  actif: _filtre == 'ouvert',
                  onTap: () => setState(() => _filtre = 'ouvert'),
                  color: AppColors.success,
                  isDark: widget.isDark,
                ),
                SizedBox(width: 8.w),
                _FiltreChip(
                  label: 'Fermés',
                  actif: _filtre == 'fermé',
                  onTap: () => setState(() => _filtre = 'fermé'),
                  color: widget.isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary,
                  isDark: widget.isDark,
                ),
              ],
            ),
          ),
        ),

        // ── TEXTE INTRODUCTIF ────────────────────────────
        Padding(
          padding: EdgeInsets.fromLTRB(24, 4, 24, 12),
          child: Text(
            "Découvrez les opportunités actuellement disponibles et déposez votre candidature.",
            style: GoogleFonts.sora(
              fontSize: 13.sp,
              color: widget.isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary,
              height: 1.5,
            ),
          ),
        ),

        // ── LISTE ────────────────────────────────────────
        Expanded(
          child: _filtres.isEmpty
              ? _EmptyState(
                  message: _filtre == 'tous' 
                      ? 'Aucun appel à projets pour le moment.' 
                      : 'Aucun appel $_filtre pour le moment.',
                  isDark: widget.isDark,
                )
              : ListView.builder(
                  padding: EdgeInsets.only(top: 8, bottom: 24),
                  itemCount: _filtres.length,
                  itemBuilder: (context, i) => AppelCard(
                    appel: _filtres[i],
                    isDark: widget.isDark,
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => AppelDetailScreen(appel: _filtres[i]),
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
  final ProgrammeMobilite? programme;
  final bool isDark;
  const _MobiliteTab({required this.programme, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(24, 20, 24, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── CARTE HERO ────────────────────────────────
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkAccent : AppColors.lightAccent,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 6.w, height: 6.h,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                          ),
                          SizedBox(width: 6.w),
                          Text(
                            'Ouvert toute l\'année',
                            style: GoogleFonts.sora(
                              color: Colors.white,
                              fontSize: 10.sp,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 16.h),
                Text(
                  programme?.titre ?? 'Mobilité',
                  style: GoogleFonts.sora(
                    color: Colors.white,
                    fontSize: 20.sp,
                    fontWeight: FontWeight.w800,
                    height: 1.3,
                  ),
                ),
                SizedBox(height: 8.h),
                Text(
                  programme?.description ?? 'Postulez pour un soutien aux déplacements tout au long de l\'année.',
                  style: GoogleFonts.sora(
                    color: Colors.white.withValues(alpha: 0.8),
                    fontSize: 13.sp,
                    height: 1.5,
                  ),
                ),
                SizedBox(height: 24.h),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/formulaire-mobilite');
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: isDark ? AppColors.darkAccent : AppColors.lightAccent,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    minimumSize: const Size(double.infinity, 52),
                    textStyle: GoogleFonts.sora(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  child: Text('Déposer ma candidature →'),
                ),
              ],
            ),
          ),
          SizedBox(height: 32.h),

          // ── CRITÈRES D'ÉLIGIBILITÉ ────────────────────
          if (programme?.criteresEligibilite != null) ...[
            Text(
              'Critères d\'éligibilité',
              style: GoogleFonts.sora(
                fontSize: 18.sp,
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary,
              ),
            ),
            SizedBox(height: 16.h),
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkBgCard : AppColors.lightBgCard,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder, width: 1),
              ),
              child: Column(
                children: programme!.criteresEligibilite!
                    .split('·')
                    .where((c) => c.trim().isNotEmpty)
                    .map((critere) => Padding(
                          padding: EdgeInsets.symmetric(vertical: 8),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 6.w, height: 6.h,
                                margin: EdgeInsets.only(top: 6, right: 12),
                                decoration: BoxDecoration(
                                  color: isDark ? AppColors.darkAccent : AppColors.lightAccent,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              Expanded(
                                child: Text(
                                  critere.trim(),
                                  style: GoogleFonts.sora(
                                    fontSize: 13.sp,
                                    height: 1.5,
                                    color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ))
                    .toList(),
              ),
            ),
            SizedBox(height: 32.h),
          ],

          // ── ÉTAPES DU FORMULAIRE ──────────────────────
          Text('Le formulaire en 5 étapes', 
            style: GoogleFonts.sora(
              fontSize: 18.sp,
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary,
            )),
          SizedBox(height: 16.h),
          ..._etapesMobilite.asMap().entries.map((entry) {
            final i = entry.key;
            final etape = entry.value;
            return Padding(
              padding: EdgeInsets.only(bottom: 16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 32.w, height: 32.h,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkBgAccent : AppColors.lightBgAccent,
                      shape: BoxShape.circle,
                      border: Border.all(
                          color: isDark ? AppColors.darkBorderAccent : AppColors.lightBorderAccent, width: 1),
                    ),
                    child: Center(
                      child: Text(
                        '${i + 1}',
                        style: GoogleFonts.sora(
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w700,
                          color: isDark ? AppColors.darkAccent : AppColors.lightAccent,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 16.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(etape['titre']!,
                            style: GoogleFonts.sora(fontSize: 14.sp, fontWeight: FontWeight.w600, color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary)),
                        SizedBox(height: 4.h),
                        Text(etape['desc']!, 
                            style: GoogleFonts.sora(fontSize: 13.sp, color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary)),
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

class _FiltreChip extends StatelessWidget {
  final String label;
  final bool actif;
  final VoidCallback onTap;
  final Color color;
  final bool isDark;
  
  const _FiltreChip({
    required this.label,
    required this.actif,
    required this.onTap,
    required this.color,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: actif ? color.withValues(alpha: 0.12) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: actif ? color : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.sora(
            fontSize: 13.sp,
            fontWeight: actif ? FontWeight.w600 : FontWeight.w500,
            color: actif ? color : (isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary),
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final String message;
  final bool isDark;
  const _EmptyState({required this.message, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 64.w, height: 64.h,
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkBgAccent : AppColors.lightBgAccent,
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(Icons.inbox_outlined, size: 30, color: isDark ? AppColors.darkAccent : AppColors.lightAccent),
          ),
          SizedBox(height: 16.h),
          Text(message,
              style: GoogleFonts.sora(fontSize: 14.sp, color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary), 
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}