import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/app/dashboard', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not log in.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="brand"><span style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#3654F4,#6c7bff)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>S</span> SyncSpace</div>
        <div className="quote">
          <h2>"Our standups got shorter because the board already tells us what changed."</h2>
          <p>Product team, using SyncSpace daily</p>
        </div>
      </div>
      <div className="auth-form-col">
        <div className="auth-form-box">
          <h1>Welcome back</h1>
          <p className="sub">Log in to get back to your workspaces.</p>
          <form onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>
          <div className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
