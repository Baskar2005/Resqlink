import { Response } from 'express';
import { uuidv4 } from '../utils/uuid';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { IMessage } from '../models/types';
import { ioServer } from '../server';

export class MessageController {
  static async getChannelMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    const channelKey = String(req.params.channelKey);
    const messages = store.getMessagesByChannel(channelKey);
    res.json({ success: true, count: messages.length, messages });
  }

  static async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { channelKey, content, isPriority, incidentId, recipientId, attachments } = req.body;

      if (!channelKey || !content) {
        res.status(400).json({ success: false, message: 'channelKey and message content are required.' });
        return;
      }

      const newMessage: IMessage = {
        id: `msg-${uuidv4().substring(0, 8)}`,
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`,
        senderCallsign: user.callsign,
        senderRole: user.role,
        senderAvatarUrl: user.avatarUrl,
        recipientId,
        incidentId,
        channelName: channelKey,
        content,
        isPriority: Boolean(isPriority),
        attachments: attachments || [],
        createdAt: new Date().toISOString()
      };

      store.addMessage(channelKey, newMessage);

      if (ioServer) {
        ioServer.to(channelKey).emit('chat:message', newMessage);
        ioServer.emit('chat:broadcast', { channelKey, message: newMessage });
      }

      res.status(201).json({ success: true, message: 'Message sent.', data: newMessage });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to send message.', error: err.message });
    }
  }
}
