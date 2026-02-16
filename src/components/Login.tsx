import React, { useState } from 'react';
import AuthService from '../services/AuthService';
import type { AuthResponse } from '../types';
import '../Login.css';

interface LoginProps {
  onLoginSuccess: (userData: AuthResponse) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await AuthService.register(username, password, email, role);
        setIsRegister(false);
        setError('Registration successful! Please login.');
        setPassword('');
        setEmail('');
        setRole('USER');
      } else {
        const response = await AuthService.login(username, password);
        onLoginSuccess(response);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isRegister ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter username"
              className="form-input"
            />
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label>EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter email"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>ROLE</label>
                <div className="role-selector">
                  <div 
                    className={`role-option ${role === 'USER' ? 'selected' : ''}`}
                    onClick={() => setRole('USER')}
                  >
                    <div className="role-radio">
                      {role === 'USER' && <div className="role-radio-dot"></div>}
                    </div>
                    <div className="role-content">
                      <div className="role-title">User</div>
                      <div className="role-description">Limited access</div>
                    </div>
                  </div>
                  
                  <div 
                    className={`role-option ${role === 'ADMIN' ? 'selected' : ''}`}
                    onClick={() => setRole('ADMIN')}
                  >
                    <div className="role-radio">
                      {role === 'ADMIN' && <div className="role-radio-dot"></div>}
                    </div>
                    <div className="role-content">
                      <div className="role-title">Admin</div>
                      <div className="role-description">Full access to monitoring</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
              className="form-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'PROCESSING...' : isRegister ? 'REGISTER' : 'LOGIN'}
          </button>
        </form>

        <div className="toggle-auth">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setRole('USER');
            }}
            className="btn-link"
          >
            {isRegister
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
