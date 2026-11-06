import { Response, Request } from 'express';
import { uuidv4 } from '../utils/uuid';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { IPagerDevice, IPagerAlert, PagerPriority, PagerTone, PagerAckResponse } from '../models/types';
import { ioServer } from '../server';

export class PagerController {
  static async listDevices(_req: Request, res: Response): Promise<void> {
    const devices = store.getAllPagerDevices();
    res.json({ success: true, count: devices.length, devices });
  }

  static async getDeviceById(req: Request, res: Response): Promise<void> {
    const device = store.getPagerDeviceById(String(req.params.id));
    if (!device) {
      res.status(404).json({ success: false, message: 'Pager device not found.' });
      return;
    }
    const alerts = store.getAllPagerAlerts().filter(a => a.targetDeviceId === device.id);
    res.json({ success: true, device, alerts });
  }

  static async registerDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { capCode, name, model, hardwareId } = req.body;

      if (!capCode || !name) {
        res.status(400).json({ success: false, message: 'CapCode and Device Name are required.' });
        return;
      }

      const existing = store.getPagerDeviceByCapCode(capCode);
      if (existing) {
        res.status(409).json({ success: false, message: `A device with CapCode ${capCode} is already registered.` });
        return;
      }

      const newDevice: IPagerDevice = {
        id: `pgr-${uuidv4().substring(0, 8)}`,
        capCode: capCode.toUpperCase(),
        hardwareId: hardwareId || `HW-RQ-${Math.floor(10000 + Math.random() * 90000)}`,
        name,
        assignedUserId: user?.id || 'usr-unassigned',
        assignedUserName: user ? `${user.firstName} ${user.lastName}` : 'Unassigned',
        model: model || 'RESQLINK_PAGER_V3',
        status: 'ONLINE',
        batteryPercentage: 100,
        signalDbm: -65,
        networkMode: 'CELLULAR_LTE_M',
        gpsCoordinates: {
          lat: 39.7392,
          lng: -104.9903,
          altitude: 1609.0,
          accuracyMeters: 3.0
        },
        motionStatus: 'NORMAL',
        lastHeartbeat: new Date().toISOString(),
        firmwareVersion: 'v3.4.12-AES256',
        unreadAlertsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      store.registerPagerDevice(newDevice);

      if (user) {
        store.updateUser(user.id, { pairedPagerId: newDevice.id });
      }

      if (ioServer) {
        ioServer.emit('pager:device_registered', newDevice);
      }

      res.status(201).json({ success: true, message: 'Pager registered and paired.', device: newDevice });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to register pager.', error: err.message });
    }
  }

  static async sendAlert(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { targetType, targetDeviceId, incidentId, priority, alertTone, message } = req.body;

      if (!message || !targetType) {
        res.status(400).json({ success: false, message: 'Message text and targetType are required.' });
        return;
      }

      const newAlert: IPagerAlert = {
        id: `alt-${uuidv4().substring(0, 8)}`,
        senderId: user?.id || 'usr-system-dispatch',
        senderName: user ? `${user.firstName} ${user.lastName} (${user.callsign})` : 'Tactical Dispatch Console',
        targetType,
        targetDeviceId,
        incidentId,
        priority: (priority as PagerPriority) || 'P2_IMMEDIATE',
        alertTone: (alertTone as PagerTone) || 'CONTINUOUS_SIREN',
        message: message.substring(0, 160), // standard pager alphanumeric limit
        status: 'SENT',
        createdAt: new Date().toISOString()
      };

      store.createPagerAlert(newAlert);

      // WebSocket broadcast to pager network
      if (ioServer) {
        ioServer.emit('pager:incoming_alert', newAlert);
        if (targetDeviceId) {
          ioServer.to(`device:${targetDeviceId}`).emit('device:buzz_alert', newAlert);
        }
      }

      res.status(201).json({ success: true, message: 'Emergency page dispatched.', alert: newAlert });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to send pager alert.', error: err.message });
    }
  }

  static async acknowledgeAlert(req: Request, res: Response): Promise<void> {
    try {
      const { alertId, responseCode, responderName, lat, lng } = req.body;

      if (!alertId || !responseCode) {
        res.status(400).json({ success: false, message: 'alertId and responseCode (e.g. ACK_10_4) are required.' });
        return;
      }

      const validCodes: PagerAckResponse[] = ['ACK_10_4', 'EN_ROUTE', 'ON_SCENE', 'UNABLE_10_7', 'MAN_DOWN_SOS'];
      if (!validCodes.includes(responseCode)) {
        res.status(400).json({ success: false, message: `Invalid ack response. Must be one of: [${validCodes.join(', ')}]` });
        return;
      }

      const ackData = {
        response: responseCode,
        responderName: responderName || 'Field Responder',
        responderLocation: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined
      };

      const updatedAlert = store.acknowledgePagerAlert(alertId, ackData);
      if (!updatedAlert) {
        res.status(404).json({ success: false, message: 'Pager alert not found.' });
        return;
      }

      if (ioServer) {
        ioServer.emit('pager:alert_acknowledged', updatedAlert);
      }

      res.json({ success: true, message: `Two-way acknowledgement received: ${responseCode}`, alert: updatedAlert });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to record acknowledgement.', error: err.message });
    }
  }

  static async updateTelemetry(req: Request, res: Response): Promise<void> {
    try {
      const deviceId = String(req.params.id);
      const { batteryPercentage, signalDbm, networkMode, lat, lng, altitude, accuracyMeters, motionStatus } = req.body;

      const telemetryUpdate: Partial<IPagerDevice> = {};
      if (batteryPercentage !== undefined) telemetryUpdate.batteryPercentage = Number(batteryPercentage);
      if (signalDbm !== undefined) telemetryUpdate.signalDbm = Number(signalDbm);
      if (networkMode) telemetryUpdate.networkMode = networkMode;
      if (motionStatus) telemetryUpdate.motionStatus = motionStatus;

      if (lat !== undefined && lng !== undefined) {
        telemetryUpdate.gpsCoordinates = {
          lat: Number(lat),
          lng: Number(lng),
          altitude: Number(altitude || 1600),
          accuracyMeters: Number(accuracyMeters || 3)
        };
      }

      const updated = store.updatePagerTelemetry(deviceId, telemetryUpdate);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Device not found.' });
        return;
      }

      if (ioServer) {
        ioServer.emit('pager:telemetry_stream', { deviceId: updated.id, telemetry: updated });
      }

      res.json({ success: true, message: 'Telemetry updated.', device: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update telemetry.', error: err.message });
    }
  }

  static async listAlerts(req: Request, res: Response): Promise<void> {
    const incidentId = req.query.incidentId as string;
    const alerts = store.getAllPagerAlerts(incidentId);
    res.json({ success: true, count: alerts.length, alerts });
  }
}
