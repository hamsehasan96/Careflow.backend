const { validationResult } = require('express-validator');
const Goal = require('../models/goal.model');

// Get all goals for a participant
exports.getParticipantGoals = async (req, res) => {
  try {
    const goals = await Goal.findAll({
      where: { participantId: req.params.participantId }
    });
    
    res.status(200).json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get goal by ID
exports.getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.status(200).json(goal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new goal
exports.createGoal = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { participantId, title, description, status, targetDate } = req.body;
    
    const newGoal = await Goal.create({
      participantId,
      title,
      description,
      status: status || 'not-started',
      targetDate,
      createdBy: req.user ? req.user.id : null
    });
    
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update goal
exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    await goal.update(req.body);
    
    res.status(200).json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete goal
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findByPk(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    await goal.destroy();
    
    res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
