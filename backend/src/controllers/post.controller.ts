import { Response } from 'express';
import { uuidv4 } from '../utils/uuid';
import { store } from '../services/store.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { IPost, IComment, PostType, PostSeverity } from '../models/types';
import { ioServer } from '../server';

export class PostController {
  static async getFeed(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const type = req.query.type as string;
      const posts = store.getAllPosts(type);
      res.json({ success: true, count: posts.length, posts });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve feed.', error: err.message });
    }
  }

  static async getPostById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const post = store.getPostById(String(req.params.id));
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found.' });
      return;
    }
    const comments = store.getCommentsByPostId(post.id);
    res.json({ success: true, post, comments });
  }

  static async createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { title, content, type, severity, locationName, coordinates, incidentId, attachments } = req.body;

      if (!title || !content) {
        res.status(400).json({ success: false, message: 'Title and content are required.' });
        return;
      }

      const newPost: IPost = {
        id: `post-${uuidv4().substring(0, 8)}`,
        authorId: user.id,
        author: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          callsign: user.callsign,
          avatarUrl: user.avatarUrl,
          role: user.role,
          rank: user.rank,
          badgeNumber: user.badgeNumber,
          organizationName: user.organization.name,
          isVerified: user.organization.isVerified
        },
        type: (type as PostType) || 'GENERAL',
        severity: (severity as PostSeverity) || 'ROUTINE',
        title,
        content,
        locationName,
        coordinates,
        attachments: attachments || [],
        reactions: {
          acknowledge: [],
          salute: [],
          support: [],
          critical: []
        },
        commentsCount: 0,
        incidentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      store.createPost(newPost);

      // Real-time broadcast to all connected responders
      if (ioServer) {
        ioServer.emit('feed:new_post', newPost);
        if (newPost.severity === 'FLASH_EMERGENCY') {
          ioServer.emit('emergency:flash_alert', {
            title: `🚨 FLASH SITREP: ${newPost.title}`,
            author: newPost.author.name,
            content: newPost.content,
            location: newPost.locationName
          });
        }
      }

      res.status(201).json({ success: true, message: 'Post published to responder network.', post: newPost });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create post.', error: err.message });
    }
  }

  static async toggleReaction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { reactionType } = req.body;
      const validReactions = ['acknowledge', 'salute', 'support', 'critical'];
      if (!validReactions.includes(reactionType)) {
        res.status(400).json({ success: false, message: `Invalid reaction type. Must be one of: [${validReactions.join(', ')}]` });
        return;
      }

      const updated = store.toggleReaction(String(req.params.id), user.id, reactionType);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Post not found.' });
        return;
      }

      if (ioServer) {
        ioServer.emit('feed:reaction_updated', { postId: updated.id, reactions: updated.reactions });
      }

      res.json({ success: true, reactions: updated.reactions });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update reaction.', error: err.message });
    }
  }

  static async addComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }

      const { content } = req.body;
      if (!content || !content.trim()) {
        res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
        return;
      }

      const newComment: IComment = {
        id: `cmt-${uuidv4().substring(0, 8)}`,
        postId: String(req.params.id),
        authorId: user.id,
        author: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          callsign: user.callsign,
          avatarUrl: user.avatarUrl,
          role: user.role,
          organizationName: user.organization.name
        },
        content: content.trim(),
        createdAt: new Date().toISOString()
      };

      store.addComment(newComment);

      if (ioServer) {
        ioServer.emit(`post:${req.params.id}:comment`, newComment);
      }

      res.status(201).json({ success: true, message: 'Comment added.', comment: newComment });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to add comment.', error: err.message });
    }
  }
}
