import 'package:flutter/material.dart';

class BottomNav extends StatelessWidget {
  const BottomNav({super.key});

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Accueil'),
        BottomNavigationBarItem(icon: Icon(Icons.call), label: 'Appels'),
        BottomNavigationBarItem(icon: Icon(Icons.folder), label: 'Dossiers'),
      ],
    );
  }
}
