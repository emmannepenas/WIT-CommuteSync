import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const WIT_POSITION = [10.7136, 122.5681];

const RouteMap = ({ terminals = [], incidents = [] }) => {
  const ungkaToWit = [
    [10.7538, 122.5482],
    [10.7289, 122.5512],
    [10.7245, 122.5610],
    WIT_POSITION
  ];

  const mohonToWit = [
    [10.6889, 122.5085],
    [10.6965, 122.5450],
    WIT_POSITION
  ];

  const tagbakToWit = [
    [10.7589, 122.5852],
    [10.7245, 122.5610],
    WIT_POSITION
  ];

  return (
    <div className="map-container">
      <MapContainer center={[10.735, 122.545]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={WIT_POSITION}>
          <Popup>
            <strong>Western Institute of Technology (WIT)</strong>
            <br />
            Destination Campus (La Paz, Iloilo City)
          </Popup>
        </Marker>

        <Polyline positions={ungkaToWit} color="#1d4ed8" weight={4} opacity={0.7} />
        <Polyline positions={mohonToWit} color="#047857" weight={4} opacity={0.7} />
        <Polyline positions={tagbakToWit} color="#b45309" weight={4} opacity={0.7} />

        {terminals.map((t) => (
          <Marker key={t._id || t.name} position={[t.coordinates.lat, t.coordinates.lng]}>
            <Popup>
              <strong>{t.name}</strong> (Stage {t.stage})
              <br />
              {t.stage === 1
                ? `Seats: ${t.occupiedSeats}/${t.totalSeats} | Est. Depart: ${t.estimatedDepartureMins} mins`
                : `Queue: ${t.queueLevel} (${t.waitingPassengers} waiting)`}
            </Popup>
          </Marker>
        ))}

        {incidents.map((inc) =>
          inc.coordinates ? (
            <Marker key={inc._id || inc.corridor} position={[inc.coordinates.lat, inc.coordinates.lng]}>
              <Popup>
                <strong style={{ color: '#b91c1c' }}>ALERT: {inc.reportType}</strong>
                <br />
                Corridor: {inc.corridor}
                <br />
                Reported by: {inc.reportedBy}
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
};

export default RouteMap;