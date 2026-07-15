import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/theme.dart';
import '../../../../services/api_service.dart';

class Etape3Documents extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final Map<String, dynamic> formData;
  final String? typeProjetCode;
  final Future<int> Function() onSyncDraft;

  const Etape3Documents({
    super.key,
    required this.formKey,
    required this.formData,
    this.typeProjetCode,
    required this.onSyncDraft,
  });

  @override
  State<Etape3Documents> createState() => _Etape3DocumentsState();
}

class _Etape3DocumentsState extends State<Etape3Documents> {
  final Map<String, String?> _fichiers = {};
  final Set<String> _uploadingKeys = {};

  List<Map<String, String>> get _docsRequis {
    final typeProjet = widget.typeProjetCode ?? widget.formData['type_projet'];
    final communs = [
      {'key': 'doc_ninea_recepisse', 'label': 'NINEA / Récépissé', 'requis': 'true'},
      {'key': 'doc_cni_passeport',   'label': 'CNI / Passeport',   'requis': 'true'},
      {'key': 'doc_plan_action',     'label': 'Plan d\'action',     'requis': 'true'},
      {'key': 'doc_photo_prototype', 'label': 'Photo / Prototype',  'requis': 'true'},
    ];
    if (typeProjet == 'structuration') {
      communs.addAll([
        {'key': 'doc_analyse_financiere', 'label': 'Analyse financière', 'requis': 'true'},
        {'key': 'doc_business_model',     'label': 'Business Model Canvas', 'requis': 'true'},
      ]);
    } else if (typeProjet == 'formation' || typeProjet == 'evenementiel') {
      communs.add({'key': 'doc_budget', 'label': 'Budget prévisionnel', 'requis': 'true'});
    }
    return communs;
  }

  bool validate() {
    for (final doc in _docsRequis) {
      if (doc['requis'] == 'true' && _fichiers[doc['key']!] == null) {
        return false;
      }
    }
    return true;
  }


  @override
  void initState() {
    super.initState();
    widget.formData['documents'] ??= <String, String?>{};
    final docs = widget.formData['documents'] as Map<String, String?>;
    for (final doc in _docsRequis) {
      if (docs[doc['key']] != null) {
        _fichiers[doc['key']!] = docs[doc['key']]!.split('/').last.split('\\').last;
      }
    }
  }

