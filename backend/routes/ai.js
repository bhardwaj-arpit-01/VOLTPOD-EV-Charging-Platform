// routes/ai.js
const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const Station = require('../models/Station');
const Slot = require('../models/Slot');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini (Ensure GEMINI_API_KEY is in your .env)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @route   POST api/ai/chat
// @desc    Chat with live context-aware AI
// @access  Private
router.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;

    // 1. Gather Live Context from your Database
    const stations = await Station.find();
    const availableSlots = await Slot.find({ status: 'available' }).populate('stationId', 'name pricePerUnit');

    // 2. Format the data so the AI can understand it
    const liveDataStr = availableSlots.map(slot => 
      `Station: ${slot.stationId.name}, Slot: ${slot.slotNumber}, Type: ${slot.chargerType} (${slot.powerKW}kW), Price: ₹${slot.stationId.pricePerUnit}/kWh`
    ).join('; ');

    // 3. Create the System Instruction
    const systemInstruction = `You are the VoltPod AI Assistant. You help EV drivers find charging stations in Bhopal. 
    Here is the LIVE data of currently available charging slots: [${liveDataStr}]. 
    Always base your recommendations on this live data. Keep your answers concise, helpful, and friendly.`;

    // 4. Call Gemini
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
        }
    });

    res.json({ reply: response.text });
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ msg: 'AI Service is currently unavailable. Please check your API key.' });
  }
});

// @route   POST api/ai/optimize
// @desc    AI calculates exact charge time and cost based on car model
// @access  Private
router.post('/optimize', auth, async (req, res) => {
  try {
    const { stationId, carModel, currentBattery, targetBattery } = req.body;

    // 1. Get the specific station and its available slots
    const station = await Station.findById(stationId);
    const availableSlots = await Slot.find({ stationId, status: 'available' });

    if (!station || availableSlots.length === 0) {
      return res.status(400).json({ msg: 'No available slots at this station to optimize.' });
    }

    // 2. Format slot data for the AI
    const slotData = availableSlots.map(s => `Slot ${s.slotNumber}: ${s.chargerType} (${s.powerKW}kW)`).join(', ');

    // 3. Prompt Gemini to do the heavy lifting
    const prompt = `
      You are an EV charging expert AI. 
      The user drives a "${carModel}". They are currently at ${currentBattery}% battery and want to charge to ${targetBattery}%.
      They are at the station "${station.name}" which charges ₹${station.pricePerUnit} per kWh.
      Available chargers right now: ${slotData}.
      
      Tasks:
      1. Estimate the battery capacity of their car in kWh.
      2. Recommend the best/fastest charger from the available list.
      3. Calculate the estimated time to charge and the total cost in Rupees.
      
      Keep the response short, punchy, and format it clearly so it looks good in a UI alert.
    `;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    res.json({ recommendation: response.text });
  } catch (err) {
    console.error('Optimizer Error:', err);
    res.status(500).json({ msg: 'AI Optimizer failed.' });
  }
});

module.exports = router;