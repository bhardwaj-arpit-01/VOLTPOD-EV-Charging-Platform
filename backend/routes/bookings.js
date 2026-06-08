const express = require('express');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 1. CREATE BOOKING: Handle the 30% advance payment
router.post('/', auth, async (req, res) => {
  try {
    const { stationId, slotId, date, startTime, endTime, totalCost, paymentMethod } = req.body;

    const user = await User.findById(req.user.id);
    const advancePaid = totalCost * 0.30;

    // If using wallet, check balance and deduct
    if (paymentMethod === 'wallet') {
      if (user.walletBalance < advancePaid) {
        return res.status(400).json({ msg: 'Insufficient wallet balance for 30% advance.' });
      }
      user.walletBalance -= advancePaid;
      await user.save();
    }

    const newBooking = new Booking({ 
      userId: req.user.id, stationId, slotId, date, startTime, endTime, totalCost, advancePaid 
    });
    const booking = await newBooking.save();

    // Mark slot as reserved and update map instantly
    await Slot.findByIdAndUpdate(slotId, { status: 'reserved' }, { new: true });
    const io = req.app.get('io');
    io.emit('slotStatusChanged', { slotId, status: 'reserved', stationId });

    res.json(booking);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// 2. GET BOOKINGS: Fetch list for the user dashboard
router.get('/my', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('stationId', 'name address')
      .populate('slotId', 'slotNumber chargerType')
      .sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// 3. CANCEL BOOKING: Handle time-based refunds
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    if (booking.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    // TIME-BASED REFUND LOGIC
    const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
    const now = new Date();
    const hoursDifference = (bookingDateTime - now) / (1000 * 60 * 60);

    let refundAmount = 0;
    if (hoursDifference >= 2) {
      refundAmount = booking.advancePaid; // 100% refund if 2+ hours early
    } else if (hoursDifference > 0) {
      refundAmount = booking.advancePaid * 0.50; // 50% refund if < 2 hours early
    } else {
      refundAmount = 0; // 0% refund if time already passed
    }

    const user = await User.findById(req.user.id);
    if (!user.bankConnected) {
      // Goes back to app wallet if no bank connected
      user.walletBalance += refundAmount;
      await user.save();
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Free up the slot and update map instantly
    await Slot.findByIdAndUpdate(booking.slotId, { status: 'available' });
    const io = req.app.get('io');
    io.emit('slotStatusChanged', { slotId: booking.slotId, status: 'available', stationId: booking.stationId });

    // THE CRUCIAL FIX: Send walletBalance back to the frontend!
    res.json({
      msg: 'Booking cancelled successfully',
      booking,
      refundAmount,
      refundedTo: user.bankConnected ? 'Bank Account' : 'VoltPod Wallet',
      walletBalance: user.walletBalance
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;