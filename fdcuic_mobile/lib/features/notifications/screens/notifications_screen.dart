import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> notifications = [
      {
        'category': 'Résultats',
        'title': 'Candidature acceptée !',
        'body': 'Félicitations, votre candidature pour Global Exchange 2026 a été acceptée.',
        'date': 'Il y a 2h',
        'isUnread': true,
        'icon': Icons.emoji_events,
        'color': AppColors.success,
      },
      {
        'category': 'Appels à projets',
        'title': 'Nouvel appel à projets',
        'body': 'Le Fonds d\'Innovation Technologique est maintenant ouvert aux candidatures.',
        'date': 'Hier',
        'isUnread': true,
        'icon': Icons.rocket_launch,
        'color': AppColors.primary,
      },
      {
        'category': 'Système',
        'title': 'Mise à jour du profil requise',
        'body': 'Veuillez mettre à jour vos coordonnées téléphoniques.',
        'date': 'Il y a 3 jours',
        'isUnread': false,
        'icon': Icons.settings,
        'color': AppColors.textSecondary,
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: AppColors.background,
        elevation: 0,
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all, color: AppColors.primary),
            onPressed: () {},
            tooltip: 'Tout marquer comme lu',
          ),
        ],
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(24),
        itemCount: notifications.length,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final notif = notifications[index];
          return _buildNotificationCard(context, notif);
        },
      ),
    );
  }

  Widget _buildNotificationCard(BuildContext context, Map<String, dynamic> notif) {
    final bool isUnread = notif['isUnread'];
    final Color color = notif['color'];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isUnread ? Colors.white : AppColors.surfaceElevated,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isUnread ? color.withOpacity(0.3) : Colors.transparent,
          width: 1,
        ),
        boxShadow: isUnread
            ? [
                BoxShadow(
                  color: color.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                )
              ]
            : [],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(notif['icon'] as IconData, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      notif['category'],
                      style: TextStyle(
                        color: color,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      notif['date'],
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  notif['title'],
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: isUnread ? FontWeight.bold : FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  notif['body'],
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          if (isUnread) ...[
            const SizedBox(width: 8),
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
            ),
          ]
        ],
      ),
    );
  }
}
