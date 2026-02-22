const express = require('express');
const { register, login, deleteAccount, saveOnboarding, getProfile, addAwardedSkill } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.post('/onboarding', protect, saveOnboarding);
router.delete('/delete', protect, deleteAccount);
router.get('/me', protect, getProfile);
router.post('/award-skill', protect, addAwardedSkill);

module.exports = router;
