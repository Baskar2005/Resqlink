class PostModel {
  final String id;
  final String title;
  final String content;
  final String type;
  final String severity;
  final String authorName;
  final String authorCallsign;
  final String authorAvatarUrl;
  final String authorRank;
  final String authorOrg;
  final bool isAuthorVerified;
  final String? locationName;
  final String? imageUrl;
  final int acknowledgeCount;
  final int saluteCount;
  final int supportCount;
  final int criticalCount;
  final int commentsCount;
  final String createdAt;

  PostModel({
    required this.id,
    required this.title,
    required this.content,
    required this.type,
    required this.severity,
    required this.authorName,
    required this.authorCallsign,
    required this.authorAvatarUrl,
    required this.authorRank,
    required this.authorOrg,
    required this.isAuthorVerified,
    this.locationName,
    this.imageUrl,
    required this.acknowledgeCount,
    required this.saluteCount,
    required this.supportCount,
    required this.criticalCount,
    required this.commentsCount,
    required this.createdAt,
  });

  factory PostModel.fromJson(Map<String, dynamic> json) {
    final attachments = json['attachments'] as List<dynamic>?;
    String? img;
    if (attachments != null && attachments.isNotEmpty) {
      if (attachments[0]['type'] == 'IMAGE') {
        img = attachments[0]['url'];
      }
    }

    final reactions = json['reactions'] as Map<String, dynamic>?;

    return PostModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      type: json['type'] ?? 'GENERAL',
      severity: json['severity'] ?? 'ROUTINE',
      authorName: json['author']?['name'] ?? 'Responder',
      authorCallsign: json['author']?['callsign'] ?? 'Unit',
      authorAvatarUrl: json['author']?['avatarUrl'] ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      authorRank: json['author']?['rank'] ?? 'Field Responder',
      authorOrg: json['author']?['organizationName'] ?? 'Emergency Services',
      isAuthorVerified: json['author']?['isVerified'] ?? false,
      locationName: json['locationName'],
      imageUrl: img,
      acknowledgeCount: (reactions?['acknowledge'] as List?)?.length ?? 0,
      saluteCount: (reactions?['salute'] as List?)?.length ?? 0,
      supportCount: (reactions?['support'] as List?)?.length ?? 0,
      criticalCount: (reactions?['critical'] as List?)?.length ?? 0,
      commentsCount: json['commentsCount'] ?? 0,
      createdAt: json['createdAt'] ?? '',
    );
  }
}

