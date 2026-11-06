import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_constants.dart';
import '../models/incident_model.dart';
import '../models/task_model.dart';

class IncidentState {
  final List<IncidentModel> incidents;
  final IncidentModel? selectedIncident;
  final List<TaskModel> tasks;
  final bool isLoading;

  IncidentState({
    this.incidents = const [],
    this.selectedIncident,
    this.tasks = const [],
    this.isLoading = false,
  });

  IncidentState copyWith({
    List<IncidentModel>? incidents,
    IncidentModel? selectedIncident,
    List<TaskModel>? tasks,
    bool? isLoading,
  }) {
    return IncidentState(
      incidents: incidents ?? this.incidents,
      selectedIncident: selectedIncident ?? this.selectedIncident,
      tasks: tasks ?? this.tasks,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class IncidentNotifier extends StateNotifier<IncidentState> {
  final DioClient _dioClient = DioClient();

  IncidentNotifier() : super(IncidentState()) {
    fetchIncidents();
  }

  Future<void> fetchIncidents() async {
    state = state.copyWith(isLoading: true);
    try {
      final response = await _dioClient.dio.get(ApiConstants.incidents);
      if (response.statusCode == 200) {
        final List list = response.data['incidents'] ?? [];
        final incidents = list.map((i) => IncidentModel.fromJson(i)).toList();
        state = state.copyWith(
          incidents: incidents,
          selectedIncident: incidents.isNotEmpty ? incidents[0] : null,
          isLoading: false,
        );
        if (incidents.isNotEmpty) {
          await fetchTasks(incidents[0].id);
        }
      }
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> selectIncident(String id) async {
    final inc = state.incidents.firstWhere((i) => i.id == id, orElse: () => state.incidents[0]);
    state = state.copyWith(selectedIncident: inc);
    await fetchTasks(inc.id);
  }

  Future<void> fetchTasks(String incidentId) async {
    try {
      final response = await _dioClient.dio.get('${ApiConstants.tasks}/incident/$incidentId');
      if (response.statusCode == 200) {
        final List list = response.data['tasks'] ?? [];
        final tasks = list.map((t) => TaskModel.fromJson(t)).toList();
        state = state.copyWith(tasks: tasks);
      }
    } catch (e) {
      // Ignored
    }
  }

  Future<bool> joinByCode(String code, String icsRole) async {
    try {
      final response = await _dioClient.dio.post(
        ApiConstants.joinIncident,
        data: {'joinCode': code.toUpperCase(), 'icsRole': icsRole},
      );
      if (response.statusCode == 200) {
        await fetchIncidents();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

final incidentProvider = StateNotifierProvider<IncidentNotifier, IncidentState>((ref) {
  return IncidentNotifier();
});

