class PagerAlertModel {
  final String id;
  final String senderName;
  final String targetType;
  final String? targetDeviceId;
  final String priority;
  final String alertTone;
  final String message;
  String status;
  final String? responseCode;
  final String? responderName;
  final String createdAt;

  PagerAlertModel({
    required this.id,
    required this.senderName,
    required this.targetType,
    this.targetDeviceId,
    required this.priority,
    required this.alertTone,
    required this.message,
    required this.status,
    this.responseCode,
    this.responderName,
    required this.createdAt,
  });

  factory PagerAlertModel.fromJson(Map<String, dynamic> json) {
    return PagerAlertModel(
      id: json['id'] ?? '',
      senderName: json['senderName'] ?? 'Tactical Dispatch',
      targetType: json['targetType'] ?? 'INCIDENT_BROADCAST',
      targetDeviceId: json['targetDeviceId'],
      priority: json['priority'] ?? 'P2_IMMEDIATE',
      alertTone: json['alertTone'] ?? 'CONTINUOUS_SIREN',
      message: json['message'] ?? '',
      status: json['status'] ?? 'SENT',
      responseCode: json['acknowledgement']?['response'],
      responderName: json['acknowledgement']?['responderName'],
      createdAt: json['createdAt'] ?? '',
    );
  }
}

