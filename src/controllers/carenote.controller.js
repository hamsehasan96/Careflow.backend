const { validationResult } = require('express-validator');
const CareNote = require('../models/carenote.model');
const User = require('../models/user.model');
const Participant = require('../models/participant.model');

// Get all care notes
exports.getAllCareNotes = async (req, res) => {
  try {
    const careNotes = await CareNote.findAll({
      include: [
        { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] },
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });
    
    res.status(200).json(careNotes);
  } catch (error) {
    console.error('Error fetching care notes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get care notes for a specific participant
exports.getParticipantCareNotes = async (req, res) => {
  try {
    const careNotes = await CareNote.findAll({
      where: { participantId: req.params.participantId },
      include: [
        { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });
    
    res.status(200).json(careNotes);
  } catch (error) {
    console.error('Error fetching participant care notes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get care notes by author
exports.getAuthorCareNotes = async (req, res) => {
  try {
    const careNotes = await CareNote.findAll({
      where: { authorId: req.params.authorId },
      include: [
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });
    
    res.status(200).json(careNotes);
  } catch (error) {
    console.error('Error fetching author care notes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get care note by ID
exports.getCareNoteById = async (req, res) => {
  try {
    const careNote = await CareNote.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] },
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });
    
    if (!careNote) {
      return res.status(404).json({ message: 'Care note not found' });
    }
    
    res.status(200).json(careNote);
  } catch (error) {
    console.error('Error fetching care note:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new care note
exports.createCareNote = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Add the current user as the author
    const newCareNote = await CareNote.create({
      ...req.body,
      authorId: req.user ? req.user.id : req.body.authorId // In production, always use req.user.id
    });
    
    res.status(201).json(newCareNote);
  } catch (error) {
    console.error('Error creating care note:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update care note
exports.updateCareNote = async (req, res) => {
  try {
    const careNote = await CareNote.findByPk(req.params.id);
    
    if (!careNote) {
      return res.status(404).json({ message: 'Care note not found' });
    }
    
    // Check if the note is already signed
    if (careNote.signedBy) {
      return res.status(403).json({ message: 'Cannot update a signed care note' });
    }
    
    await careNote.update(req.body);
    
    res.status(200).json(careNote);
  } catch (error) {
    console.error('Error updating care note:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Sign care note
exports.signCareNote = async (req, res) => {
  try {
    const careNote = await CareNote.findByPk(req.params.id);
    
    if (!careNote) {
      return res.status(404).json({ message: 'Care note not found' });
    }
    
    // Check if the note is already signed
    if (careNote.signedBy) {
      return res.status(403).json({ message: 'Care note is already signed' });
    }
    
    // Update with signature information
    await careNote.update({
      signedBy: req.user ? req.user.id : req.body.signedBy, // In production, always use req.user.id
      signatureTimestamp: new Date()
    });
    
    res.status(200).json(careNote);
  } catch (error) {
    console.error('Error signing care note:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete care note
exports.deleteCareNote = async (req, res) => {
  try {
    const careNote = await CareNote.findByPk(req.params.id);
    
    if (!careNote) {
      return res.status(404).json({ message: 'Care note not found' });
    }
    
    // Check if the note is already signed
    if (careNote.signedBy) {
      return res.status(403).json({ message: 'Cannot delete a signed care note' });
    }
    
    await careNote.destroy();
    
    res.status(200).json({ message: 'Care note deleted successfully' });
  } catch (error) {
    console.error('Error deleting care note:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
