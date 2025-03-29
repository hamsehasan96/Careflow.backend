const { validationResult } = require('express-validator');
const Message = require('../models/message.model');
const User = require('../models/user.model');

// Get all messages for a user (both sent and received)
exports.getUserMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      order: [['timestamp', 'DESC']],
      include: [
        { 
          model: User, 
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'role', 'profileImage'] 
        },
        { 
          model: User, 
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'role', 'profileImage'] 
        }
      ]
    });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get conversation between two users
exports.getConversation = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          {
            senderId: userId,
            receiverId: otherUserId
          },
          {
            senderId: otherUserId,
            receiverId: userId
          }
        ]
      },
      order: [['timestamp', 'ASC']],
      include: [
        { 
          model: User, 
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'role', 'profileImage'] 
        },
        { 
          model: User, 
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'role', 'profileImage'] 
        }
      ]
    });
    
    // Mark messages as read
    const unreadMessages = messages.filter(
      message => message.receiverId === userId && !message.isRead
    );
    
    if (unreadMessages.length > 0) {
      await Promise.all(
        unreadMessages.map(message => 
          message.update({ isRead: true })
        )
      );
    }
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's contacts with latest message and unread count
exports.getUserContacts = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get all users who have exchanged messages with this user
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      order: [['timestamp', 'DESC']],
      include: [
        { 
          model: User, 
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'role', 'profileImage'] 
        },
        { 
          model: User, 
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'role', 'profileImage'] 
        }
      ]
    });
    
    // Extract unique contacts and their latest message
    const contactsMap = new Map();
    
    messages.forEach(message => {
      const contactId = message.senderId === userId ? message.receiverId : message.senderId;
      const contact = message.senderId === userId ? message.receiver : message.sender;
      
      if (!contactsMap.has(contactId)) {
        contactsMap.set(contactId, {
          ...contact.toJSON(),
          latestMessage: message,
          unreadCount: message.receiverId === userId && !message.isRead ? 1 : 0
        });
      } else if (message.receiverId === userId && !message.isRead) {
        // Increment unread count for existing contact
        const existingContact = contactsMap.get(contactId);
        existingContact.unreadCount += 1;
      }
    });
    
    const contacts = Array.from(contactsMap.values());
    
    // Sort contacts by latest message timestamp
    contacts.sort((a, b) => 
      new Date(b.latestMessage.timestamp) - new Date(a.latestMessage.timestamp)
    );
    
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching user contacts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { senderId, receiverId, content, language, attachmentUrl, attachmentType } = req.body;
    
    // Check if sender and receiver exist
    const sender = await User.findByPk(senderId);
    const receiver = await User.findByPk(receiverId);
    
    if (!sender || !receiver) {
      return res.status(404).json({ message: 'Sender or receiver not found' });
    }
    
    const newMessage = await Message.create({
      senderId,
      receiverId,
      content,
      language: language || 'english',
      attachmentUrl,
      attachmentType,
      timestamp: new Date()
    });
    
    // Include sender and receiver info in response
    const messageWithUsers = await Message.findByPk(newMessage.id, {
      include: [
        { 
          model: User, 
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'role', 'profileImage'] 
        },
        { 
          model: User, 
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'role', 'profileImage'] 
        }
      ]
    });
    
    res.status(201).json(messageWithUsers);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark message as read
exports.markMessageAsRead = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    await message.update({ isRead: true });
    
    res.status(200).json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark all messages in a conversation as read
exports.markConversationAsRead = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    
    await Message.update(
      { isRead: true },
      {
        where: {
          senderId: otherUserId,
          receiverId: userId,
          isRead: false
        }
      }
    );
    
    res.status(200).json({ message: 'All messages marked as read' });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    await message.destroy();
    
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
