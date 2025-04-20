const { validationResult } = require('express-validator');
const path = require('path');
const modelsPath = path.join(__dirname, '..', 'models');
const { Participant } = require(path.join(modelsPath, 'index'));

// Get all participants
exports.getAllParticipants = async (req, res) => {
  try {
    const participants = await Participant.findAll();
    res.status(200).json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get participant by ID
exports.getParticipantById = async (req, res) => {
  try {
    const participant = await Participant.findByPk(req.params.id);
    
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    
    res.status(200).json(participant);
  } catch (error) {
    console.error('Error fetching participant:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new participant
exports.createParticipant = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const newParticipant = await Participant.create(req.body);
    res.status(201).json(newParticipant);
  } catch (error) {
    console.error('Error creating participant:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update participant
exports.updateParticipant = async (req, res) => {
  try {
    const participant = await Participant.findByPk(req.params.id);
    
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    
    await participant.update(req.body);
    
    res.status(200).json(participant);
  } catch (error) {
    console.error('Error updating participant:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete participant
exports.deleteParticipant = async (req, res) => {
  try {
    const participant = await Participant.findByPk(req.params.id);
    
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    
    await participant.destroy();
    
    res.status(200).json({ message: 'Participant deleted successfully' });
  } catch (error) {
    console.error('Error deleting participant:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
