const User = require('../models/User');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Use string representation of email to ensure it's not an object if passed weirdly
        const existingUser = await User.findOne({ email: String(email) });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                resumeProcessed: user.resumeProcessed,
                careerProfile: user.careerProfile,
                hasCompletedOnboarding: !!user.onboardingData
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id; // From authMiddleware
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete Account Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const saveOnboarding = async (req, res) => {
    try {
        const userId = req.user.id;
        const answers = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.onboardingData = answers;
        user.markModified('onboardingData');
        await user.save();

        res.json({ message: 'Onboarding data saved successfully' });
    } catch (error) {
        console.error('Save Onboarding Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const { getMarketTrends } = require('../services/marketDataService');

// Cache validity: 6 hours
const TREND_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const profile = user.careerProfile || {};

        // ── Respond immediately with what we have in the DB ──────────────────
        const cachedTrends = user.cachedMarketTrends || {};
        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            careerProfile: profile,
            resumeProcessed: user.resumeProcessed,
            marketTrends: cachedTrends,
        });

        // ── Fire-and-forget: refresh JSearch cache if stale ──────────────────
        const cacheAge = user.marketTrendsCachedAt
            ? Date.now() - new Date(user.marketTrendsCachedAt).getTime()
            : Infinity;

        if (cacheAge > TREND_CACHE_TTL_MS) {
            const skills = profile.skills || {};
            const allSkills = [
                ...(skills.languages || []),
                ...(skills.frameworks || []),
                ...(skills.tools || []),
            ].slice(0, 8);

            if (allSkills.length > 0) {
                getMarketTrends(allSkills)
                    .then(async (freshTrends) => {
                        await User.findByIdAndUpdate(req.user.id, {
                            $set: {
                                cachedMarketTrends: freshTrends,
                                marketTrendsCachedAt: new Date(),
                            },
                        });
                        console.log('Market trends cache refreshed for user:', req.user.id);
                    })
                    .catch(e => console.error('BG market refresh error:', e.message));
            }
        }
    } catch (error) {
        console.error('Get Profile Error:', error);
        // Only send error if response hasn't been sent yet
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

const addAwardedSkill = async (req, res) => {
    try {
        const { skill } = req.body;
        if (!skill) return res.status(400).json({ message: 'Missing skill' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Ensure careerProfile structure exists
        if (!user.careerProfile) user.careerProfile = {};
        if (!user.careerProfile.awardedSkills) user.careerProfile.awardedSkills = [];

        // Don't duplicate
        if (!user.careerProfile.awardedSkills.includes(skill)) {
            user.careerProfile.awardedSkills.push(skill);
            user.markModified('careerProfile');
            await user.save();
        }

        res.json({ message: 'Skill awarded', awardedSkills: user.careerProfile.awardedSkills });
    } catch (error) {
        console.error('Award skill error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { register, login, deleteAccount, saveOnboarding, getProfile, addAwardedSkill };

