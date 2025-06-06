const path = require('path');
const express = require('express');
const router = express.Router();
const { CareNote } = require(path.join(__dirname, '..', 'models'));
const { auth, checkRole } = require(path.join(__dirname, '..', 'middleware', 'auth.middleware'));
const { validate } = require(path.join(__dirname, '..', 'middleware', 'validate.middleware'));
const logger = require(path.join(__dirname, '..', 'config', 'logger'));

// Get all care notes
router.get('/', auth, checkRole(['admin', 'care_worker']), async (req, res) => {
  try {
    const careNotes = await CareNote.findAll({
      where: req.userRole === 'admin' ? {} : { careWorkerId: req.userId },
      include: ['participant', 'careWorker'],
      order: [['createdAt', 'DESC']]
    });
    res.json(careNotes);
  } catch (error) {
    logger.error('Error fetching care notes:', error);
    res.status(500).json({ message: 'Error fetching care notes' });
  }
});

// Get a single care note
router.get('/:id', auth, checkRole(['admin', 'care_worker']), async (req, res) => {
  try {
    const careNote = await CareNote.findByPk(req.params.id, {
      include: ['participant', 'careWorker']
    });
    if (!careNote) {
      return res.status(404).json({ message: 'Care note not found' });
    }
    res.json(careNote);
  } catch (error) {
    logger.error('Error fetching care note:', error);
    res.status(500).json({ message: 'Error fetching care note' });
  }
});

// Create a new care note
router.post('/', auth, checkRole(['care_worker']), validate, async (req, res) => {
  try {
    const careNote = await CareNote.create({
      ...req.body,
      careWorkerId: req.userId
    });
    res.status(201).json(careNote);
  } catch (error) {
    logger.error('Error creating care note:', error);
    res.status(500).json({ message: 'Error creating care note' });
  }
});

// Update a care note
router.put('/:id', auth, checkRole(['admin', 'care_worker']), validate, async (req, res) => {
  try {
    const careNote = await CareNote.findByPk(req.params.id);
    if (!careNote) {
      return res.status(404).json({ message: 'Care note not found' });
    }
    await careNote.update(req.body);
    res.json(careNote);
  } catch (error) {
    logger.error('Error updating care note:', error);
    res.status(500).json({ message: 'Error updating care note' });
  }
});

// Delete a care note
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const careNote = await CareNote.findByPk(req.params.id);
    if (!careNote) {
      return res.status(404).json({ message: 'Care note not found' });
    }
    await careNote.destroy();
    res.json({ message: 'Care note deleted successfully' });
  } catch (error) {
    logger.error('Error deleting care note:', error);
    res.status(500).json({ message: 'Error deleting care note' });
  }
});

module.exports = router;
