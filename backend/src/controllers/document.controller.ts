import { Response } from 'express';
import { uuidv4 } from '../utils/uuid';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { IICSDocument, ICSFormType } from '../models/types';
import { ioServer } from '../server';

export class DocumentController {
  static async listDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    const incidentId = String(req.params.incidentId);
    const documents = store.getDocumentsByIncidentId(incidentId);
    res.json({ success: true, count: documents.length, documents });
  }

  static async createDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { incidentId, formType, title, data } = req.body;

      if (!incidentId || !formType || !title) {
        res.status(400).json({ success: false, message: 'incidentId, formType, and title are required.' });
        return;
      }

      const newDoc: IICSDocument = {
        id: `doc-${uuidv4().substring(0, 8)}`,
        incidentId,
        formType: formType as ICSFormType,
        title,
        preparedBy: user ? `${user.firstName} ${user.lastName} (${user.callsign})` : 'ICS Officer',
        status: 'DRAFT',
        version: 1,
        data: data || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      store.createDocument(newDoc);

      if (ioServer) {
        ioServer.to(`incident:${incidentId}`).emit('document:created', newDoc);
      }

      res.status(201).json({ success: true, message: 'ICS Document generated.', document: newDoc });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create document.', error: err.message });
    }
  }
}
