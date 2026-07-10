import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/app_colors.dart';
import '../../models/appel_projet_dossier.dart';
import '../../models/projet_mobilite.dart';
import '../../services/api_service.dart';
import 'dossier_detail_screen.dart';

class MesDossiersScreen extends StatefulWidget {
  const MesDossiersScreen({super.key});
  @override
  State<MesDossiersScreen> createState() => _MesDossiersScreenState();
}

class _MesDossiersScreenState extends State<MesDossiersScreen> {
  String _currentTab = 'Appels';

  List<AppelProjetDossier> _dossiers = [];
  List<ProjetMobilite> _projets = [];
  bool _isLoading = true;

  List<AppelProjetDossier> get _filteredDossiers => _dossiers.where((d) => d.statut != 'brouillon').toList();
  List<ProjetMobilite> get _filteredProjets => _projets.where((p) => p.statut != 'brouillon').toList();
  List<dynamic> get _brouillons {
    final b1 = _dossiers.where((d) => d.statut == 'brouillon').toList();
    final b2 = _projets.where((p) => p.statut == 'brouillon').toList();
    return [...b1, ...b2];
  }

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final dossiersData = await ApiService.getMesDossiers();
      final projetsData = await ApiService.getMesProjets();

      if (mounted) {
        setState(() {
          _dossiers = dossiersData.map((e) => AppelProjetDossier.fromJson(e)).toList();
          _projets = projetsData.map((e) => ProjetMobilite.fromJson(e)).toList();
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
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_isLoading) {
      return Scaffold(
        backgroundColor: isDark ? AppColors.darkBgPrimary : AppColors.lightBgPrimary,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    int count = 0;
    if (_currentTab == 'Appels') count = _filteredDossiers.length;
    else if (_currentTab == 'Mobilité') count = _filteredProjets.length;
    else count = _brouillons.length;

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
                      Text('Mes Dossiers',
                        style: GoogleFonts.sora(fontSize: 22.sp, fontWeight: FontWeight.w700,
                          color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary)),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.darkBgAccent : AppColors.lightBgAccent,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isDark ? AppColors.darkBorderAccent : AppColors.lightBorderAccent,
                            width: 1),
                        ),
                        child: Text('$count dossiers',
                          style: GoogleFonts.sora(fontSize: 12.sp, fontWeight: FontWeight.w600,
                            color: isDark ? AppColors.darkAccent : AppColors.lightAccent)),
                      ),
                    ],
                  ),
                  SizedBox(height: 16.h),

                  // Onglets
                  Row(
                    children: ['Appels', 'Mobilité', 'Brouillons'].map((tab) {
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

          // TEXTE INTRODUCTIF
          Container(
            width: double.infinity,
            padding: EdgeInsets.fromLTRB(24, 16, 24, 4),
            child: Text(
              _currentTab == 'Brouillons' 
                ? "Retrouvez ici vos candidatures en cours de saisie."
                : "Retrouvez ici l'ensemble de vos dossiers soumis et suivez leur avancement.",
              style: GoogleFonts.sora(
                fontSize: 13.sp,
                color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary,
                height: 1.5,
              ),
            ),
          ),

          // Corps
          Expanded(
            child: _currentTab == 'Appels'
                ? _DossiersTab(dossiers: _filteredDossiers, isDark: isDark)
                : _currentTab == 'Mobilité'
                    ? _MobiliteTab(projets: _filteredProjets, isDark: isDark)
                    : _BrouillonsTab(brouillons: _brouillons, isDark: isDark),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String message;
  final bool isDark;

  const _EmptyState({required this.icon, required this.message, required this.isDark});

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
            child: Icon(icon, size: 30,
              color: isDark ? AppColors.darkAccent : AppColors.lightAccent),
          ),
          SizedBox(height: 16.h),
          Text(message,
            style: GoogleFonts.sora(fontSize: 15.sp, fontWeight: FontWeight.w600,
              color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary)),
          SizedBox(height: 6.h),
          Text('Déposez votre candidature !',
            style: GoogleFonts.sora(fontSize: 13.sp,
              color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary)),
        ],
      ),
    );
  }
}

class _DossiersTab extends StatelessWidget {
  final List<AppelProjetDossier> dossiers;
  final bool isDark;
  const _DossiersTab({required this.dossiers, required this.isDark});

  @override
  Widget build(BuildContext context) {
    if (dossiers.isEmpty) {
      return _EmptyState(
        icon: Icons.folder_open_outlined,
        message: 'Aucun dossier pour l\'instant',
        isDark: isDark,
      );
    }

    return ListView.builder(
      padding: EdgeInsets.fromLTRB(24, 20, 24, 32),
      itemCount: dossiers.length,
      itemBuilder: (context, i) => Padding(
        padding: EdgeInsets.only(bottom: 14),
        child: _DossierCard(dossier: dossiers[i], isDark: isDark),
      ),
    );
  }
}

class _MobiliteTab extends StatelessWidget {
  final List<ProjetMobilite> projets;
  final bool isDark;
  const _MobiliteTab({required this.projets, required this.isDark});

  @override
  Widget build(BuildContext context) {
    if (projets.isEmpty) {
      return _EmptyState(
        icon: Icons.flight_takeoff_outlined,
        message: 'Aucun dossier pour l\'instant',
        isDark: isDark,
      );
    }

    return ListView.builder(
      padding: EdgeInsets.fromLTRB(24, 20, 24, 32),
      itemCount: projets.length,
      itemBuilder: (context, i) => Padding(
        padding: EdgeInsets.only(bottom: 14),
        child: _MobiliteCard(projet: projets[i], isDark: isDark),
      ),
    );
  }
}

class _BrouillonsTab extends StatelessWidget {
  final List<dynamic> brouillons;
  final bool isDark;
  const _BrouillonsTab({required this.brouillons, required this.isDark});

  @override
  Widget build(BuildContext context) {
    if (brouillons.isEmpty) {
      return _EmptyState(
        icon: Icons.edit_document,
        message: 'Aucun brouillon en cours',
        isDark: isDark,
      );
    }

    return ListView.builder(
      padding: EdgeInsets.fromLTRB(24, 20, 24, 32),
      itemCount: brouillons.length,
      itemBuilder: (context, i) {
        final item = brouillons[i];
        if (item is AppelProjetDossier) {
          return Padding(
            padding: EdgeInsets.only(bottom: 14),
            child: _DossierCard(dossier: item, isDark: isDark),
          );
        } else if (item is ProjetMobilite) {
          return Padding(
            padding: EdgeInsets.only(bottom: 14),
            child: _MobiliteCard(projet: item, isDark: isDark),
          );
        }
        return const SizedBox.shrink();
      },
    );
  }
}

// ════════════════════════════════════════════════
// STATUT CONFIG
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

  factory _StatutConfig.from(String statut, bool isDark) {
    switch (statut) {
      case 'brouillon':
        return _StatutConfig(
          label: 'Brouillon',
          color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary,
          bg: isDark ? AppColors.darkBgAccent : AppColors.lightBgAccent,
        );
      case 'soumis':
        return _StatutConfig(
          label: 'Soumis',
          color: AppColors.warning,
          bg: AppColors.warningBg,
        );
      case 'en_examen':
        return _StatutConfig(
          label: 'En examen',
          color: AppColors.catStructuration,
          bg: isDark ? AppColors.catStructBgD : AppColors.catStructBgL,
        );
      case 'accepte':
        return _StatutConfig(
          label: 'Accepté',
          color: AppColors.success,
          bg: AppColors.successBg,
        );
      case 'rejete':
        return _StatutConfig(
          label: 'Rejeté',
          color: AppColors.error,
          bg: AppColors.errorBg,
        );
      default:
        return _StatutConfig(
          label: statut,
          color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary,
          bg: isDark ? AppColors.darkBgAccent : AppColors.lightBgAccent,
        );
    }
  }
}

class _StatutBadge extends StatelessWidget {
  final _StatutConfig statut;
  const _StatutBadge({required this.statut});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: statut.bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        statut.label,
        style: GoogleFonts.sora(
          fontSize: 10.sp,
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
      padding: EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        text,
        style: GoogleFonts.sora(
          fontSize: 9.sp,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }
}

// ════════════════════════════════════════════════
//  DOSSIER CARD (Appels)
// ════════════════════════════════════════════════
class _TypeConfig {
  final String label;
  final Color color;
  final Color bg;

  const _TypeConfig(this.label, this.color, this.bg);

