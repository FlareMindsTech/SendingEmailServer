import express from 'express';
import multer from 'multer';
import {
  deleteEmail,
    getEmailsByStatus,
  scheduleEmail,
 
} from '../Controller/Email.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Schedule email (immediate or future)
router.post('/schedule-email', upload.single('file'), scheduleEmail); 

router.get('/emails', getEmailsByStatus);
router.delete('/emails/:id', deleteEmail);


export default router;
