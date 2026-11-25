import React, { useState } from 'react';

const FacultyView = ({ logs = [], incidents = [] }) => {
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredLogs =
    filterStatus === 'All' ? logs : logs.filter((log) => log.status === filterStatus);

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span className="card-title">WIT Faculty Smart Attendance &amp; Geo-Verified Delay Log</span>
            <span className="stage-tag" style={{ marginLeft: '0.6rem' }}>
              Automated Excuse Verification
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Filter Verdict:</label>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Records ({logs.length})</option>
              <option value="Verified Transit Delay">Verified Transit Delay</option>
              <option value="On Time">On Time</option>
              <option value="Unexcused Tardiness">Unexcused Tardiness</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student ID &amp; Name</th>
                <th>Route Taken</th>
                <th>Class Time</th>
                <th>Delay</th>
                <th>Attendance Verdict</th>
                <th>System Verification Audit</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#64748b' }}>
                    No attendance logs found for this filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <strong>{log.studentName}</strong>
                      <br />
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{log.studentId}</span>
                    </td>
                    <td>
                      {log.originMunicipality} &rarr; {log.perimeterUsed}
                      <br />
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{log.corridorUsed}</span>
                    </td>
                    <td>{log.scheduledClassTime}</td>
                    <td>{log.minutesLate > 0 ? `${log.minutesLate} mins` : '0 mins'}</td>
                    <td>
                      <span
                        className={`badge ${
                          log.status === 'On Time'
                            ? 'badge-ontime'
                            : log.status === 'Verified Transit Delay'
                            ? 'badge-verified'
                            : 'badge-unexcused'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', maxWidth: '320px' }}>
                      {log.verificationReason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Active Corridor Disruption Feed (Used for Cross-Verification)</span>
          <span className="stage-tag">Live Feed</span>
        </div>
        {incidents.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            No active corridor disruptions reported.
          </p>
        ) : (
          <div className="grid-3" style={{ marginBottom: 0 }}>
            {incidents.map((inc) => (
              <div key={inc._id} className="stat-box" style={{ textAlign: 'left' }}>
                <span className="badge badge-critical">{inc.reportType}</span>
                <h4 style={{ marginTop: '0.4rem' }}>{inc.corridor}</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Reported by: {inc.reportedBy}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyView;