import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser } from '../utils/authUtils';
import { useAuth } from '../context/auth';
import { UserRole, normalizeRole } from '../config/constants';

const roleToRoute: Record<string, string> = {
  [UserRole.ADMIN]: '/admin-dashboard',
  [UserRole.PROJECT_MANAGER]: '/pm-dashboard',
  [UserRole.DEV]: '/dev-dashboard',
};

const Signin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const user = authenticateUser(formData.email, formData.password);
      const normalizedRole = normalizeRole(user.role);

      login({
        token: btoa(user.email + ":" + user.password),
        user: { name: user.name, username: user.email },
        role: normalizedRole,
      });

      const dashboardRoute = roleToRoute[normalizedRole] || '/dev-dashboard';
      navigate(dashboardRoute);
    } catch (err) {
      setError((err as Error).message || "Login failed.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue to Smarter Tasks</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-field">
            <input name="email" type="email" placeholder="Email Address" required value={formData.email} onChange={handleChange} />
          </div>
          <div className="auth-field">
            <input name="password" type="password" placeholder="Password" required value={formData.password} onChange={handleChange} />
          </div>
          <button type="submit" className="auth-button">Sign In</button>
        </form>
        <p className="auth-switch">
          Need an account? <span onClick={() => navigate('/signup')}>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default Signin;
