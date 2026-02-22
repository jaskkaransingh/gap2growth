const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalScore: Number,
    categoryScores: [
        {
            category: String,
            score: Number,
            feedback: String
        }
    ],
    strengths: [String],
    areasForImprovement: [String],
    finalAssessment: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
