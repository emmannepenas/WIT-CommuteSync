const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Terminal = require('./models/Terminal');
const Incident = require('./models/Incident');
const AttendanceLog = require('./models/AttendanceLog');
const User = require('./models/User');

const seedData = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  await Terminal.deleteMany({});
  await Incident.deleteMany({});
  await AttendanceLog.deleteMany({});
  await User.deleteMany({});

  const terminals = [
    { name: 'Pavia Municipal Terminal', stage: 1, municipality: 'Pavia', coordinates: { lat: 10.7753, lng: 122.5419 }, totalSeats: 20, occupiedSeats: 16, estimatedDepartureMins: 5 },
    { name: 'Oton Plaza Terminal', stage: 1, municipality: 'Oton', coordinates: { lat: 10.6931, lng: 122.4735 }, totalSeats: 22, occupiedSeats: 11, estimatedDepartureMins: 14 },
    { name: 'San Miguel Public Terminal', stage: 1, municipality: 'San Miguel', coordinates: { lat: 10.7764, lng: 122.4673 }, totalSeats: 18, occupiedSeats: 17, estimatedDepartureMins: 2 },
    { name: 'Sta. Barbara Jeepney Terminal', stage: 1, municipality: 'Sta. Barbara', coordinates: { lat: 10.8225, lng: 122.5342 }, totalSeats: 20, occupiedSeats: 8, estimatedDepartureMins: 18 },
    { name: 'Leganes Integrated Terminal', stage: 1, municipality: 'Leganes', coordinates: { lat: 10.7869, lng: 122.5897 }, totalSeats: 20, occupiedSeats: 14, estimatedDepartureMins: 7 },
    { name: 'Ungka ITGSI Terminal', stage: 2, municipality: 'Jaro/Pavia Boundary', coordinates: { lat: 10.7538, lng: 122.5482 }, queueLevel: 'Critical', waitingPassengers: 65, incomingCityLoops: 1 },
    { name: 'Mohon Terminal (Arevalo)', stage: 2, municipality: 'Oton/Arevalo Boundary', coordinates: { lat: 10.6889, lng: 122.5085 }, queueLevel: 'Moderate', waitingPassengers: 24, incomingCityLoops: 3 },
    { name: 'Tagbak Terminal (Jaro)', stage: 2, municipality: 'Leganes/Jaro Boundary', coordinates: { lat: 10.7589, lng: 122.5852 }, queueLevel: 'Heavy', waitingPassengers: 48, incomingCityLoops: 2 }
  ];

  await Terminal.insertMany(terminals);

  await Incident.insertMany([
    { corridor: 'Sen. Benigno Aquino Ave. (Diversion)', reportType: 'Puno na sa loading zone', severity: 'Severe', reportedBy: 'BSIT-3A Student', coordinates: { lat: 10.7289, lng: 122.5512 } },
    { corridor: 'Jaro Plaza to La Paz (WIT)', reportType: 'Baha/Traffic sa daan', severity: 'Severe', reportedBy: 'BSCE-2B Student', coordinates: { lat: 10.7245, lng: 122.5610 } }
  ]);

  await AttendanceLog.insertMany([
    { studentId: '2023-0142', studentName: 'Juan Dela Cruz', originMunicipality: 'San Miguel', perimeterUsed: 'Ungka ITGSI Terminal', corridorUsed: 'Sen. Benigno Aquino Ave. (Diversion)', scheduledClassTime: '07:30', minutesLate: 18, status: 'Verified Transit Delay', verificationReason: 'Severe bottleneck at Ungka ITGSI + Diversion Road congestion.' },
    { studentId: '2023-0891', studentName: 'Maria Clara Reyes', originMunicipality: 'Oton', perimeterUsed: 'Mohon Terminal (Arevalo)', corridorUsed: 'Oton–City Proper Highway', scheduledClassTime: '07:30', minutesLate: 0, status: 'On Time', verificationReason: 'Arrived within schedule.' },
    { studentId: '2024-0311', studentName: 'Carlos Mendoza', originMunicipality: 'Leganes', perimeterUsed: 'Tagbak Terminal (Jaro)', corridorUsed: 'Jaro Plaza to La Paz (WIT)', scheduledClassTime: '08:00', minutesLate: 22, status: 'Verified Transit Delay', verificationReason: 'Heavy rainfall advisory + Tagbak queue critical.' },
    { studentId: '2022-0519', studentName: 'Angela Soriano', originMunicipality: 'Pavia', perimeterUsed: 'Ungka ITGSI Terminal', corridorUsed: 'Sen. Benigno Aquino Ave. (Diversion)', scheduledClassTime: '09:00', minutesLate: 12, status: 'Unexcused Tardiness', verificationReason: 'No active corridor disruption or terminal bottleneck logged during travel window.' }
  ]);

  const demoPassword = await bcrypt.hash('witpass123', 10);
  await User.insertMany([
    {
      fullName: 'Kyla Marie Santos',
      email: 'student@wit.edu.ph',
      passwordHash: demoPassword,
      role: 'student',
      studentId: '2024-0198',
      originMunicipality: 'Pavia',
      perimeterUsed: 'Ungka ITGSI Terminal'
    },
    {
      fullName: 'Ramon Padilla',
      email: 'dispatcher@wit.edu.ph',
      passwordHash: demoPassword,
      role: 'dispatcher',
      originMunicipality: 'Pavia',
      perimeterUsed: 'Ungka ITGSI Terminal'
    },
    {
      fullName: 'Prof. Elena Gomez',
      email: 'faculty@wit.edu.ph',
      passwordHash: demoPassword,
      role: 'faculty',
      originMunicipality: 'Leganes',
      perimeterUsed: 'Tagbak Terminal (Jaro)'
    },
    {
      fullName: 'Admin CommuteSync',
      email: 'admin@wit.edu.ph',
      passwordHash: demoPassword,
      role: 'admin',
      originMunicipality: 'Oton',
      perimeterUsed: 'Mohon Terminal (Arevalo)'
    }
  ]);

  console.log('Seeded terminals, incidents, attendance logs, and demo users (password: witpass123)');
  process.exit();
};

seedData();