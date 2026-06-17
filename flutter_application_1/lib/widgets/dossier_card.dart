import 'package:flutter/material.dart';

class DossierCard extends StatelessWidget {
  const DossierCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.folder),
        title: const Text('Dossier'),
        subtitle: const Text('Résumé du dossier'),
      ),
    );
  }
}
