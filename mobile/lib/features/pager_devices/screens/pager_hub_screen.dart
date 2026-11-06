import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/pager_provider.dart';

class PagerHubScreen extends ConsumerStatefulWidget {
  const PagerHubScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<PagerHubScreen> createState() => _PagerHubScreenState();
}

class _PagerHubScreenState extends ConsumerState<PagerHubScreen> {
  String _screenMessage = 'READY FOR EMERGENCY DISPATCH. 915MHz MESH NOMINAL.';

  void _onTactileButtonPressed(String code) async {
    final alerts = ref.read(pagerProvider).alerts;
    final alertId = alerts.isNotEmpty ? alerts[0].id : 'alt-flash-01';

    setState(() {
      _screenMessage = 'TRANSMITTING ACK [$code] TO COMMAND SERVER...';
    });

    final success = await ref.read(pagerProvider.notifier).sendAcknowledgement(alertId, code);

    setState(() {
      _screenMessage = success
          ? 'CONFIRMED: [$code] RECEIVED BY INCIDENT COMMAND.'
          : 'RETRY: TRANSMISSION TIMEOUT ON 915MHz.';
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: code == 'MAN_DOWN_SOS' ? AppColors.red700 : AppColors.teal600,
          content: Text('Two-Way Pager Transmitted: $code'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final pagerState = ref.watch(pagerProvider);
    final activeDevice = pagerState.activeSimulatorDevice;

    return Scaffold(
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          // Handheld Physical Hardware Pager Simulator
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF111A24),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF233446), width: 3),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.5),
                  blurRadius: 15,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('RESQLINK MARK III', style: TextStyle(fontFamily: 'monospace', fontSize: 10, color: AppColors.slate400, fontWeight: FontWeight.bold)),
                    Row(
                      children: [
                        const Icon(Icons.lock, size: 10, color: AppColors.teal400),
                        const SizedBox(width: 4),
                        const Text('AES-256', style: TextStyle(fontFamily: 'monospace', fontSize: 10, color: AppColors.teal400)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Green Phosphor LCD Screen
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.pagerLcdBg,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: Colors.black, width: 3),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(activeDevice?.capCode ?? 'CAP-104921', style: const TextStyle(fontFamily: 'monospace', fontSize: 10, color: AppColors.pagerLcdText)),
                          Text(activeDevice?.networkMode ?? 'LORA_MESH', style: const TextStyle(fontFamily: 'monospace', fontSize: 10, color: AppColors.pagerLcdText)),
                          Text('${activeDevice?.batteryPercentage ?? 94}%', style: const TextStyle(fontFamily: 'monospace', fontSize: 10, color: AppColors.pagerLcdText)),
                        ],
                      ),
                      const Divider(color: Colors.white24, height: 12),
                      Text(
                        _screenMessage,
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 12,
                          color: AppColors.pagerLcdText,
                          fontWeight: FontWeight.bold,
                          height: 1.3,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                const Center(
                  child: Text('TWO-WAY PHYSICAL TACTILE BUTTONS', style: TextStyle(fontFamily: 'monospace', fontSize: 9, color: AppColors.slate400, letterSpacing: 0.5)),
                ),
                const SizedBox(height: 10),

                // Tactile Buttons Grid
                Row(
                  children: [
                    Expanded(
                      child: _buildTactileButton('[1] 10-4 COPY', () => _onTactileButtonPressed('ACK_10_4')),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildTactileButton('[2] EN ROUTE', () => _onTactileButtonPressed('EN_ROUTE')),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: _buildTactileButton('[3] ON SCENE', () => _onTactileButtonPressed('ON_SCENE')),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildTactileButton('[4] 10-7 CANNOT', () => _onTactileButtonPressed('UNABLE_10_7')),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.red700,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  onPressed: () => _onTactileButtonPressed('MAN_DOWN_SOS'),
                  child: const Text('🚨 SOS MAN-DOWN DISTRESS', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),
          const Text('Registered Two-Way Pagers & Telemetry', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),

          // Device Telemetry List
          ...pagerState.devices.map((device) => Card(
                child: ListTile(
                  leading: const Icon(Icons.speaker_phone, color: AppColors.teal400),
                  title: Text(device.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: Text('CAP: ${device.capCode} • ${device.assignedUserName}', style: const TextStyle(fontSize: 11, color: AppColors.slate400)),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('🔋 ${device.batteryPercentage}%', style: const TextStyle(fontSize: 11, color: AppColors.slate300)),
                      const SizedBox(width: 8),
                      Text('📶 ${device.signalDbm}dBm', style: const TextStyle(fontSize: 11, color: AppColors.slate300)),
                    ],
                  ),
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildTactileButton(String label, VoidCallback onPressed) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF253342),
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 10),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
      ),
      onPressed: onPressed,
      child: Text(label, style: const TextStyle(fontFamily: 'monospace', fontSize: 11, fontWeight: FontWeight.bold)),
    );
  }
}

