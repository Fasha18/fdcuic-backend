import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/theme.dart';

class Etape3Documents extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final Map<String, dynamic> formData;

  const Etape3Documents({
    super.key,
    required this.formKey,
    required this.formData,
  });

  @override
  State<Etape3Documents> createState() => _Etape3DocumentsState();
}

class _Etape3DocumentsState extends State<Etape3Documents> {
  final Map<String, String?> _fichiers = {};

  List<Map<String, String>> get _docsRequis {
    final typeProjet = widget.formData['type_projet'];
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
    }
    if (typeProjet == 'formation' || typeProjet == 'evenementiel') {
      communs.add({'key': 'doc_budget', 'label': 'Budget prévisionnel', 'requis': 'true'});
    }
    return communs;
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

      setState(() {
        _fichiers[key] = result.files.single.name;
      });
      final docs = widget.formData['documents'] as Map<String, String?>;
      docs[key] = result.files.single.path;
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
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Info
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: FDColors.electricBlue.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(FDRadius.sm),
                border: Border.all(
                    color: FDColors.electricBlue.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline,
                      size: 16, color: FDColors.electricBlue),
                  const SizedBox(width: 8),
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
            const SizedBox(height: 20),

            // Liste des documents
            ..._docsRequis.map((doc) => Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: _DocUploadField(
                label: doc['label']!,
                isRequis: doc['requis'] == 'true',
                fichierNom: _fichiers[doc['key']],
                onTap: () => _pickFile(doc['key']!),
                onSupprimer: () => _removeFile(doc['key']!),
              ),
            )),
          ],
        ),
      ),
    );
  }
}

// ── CHAMP UPLOAD ──────────────────────────────────────────
class _DocUploadField extends StatelessWidget {
  final String label;
  final bool isRequis;
  final String? fichierNom;
  final VoidCallback onTap;
  final VoidCallback onSupprimer;

  const _DocUploadField({
    required this.label,
    required this.isRequis,
    required this.fichierNom,
    required this.onTap,
    required this.onSupprimer,
  });

  @override
  Widget build(BuildContext context) {
    final uploaded = fichierNom != null;
    return GestureDetector(
      onTap: uploaded ? null : onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
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
              child: Icon(
                uploaded
                    ? Icons.check_circle_outline
                    : Icons.upload_file_outlined,
                size: 20,
                color: uploaded ? FDColors.mint : FDColors.textSub,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(label,
                          style: FDText.h3.copyWith(fontSize: 13)),
                      if (isRequis) ...[
                        const SizedBox(width: 4),
                        Text('*',
                            style: TextStyle(
                                color: FDColors.coral,
                                fontSize: 13,
                                fontWeight: FontWeight.w700)),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    uploaded ? fichierNom! : 'Appuyer pour sélectionner',
                    style: FDText.bodySub.copyWith(
                      color: uploaded
                          ? FDColors.mint
                          : FDColors.textHint,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            if (uploaded)
              GestureDetector(
                onTap: onSupprimer,
                child: const Icon(Icons.close,
                    size: 16, color: FDColors.coral),
              ),
          ],
        ),
      ),
    );
  }
}