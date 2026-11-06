import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/network/api_constants.dart';
import '../models/pager_device_model.dart';
import '../models/pager_alert_model.dart';

class PagerState {
  final List<PagerDeviceModel> devices;
  final List<PagerAlertModel> alerts;
  final PagerDeviceModel? activeSimulatorDevice;
  final bool isLoading;

  PagerState({
    this.devices = const [],
    this.alerts = const [],
    this.activeSimulatorDevice,
    this.isLoading = false,
  });

  PagerState copyWith({
    List<PagerDeviceModel>? devices,
    List<PagerAlertModel>? alerts,
    PagerDeviceModel? activeSimulatorDevice,
    bool? isLoading,
  }) {
    return PagerState(
      devices: devices ?? this.devices,
      alerts: alerts ?? this.alerts,
      activeSimulatorDevice: activeSimulatorDevice ?? this.activeSimulatorDevice,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class PagerNotifier extends StateNotifier<PagerState> {
  final DioClient _dioClient = DioClient();

  PagerNotifier() : super(PagerState()) {
    fetchPagerData();
  }

  Future<void> fetchPagerData() async {
    state = state.copyWith(isLoading: true);
    try {
      final devRes = await _dioClient.dio.get(ApiConstants.pagerDevices);
      final altRes = await _dioClient.dio.get(ApiConstants.pagerAlerts);

      final List dList = devRes.data['devices'] ?? [];
      final List aList = altRes.data['alerts'] ?? [];

      final devices = dList.map((d) => PagerDeviceModel.fromJson(d)).toList();
      final alerts = aList.map((a) => PagerAlertModel.fromJson(a)).toList();

      state = state.copyWith(
        devices: devices,
        alerts: alerts,
        activeSimulatorDevice: devices.isNotEmpty ? devices[0] : null,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  void selectSimulatorDevice(PagerDeviceModel dev) {
    state = state.copyWith(activeSimulatorDevice: dev);
  }

  Future<bool> sendAcknowledgement(String alertId, String code) async {
    try {
      final dev = state.activeSimulatorDevice;
      final response = await _dioClient.dio.post(
        ApiConstants.pagerAcknowledge,
        data: {
          'alertId': alertId,
          'responseCode': code,
          'responderName': dev?.assignedUserName ?? 'Field Unit',
          'lat': dev?.lat,
          'lng': dev?.lng,
        },
      );
      if (response.statusCode == 200) {
        await fetchPagerData();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

final pagerProvider = StateNotifierProvider<PagerNotifier, PagerState>((ref) {
  return PagerNotifier();
});

