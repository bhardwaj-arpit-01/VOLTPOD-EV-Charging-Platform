const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  coordinates: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  totalSlots: {
    type: Number,
    required: true,
  },
  chargerTypes: {
    type: [String],
    required: true,
  },
  pricePerUnit: {
    type: Number, // price per kWh
    required: true,
  },
  operatingHours: {
    type: String,
    default: '24/7',
  },
  amenities: {
    type: [String],
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Station', StationSchema);
