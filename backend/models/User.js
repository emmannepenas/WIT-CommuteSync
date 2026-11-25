const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'dispatcher', 'faculty', 'admin'],
    default: 'student'
  },
  studentId: { type: String, default: '' },
  originMunicipality: { type: String, default: 'Pavia' },
  perimeterUsed: { type: String, default: 'Ungka ITGSI Terminal' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);