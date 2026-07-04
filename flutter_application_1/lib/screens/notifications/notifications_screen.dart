import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/notification_model.dart';
import '../../services/api_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<NotificationModel> _notifications = [];
  bool _isLoading = true;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    try {
      final data = await ApiService.getNotifications();
      if (mounted) {
        setState(() {
          _notifications = data
              .map((n) => NotificationModel.fromJson(n))
              .toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Erreur chargement notifications: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
          _hasError = true;
        });
      }
    }
  }

  Future<void> _marquerCommeLu(NotificationModel notif) async {
    try {
      await ApiService.marquerCommeLu(notif.id);
      setState(() {
        final index = _notifications.indexWhere((n) => n.id == notif.id);
        if (index != -1) {
          _notifications[index] = NotificationModel(
            id: notif.id,
            message: notif.message,
            type: notif.type,
            userId: notif.userId,
            lu: true,
            dateEnvoi: notif.dateEnvoi,
          );
        }
      });
    } catch (e) {
      debugPrint('Erreur marquer comme lu: $e');
    }
  }

  Future<void> _toutMarquerCommeLu() async {
    try {
      await ApiService.toutMarquerCommeLu();
      setState(() {
        _notifications = _notifications
            .map((n) => NotificationModel(
                  id: n.id,
                  message: n.message,
                  type: n.type,
                  userId: n.userId,
                  lu: true,
                  dateEnvoi: n.dateEnvoi,
                ))
            .toList();
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Toutes les notifications ont été marquées comme lues.'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      debugPrint('Erreur tout marquer comme lu: $e');
    }
  }

  int get _nonLuesCount => _notifications.where((n) => !n.lu).length;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FDColors.skyBg,
      body: Column(
        children: [
          // ── HEADER ──────────────────────────────────────
          Container(
            decoration: BoxDecoration(gradient: FDGradients.header),
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: EdgeInsets.fromLTRB(8, 8, 20, 20),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(Icons.arrow_back_ios_new_rounded,
                          color: FDColors.white, size: 18),
                    ),
                    Expanded(
                      child: Text(
                        'Notifications',
                        style: TextStyle(
                          color: FDColors.white,
                          fontSize: 20.sp,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    if (_nonLuesCount > 0)
                      Container(
                        padding: EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: FDColors.white.withValues(alpha: 0.15),
                          borderRadius:
                              BorderRadius.circular(FDRadius.pill),
                        ),
                        child: Text(
                          '$_nonLuesCount non lues',
                          style: TextStyle(
                            color: FDColors.white,
                            fontSize: 11.sp,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),

          // ── Bouton "Tout marquer comme lu" ───────────────
          if (_notifications.isNotEmpty && _nonLuesCount > 0)
            Padding(
              padding: EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Align(
                alignment: Alignment.centerRight,
                child: GestureDetector(
                  onTap: _toutMarquerCommeLu,
                  child: Container(
                    padding:
                        EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: FDColors.royal.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(FDRadius.pill),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.done_all_rounded,
                            size: 14, color: FDColors.royal),
                        SizedBox(width: 4.w),
                        Text(
                          'Tout marquer comme lu',
                          style: TextStyle(
                            fontSize: 11.sp,
                            fontWeight: FontWeight.w600,
                            color: FDColors.royal,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

          // ── CONTENU ─────────────────────────────────────
          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (_isLoading) {
      return Center(child: CircularProgressIndicator());
    }

    if (_hasError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.wifi_off_rounded, size: 48, color: FDColors.border),
            SizedBox(height: 12.h),
            Text(
              'Impossible de charger les notifications.',
              style: FDText.bodySub,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 16.h),
            GestureDetector(
              onTap: () {
                setState(() {
                  _isLoading = true;
                  _hasError = false;
                });
                _loadNotifications();
              },
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: FDColors.royal.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(FDRadius.sm),
                ),
                child: Text(
                  'Réessayer',
                  style: TextStyle(
                    color: FDColors.royal,
                    fontWeight: FontWeight.w600,
                    fontSize: 13.sp,
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    }

    if (_notifications.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.notifications_off_outlined,
                size: 52, color: FDColors.border),
            SizedBox(height: 14.h),
            Text(
              'Aucune notification pour le moment.',
              style: FDText.bodySub,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        setState(() => _isLoading = true);
        await _loadNotifications();
      },
      child: ListView.builder(
        padding: EdgeInsets.fromLTRB(16, 12, 16, 32),
        itemCount: _notifications.length,
        itemBuilder: (context, i) {
          final notif = _notifications[i];
          return Padding(
            padding: EdgeInsets.only(bottom: 10),
            child: _NotificationCard(
              notification: notif,
              onTap: () {
                if (!notif.lu) _marquerCommeLu(notif);
              },
            ),
          );
        },
      ),
    );
  }
}

// ── CARTE NOTIFICATION ────────────────────────
class _NotificationCard extends StatelessWidget {
  final NotificationModel notification;
  final VoidCallback onTap;
  const _NotificationCard({required this.notification, required this.onTap});

  IconData get _icon {
    if (notification.message.toLowerCase().contains('accepté') ||
        notification.message.toLowerCase().contains('retenu') ||
        notification.message.toLowerCase().contains('félicitations')) {
      return Icons.check_circle_outline_rounded;
    }
    if (notification.message.toLowerCase().contains('rejeté') ||
        notification.message.toLowerCase().contains('regret')) {
      return Icons.cancel_outlined;
    }
    if (notification.message.toLowerCase().contains('examen')) {
      return Icons.hourglass_top_rounded;
    }
    return Icons.notifications_outlined;
  }

  Color get _iconColor {
    if (notification.message.toLowerCase().contains('accepté') ||
        notification.message.toLowerCase().contains('retenu') ||
        notification.message.toLowerCase().contains('félicitations')) {
      return FDColors.mint;
    }
    if (notification.message.toLowerCase().contains('rejeté') ||
        notification.message.toLowerCase().contains('regret')) {
      return FDColors.coral;
    }
    if (notification.message.toLowerCase().contains('examen')) {
      return FDColors.violet;
    }
    return FDColors.royal;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: notification.lu
              ? FDColors.white
              : FDColors.royal.withValues(alpha: 0.04),
          borderRadius: BorderRadius.circular(FDRadius.md),
          border: Border.all(
            color: notification.lu ? FDColors.border : FDColors.royal.withValues(alpha: 0.15),
            width: 0.5,
          ),
          boxShadow: FDShadow.card,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40.w, height: 40.h,
              decoration: BoxDecoration(
                color: _iconColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(_icon, color: _iconColor, size: 20),
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    notification.message,
                    style: TextStyle(
                      fontSize: 13.sp,
                      fontWeight: notification.lu ? FontWeight.w400 : FontWeight.w600,
                      color: FDColors.navy,
                      height: 1.4,
                    ),
                  ),
                  SizedBox(height: 6.h),
                  Row(
                    children: [
                      Icon(Icons.access_time_rounded,
                          size: 11, color: FDColors.textSub),
                      SizedBox(width: 4.w),
                      Text(
                        _formatDate(notification.dateEnvoi ?? ''),
                        style: FDText.bodySub.copyWith(fontSize: 10.sp),
                      ),
                      if (!notification.lu) ...[
                        Spacer(),
                        Container(
                          width: 8.w, height: 8.h,
                          decoration: BoxDecoration(
                            color: FDColors.royal,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(String date) {
    if (date.isEmpty) return '—';
    try {
      final dt = DateTime.parse(date);
      final now = DateTime.now();
      final diff = now.difference(dt);

      if (diff.inMinutes < 1) return 'À l\'instant';
      if (diff.inMinutes < 60) return 'Il y a ${diff.inMinutes} min';
      if (diff.inHours < 24) return 'Il y a ${diff.inHours}h';
      if (diff.inDays < 7) return 'Il y a ${diff.inDays}j';

      const mois = [
        '', 'jan.', 'fév.', 'mar.', 'avr.', 'mai', 'juin',
        'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.'
      ];
      return '${dt.day} ${mois[dt.month]} ${dt.year}';
    } catch (e) {
      return date;
    }
  }
}
