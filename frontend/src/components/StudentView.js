import React, { useState } from 'react';
import axios from 'axios';
import RouteMap from './RouteMap';

const API_URL = 'http://localhost:5000/api';

const StudentView = ({ terminals = [], incidents = [], weather = {} }) => {
  const [selectedMunicipality, setSelectedMunicipality] = useState('Pavia');
  const [targetClassTime, setTargetClassTime] = useState('07:30');

  const [corridor, setCorridor] = useState('Sen. Benigno Aquino Ave. (Diversion)');
  const [reportFeedback, setReportFeedback] = useState('');

  const [studentId, setStudentId] = useState('2024-0198');
  const [studentName, setStudentName] = useState('Kyla Marie Santos');
  const [perimeterUsed, setPerimeterUsed] = useState('Ungka ITGSI Terminal');
  const [minutesLate, setMinutesLate] = useState(15);
  const [gpsStatus, setGpsStatus] = useState('Not yet captured');
  const [coords, setCoords] = useState({ lat: 10.7137, lng: 122.5680 });
  const [checkInResult, setCheckInResult] = useState(null);

  const stage1Terminals = terminals.filter((t) => t.stage === 1);
  const stage2Terminals = terminals.filter((t) => t.stage === 2);

  const calculateRecommendedDeparture = () => {
    const provTerminal = stage1Terminals.find((t) => t.municipality === selectedMunicipality);
    const waitMins = provTerminal ? provTerminal.estimatedDepartureMins : 10;
    const baseTravelMins =
      selectedMunicipality === 'Sta. Barbara' || selectedMunicipality === 'Oton' ? 45 : 35;
    const congestionBuffer = incidents.length * 7 + (weather.floodHazard ? 15 : 5);
    const totalNeededMins = waitMins + baseTravelMins + congestionBuffer;

    const [hours, mins] = targetClassTime.split(':').map(Number);
    const targetDate = new Date();
    targetDate.setHours(hours, mins, 0);
    targetDate.setMinutes(targetDate.getMinutes() - totalNeededMins);

    return {
      recommendedTime: targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      totalNeededMins,
      waitMins,
      congestionBuffer
    };
  };

  const alarmInfo = calculateRecommendedDeparture();

  const handleQuickReport = async (reportType) => {
    try {
      await axios.post(`${API_URL}/incidents`, {
        corridor,
        reportType,
        severity: 'Severe',
        reportedBy: `${studentName} (${selectedMunicipality})`
      });
      setReportFeedback(`Alert sent: "${reportType}" on ${corridor}`);
      setTimeout(() => setReportFeedback(''), 4000);
    } catch (err) {
      alert('Error sending report');
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported; using WIT Campus fallback.');
      return;
    }
    setGpsStatus('Acquiring GPS signal...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus(`GPS Locked (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
      },
      () => {
        setCoords({ lat: 10.7136, lng: 122.5681 });
        setGpsStatus('GPS Simulated at WIT La Paz Gate (Location permission blocked/desktop)');
      }
    );
  };

  const handleAttendanceCheckIn = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/attendance/checkin`, {
        studentId,
        studentName,
        originMunicipality: selectedMunicipality,
        perimeterUsed,
        corridorUsed: corridor,
        scheduledClassTime: targetClassTime,
        minutesLate: Number(minutesLate),
        gpsCoordinates: coords
      });
      setCheckInResult(res.data);
    } catch (err) {
      alert('Check-in failed');
    }
  };

  return (
    <div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Smart Departure Alarm (Iloilo &rarr; WIT)</span>
            <span className="stage-tag">Predictive ETA</span>
          </div>

          <div className="grid-2" style={{ marginBottom: '0.5rem' }}>
            <div className="form-group">
              <label>Origin Municipality</label>
              <select
                className="form-control"
                value={selectedMunicipality}
                onChange={(e) => setSelectedMunicipality(e.target.value)}
              >
                <option value="Pavia">Pavia</option>
                <option value="Oton">Oton</option>
                <option value="San Miguel">San Miguel</option>
                <option value="Sta. Barbara">Sta. Barbara</option>
                <option value="Leganes">Leganes</option>
              </select>
            </div>
            <div className="form-group">
              <label>First Class Schedule at WIT</label>
              <input
                type="time"
                className="form-control"
                value={targetClassTime}
                onChange={(e) => setTargetClassTime(e.target.value)}
              />
            </div>
          </div>

          <div className="alert-box">
            <strong>Recommended Departure Time: {alarmInfo.recommendedTime}</strong>
            <p style={{ marginTop: '0.3rem', fontSize: '0.83rem' }}>
              Estimated Total Commute: <strong>{alarmInfo.totalNeededMins} mins</strong> (Includes ~{alarmInfo.waitMins}m municipal terminal wait + {alarmInfo.congestionBuffer}m live traffic/weather buffer).
            </p>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              Stage 3: Live Corridor Crowdsourced Report
            </label>
            <select
              className="form-control"
              style={{ marginTop: '0.35rem' }}
              value={corridor}
              onChange={(e) => setCorridor(e.target.value)}
            >
              <option value="Sen. Benigno Aquino Ave. (Diversion)">Sen. Benigno Aquino Ave. (Diversion)</option>
              <option value="Oton–City Proper Highway">Oton–City Proper Highway</option>
              <option value="Jaro Plaza to La Paz (WIT)">Jaro Plaza to La Paz (WIT)</option>
              <option value="Ungka–Jaro McArthur Highway">Ungka–Jaro McArthur Highway</option>
            </select>

            <div className="crowd-btn-grid">
              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleQuickReport('Puno na sa loading zone')}>
                Puno na sa loading zone
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleQuickReport('Mahaba pila sa terminal')}>
                Mahaba pila sa terminal
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleQuickReport('Baha/Traffic sa daan')}>
                Baha / Traffic sa Jaro-La Paz
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleQuickReport('Route Skipping')}>
                Route Skipping (No Stop)
              </button>
            </div>
            {reportFeedback && (
              <p style={{ color: '#15803d', fontWeight: 600, fontSize: '0.82rem', marginTop: '0.5rem' }}>
                {reportFeedback}
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Live Iloilo–WIT Transit Corridor Map</span>
            <span className="stage-tag">Leaflet GPS</span>
          </div>
          <RouteMap terminals={terminals} incidents={incidents} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <span className="card-title">Stage 1: Municipal Terminals (&quot;Waiting Until Full&quot; Seat Counter)</span>
          <span className="stage-tag">Provincial Origin</span>
        </div>
        <div className="grid-3" style={{ marginBottom: 0 }}>
          {stage1Terminals.map((t) => {
            const seatsNeeded = t.totalSeats - t.occupiedSeats;
            const percent = Math.min(100, Math.round((t.occupiedSeats / t.totalSeats) * 100));
            return (
              <div key={t._id} className="stat-box" style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{t.municipality}</strong>
                  <span className={`badge ${seatsNeeded <= 3 ? 'badge-ontime' : 'badge-moderate'}`}>
                    {seatsNeeded === 0 ? 'Departing Now' : `${seatsNeeded} seats left`}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.name}</p>
                <div className="seat-bar-bg">
                  <div
                    className={`seat-bar-fill ${seatsNeeded <= 3 ? 'almost-full' : ''}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span>Occupied: <strong>{t.occupiedSeats}/{t.totalSeats}</strong></span>
                  <span>Est. Depart: <strong>{t.estimatedDepartureMins} mins</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <span className="card-title">Stage 2: Perimeter Boundary Terminals (Two-Ride Transfer Monitor)</span>
          <span className="stage-tag">Ungka &bull; Mohon &bull; Tagbak</span>
        </div>
        <div className="grid-3" style={{ marginBottom: 0 }}>
          {stage2Terminals.map((t) => (
            <div key={t._id} className="stat-box" style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{t.name}</strong>
                <span className={`badge badge-${t.queueLevel.toLowerCase()}`}>{t.queueLevel} Queue</span>
              </div>
              <p style={{ fontSize: '0.82rem', marginTop: '0.4rem' }}>
                Waiting Commuters: <strong>~{t.waitingPassengers} passengers</strong>
              </p>
              <p style={{ fontSize: '0.82rem' }}>
                Incoming City Loop Jeepneys (La Paz/WIT): <strong>{t.incomingCityLoops} units arriving</strong>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Stage 4: WIT Campus Arrival &amp; Geo-Verified Delay Pass</span>
          <span className="stage-tag">GPS + Corridor Cross-Check</span>
        </div>
        <form onSubmit={handleAttendanceCheckIn} className="grid-2" style={{ marginBottom: 0 }}>
          <div>
            <div className="grid-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label>Student ID</label>
                <input className="form-control" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-control" value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label>Perimeter Transfer Hub Used</label>
                <select className="form-control" value={perimeterUsed} onChange={(e) => setPerimeterUsed(e.target.value)}>
                  <option value="Ungka ITGSI Terminal">Ungka ITGSI Terminal</option>
                  <option value="Mohon Terminal (Arevalo)">Mohon Terminal (Arevalo)</option>
                  <option value="Tagbak Terminal (Jaro)">Tagbak Terminal (Jaro)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Minutes Late to Class (0 if On Time)</label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  className="form-control"
                  value={minutesLate}
                  onChange={(e) => setMinutesLate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-accent" onClick={handleGetLocation}>
                1. Verify WIT Campus GPS
              </button>
              <button type="submit" className="btn btn-primary">
                2. Log Arrival &amp; Check Delay Pass
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>
              Location Status: <strong>{gpsStatus}</strong>
            </p>
          </div>

          <div>
            {checkInResult ? (
              <div className="stat-box" style={{ textAlign: 'left', height: '100%' }}>
                <span className={`badge ${checkInResult.status === 'Verified Transit Delay' ? 'badge-verified' : checkInResult.status === 'On Time' ? 'badge-ontime' : 'badge-unexcused'}`}>
                  {checkInResult.status}
                </span>
                <h4 style={{ marginTop: '0.5rem' }}>{checkInResult.studentName} ({checkInResult.studentId})</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>
                  <strong>System Verdict:</strong> {checkInResult.verificationReason}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>
                  Route: {checkInResult.originMunicipality} &rarr; {checkInResult.perimeterUsed} &rarr; {checkInResult.corridorUsed}
                </p>
              </div>
            ) : (
              <div className="stat-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
                  Click <strong>Verify WIT Campus GPS</strong> and submit your arrival to automatically cross-check active bottlenecks, weather hazards, and terminal queues for your faculty class record.
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentView;