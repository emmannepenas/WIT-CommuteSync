const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  corridor: { type: String, required: true }, // e.g., "Sen. Benigno Aquino Ave.", "Oton-City Proper", "Jaro Plaza"
  reportType: { 
    type: String, 
    enum: ['Puno na sa loading zone', 'Mahaba pila sa terminal', 'Baha/Traffic sa daan', 'Route Skipping'], 
    required: true 
  },
  severity: { type: String, enum: ['Moderate', 'Severe'], default: 'Moderate' },
  reportedBy: { type: String, default: 'WIT Student' },
  coordinates: {
    lat: Number,
    lng: Number
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now, expires: 7200 } // Auto-expires after 2 hours
});

module.exports = mongoose.model('Incident', IncidentSchema);