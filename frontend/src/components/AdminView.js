import React from 'react';

const AdminView = ({ logs = [], terminals = [], incidents = [] }) => {
  const totalRecords = logs.length;
  const verifiedDelays = logs.filter((l) => l.status === 'Verified Transit Delay').length;
  const unexcusedDelays = logs.filter((l) => l.status === 'Unexcused Tardiness').length;
  const avgDelayMins =
    logs.reduce((acc, item) => acc + (item.minutesLate || 0), 0) / (totalRecords || 1);

  const municipalities = ['Pavia', 'Oton', 'San Miguel', 'Sta. Barbara', 'Leganes'];

  const municipalityStats = municipalities.map((muni) => {
    const muniLogs = logs.filter((l) => l.originMunicipality === muni);
    const delayed = muniLogs.filter((l) => l.minutesLate > 0).length;
    const rate = muniLogs.length > 0 ? Math.round((delayed / muniLogs.length) * 100) : 0;
    return { muni, count: muniLogs.length, delayed, rate };
  });

  return (
    <div>
      <div className="grid-3">
        <div className="stat-box">
          <div className="stat-value">{verifiedDelays}</div>
          <div className="stat-label">Verified Transit Delays</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{unexcusedDelays}</div>
          <div className="stat-label">Unexcused Tardiness</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{Math.round(avgDelayMins)} mins</div>
          <div className="stat-label">Average Commute Delay</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Delay Rate by Origin Municipality</span>
            <span className="stage-tag">Research Analytics</span>
          </div>
          {municipalityStats.map((stat) => (
            <div key={stat.muni} style={{ marginBottom: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <strong>{stat.muni}</strong>
                <span>
                  {stat.delayed}/{stat.count} commuters delayed ({stat.rate}%)
                </span>
              </div>
              <div className="seat-bar-bg">
                <div
                  className="seat-bar-fill"
                  style={{
                    width: `${stat.rate}%`,
                    backgroundColor: stat.rate > 50 ? '#b91c1c' : '#1c457a'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Perimeter Terminal Bottleneck Index</span>
            <span className="stage-tag">Stage 2 Hubs</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Perimeter Hub</th>
                  <th>Queue Status</th>
                  <th>Waiting Pax</th>
                  <th>City Loops</th>
                </tr>
              </thead>
              <tbody>
                {terminals
                  .filter((t) => t.stage === 2)
                  .map((t) => (
                    <tr key={t._id}>
                      <td>
                        <strong>{t.name}</strong>
                      </td>
                      <td>
                        <span className={`badge badge-${(t.queueLevel || 'low').toLowerCase()}`}>
                          {t.queueLevel}
                        </span>
                      </td>
                      <td>{t.waitingPassengers}</td>
                      <td>{t.incomingCityLoops}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.8rem' }}>
            Active Crowdsourced Corridor Alerts: <strong>{incidents.length}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminView;