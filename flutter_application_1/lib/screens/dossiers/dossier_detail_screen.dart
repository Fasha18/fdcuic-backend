import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/app_colors.dart';
import '../../models/appel_projet_dossier.dart';
import '../../models/projet_mobilite.dart';
import 'package:url_launcher/url_launcher.dart';

class DossierDetailScreen extends StatelessWidget {
  final dynamic dossier;
  final bool isMobilite;

  const DossierDetailScreen({
    super.key,
    required this.dossier,
    required this.isMobilite,
  });

  Map<String, dynamic> get rawJson {
    if (isMobilite) {
      return (dossier as ProjetMobilite).rawJson ?? {};
    } else {
      return (dossier as AppelProjetDossier).rawJson ?? {};
    }
  }

  String get statut {
    if (isMobilite) {
      return (dossier as ProjetMobilite).statut;
    } else {
      return (dossier as AppelProjetDossier).statut;
    }
  }

  String get title {
    if (isMobilite) {
      return (dossier as ProjetMobilite).nomStructure ?? 'Projet de Mobilité';
    } else {
      final app = dossier as AppelProjetDossier;
      return app.appel?.titre ?? app.nomStructure ?? 'Dossier';
    }
  }

  String _formatDate(String? date) {
    if (date == null || date.isEmpty) return '—';
    try {
      final dt = DateTime.parse(date);
      const m = ['','jan.','fév.','mar.','avr.','mai','juin','juil.','août','sep.','oct.','nov.','déc.'];
      return '${dt.day} ${m[dt.month]} ${dt.year}';
    } catch (e) {
      return date.split('T')[0];
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgPrimary = isDark ? AppColors.darkBgPrimary : AppColors.lightBgPrimary;
    final bgHeader = isDark ? AppColors.darkBgHeader : AppColors.lightBgHeader;
    final txtPrimary = isDark ? AppColors.darkTxtPrimary : AppColors.lightTxtPrimary;
    final txtSecondary = isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary;
    final borderCol = isDark ? AppColors.darkBorder : AppColors.lightBorder;

    return Scaffold(
      backgroundColor: bgPrimary,
      appBar: AppBar(
        backgroundColor: bgHeader,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: txtPrimary),
        title: Text(
          'Détail du Dossier',
          style: GoogleFonts.sora(color: txtPrimary, fontSize: 16.sp, fontWeight: FontWeight.w600),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Section
            Container(
              padding: EdgeInsets.all(24),
              color: bgHeader,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: isMobilite ? AppColors.catMobilite.withValues(alpha: 0.1) : AppColors.catStructuration.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          isMobilite ? 'Mobilité' : 'Appel à projets',
                          style: GoogleFonts.sora(
                            color: isMobilite ? AppColors.catMobilite : AppColors.catStructuration,
                            fontSize: 10.sp,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      SizedBox(width: 8.w),
                      Text(
                        'Soumis le ${_formatDate(rawJson['createdAt'])}',
                        style: GoogleFonts.sora(color: txtSecondary, fontSize: 11.sp),
                      ),
                    ],
                  ),
                  SizedBox(height: 12.h),
                  Text(
                    title,
                    style: GoogleFonts.sora(color: txtPrimary, fontSize: 18.sp, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            ),
            
            Divider(height: 1, color: borderCol),
            
            // Stepper / Timeline
            Container(
              padding: EdgeInsets.symmetric(vertical: 32, horizontal: 16),
              color: bgPrimary,
              child: _buildTimeline(isDark),
            ),

            Divider(height: 1, color: borderCol),

            // Content Sections
            Padding(
              padding: EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionTitle('Informations générales', txtPrimary),
                  SizedBox(height: 16.h),
                  _buildInfoRow('Structure', rawJson['nom_structure'], txtPrimary, txtSecondary),
                  _buildInfoRow('Région', rawJson['region'] ?? rawJson['region_destination'], txtPrimary, txtSecondary),
                  if (!isMobilite) _buildInfoRow('Secteur', rawJson['secteur_activite'], txtPrimary, txtSecondary),
                  if (isMobilite) _buildInfoRow('Pays de destination', rawJson['pays_destination'], txtPrimary, txtSecondary),
                  if (isMobilite) _buildInfoRow('Période', '${_formatDate(rawJson['date_depart'])} - ${_formatDate(rawJson['date_arrivee'])}', txtPrimary, txtSecondary),
                  
                  SizedBox(height: 32.h),
                  _buildSectionTitle('Détails du projet', txtPrimary),
                  SizedBox(height: 16.h),
                  if (!isMobilite) _buildTextField('Objectifs globaux', rawJson['objectifs_globaux'], txtPrimary, txtSecondary, bgHeader),
                  if (!isMobilite) _buildTextField('Impacts', rawJson['impacts_economiques'], txtPrimary, txtSecondary, bgHeader),
                  if (isMobilite) _buildTextField('Objectif principal', rawJson['objectif_principal'], txtPrimary, txtSecondary, bgHeader),
                  if (isMobilite) _buildTextField('Impact attendu', rawJson['impact_attendu'], txtPrimary, txtSecondary, bgHeader),

                  SizedBox(height: 32.h),
                  _buildSectionTitle('Documents soumis', txtPrimary),
                  SizedBox(height: 16.h),
                  _buildDocumentsList(txtPrimary, txtSecondary, isDark),
                  SizedBox(height: 40.h),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeline(bool isDark) {
    int currentIndex = 0;
    List<String> steps;

    if (isMobilite) {
      if (statut == 'soumis' || statut == 'en_examen') currentIndex = 1;
      if (statut == 'accepte' || statut == 'rejete') currentIndex = 2;
      steps = ['Soumission', 'Examen', statut == 'rejete' ? 'Refusé' : 'Décision'];
    } else {
      if (statut == 'soumis') currentIndex = 1;
      if (statut == 'en_examen_conformite' || statut == 'en_evaluation_contenu' || statut == 'en_examen') currentIndex = 2;
      if (statut == 'accepte' || statut == 'rejete' || statut == 'non_conforme') currentIndex = 3;
      steps = ['Brouillon', 'Soumis', 'En examen', (statut == 'rejete' || statut == 'non_conforme') ? 'Refusé' : 'Accepté'];
    }

    final int totalSteps = steps.length - 1;
    final isFail = (statut == 'rejete' || statut == 'non_conforme') && currentIndex == totalSteps;
    final isSuccess = statut == 'accepte' && currentIndex == totalSteps;

    return Row(
      children: List.generate(steps.length, (index) {
        final isCompleted = index < currentIndex;
        final isCurrent = index == currentIndex;

        Color circleColor;
        Color labelColor;

        if (isCompleted) {
          circleColor = AppColors.success;
          labelColor = isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary;
        } else if (isCurrent) {
          circleColor = isFail ? AppColors.error : (isSuccess ? AppColors.success : AppColors.lightAccent);
          labelColor = circleColor;
        } else {
          circleColor = isDark ? AppColors.darkBorder : AppColors.lightBorder;
          labelColor = isDark ? AppColors.darkTxtSecondary : AppColors.lightTxtSecondary;
        }

        return Expanded(
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 2,
                      color: index == 0 ? Colors.transparent : (isCompleted || isCurrent ? AppColors.success : (isDark ? AppColors.darkBorder : AppColors.lightBorder)),
                    ),
                  ),
                  Container(
                    width: isCurrent ? 28.w : 24.w,
                    height: isCurrent ? 28.w : 24.w,
                    decoration: BoxDecoration(
                      color: isCompleted || isCurrent ? circleColor : Colors.transparent,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isCompleted || isCurrent ? circleColor : circleColor,
                        width: 2,
                      ),
                      boxShadow: isCurrent ? [
                        BoxShadow(
                          color: circleColor.withValues(alpha: 0.2),
                          blurRadius: 8,
                          spreadRadius: 4,
                        )
                      ] : null,
                    ),
                    child: Center(
                      child: isCompleted || (isCurrent && isSuccess)
                          ? Icon(Icons.check, size: 14.sp, color: Colors.white)
                          : (isFail && isCurrent ? Icon(Icons.close, size: 14.sp, color: Colors.white) : null),
                    ),
                  ),
                  Expanded(
                    child: Container(
                      height: 2,
                      color: index == steps.length - 1 ? Colors.transparent : (isCompleted ? AppColors.success : (isDark ? AppColors.darkBorder : AppColors.lightBorder)),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 8.h),
              Text(
                steps[index],
                textAlign: TextAlign.center,
                style: GoogleFonts.sora(
                  fontSize: 10.sp,
                  fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w500,
                  color: labelColor,
                ),
              ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildSectionTitle(String title, Color color) {
    return Text(
      title,
      style: GoogleFonts.sora(color: color, fontSize: 14.sp, fontWeight: FontWeight.w700),
    );
  }

  Widget _buildInfoRow(String label, dynamic value, Color valColor, Color labelColor) {
    if (value == null || value.toString().isEmpty) return SizedBox.shrink();
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120.w,
            child: Text(
              label,
              style: GoogleFonts.sora(color: labelColor, fontSize: 12.sp),
            ),
          ),
          Expanded(
            child: Text(
              value.toString(),
              style: GoogleFonts.sora(color: valColor, fontSize: 12.sp, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField(String label, dynamic value, Color txtColor, Color labelColor, Color bg) {
    if (value == null || value.toString().isEmpty) return SizedBox.shrink();
    return Padding(
      padding: EdgeInsets.only(bottom: 16.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: GoogleFonts.sora(color: labelColor, fontSize: 12.sp)),
          SizedBox(height: 6.h),
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              value.toString(),
              style: GoogleFonts.sora(color: txtColor, fontSize: 12.sp, height: 1.5),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentsList(Color txtPrimary, Color txtSecondary, bool isDark) {
    final docs = <String, String>{};
    final keys = rawJson.keys.where((k) => k.startsWith('doc_') && rawJson[k] != null && rawJson[k].toString().isNotEmpty);
    
    for (var key in keys) {
      String label = key.replaceAll('doc_', '').replaceAll('_', ' ');
      docs[label] = rawJson[key];
    }

    if (docs.isEmpty) {
      return Text('Aucun document fourni.', style: GoogleFonts.sora(color: txtSecondary, fontSize: 12.sp));
    }

    return Column(
      children: docs.entries.map((e) {
        return Container(
          margin: EdgeInsets.only(bottom: 12.h),
          decoration: BoxDecoration(
            border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
            borderRadius: BorderRadius.circular(10),
          ),
          child: ListTile(
            leading: Icon(Icons.description_outlined, color: AppColors.lightAccent),
            title: Text(e.key.toUpperCase(), style: GoogleFonts.sora(color: txtPrimary, fontSize: 11.sp, fontWeight: FontWeight.w600)),
            trailing: IconButton(
              icon: Icon(Icons.download_rounded, color: txtSecondary, size: 20.sp),
              onPressed: () => _launchUrl(e.value),
            ),
            onTap: () => _launchUrl(e.value),
          ),
        );
      }).toList(),
    );
  }

  Future<void> _launchUrl(String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      debugPrint('Could not launch \$url');
    }
  }
}
