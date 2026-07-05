import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Lock, Mail, User, Loader } from 'lucide-react';
import api from '../services/api';

const Login = ({ onAuthSuccess, addToast }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateForm = () => {
    // Basic validations
    if (!email || !password) {
      addToast('Please enter all required fields', 'danger');
      return false;
    }

    if (!isLogin) {
      if (!username) {
        addToast('Username is required', 'danger');
        return false;
      }
      if (username.length < 3) {
        addToast('Username must be at least 3 characters', 'danger');
        return false;
      }
      if (password.length < 6) {
        addToast('Password must be at least 6 characters', 'danger');
        return false;
      }
      if (password !== confirmPassword) {
        addToast('Passwords do not match', 'danger');
        return false;
      }
    }

    // Email regex check
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      addToast('Please enter a valid email address', 'danger');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let data;
      if (isLogin) {
        data = await api.auth.login({ email, password });
        addToast(`Welcome back, ${data.username}!`, 'success');
      } else {
        data = await api.auth.register({ username, email, password });
        addToast('Account created successfully!', 'success');
      }

      // Save token and invoke success callback
      localStorage.setItem('token', data.token);
      onAuthSuccess(data);
      navigate('/');
    } catch (error) {
      addToast(error.message || 'Authentication failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', color: 'var(--accent)', marginBottom: '12px' }}>
            <Share2 size={32} />
          </div>
          <h1 className="auth-title">
            {isLogin ? 'Sign In to SocialSphere' : 'Join SocialSphere'}
          </h1>
          <p className="auth-subtitle">
            {isLogin ? 'Connect with friends and share your world' : 'Create an account to start sharing today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input
                  id="username"
                  type="text"
                  placeholder="john_doe"
                  className="form-control"
                  style={{ paddingLeft: '44px', width: '100%' }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                id="email"
                type="email"
                placeholder="example@mail.com"
                className="form-control"
                style={{ paddingLeft: '44px', width: '100%' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="form-control"
                style={{ paddingLeft: '44px', width: '100%' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="form-control"
                  style={{ paddingLeft: '44px', width: '100%' }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px', height: '48px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={18} /> Authenticating...
              </>
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <span>
              Don't have an account?{' '}
              <span className="auth-toggle-link" onClick={() => setIsLogin(false)}>
                Sign Up
              </span>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <span className="auth-toggle-link" onClick={() => setIsLogin(true)}>
                Sign In
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
