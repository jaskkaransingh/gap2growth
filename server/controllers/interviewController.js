const Interview = require('../models/Interview');
const Feedback = require('../models/Feedback');

// @desc    Create a new interview
// @route   POST /api/interviews
// @access  Private
const createInterview = async (req, res) => {
    try {
        const { role, type, level, techstack, questions, finalized, coverImage } = req.body;

        const interview = new Interview({
            userId: req.user.id,
            role,
            type,
            level,
            techstack,
            questions,
            finalized,
            coverImage
        });

        const createdInterview = await interview.save();
        res.status(201).json({ success: true, _id: createdInterview._id });
    } catch (error) {
        console.error('Error creating interview:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Create a new interview (Internal via Vapi)
// @route   POST /api/interview/internal
// @access  Internal
const createInterviewInternal = async (req, res) => {
    try {
        const { userId, role, type, level, techstack, questions, finalized, coverImage } = req.body;

        const interview = new Interview({
            userId,
            role,
            type,
            level,
            techstack,
            questions,
            finalized,
            coverImage
        });

        const createdInterview = await interview.save();
        res.status(201).json({ success: true, _id: createdInterview._id });
    } catch (error) {
        console.error('Error creating internal interview:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get interviews for the logged in user
// @route   GET /api/interviews/me
// @access  Private
const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, interviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get latest interviews (public, for feed)
// @route   GET /api/interviews/latest
// @access  Private
const getLatestInterviews = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const interviews = await Interview.find({ finalized: true, userId: { $ne: req.user.id } })
            .sort({ createdAt: -1 })
            .limit(limit);
        res.json({ success: true, interviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get single interview by ID
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewById = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }
        res.json({ success: true, interview });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Save Feedback
// @route   POST /api/interviews/feedback
// @access  Private
const saveFeedback = async (req, res) => {
    try {
        const { interviewId, totalScore, categoryScores, strengths, areasForImprovement, finalAssessment, feedbackId } = req.body;

        const feedbackData = {
            interviewId,
            userId: req.user.id,
            totalScore,
            categoryScores,
            strengths,
            areasForImprovement,
            finalAssessment
        };

        let feedback;
        if (feedbackId) {
            feedback = await Feedback.findByIdAndUpdate(feedbackId, feedbackData, { new: true });
        } else {
            feedback = new Feedback(feedbackData);
            await feedback.save();
        }

        res.status(201).json({ success: true, feedbackId: feedback._id });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get Feedback by Interview ID
// @route   GET /api/interviews/:id/feedback
// @access  Private
const getFeedbackByInterviewId = async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ interviewId: req.params.id, userId: req.user.id });
        if (!feedback) {
            // It's okay if it doesn't exist yet
            return res.json({ success: true, feedback: null });
        }
        res.json({ success: true, feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = {
    createInterview,
    createInterviewInternal,
    getMyInterviews,
    getLatestInterviews,
    getInterviewById,
    saveFeedback,
    getFeedbackByInterviewId
};
