const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: String,
    type: String, // e.g. Behavioral / Technical
    level: String,
    techstack: [String],
    questions: [String],
    finalized: { type: Boolean, default: false },
    coverImage: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interview', interviewSchema);
