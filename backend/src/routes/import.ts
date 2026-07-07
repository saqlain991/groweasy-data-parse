import { Router } from 'express';
import multer from 'multer';
import { handleImport, handleImportStream } from '../controllers/import.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

const router = Router();

// Standard JSON response
router.post('/', upload.single('file'), handleImport);

// SSE streaming (real-time batch progress)
router.post('/stream', upload.single('file'), handleImportStream);

export default router;
