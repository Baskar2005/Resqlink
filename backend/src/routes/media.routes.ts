import { Router, Request, Response } from 'express';
import { uploadMedia, scanForMalware } from '../middleware/upload.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/upload', authenticate, uploadMedia.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file provided.' });
      return;
    }

    // Malware scanning check
    const isClean = await scanForMalware(req.file.path);
    if (!isClean) {
      res.status(400).json({ success: false, message: 'Security Alert: File failed integrity verification.' });
      return;
    }

    // Return accessible URL path and metadata
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      file: {
        url: fileUrl,
        name: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Upload processing failed.', error: err.message });
  }
});

export default router;

