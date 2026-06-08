// routes/operator.js
const express = require('express');
const Booking = require('../models/Booking');
const Station = require('../models/Station');
const Slot = require('../models/Slot');
const { auth, operator } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/operator/dashboard
// @desc    Get full operational data (Stations, Hardware, Live Tasks)
router.get('/dashboard', [auth, operator], async (req, res) => {
  try {
    const stations = await Station.find({ operatorId: req.user.id });
    const stationIds = stations.map(s => s._id);

    // Fetch all hardware slots for these stations
    const slots = await Slot.find({ stationId: { $in: stationIds } }).populate('stationId', 'name');

    // Fetch all bookings for these stations
    const allBookings = await Booking.find({ stationId: { $in: stationIds } })
      .populate('stationId', 'name')
      .populate('slotId', 'slotNumber chargerType')
      .populate('userId', 'name email')
      .sort({ date: -1, startTime: 1 });

    const completedBookings = allBookings.filter(b => b.status === 'completed');
    const totalRevenue = completedBookings.reduce((acc, curr) => acc + curr.totalCost, 0);

    res.json({
      stations,
      slots,
      bookings: allBookings,
      totalRevenue,
      totalCompleted: completedBookings.length
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/operator/slots/:id/status
// @desc    Manually override hardware status (e.g., take offline for maintenance)
router.put('/slots/:id/status', [auth, operator], async (req, res) => {
  try {
    const slot = await Slot.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    
    // Alert all connected clients (React Map) that a station went offline/online
    const io = req.app.get('io');
    io.emit('slotStatusChanged', { slotId: slot._id, status: slot.status, stationId: slot.stationId });
    
    res.json(slot);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/operator/bookings/:id/status
// @desc    Operator manages user charging sessions (Start / Complete)
router.put('/bookings/:id/status', [auth, operator], async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    // Hardware Auto-Sync logic based on task status
    let slotStatus = null;
    if (status === 'active') slotStatus = 'occupied'; // Car plugged in
    if (status === 'completed' || status === 'cancelled') slotStatus = 'available'; // Car left

    if (slotStatus) {
       await Slot.findByIdAndUpdate(booking.slotId, { status: slotStatus });
       const io = req.app.get('io');
       io.emit('slotStatusChanged', { slotId: booking.slotId, status: slotStatus, stationId: booking.stationId });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;