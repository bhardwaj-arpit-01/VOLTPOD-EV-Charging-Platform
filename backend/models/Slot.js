const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true,
  },
  slotNumber: {
    type: Number,
    required: true,
  },
  chargerType: {
    type: String, // Type 1, Type 2, CCS, CHAdeMO
    required: true,
  },
  powerKW: {
    type: Number, // Power output in kW
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available',
  },
});

module.exports = mongoose.model('Slot', SlotSchema);