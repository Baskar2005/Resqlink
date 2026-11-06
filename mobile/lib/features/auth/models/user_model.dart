class UserModel {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String callsign;
  final String badgeNumber;
  final String role;
  final String rank;
  final String availability;
  final String organizationName;
  final bool isVerified;
  final String avatarUrl;
  final List<String> skills;
  final String? pairedPagerId;

  UserModel({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.callsign,
    required this.badgeNumber,
    required this.role,
    required this.rank,
    required this.availability,
    required this.organizationName,
    required this.isVerified,
    required this.avatarUrl,
    required this.skills,
    this.pairedPagerId,
  });

  String get fullName => '$firstName $lastName';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? json['_id'] ?? '',
      email: json['email'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      callsign: json['callsign'] ?? '',
      badgeNumber: json['badgeNumber'] ?? '',
      role: json['role'] ?? 'RESPONDER',
      rank: json['rank'] ?? 'Field Responder',
      availability: json['availability'] ?? 'ON_DUTY',
      organizationName: json['organization']?['name'] ?? 'Auxiliary Unit',
      isVerified: json['organization']?['isVerified'] ?? false,
      avatarUrl: json['avatarUrl'] ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      skills: (json['skills'] as List<dynamic>?)?.map((s) => s.toString()).toList() ?? [],
      pairedPagerId: json['pairedPagerId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'callsign': callsign,
      'badgeNumber': badgeNumber,
      'role': role,
      'rank': rank,
      'availability': availability,
      'organization': {
        'name': organizationName,
        'isVerified': isVerified,
      },
      'avatarUrl': avatarUrl,
      'skills': skills,
      'pairedPagerId': pairedPagerId,
    };
  }
}

