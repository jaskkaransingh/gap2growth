const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resumeProcessed: { type: Boolean, default: false },
    lastResumeUpload: { type: Date },
    careerProfile: { type: Object },       // Structured data from LLM
    onboardingData: { type: Object },      // Answers from onboarding quiz
    cachedMarketTrends: { type: Object },  // Cached JSearch results
    marketTrendsCachedAt: { type: Date },  // When trends were last fetched
    savedRoadmaps: { type: Array, default: [] } // Array of saved roadmap JSONs
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
