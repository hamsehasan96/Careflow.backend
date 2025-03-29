const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getUserMessages, 
  getConversation, 
  getUserContacts, 
  sendMessage, 
  markMessageAsRead, 
  markConversationAsRead, 
  deleteMessage 
} = require('../controllers/message.controller');

// Get all messages for a user (both sent and received)
router.get(
  '/user/:userId',
  // authMiddleware,
  getUserMessages
);

// Get conversation between two users
router.get(
  '/conversation/:userId/:otherUserId',
  // authMiddleware,
  getConversation
);

// Get user's contacts with latest message and unread count
router.get(
  '/contacts/:userId',
  // authMiddleware,
  getUserContacts
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
  sendMessage
);

// Mark message as read
router.put(
  '/:messageId/read',
  // authMiddleware,
  markMessageAsRead
);

// Mark all messages in a conversation as read
router.put(
  '/conversation/:userId/:otherUserId/read',
  // authMiddleware,
  markConversationAsRead
);

// Delete a message
router.delete(
  '/:messageId',
  // authMiddleware,
  deleteMessage
);

module.exports = router;
