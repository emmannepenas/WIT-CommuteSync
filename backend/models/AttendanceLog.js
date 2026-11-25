const mongoose = require('mongoose');

const AttendanceLogSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  originMunicipality: { type: String, required: true },
  perimeterUsed: { type: String, required: true },
  corridorUsed: { type: String, required: true },
  scheduledClassTime: { type: String, required: true },
  actualArrivalTime: { type: Date, default: Date.now },
  minutesLate: { type: Number, default: 0 },
  gpsCoordinates: {
    lat: Number,
    lng: Number
  },
  distanceFromWITMeters: Number,
  status: { 
    type: String, 
    enum: ['On Time', 'Verified Transit Delay', 'Unexcused Tardiness'], 
    required: true 
  },
  verificationReason: { type: String, required: true }
});

module.exports = mongoose.model('AttendanceLog', AttendanceLogSchema);