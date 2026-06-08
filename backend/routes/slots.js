const express = require('express');
const Slot = require('../models/Slot');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET api/slots/:id/availability
// @desc    Get availability of a slot for a given date
// @access  Public
router.get('/:id/availability', async (req, res) => {
  try {
    const { date } = req.query;
    // In a full implementation, you would check the Bookings collection 
    // for this slot on this date to return available time blocks.
    // For demo, just returning the current slot status.
    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ msg: 'Slot not found' });
    
    res.json({ slot, date, available: slot.status === 'available' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