  factory _TypeConfig.from(String? type, bool isDark) {
    final t = type?.toLowerCase() ?? '';
    if (t.contains('evenementiel') || t.contains('événe')) {
      return _TypeConfig('Événementiel', AppColors.catEvenementiel, isDark ? AppColors.catEventBgD : AppColors.catEventBgL);
    } else if (t.contains('structuration')) {
      return _TypeConfig('Structuration', AppColors.catStructuration, isDark ? AppColors.catStructBgD : AppColors.catStructBgL);
    } else {
      return _TypeConfig('Formation', AppColors.catFormation, isDark ? AppColors.catFormationBgD : AppColors.catFormationBgL);
    }
  }
}

class _DossierCard extends StatelessWidget {
  final AppelProjetDossier dossier;
  final bool isDark;
  const _DossierCard({required this.dossier, required this.isDark});

  int get _totalEtapes => 4;
  double get _progression => dossier.etapeCourante / _totalEtapes;

  @override
  Widget build(BuildContext context) {
    final statut = _StatutConfig.from(dossier.statut, isDark);
    final typeCfg = _TypeConfig.from(dossier.typeProjet, isDark);
    final isSoumis = dossier.statut == 'soumis';

    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkBgCard : AppColors.lightBgCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
          width: 1,
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            left: 0, top: 0, bottom: 0,
            child: Container(
              width: 4,
              color: statut.color,
            ),
          ),
          Padding(
            padding: EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.folder_special, size: 14, color: typeCfg.color),
                        SizedBox(width: 6.w),
                        _MiniTag(typeCfg.label, typeCfg.color, typeCfg.bg),
                      ],
                    ),
                    _StatutBadge(statut: statut),
                  ],
                ),
                SizedBox(height: 12.h),

                // Titre
                Text(
                  dossier.appel?.titre ?? 'Appel introuvable',
                  style: GoogleFonts.sora(fontSize: 14.sp, fontWeight: FontWeight.w600, color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary, height: 1.4),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: 6.h),
                
                // Sous-titre
                Text(
                  dossier.nomStructure != null && dossier.nomStructure!.isNotEmpty
                      ? dossier.nomStructure!
                      : 'Structure non renseignée',
                  style: GoogleFonts.sora(fontSize: 12.sp, fontWeight: FontWeight.w600, color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary),
                ),
                SizedBox(height: 4.h),
                Text(
                  '${dossier.secteurActivite ?? 'Secteur inconnu'} · ${dossier.region ?? 'Région inconnue'}',
                  style: GoogleFonts.sora(fontSize: 12.sp, color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary),
                ),
                SizedBox(height: 16.h),

                if (isSoumis)
                  Container(
                    margin: EdgeInsets.only(bottom: 16),
                    padding: EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.warningBg,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.check_circle, color: AppColors.warning, size: 16),
                        SizedBox(width: 8.w),
                        Expanded(
                          child: Text(
                            'Candidature transmise et en attente d\'examen.',
                            style: GoogleFonts.sora(color: AppColors.warning, fontWeight: FontWeight.w600, fontSize: 11.sp),
                          ),
                        ),
                      ],
                    ),
                  ),

                if (dossier.statut == 'brouillon') ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Étape ${dossier.etapeCourante} sur $_totalEtapes',
                        style: GoogleFonts.sora(fontSize: 11.sp, color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary),
                      ),
                      Text(
                        '${(_progression * 100).toInt()}%',
                        style: GoogleFonts.sora(fontSize: 11.sp, fontWeight: FontWeight.w700, color: isDark ? AppColors.darkAccent : AppColors.lightAccent),
                      ),
                    ],
                  ),
                  SizedBox(height: 6.h),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: _progression,
                      backgroundColor: isDark ? AppColors.darkBgPrimary : AppColors.lightBgPrimary,
                      valueColor: AlwaysStoppedAnimation(isDark ? AppColors.darkAccent : AppColors.lightAccent),
                      minHeight: 5,
                    ),
                  ),
                  SizedBox(height: 16.h),
                ],

                // Footer
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.calendar_today_outlined, size: 12, color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary),
                        SizedBox(width: 4.w),
                        Text(
                          _formatDate(dossier.createdAt ?? ''),
                          style: GoogleFonts.sora(fontSize: 11.sp, color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary),
                        ),
                      ],
                    ),
                    if (dossier.statut == 'brouillon')
                      _ActionButton(
                        label: 'Continuer →',
                        isDark: isDark,
                        onTap: () => Navigator.pushNamed(context, '/formulaire-appel', arguments: dossier),
                      )
                    else
                      _ActionButton(
                        label: 'Voir le dossier',
                        isDark: isDark,
                        outline: true,
                        onTap: () {
                          Navigator.push(context, MaterialPageRoute(
                            builder: (_) => DossierDetailScreen(dossier: dossier, isMobilite: false),
                          ));
                        },
                      ),
                  ],
                ),
              ],
            ),
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
//  MOBILITE CARD
// ════════════════════════════════════════════════
class _MobiliteCard extends StatelessWidget {
  final ProjetMobilite projet;
  final bool isDark;
  const _MobiliteCard({required this.projet, required this.isDark});

