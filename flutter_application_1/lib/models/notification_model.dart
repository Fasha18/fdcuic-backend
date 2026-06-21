class NotificationModel {
  final int id;
  final String message;
  final String type;      // 'email', 'push', 'in_app'
  final int? userId;
  final bool lu;
  final String? dateEnvoi;

  NotificationModel({
    required this.id,
    required this.message,
    required this.type,
    this.userId,
    required this.lu,
    this.dateEnvoi,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'],
      message: json['message'] ?? '',
      type: json['type'] ?? 'in_app',
      userId: json['user_id'],
      lu: json['lu'] ?? false,
      dateEnvoi: json['date_envoi'] ?? json['createdAt'],
    );
  }
}
