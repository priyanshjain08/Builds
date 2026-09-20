const express = require('express');
const { listMessages, sendMessage } = require('../controllers/messageController');

const router = express.Router({ mergeParams: true });

router.get('/', listMessages);
router.post('/', sendMessage);

module.exports = router;
