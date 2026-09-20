const express = require('express');
const { updateProfile, getProfileOverview, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.get('/me/overview', getProfileOverview);
router.patch('/me', updateProfile);
router.get('/search', searchUsers);

module.exports = router;
