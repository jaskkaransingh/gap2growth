const User = require('../models/User');
const crypto = require('crypto');

// Save a newly generated roadmap to the user's profile
exports.saveRoadmap = async (req, res) => {
    try {
        const { topic, roadmapData } = req.body;

        if (!topic || !roadmapData) {
            return res.status(400).json({ error: 'Missing topic or roadmapData' });
        }

        const newRoadmap = {
            id: crypto.randomUUID(),
            topic,
            roadmapData,
            completedCheckpoints: [],
            progressPercentage: 0,
            createdAt: new Date()
        };

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $push: { savedRoadmaps: newRoadmap } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(201).json({ message: 'Roadmap saved successfully', roadmap: newRoadmap });
    } catch (error) {
        console.error('Error saving roadmap:', error);
        res.status(500).json({ error: 'Failed to save roadmap' });
    }
};

// Fetch all saved roadmaps for the logged-in user
exports.getSavedRoadmaps = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ roadmaps: user.savedRoadmaps || [] });
    } catch (error) {
        console.error('Error fetching roadmaps:', error);
        res.status(500).json({ error: 'Failed to fetch roadmaps' });
    }
};

// Update progress (completed checkpoints) for a specific roadmap
exports.updateRoadmapProgress = async (req, res) => {
    try {
        const { roadmapId } = req.params;
        const { completedCheckpoints, progressPercentage } = req.body;

        const user = await User.findOneAndUpdate(
            { _id: req.user.id, "savedRoadmaps.id": roadmapId },
            {
                $set: {
                    "savedRoadmaps.$.completedCheckpoints": completedCheckpoints,
                    "savedRoadmaps.$.progressPercentage": progressPercentage
                }
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User or Roadmap not found' });
        }

        const updatedRoadmap = user.savedRoadmaps.find(r => r.id === roadmapId);
        res.json({ message: 'Progress updated', roadmap: updatedRoadmap });
    } catch (error) {
        console.error('Error updating roadmap progress:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
};

// Delete a saved roadmap
exports.deleteRoadmap = async (req, res) => {
    try {
        const { roadmapId } = req.params;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { savedRoadmaps: { id: roadmapId } } },
            { new: true }
        );

        res.json({ message: 'Roadmap deleted completely' });
    } catch (error) {
        console.error('Error deleting roadmap:', error);
        res.status(500).json({ error: 'Failed to delete roadmap' });
    }
};