  double get _progression => projet.etapeCourante / 5;

  @override
  Widget build(BuildContext context) {
    final statut = _StatutConfig.from(projet.statut, isDark);
    final isSoumis = projet.statut == 'soumis';

    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkBgCard : AppColors.lightBgCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
          width: 1,
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            left: 0, top: 0, bottom: 0,
            child: Container(
              width: 4,
              color: statut.color,
            ),
          ),
          Padding(
            padding: EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.flight_takeoff, size: 14, color: AppColors.catMobilite),
                        SizedBox(width: 6.w),
                        _MiniTag('Mobilité', AppColors.catMobilite, isDark ? AppColors.catMobiliteBgD : AppColors.catMobiliteBgL),
                      ],
                    ),
                    _StatutBadge(statut: statut),
                  ],
                ),
                SizedBox(height: 12.h),

                Text(
                  projet.nomStructure ?? 'Sans titre',
                  style: GoogleFonts.sora(fontSize: 14.sp, fontWeight: FontWeight.w600, color: isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary),
                ),
                SizedBox(height: 6.h),
                Row(
                  children: [
                    Icon(Icons.flight_takeoff_outlined, size: 13, color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary),
                    SizedBox(width: 6.w),
                    Text(
                      '${projet.paysDestination ?? '—'} · ${projet.regionDestination ?? ''}',
                      style: GoogleFonts.sora(fontSize: 12.sp, color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary),
                    ),
                  ],
                ),
                SizedBox(height: 4.h),
                if (projet.dateDepart != null)
                  Row(
                    children: [
                      Icon(Icons.date_range_outlined, size: 13, color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary),
                      SizedBox(width: 6.w),
                      Text(
                        '${_fmt(projet.dateDepart!)} → ${_fmt(projet.dateArrivee ?? '')}',
                        style: GoogleFonts.sora(fontSize: 12.sp, color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary),
                      ),
                    ],
                  ),
                SizedBox(height: 16.h),

                if (projet.statut == 'brouillon') ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Étape ${projet.etapeCourante} sur 5',
                        style: GoogleFonts.sora(fontSize: 11.sp, color: isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary),
                      ),
                      Text(
                        '${(_progression * 100).toInt()}%',
                        style: GoogleFonts.sora(fontSize: 11.sp, fontWeight: FontWeight.w700, color: isDark ? AppColors.darkAccent : AppColors.lightAccent),
                      ),
                    ],
                  ),
                  SizedBox(height: 6.h),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: _progression,
                      backgroundColor: isDark ? AppColors.darkBgPrimary : AppColors.lightBgPrimary,
                      valueColor: AlwaysStoppedAnimation(isDark ? AppColors.darkAccent : AppColors.lightAccent),
                      minHeight: 5,
                    ),
                  ),
                  SizedBox(height: 16.h),
                ],

                Align(
                  alignment: Alignment.centerRight,
                  child: projet.statut == 'brouillon'
                      ? _ActionButton(
                          label: 'Continuer →',
                          isDark: isDark,
                          onTap: () => Navigator.pushNamed(context, '/formulaire-mobilite', arguments: projet),
                        )
                      : _ActionButton(
                          label: 'Voir le dossier',
                          isDark: isDark,
                          outline: true,
                          onTap: () {
                            Navigator.push(context, MaterialPageRoute(
                              builder: (_) => DossierDetailScreen(dossier: projet, isMobilite: true),
                            ));
                          },
                        ),
                ),
              ],
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

class _ActionButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final bool outline;
  final bool isDark;
  
  const _ActionButton({
    required this.label,
    required this.onTap,
    this.outline = false,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: outline ? Colors.transparent : (isDark ? AppColors.darkAccent : AppColors.lightAccent),
          borderRadius: BorderRadius.circular(12),
          border: outline
              ? Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder, width: 1)
              : null,
        ),
        child: Text(
          label,
          style: GoogleFonts.sora(
            color: outline ? (isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary) : Colors.white,
            fontSize: 12.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}