const { validationResult } = require('express-validator');
const RestrictivePractice = require('../models/restrictivePractice.model');
const User = require('../models/user.model');
const Participant = require('../models/participant.model');

// Get all restrictive practices
exports.getAllRestrictivePractices = async (req, res) => {
  try {
    const restrictivePractices = await RestrictivePractice.findAll({
      include: [
        { model: User, as: 'authorizedBy', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'implementedBy', attributes: ['id', 'firstName', 'lastName'] },
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['startDate', 'DESC'], ['createdAt', 'DESC']]
    });
    
    res.status(200).json(restrictivePractices);
  } catch (error) {
    console.error('Error fetching restrictive practices:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get restrictive practices for a specific participant
exports.getParticipantRestrictivePractices = async (req, res) => {
  try {
    const restrictivePractices = await RestrictivePractice.findAll({
      where: { participantId: req.params.participantId },
      include: [
        { model: User, as: 'authorizedBy', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'implementedBy', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['startDate', 'DESC'], ['createdAt', 'DESC']]
    });
    
    res.status(200).json(restrictivePractices);
  } catch (error) {
    console.error('Error fetching participant restrictive practices:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get restrictive practice by ID
exports.getRestrictivePracticeById = async (req, res) => {
  try {
    const restrictivePractice = await RestrictivePractice.findByPk(req.params.id, {
      include: [
        { model: User, as: 'authorizedBy', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'implementedBy', attributes: ['id', 'firstName', 'lastName'] },
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });
    
    if (!restrictivePractice) {
      return res.status(404).json({ message: 'Restrictive practice report not found' });
    }
    
    res.status(200).json(restrictivePractice);
  } catch (error) {
    console.error('Error fetching restrictive practice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new restrictive practice
exports.createRestrictivePractice = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const newRestrictivePractice = await RestrictivePractice.create(req.body);
    
    // This is a reportable incident to NDIS Quality and Safeguards Commission
    // In a production environment, this would trigger a notification or report
    console.log(`Restrictive practice created: ${newRestrictivePractice.id}`);
    
    res.status(201).json(newRestrictivePractice);
  } catch (error) {
    console.error('Error creating restrictive practice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update restrictive practice
exports.updateRestrictivePractice = async (req, res) => {
  try {
    const restrictivePractice = await RestrictivePractice.findByPk(req.params.id);
    
    if (!restrictivePractice) {
      return res.status(404).json({ message: 'Restrictive practice report not found' });
    }
    
    // Check if the report is already submitted
    if (restrictivePractice.status !== 'draft') {
      return res.status(403).json({ message: 'Cannot update a submitted restrictive practice report' });
    }
    
    await restrictivePractice.update(req.body);
    
    res.status(200).json(restrictivePractice);
  } catch (error) {
    console.error('Error updating restrictive practice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit restrictive practice report
exports.submitRestrictivePractice = async (req, res) => {
  try {
    const restrictivePractice = await RestrictivePractice.findByPk(req.params.id);
    
    if (!restrictivePractice) {
      return res.status(404).json({ message: 'Restrictive practice report not found' });
    }
    
    // Update status to submitted
    await restrictivePractice.update({
      status: 'submitted',
      submittedAt: new Date(),
      submittedById: req.user ? req.user.id : req.body.submittedById // In production, always use req.user.id
    });
    
    res.status(200).json(restrictivePractice);
  } catch (error) {
    console.error('Error submitting restrictive practice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete restrictive practice
exports.deleteRestrictivePractice = async (req, res) => {
  try {
    const restrictivePractice = await RestrictivePractice.findByPk(req.params.id);
    
    if (!restrictivePractice) {
      return res.status(404).json({ message: 'Restrictive practice report not found' });
    }
    
    // Check if the report is already submitted
    if (restrictivePractice.status !== 'draft') {
      return res.status(403).json({ message: 'Cannot delete a submitted restrictive practice report' });
    }
    
    await restrictivePractice.destroy();
    
    res.status(200).json({ message: 'Restrictive practice report deleted successfully' });
  } catch (error) {
    console.error('Error deleting restrictive practice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
