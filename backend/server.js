const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Terminal = require('./models/Terminal');
const Incident = require('./models/Incident');
const AttendanceLog = require('./models/AttendanceLog');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT'] }
});

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'wit_commutesync_dev_secret';

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Error:', err));

const WIT_COORDS = { lat: 10.7136, lng: 122.5681 };

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

async function getIloiloWeather() {
  try {
    if (
      !process.env.OPENWEATHER_API_KEY ||
      process.env.OPENWEATHER_API_KEY === 'your_openweathermap_api_key_here'
    ) {
      return {
        condition: 'Moderate Rain',
        floodHazard: true,
        temp: 28,
        description: 'Monsoon rain advisory in Jaro & La Paz corridors'
      };
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=10.7202&lon=122.5621&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    const res = await axios.get(url);
    const weatherMain = res.data.weather[0].main;
    const isRainy = ['Rain', 'Thunderstorm', 'Drizzle'].includes(weatherMain);
    return {
      condition: weatherMain,
      floodHazard: isRainy,
      temp: Math.round(res.data.main.temp),
      description: res.data.weather[0].description
    };
  } catch (error) {
    return {
      condition: 'Cloudy / Light Rain',
      floodHazard: false,
      temp: 29,
      description: 'Normal transit weather'
    };
  }
}

function signUserToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    originMunicipality: user.originMunicipality,
    perimeterUsed: user.perimeterUsed
  };
}

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, role, studentId, originMunicipality, perimeterUsed } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const allowedRoles = ['student', 'dispatcher', 'faculty', 'admin'];
    const safeRole = allowedRoles.includes(role) ? role : 'student';
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: safeRole,
      studentId: (studentId || '').trim(),
      originMunicipality: originMunicipality || 'Pavia',
      perimeterUsed: perimeterUsed || 'Ungka ITGSI Terminal'
    });

    const token = signUserToken(newUser);
    res.status(201).json({ token, user: sanitizeUser(newUser) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signUserToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Missing token.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

// --- TRANSIT & ATTENDANCE ROUTES ---

app.get('/api/state', async (req, res) => {
  try {
    const terminals = await Terminal.find().sort({ stage: 1, name: 1 });
    const incidents = await Incident.find({ active: true }).sort({ createdAt: -1 });
    const logs = await AttendanceLog.find().sort({ actualArrivalTime: -1 });
    const weather = await getIloiloWeather();
    res.json({ terminals, incidents, logs, weather });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/terminals/:id', async (req, res) => {
  try {
    const { occupiedSeats, estimatedDepartureMins, queueLevel, waitingPassengers, incomingCityLoops } = req.body;
    const terminal = await Terminal.findByIdAndUpdate(
      req.params.id,
      {
        occupiedSeats,
        estimatedDepartureMins,
        queueLevel,
        waitingPassengers,
        incomingCityLoops,
        lastUpdated: Date.now()
      },
      { new: true }
    );
    io.emit('terminal_updated', terminal);
    res.json(terminal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/incidents', async (req, res) => {
  try {
    const { corridor, reportType, severity, reportedBy, coordinates } = req.body;
    const incident = await Incident.create({
      corridor,
      reportType,
      severity: severity || 'Severe',
      reportedBy: reportedBy || 'WIT Commuter',
      coordinates: coordinates || { lat: 10.7250, lng: 122.5580 }
    });
    io.emit('new_incident', incident);
    res.status(201).json(incident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance/checkin', async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      originMunicipality,
      perimeterUsed,
      corridorUsed,
      scheduledClassTime,
      minutesLate,
      gpsCoordinates
    } = req.body;

    let distance = 0;
    if (gpsCoordinates && gpsCoordinates.lat && gpsCoordinates.lng) {
      distance = getDistanceMeters(
        gpsCoordinates.lat,
        gpsCoordinates.lng,
        WIT_COORDS.lat,
        WIT_COORDS.lng
      );
    }

    const perimeterTerminal = await Terminal.findOne({ name: perimeterUsed });
    const activeCorridorIncidents = await Incident.find({ corridor: corridorUsed, active: true });
    const weather = await getIloiloWeather();

    let status = 'On Time';
    let verificationReason = 'Arrived on or before class schedule.';

    if (minutesLate > 0) {
      const reasons = [];
      if (perimeterTerminal && ['Heavy', 'Critical'].includes(perimeterTerminal.queueLevel)) {
        reasons.push(
          `${perimeterTerminal.queueLevel} queue bottleneck at ${perimeterUsed} (${perimeterTerminal.waitingPassengers} waiting)`
        );
      }
      if (activeCorridorIncidents.length > 0) {
        reasons.push(`Active corridor alert on ${corridorUsed}: ${activeCorridorIncidents[0].reportType}`);
      }
      if (weather.floodHazard) {
        reasons.push(`Weather hazard: ${weather.description}`);
      }

      if (reasons.length > 0) {
        status = 'Verified Transit Delay';
        verificationReason = `AUTO-VERIFIED PASS: ${reasons.join(' + ')}.`;
      } else {
        status = 'Unexcused Tardiness';
        verificationReason =
          'No severe terminal bottlenecks, corridor incidents, or flood hazards recorded along selected route.';
      }
    }

    const log = await AttendanceLog.create({
      studentId,
      studentName,
      originMunicipality,
      perimeterUsed,
      corridorUsed,
      scheduledClassTime,
      minutesLate,
      gpsCoordinates,
      distanceFromWITMeters: distance,
      status,
      verificationReason
    });

    io.emit('new_attendance', log);
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`WIT-CommuteSync Server running on port ${PORT}`));