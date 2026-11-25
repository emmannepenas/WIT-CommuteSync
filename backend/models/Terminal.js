const mongoose = require('mongoose');

const TerminalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stage: { type: Number, enum: [1, 2], required: true }, // 1 = Provincial, 2 = Perimeter
  municipality: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  // Stage 1: "Waiting until full" metrics
  totalSeats: { type: Number, default: 20 },
  occupiedSeats: { type: Number, default: 0 },
  estimatedDepartureMins: { type: Number, default: 15 },
  // Stage 2: Perimeter transfer bottleneck metrics
  queueLevel: { type: String, enum: ['Low', 'Moderate', 'Heavy', 'Critical'], default: 'Low' },
  waitingPassengers: { type: Number, default: 0 },
  incomingCityLoops: { type: Number, default: 2 },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Terminal', TerminalSchema);