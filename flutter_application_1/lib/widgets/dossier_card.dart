import 'package:flutter/material.dart';

class DossierCard extends StatelessWidget {
  const DossierCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(Icons.folder),
        title: Text('Dossier'),
        subtitle: Text('Résumé du dossier'),
      ),
    );
  }
}
