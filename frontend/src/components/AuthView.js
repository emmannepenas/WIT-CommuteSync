import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const AuthView = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [studentId, setStudentId] = useState('');
  const [originMunicipality, setOriginMunicipality] = useState('Pavia');
  const [perimeterUsed, setPerimeterUsed] = useState('Ungka ITGSI Terminal');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        mode === 'login'
          ? { email, password }
          : {
              fullName,
              email,
              password,
              role,
              studentId,
              originMunicipality,
              perimeterUsed
            };

      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      localStorage.setItem('wit_token', res.data.token);
      localStorage.setItem('wit_user', JSON.stringify(res.data.user));
      onAuthSuccess(res.data.user);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Authentication failed. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '1rem auto' }}>
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            {mode === 'login' ? 'Sign In to WIT-CommuteSync' : 'Register a WIT-CommuteSync Account'}
          </span>
          <span className="stage-tag">MongoDB Auth</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : 'btn-accent'}`}
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'register' ? 'btn-primary' : 'btn-accent'}`}
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Juan Dela Cruz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label>Account Role</label>
                  <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="student">Student Commuter</option>
                    <option value="dispatcher">Terminal Dispatcher</option>
                    <option value="faculty">WIT Faculty</option>
                    <option value="admin">Admin / Researcher</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Student / Staff ID (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., 2024-0512"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label>Origin Municipality</label>
                  <select
                    className="form-control"
                    value={originMunicipality}
                    onChange={(e) => setOriginMunicipality(e.target.value)}
                  >
                    <option value="Pavia">Pavia</option>
                    <option value="Oton">Oton</option>
                    <option value="San Miguel">San Miguel</option>
                    <option value="Sta. Barbara">Sta. Barbara</option>
                    <option value="Leganes">Leganes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Perimeter Transfer Hub</label>
                  <select
                    className="form-control"
                    value={perimeterUsed}
                    onChange={(e) => setPerimeterUsed(e.target.value)}
                  >
                    <option value="Ungka ITGSI Terminal">Ungka ITGSI Terminal</option>
                    <option value="Mohon Terminal (Arevalo)">Mohon Terminal (Arevalo)</option>
                    <option value="Tagbak Terminal (Jaro)">Tagbak Terminal (Jaro)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="name@wit.edu.ph"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        <div className="alert-box" style={{ marginTop: '1rem', marginBottom: 0 }}>
          <strong>Demo Accounts (after running `node seed.js`):</strong>
          <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
            Student: <code>student@wit.edu.ph</code> &bull; Dispatcher: <code>dispatcher@wit.edu.ph</code> &bull; Faculty: <code>faculty@wit.edu.ph</code> &bull; Admin: <code>admin@wit.edu.ph</code>
            <br />
            Password for all demo accounts: <code>witpass123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthView;