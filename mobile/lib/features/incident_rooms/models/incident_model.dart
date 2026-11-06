class IncidentMemberModel {
  final String userId;
  final String name;
  final String callsign;
  final String badgeNumber;
  final String avatarUrl;
  final String icsRole;
  final String checkInStatus;

  IncidentMemberModel({
    required this.userId,
    required this.name,
    required this.callsign,
    required this.badgeNumber,
    required this.avatarUrl,
    required this.icsRole,
    required this.checkInStatus,
  });

  factory IncidentMemberModel.fromJson(Map<String, dynamic> json) {
    return IncidentMemberModel(
      userId: json['userId'] ?? '',
      name: json['name'] ?? '',
      callsign: json['callsign'] ?? '',
      badgeNumber: json['badgeNumber'] ?? '',
      avatarUrl: json['avatarUrl'] ?? '',
      icsRole: json['icsRole'] ?? 'FIELD_RESPONDER',
      checkInStatus: json['checkInStatus'] ?? 'CHECKED_IN',
    );
  }
}

class IncidentModel {
  final String id;
  final String incidentNumber;
  final String title;
  final String description;
  final String type;
  final int severityLevel;
  final String status;
  final String joinCode;
  final String operationalPeriod;
  final String locationName;
  final String commanderName;
  final int totalPersonnel;
  final int activeTasks;
  final int completedTasks;
  final List<IncidentMemberModel> members;

  IncidentModel({
    required this.id,
    required this.incidentNumber,
    required this.title,
    required this.description,
    required this.type,
    required this.severityLevel,
    required this.status,
    required this.joinCode,
    required this.operationalPeriod,
    required this.locationName,
    required this.commanderName,
    required this.totalPersonnel,
    required this.activeTasks,
    required this.completedTasks,
    required this.members,
  });

  factory IncidentModel.fromJson(Map<String, dynamic> json) {
    final rawMembers = json['members'] as List<dynamic>? ?? [];
    return IncidentModel(
      id: json['id'] ?? '',
      incidentNumber: json['incidentNumber'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      type: json['type'] ?? 'WILDFIRE',
      severityLevel: json['severityLevel'] ?? 3,
      status: json['status'] ?? 'ACTIVE',
      joinCode: json['joinCode'] ?? '',
      operationalPeriod: json['operationalPeriod'] ?? '',
      locationName: json['location']?['name'] ?? 'Command Area',
      commanderName: json['commanderName'] ?? 'Incident Commander',
      totalPersonnel: json['stats']?['totalPersonnel'] ?? rawMembers.length,
      activeTasks: json['stats']?['activeTasks'] ?? 0,
      completedTasks: json['stats']?['completedTasks'] ?? 0,
      members: rawMembers.map((m) => IncidentMemberModel.fromJson(m)).toList(),
    );
  }
}

