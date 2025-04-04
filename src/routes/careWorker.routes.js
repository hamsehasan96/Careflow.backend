const path = require('path');
const express = require('express');
const router = express.Router();
const { auth, checkRole } = require(path.join(__dirname, '..', 'middleware', 'auth.middleware'));
const { User } = require(path.join(__dirname, '..', 'models'));

// Get all care workers
router.get('/', auth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const careWorkers = await User.findAll({
      where: { role: 'staff' },
      attributes: { exclude: ['password'] }
    });
    res.json(careWorkers);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get care worker by ID
router.get('/:id', auth, checkRole(['admin', 'manager', 'staff']), async (req, res) => {
  try {
    const careWorker = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!careWorker) {
      return res.status(404).json({ message: 'Care worker not found' });
    }
    
    res.json(careWorker);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update care worker
router.put('/:id', auth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const careWorker = await User.findByPk(req.params.id);
    
    if (!careWorker) {
      return res.status(404).json({ message: 'Care worker not found' });
    }
    
    const { firstName, lastName, email, role } = req.body;
    
    await careWorker.update({
      firstName,
      lastName,
      email,
      role: role || careWorker.role
    });
    
    res.json(careWorker);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete care worker
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const careWorker = await User.findByPk(req.params.id);
    
    if (!careWorker) {
      return res.status(404).json({ message: 'Care worker not found' });
    }
    
    await careWorker.destroy();
    res.json({ message: 'Care worker deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 