const express = require('express');
const { createTask, listTasks, updateTask, deleteTask } = require('../controllers/taskController');

const router = express.Router({ mergeParams: true });

router.get('/', listTasks);
router.post('/', createTask);
router.patch('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;
