import 'package:flutter/material.dart';
import '../../core/theme.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FDColors.skyBg,
      appBar: AppBar(
        title: const Text('Notifications', style: TextStyle(color: FDColors.white, fontWeight: FontWeight.bold)),
        backgroundColor: FDColors.royal,
        elevation: 0,
        iconTheme: const IconThemeData(color: FDColors.white),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.notifications_off_outlined, size: 64, color: FDColors.border),
            const SizedBox(height: 16),
            const Text(
              'Aucune notification pour le moment.',
              style: FDText.bodySub,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
