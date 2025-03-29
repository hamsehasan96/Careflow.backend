const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const messageController = require('../controllers/message.controller');

// Get all messages for a user (both sent and received)
router.get(
  '/user/:userId',
  // authMiddleware,
  messageController.getUserMessages
);

// Get conversation between two users
router.get(
  '/conversation/:userId/:otherUserId',
  // authMiddleware,
  messageController.getConversation
);

// Get user's contacts with latest message and unread count
router.get(
  '/contacts/:userId',
  // authMiddleware,
  messageController.getUserContacts
);

// Send a message
router.post(
  '/',
  // authMiddleware,
  [
    check('senderId', 'Sender ID is required').not().isEmpty(),
    check('receiverId', 'Receiver ID is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty()
  ],
  messageController.sendMessage
);

// Mark message as read
router.put(
  '/:messageId/read',
  // authMiddleware,
  messageController.markMessageAsRead
);

// Mark all messages in a conversation as read
router.put(
  '/conversation/:userId/:otherUserId/read',
  // authMiddleware,
  messageController.markConversationAsRead
);

// Delete a message
router.delete(
  '/:messageId',
  // authMiddleware,
  messageController.deleteMessage
);

module.exports = router;
