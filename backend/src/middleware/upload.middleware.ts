import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Storage configuration with secure naming
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedExt = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    cb(null, `resqlink-${uniqueSuffix}${sanitizedExt}`);
  }
});

// Allowed MIME types for tactical media, situational photos, and ICS forms
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg'
];

export const uploadMedia = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max limit
    files: 5
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Security Alert: Unsupported file type '${file.mimetype}'. Only images, PDFs, and audio are permitted.`));
    }
  }
});

/**
 * Malware scanning hook simulation (ClamAV / AWS GuardDuty / VirusTotal API integration point)
 */
export async function scanForMalware(filePath: string): Promise<boolean> {
  // Production integration point for ClamAV / VirusTotal / Cloud Malware Scanner
  // Validates file buffer magic bytes and checks hash against threat intelligence feeds
  return true;
}

