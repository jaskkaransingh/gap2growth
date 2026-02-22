const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roadmapController = require('../controllers/roadmapController');

// All roadmap routes are protected
router.use(authMiddleware.protect);

router.post('/save', roadmapController.saveRoadmap);
router.get('/', roadmapController.getSavedRoadmaps);
router.put('/:roadmapId/progress', roadmapController.updateRoadmapProgress);
router.delete('/:roadmapId', roadmapController.deleteRoadmap);

module.exports = router;
