import { Response } from 'express';
import { uuidv4 } from '../utils/uuid';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ITask, TaskPriority, TaskSection, TaskStatus } from '../models/types';
import { ioServer } from '../server';

export class TaskController {
  static async listTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
    const incidentId = String(req.params.incidentId);
    const tasks = store.getTasksByIncidentId(incidentId);
    res.json({ success: true, count: tasks.length, tasks });
  }

  static async createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { incidentId, title, description, priority, section, assignedTo, checklist, dueDate, notes } = req.body;

      if (!incidentId || !title) {
        res.status(400).json({ success: false, message: 'Incident ID and task title are required.' });
        return;
      }

      const formattedChecklist = (checklist || []).map((item: any) => ({
        id: `chk-${uuidv4().substring(0, 6)}`,
        text: typeof item === 'string' ? item : item.text,
        completed: false
      }));

      const newTask: ITask = {
        id: `task-${uuidv4().substring(0, 8)}`,
        incidentId,
        title,
        description: description || '',
        priority: (priority as TaskPriority) || 'MEDIUM',
        section: (section as TaskSection) || 'OPERATIONS',
        status: 'PENDING',
        assignedTo: assignedTo || [],
        checklist: formattedChecklist,
        dueDate: dueDate || new Date(Date.now() + 4 * 3600000).toISOString(),
        notes: notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      store.createTask(newTask);

      if (ioServer) {
        ioServer.to(`incident:${incidentId}`).emit('task:created', newTask);
      }

      res.status(201).json({ success: true, message: 'Tactical task assigned.', task: newTask });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create task.', error: err.message });
    }
  }

  static async updateTaskStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status, notes } = req.body;
      const validStatuses: TaskStatus[] = ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ success: false, message: `Invalid status. Must be one of: [${validStatuses.join(', ')}]` });
        return;
      }

      const updates: Partial<ITask> = { status };
      if (notes) updates.notes = notes;
      if (status === 'COMPLETED') {
        updates.completedAt = new Date().toISOString();
      }

      const updated = store.updateTask(String(req.params.id), updates);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Task not found.' });
        return;
      }

      if (ioServer) {
        ioServer.to(`incident:${updated.incidentId}`).emit('task:updated', updated);
      }

      res.json({ success: true, message: `Task status updated to ${status}.`, task: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update task.', error: err.message });
    }
  }

  static async toggleChecklistItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { checklistItemId, completed } = req.body;

      const task = store.getTaskById(String(req.params.id));
      if (!task) {
        res.status(404).json({ success: false, message: 'Task not found.' });
        return;
      }

      const item = task.checklist.find(c => c.id === checklistItemId);
      if (!item) {
        res.status(404).json({ success: false, message: 'Checklist item not found.' });
        return;
      }

      item.completed = completed !== undefined ? completed : !item.completed;
      if (item.completed) {
        item.completedBy = user?.firstName || 'Responder';
        item.completedAt = new Date().toISOString();
      } else {
        item.completedBy = undefined;
        item.completedAt = undefined;
      }

      // Check if all items completed
      const allDone = task.checklist.every(c => c.completed);
      if (allDone && task.status !== 'COMPLETED') {
        task.status = 'COMPLETED';
        task.completedAt = new Date().toISOString();
      }

      const updated = store.updateTask(task.id, { checklist: task.checklist, status: task.status, completedAt: task.completedAt });

      if (ioServer) {
        ioServer.to(`incident:${task.incidentId}`).emit('task:updated', updated);
      }

      res.json({ success: true, task: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to toggle checklist item.', error: err.message });
    }
  }
}
