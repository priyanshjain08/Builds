const express = require('express');
const { listNotifications, markRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.get('/', listNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:notificationId/read', markRead);

module.exports = router;
