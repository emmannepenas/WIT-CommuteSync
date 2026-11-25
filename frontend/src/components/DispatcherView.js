import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const DispatcherView = ({ terminals = [] }) => {
  const [selectedId, setSelectedId] = useState('');
  const [occupiedSeats, setOccupiedSeats] = useState(0);
  const [estimatedDepartureMins, setEstimatedDepartureMins] = useState(10);
  const [queueLevel, setQueueLevel] = useState('Moderate');
  const [waitingPassengers, setWaitingPassengers] = useState(20);
  const [incomingCityLoops, setIncomingCityLoops] = useState(2);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    if (terminals.length > 0 && !selectedId) {
      const first = terminals[0];
      setSelectedId(first._id);
      setOccupiedSeats(first.occupiedSeats || 0);
      setEstimatedDepartureMins(first.estimatedDepartureMins || 10);
      setQueueLevel(first.queueLevel || 'Moderate');
      setWaitingPassengers(first.waitingPassengers || 20);
      setIncomingCityLoops(first.incomingCityLoops || 2);
    }
  }, [terminals, selectedId]);

  const activeTerminal = terminals.find((t) => t._id === selectedId) || terminals[0];

  const handleSelectTerminal = (id) => {
    setSelectedId(id);
    const found = terminals.find((t) => t._id === id);
    if (found) {
      setOccupiedSeats(found.occupiedSeats || 0);
      setEstimatedDepartureMins(found.estimatedDepartureMins || 10);
      setQueueLevel(found.queueLevel || 'Moderate');
      setWaitingPassengers(found.waitingPassengers || 20);
      setIncomingCityLoops(found.incomingCityLoops || 2);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!activeTerminal) return;
    try {
      await axios.put(`${API_URL}/terminals/${activeTerminal._id}`, {
        occupiedSeats: Number(occupiedSeats),
        estimatedDepartureMins: Number(estimatedDepartureMins),
        queueLevel,
        waitingPassengers: Number(waitingPassengers),
        incomingCityLoops: Number(incomingCityLoops)
      });
      setSavedMsg(`Broadcasted live update for ${activeTerminal.name}!`);
      setTimeout(() => setSavedMsg(''), 3500);
    } catch (err) {
      alert('Failed to update terminal. Make sure the backend server is running.');
    }
  };

  if (terminals.length === 0) {
    return (
      <div className="card">
        <p style={{ color: '#64748b' }}>
          No terminal data loaded yet. Ensure the backend server is running and seeded (`node seed.js`).
        </p>
      </div>
    );
  }

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Dispatcher Live Control Panel</span>
          <span className="stage-tag">Socket.io Real-Time</span>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Select Assigned Terminal (Stage 1 or Stage 2)</label>
            <select
              className="form-control"
              value={activeTerminal?._id || ''}
              onChange={(e) => handleSelectTerminal(e.target.value)}
            >
              {terminals.map((t) => (
                <option key={t._id} value={t._id}>
                  [Stage {t.stage}] {t.name} ({t.municipality})
                </option>
              ))}
            </select>
          </div>

          {activeTerminal?.stage === 1 ? (
            <>
              <div className="form-group">
                <label>Occupied Seats (Max: {activeTerminal.totalSeats})</label>
                <input
                  type="number"
                  min="0"
                  max={activeTerminal.totalSeats}
                  className="form-control"
                  value={occupiedSeats}
                  onChange={(e) => setOccupiedSeats(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Estimated Departure Time (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  className="form-control"
                  value={estimatedDepartureMins}
                  onChange={(e) => setEstimatedDepartureMins(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Perimeter Queue Bottleneck Level</label>
                <select
                  className="form-control"
                  value={queueLevel}
                  onChange={(e) => setQueueLevel(e.target.value)}
                >
                  <option value="Low">Low (Fast Boarding)</option>
                  <option value="Moderate">Moderate (10-15 min wait)</option>
                  <option value="Heavy">Heavy (20-30 min wait)</option>
                  <option value="Critical">Critical (Severe Bottleneck)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estimated Waiting Passengers in Line</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={waitingPassengers}
                  onChange={(e) => setWaitingPassengers(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Incoming City Loop Jeepneys (to La Paz / WIT)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={incomingCityLoops}
                  onChange={(e) => setIncomingCityLoops(e.target.value)}
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Publish Live Terminal Status to Students
          </button>
          {savedMsg && (
            <p style={{ color: '#15803d', fontWeight: 700, marginTop: '0.6rem' }}>{savedMsg}</p>
          )}
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Terminals Live Status Board</span>
          <span className="stage-tag">Synced</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Terminal</th>
                <th>Stage</th>
                <th>Live Metric</th>
              </tr>
            </thead>
            <tbody>
              {terminals.map((t) => (
                <tr key={t._id}>
                  <td>
                    <strong>{t.name}</strong>
                  </td>
                  <td>Stage {t.stage}</td>
                  <td>
                    {t.stage === 1
                      ? `${t.occupiedSeats}/${t.totalSeats} seats (${t.estimatedDepartureMins}m)`
                      : `${t.queueLevel} (${t.waitingPassengers} pax)`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DispatcherView;