const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'operator', 'admin'],
    default: 'user',
  },
  walletBalance: {
    type: Number,
    default: 0 // Changed from 500 to 0 to prevent old users from getting free money
  },
  bankConnected: {
    type: Boolean,
    default: false, // Tracks if user linked their real bank
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);