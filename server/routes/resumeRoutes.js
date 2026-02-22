const express = require('express');
const multer = require('multer');
const { uploadResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware'); // Need to create this or use existing authentication check

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Protected route
router.post('/upload', protect, upload.single('resume'), uploadResume);

module.exports = router;
