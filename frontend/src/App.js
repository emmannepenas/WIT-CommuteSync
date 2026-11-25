import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './App.css';

import StudentView from './components/StudentView';
import DispatcherView from './components/DispatcherView';
import FacultyView from './components/FacultyView';
import AdminView from './components/AdminView';
import AuthView from './components/AuthView';

const API_URL = 'http://localhost:5000/api';
const socket = io('http://localhost:5000');

function App() {
  const [activeTab, setActiveTab] = useState('student');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('wit_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [terminals, setTerminals] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [weather, setWeather] = useState({
    condition: 'Loading...',
    floodHazard: false,
    temp: 28,
    description: ''
  });

  const fetchInitialData = async () => {
    try {
      const res = await axios.get(`${API_URL}/state`);
      setTerminals(res.data.terminals || []);
      setIncidents(res.data.incidents || []);
      setLogs(res.data.logs || []);
      if (res.data.weather) {
        setWeather(res.data.weather);
      }
    } catch (err) {
      console.error('Error fetching initial state:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();

    const token = localStorage.getItem('wit_token');
    if (token) {
      axios
        .get(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('wit_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem('wit_token');
          localStorage.removeItem('wit_user');
          setUser(null);
        });
    }

    socket.on('terminal_updated', (updatedTerminal) => {
      setTerminals((prev) =>
        prev.map((t) => (t._id === updatedTerminal._id ? updatedTerminal : t))
      );
    });

    socket.on('new_incident', (incident) => {
      setIncidents((prev) => [incident, ...prev]);
    });

    socket.on('new_attendance', (log) => {
      setLogs((prev) => [log, ...prev]);
    });

    return () => {
      socket.off('terminal_updated');
      socket.off('new_incident');
      socket.off('new_attendance');
    };
  }, []);

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'dispatcher') setActiveTab('dispatcher');
    else if (loggedInUser.role === 'faculty') setActiveTab('faculty');
    else if (loggedInUser.role === 'admin') setActiveTab('admin');
    else setActiveTab('student');
  };

  const handleLogout = () => {
    localStorage.removeItem('wit_token');
    localStorage.removeItem('wit_user');
    setUser(null);
    setActiveTab('auth');
  };

  return (
    <div>
      <header className="navbar">
        <div className="brand">
          <h1>
            WIT-<span>CommuteSync</span>
          </h1>
          <p>Iloilo Provincial Transit &amp; Geo-Verified Attendance System</p>
        </div>

        <nav className="nav-tabs">
          <button
            type="button"
            className={`nav-btn ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => setActiveTab('student')}
          >
            1. Student Commuter
          </button>
          <button
            type="button"
            className={`nav-btn ${activeTab === 'dispatcher' ? 'active' : ''}`}
            onClick={() => setActiveTab('dispatcher')}
          >
            2. Terminal Dispatcher
          </button>
          <button
            type="button"
            className={`nav-btn ${activeTab === 'faculty' ? 'active' : ''}`}
            onClick={() => setActiveTab('faculty')}
          >
            3. Faculty Attendance
          </button>
          <button
            type="button"
            className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            4. Commute Analytics
          </button>

          {user ? (
            <button type="button" className="nav-btn active" onClick={handleLogout}>
              Sign Out ({user.fullName})
            </button>
          ) : (
            <button
              type="button"
              className={`nav-btn ${activeTab === 'auth' ? 'active' : ''}`}
              onClick={() => setActiveTab('auth')}
            >
              Sign In / Register
            </button>
          )}
        </nav>
      </header>

      <div className="status-banner">
        <div>
          <strong>Target Campus:</strong> Western Institute of Technology (La Paz, Iloilo City)
          {user && (
            <span style={{ marginLeft: '1rem', color: '#0f294a' }}>
              | Signed in as <strong>{user.fullName}</strong> ({user.role})
            </span>
          )}
        </div>
        <div>
          <span className={`weather-pill ${weather.floodHazard ? 'hazard' : 'normal'}`}>
            Iloilo Weather: {weather.condition} ({weather.temp}&deg;C) &mdash; {weather.description}
          </span>
        </div>
      </div>

      <main className="container">
        {activeTab === 'auth' && <AuthView onAuthSuccess={handleAuthSuccess} />}
        {activeTab === 'student' && (
          <StudentView
            terminals={terminals}
            incidents={incidents}
            weather={weather}
            currentUser={user}
          />
        )}
        {activeTab === 'dispatcher' && <DispatcherView terminals={terminals} />}
        {activeTab === 'faculty' && <FacultyView logs={logs} incidents={incidents} />}
        {activeTab === 'admin' && (
          <AdminView logs={logs} terminals={terminals} incidents={incidents} />
        )}
      </main>
    </div>
  );
}

export default App;