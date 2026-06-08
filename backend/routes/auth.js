const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password, role: role || 'user', walletBalance: 500 });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, walletBalance: user.walletBalance, bankConnected: user.bankConnected } });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, walletBalance: user.walletBalance, bankConnected: user.bankConnected } });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Toggle Bank Connection
router.post('/wallet/connect', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.bankConnected = !user.bankConnected;
    await user.save();
    res.json({ bankConnected: user.bankConnected });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Redeem Wallet Funds to Bank
router.post('/wallet/redeem', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.bankConnected) return res.status(400).json({ msg: 'Connect a bank account first.' });
    if (user.walletBalance <= 0) return res.status(400).json({ msg: 'No funds to redeem.' });

    const redeemedAmount = user.walletBalance;
    user.walletBalance = 0;
    await user.save();

    res.json({ msg: `Successfully transferred ₹${redeemedAmount} to your bank account.`, walletBalance: 0 });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;