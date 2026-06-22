import express from 'express';
import multer from 'multer';
import {
  bulkImportPlayers,
  bulkImportTeams,
  downloadPlayerTemplate,
  downloadTeamTemplate
} from '../controllers/bulkImportController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const adminOnly = [protect, requireAdmin];

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

router.post('/players', ...adminOnly, upload.single('file'), bulkImportPlayers);
router.post('/teams', ...adminOnly, upload.single('file'), bulkImportTeams);

router.get('/players/template', downloadPlayerTemplate);
router.get('/teams/template', downloadTeamTemplate);

export default router;
