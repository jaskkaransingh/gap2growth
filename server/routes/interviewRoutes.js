const express = require('express');
const {
    createInterview,
    createInterviewInternal,
    getMyInterviews,
    getLatestInterviews,
    getInterviewById,
    saveFeedback,
    getFeedbackByInterviewId
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createInterview);
router.post('/internal', createInterviewInternal);
router.get('/me', protect, getMyInterviews);
router.get('/latest', protect, getLatestInterviews);
router.post('/feedback', protect, saveFeedback);
router.get('/:id', protect, getInterviewById);
router.get('/:id/feedback', protect, getFeedbackByInterviewId);

module.exports = router;