  Future<void> _pickFile(String key) async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
      );

      if (result != null && result.files.single.path != null) {
        final sizeInBytes = result.files.single.size;
        // 10 MB max
        if (sizeInBytes > 10 * 1024 * 1024) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('La taille du fichier ne doit pas dépasser 10 Mo.'),
                backgroundColor: FDColors.coral,
              ),
            );
          }
          return;
        }

        final filePath = result.files.single.path!;

        setState(() {
          _uploadingKeys.add(key);
        });

        try {
          final dId = await widget.onSyncDraft();
          await ApiService.uploadDocumentUniqueAppel(dId, key, filePath);

          setState(() {
            _fichiers[key] = result.files.single.name;
          });
          final docs = widget.formData['documents'] as Map<String, String?>;
          docs[key] = filePath;

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text("${result.files.single.name} envoyé !"),
                backgroundColor: FDColors.mint,
                duration: Duration(seconds: 2),
              ),
            );
          }
        } catch (uploadError) {
          debugPrint("Erreur upload API: $uploadError");
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text("Échec: ${uploadError.toString().replaceAll('Exception: ', '').split('\\n').first}"),
                backgroundColor: FDColors.coral,
                duration: Duration(seconds: 4),
              ),
            );
          }
        } finally {
          if (mounted) {
            setState(() {
              _uploadingKeys.remove(key);
            });
          }
        }
      }
    } catch (e) {
      debugPrint("Erreur sélection fichier: $e");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Échec de la sélection du fichier: $e"),
            backgroundColor: FDColors.coral,
          ),
        );
      }
    }
  }

  void _removeFile(String key) {
    setState(() {
      _fichiers.remove(key);
    });
    final docs = widget.formData['documents'] as Map<String, String?>;
    docs.remove(key);
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: widget.formKey,
      child: FormField<bool>(
        validator: (value) {
          if (!validate()) {
            return 'Veuillez uploader tous les documents obligatoires.';
          }
          return null;
        },
        builder: (field) {
          return SingleChildScrollView(
            padding: EdgeInsets.fromLTRB(20, 24, 20, 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (field.hasError)
                  Container(
                    padding: EdgeInsets.all(12),
                    margin: EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: FDColors.coral.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(FDRadius.sm),
                      border: Border.all(color: FDColors.coral.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.error_outline, size: 16, color: FDColors.coral),
                        SizedBox(width: 8.w),
                        Expanded(
                          child: Text(
                            field.errorText!,
                            style: FDText.bodySub.copyWith(color: FDColors.coral),
                          ),
                        ),
                      ],
                    ),
                  ),
                // Info
                Container(
                  padding: EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: FDColors.electricBlue.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(FDRadius.sm),
                    border: Border.all(
                        color: FDColors.electricBlue.withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.info_outline,
                          size: 16, color: FDColors.electricBlue),
                      SizedBox(width: 8.w),
                      Expanded(
                        child: Text(
                          'Formats acceptés : PDF, JPG, PNG. Taille max : 10 Mo.',
                          style: FDText.bodySub
                              .copyWith(color: FDColors.electricBlue),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 20.h),

                // Liste des documents
                ..._docsRequis.map((doc) => Padding(
                  padding: EdgeInsets.only(bottom: 14),
                  child: _DocUploadField(
                    label: doc['label']!,
                    isRequis: doc['requis'] == 'true',
                    fichierNom: _fichiers[doc['key']],
                    isUploading: _uploadingKeys.contains(doc['key']),
                    isAnyUploading: _uploadingKeys.isNotEmpty,
                    onTap: () {
                      _pickFile(doc['key']!);
                      field.didChange(true);
                    },
                    onSupprimer: () {
                      _removeFile(doc['key']!);
                      field.didChange(true);
                    },
                  ),
                )),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ── CHAMP UPLOAD ──────────────────────────────────────────
class _DocUploadField extends StatelessWidget {
  final String label;
  final bool isRequis;
  final String? fichierNom;
  final bool isUploading;
  final bool isAnyUploading;
  final VoidCallback onTap;
  final VoidCallback onSupprimer;

  const _DocUploadField({
    required this.label,
    required this.isRequis,
    required this.fichierNom,
    required this.isUploading,
    required this.isAnyUploading,
    required this.onTap,
    required this.onSupprimer,
  });

  @override
  Widget build(BuildContext context) {
    final uploaded = fichierNom != null;
    return GestureDetector(
      onTap: (uploaded || isAnyUploading) ? null : onTap,
      child: Container(
        padding: EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: uploaded
              ? FDColors.mint.withValues(alpha: 0.06)
              : FDColors.white,
          borderRadius: BorderRadius.circular(FDRadius.sm),
          border: Border.all(
            color: uploaded ? FDColors.mint : FDColors.border,
            width: uploaded ? 1 : 0.5,
          ),
          boxShadow: FDShadow.card,
        ),
        child: Row(
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                color: uploaded
                    ? FDColors.mint.withValues(alpha: 0.12)
                    : FDColors.ice,
                borderRadius: BorderRadius.circular(FDRadius.xs),
              ),
              child: isUploading 
                  ? Padding(padding: EdgeInsets.all(10), child: CircularProgressIndicator(strokeWidth: 2))
                  : Icon(
                      uploaded
                          ? Icons.check_circle_outline
                          : Icons.upload_file_outlined,
                      size: 20,
                      color: uploaded ? FDColors.mint : FDColors.textSub,
                    ),
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(label,
                          style: FDText.h3.copyWith(fontSize: 13.sp)),
                      if (isRequis) ...[
                        SizedBox(width: 4.w),
                        Text('*',
                            style: TextStyle(
                                color: FDColors.coral,
                                fontSize: 13.sp,
                                fontWeight: FontWeight.w700)),
                      ],
                    ],
                  ),
                  SizedBox(height: 2.h),
                  Text(
                    uploaded ? fichierNom! : 'Appuyer pour sélectionner',
                    style: FDText.bodySub.copyWith(
                      color: uploaded
                          ? FDColors.mint
                          : FDColors.textHint,
                      fontSize: 11.sp,
                    ),
                  ),
                ],
              ),
            ),
            if (uploaded)
              GestureDetector(
                onTap: onSupprimer,
                child: Icon(Icons.close,
                    size: 16, color: FDColors.coral),
              ),
          ],
        ),
      ),
    );
  }
}