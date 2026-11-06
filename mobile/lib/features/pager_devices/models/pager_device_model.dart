class PagerDeviceModel {
  final String id;
  final String capCode;
  final String hardwareId;
  final String name;
  final String assignedUserName;
  final String model;
  String status;
  int batteryPercentage;
  int signalDbm;
  String networkMode;
  final double lat;
  final double lng;
  String motionStatus;
  final String lastHeartbeat;

  PagerDeviceModel({
    required this.id,
    required this.capCode,
    required this.hardwareId,
    required this.name,
    required this.assignedUserName,
    required this.model,
    required this.status,
    required this.batteryPercentage,
    required this.signalDbm,
    required this.networkMode,
    required this.lat,
    required this.lng,
    required this.motionStatus,
    required this.lastHeartbeat,
  });

  factory PagerDeviceModel.fromJson(Map<String, dynamic> json) {
    return PagerDeviceModel(
      id: json['id'] ?? '',
      capCode: json['capCode'] ?? '',
      hardwareId: json['hardwareId'] ?? '',
      name: json['name'] ?? '',
      assignedUserName: json['assignedUserName'] ?? 'Unassigned',
      model: json['model'] ?? 'RESQLINK_PAGER_V3',
      status: json['status'] ?? 'ONLINE',
      batteryPercentage: json['batteryPercentage'] ?? 100,
      signalDbm: json['signalDbm'] ?? -75,
      networkMode: json['networkMode'] ?? 'CELLULAR_LTE_M',
      lat: (json['gpsCoordinates']?['lat'] as num?)?.toDouble() ?? 39.7392,
      lng: (json['gpsCoordinates']?['lng'] as num?)?.toDouble() ?? -104.9903,
      motionStatus: json['motionStatus'] ?? 'NORMAL',
      lastHeartbeat: json['lastHeartbeat'] ?? '',
    );
  }
}

