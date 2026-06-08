const express = require('express');
const Station = require('../models/Station');
const Slot = require('../models/Slot');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET api/stations
// @desc    Get all stations (with filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius, type, available } = req.query;
    
    // In a real app, use geospatial queries (e.g. $geoWithin) here.
    // For demo, just return all, maybe filter by type.
    let query = {};
    if (type) {
      query.chargerTypes = { $in: [type] };
    }

    let stations = await Station.find(query);

    // If we only want available, we'd need to check slots.
    // For simplicity, fetch all and filter in frontend or do an aggregation.

    res.json(stations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/stations/:id
// @desc    Get station by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) return res.status(404).json({ msg: 'Station not found' });
    res.json(station);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/stations
// @desc    Create a station
// @access  Private/Admin
router.post('/', [auth, admin], async (req, res) => {
  try {
    const newStation = new Station(req.body);
    const station = await newStation.save();
    res.json(station);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/stations/:id
// @desc    Update a station
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(station);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/stations/:id/slots
// @desc    Get all slots for a station
// @access  Public
router.get('/:id/slots', async (req, res) => {
  try {
    const slots = await Slot.find({ stationId: req.params.id });
    res.json(slots);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
