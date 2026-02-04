import express from 'express';
import multer from 'multer';
import {
  bulkImportPlayers,
  bulkImportTeams,
  downloadPlayerTemplate,
  downloadTeamTemplate
} from '../controllers/bulkImportController.js';

const router = express.Router();

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

router.post('/players', upload.single('file'), bulkImportPlayers);
router.post('/teams', upload.single('file'), bulkImportTeams);

router.get('/players/template', downloadPlayerTemplate);
router.get('/teams/template', downloadTeamTemplate);

export default router;