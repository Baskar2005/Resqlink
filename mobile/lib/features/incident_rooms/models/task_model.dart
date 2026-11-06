class ChecklistItemModel {
  final String id;
  final String text;
  bool completed;

  ChecklistItemModel({
    required this.id,
    required this.text,
    required this.completed,
  });

  factory ChecklistItemModel.fromJson(Map<String, dynamic> json) {
    return ChecklistItemModel(
      id: json['id'] ?? '',
      text: json['text'] ?? '',
      completed: json['completed'] ?? false,
    );
  }
}

class TaskModel {
  final String id;
  final String incidentId;
  final String title;
  final String description;
  final String priority;
  final String section;
  String status;
  final List<ChecklistItemModel> checklist;
  final String dueDate;

  TaskModel({
    required this.id,
    required this.incidentId,
    required this.title,
    required this.description,
    required this.priority,
    required this.section,
    required this.status,
    required this.checklist,
    required this.dueDate,
  });

  factory TaskModel.fromJson(Map<String, dynamic> json) {
    final rawChecklist = json['checklist'] as List<dynamic>? ?? [];
    return TaskModel(
      id: json['id'] ?? '',
      incidentId: json['incidentId'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      priority: json['priority'] ?? 'MEDIUM',
      section: json['section'] ?? 'OPERATIONS',
      status: json['status'] ?? 'PENDING',
      checklist: rawChecklist.map((c) => ChecklistItemModel.fromJson(c)).toList(),
      dueDate: json['dueDate'] ?? '',
    );
  }
}

