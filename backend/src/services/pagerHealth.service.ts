import { store } from './store.service';
import { ioServer } from '../server';
import { IPagerAlert } from '../models/types';
import { uuidv4 } from '../utils/uuid';

export class PagerHealthService {
  private timer: NodeJS.Timeout | null = null;

  startMonitoring(intervalMs = 8000): void {
    if (this.timer) return;

    console.log('📡 [PagerHealth] Background device telemetry & dead-man switch monitor started.');

    this.timer = setInterval(() => {
      this.checkDevices();
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private checkDevices(): void {
    const devices = store.getAllPagerDevices();
    const now = Date.now();

    for (const device of devices) {
      const lastPing = new Date(device.lastHeartbeat).getTime();
      const elapsed = now - lastPing;

      // 1. Simulating realistic minor telemetry drift for active devices
      if (device.status === 'ONLINE') {
        // Micro signal variation
        const signalDelta = (Math.random() - 0.5) * 2;
        const newSignal = Math.max(-110, Math.min(-45, Math.round(device.signalDbm + signalDelta)));

        // Micro battery drain (very slow)
        let newBattery = device.batteryPercentage;
        if (Math.random() < 0.05 && newBattery > 5) {
          newBattery -= 1;
        }

        // Slight GPS micro-drift
        const latDelta = (Math.random() - 0.5) * 0.0001;
        const lngDelta = (Math.random() - 0.5) * 0.0001;

        store.updatePagerTelemetry(device.id, {
          signalDbm: newSignal,
          batteryPercentage: newBattery,
          gpsCoordinates: {
            lat: Number((device.gpsCoordinates.lat + latDelta).toFixed(6)),
            lng: Number((device.gpsCoordinates.lng + lngDelta).toFixed(6)),
            altitude: device.gpsCoordinates.altitude,
            accuracyMeters: device.gpsCoordinates.accuracyMeters
          }
        });
      }

      // 2. Battery low warning
      if (device.batteryPercentage < 20 && device.status !== 'LOW_BATTERY' && device.status !== 'OFFLINE') {
        store.updatePagerTelemetry(device.id, { status: 'LOW_BATTERY' });
        if (ioServer) {
          ioServer.emit('pager:battery_warning', {
            deviceId: device.id,
            name: device.name,
            battery: device.batteryPercentage
          });
        }
      }

      // 3. Mark offline if missed heartbeats for over 90 seconds
      if (elapsed > 90000 && device.status === 'ONLINE') {
        store.updatePagerTelemetry(device.id, { status: 'OFFLINE' });
        if (ioServer) {
          ioServer.emit('pager:device_offline', {
            deviceId: device.id,
            name: device.name,
            elapsedSeconds: Math.round(elapsed / 1000)
          });
        }
      }

      // 4. Man-Down Detection Trigger (Deadman switch)
      if (device.motionStatus === 'MAN_DOWN_ALERT') {
        // Dispatch emergency broadcast if not already recorded
        const alerts = store.getAllPagerAlerts();
        const alreadyDispatched = alerts.some(
          a => a.targetDeviceId === device.id && a.priority === 'P1_FLASH_SOS' && a.status === 'SENT'
        );

        if (!alreadyDispatched) {
          const emergencyAlert: IPagerAlert = {
            id: `alt-sos-${uuidv4().substring(0, 6)}`,
            senderId: 'SYS_MAN_DOWN',
            senderName: `AUTOMATED SOS: ${device.name}`,
            targetType: 'ALL_STATION_SOS',
            targetDeviceId: device.id,
            priority: 'P1_FLASH_SOS',
            alertTone: 'CONTINUOUS_SIREN',
            message: `CRITICAL MAN-DOWN SOS: ${device.assignedUserName} motionless > 180s at coords [${device.gpsCoordinates.lat}, ${device.gpsCoordinates.lng}]. Immediate assistance required.`,
            status: 'SENT',
            createdAt: new Date().toISOString()
          };

          store.createPagerAlert(emergencyAlert);

          if (ioServer) {
            ioServer.emit('pager:incoming_alert', emergencyAlert);
            ioServer.emit('emergency:flash_alert', {
              title: '🚨 MAN-DOWN ALARM TRIGGERED',
              author: device.name,
              content: emergencyAlert.message,
              coordinates: device.gpsCoordinates
            });
          }
        }
      }
    }
  }
}

export const pagerHealth = new PagerHealthService();
