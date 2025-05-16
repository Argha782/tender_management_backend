const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// GET /api/notifications - Fetch user's notifications
router.get('/', authMiddleware, notificationController.getMyNotifications);

// PATCH /api/notifications/:notificationId/read - Mark as read
router.patch('/:notificationId/read', authMiddleware, notificationController.markAsRead);

module.exports = router;
