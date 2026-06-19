import React, { useState, useEffect } from 'react';
import './Signin.css';
import { useNavigate } from 'react-router-dom';
import { getUsers, getAdminByOrg, registerAdmin } from '../utils/authUtils';
import { useAuth } from '../context/auth';
import { UserRole, normalizeRole } from '../config/constants';

const roleToRoute: Record<string, string> = {
  [UserRole.ADMIN]: '/admin-dashboard',
  [UserRole.PROJECT_MANAGER]: '/pm-dashboard',
  [UserRole.DEV]: '/dev-dashboard',
};

type SignInMode = 'signin' | 'register';

type FormData = {
  name: string;
  email: string;
  password: string;
  orgName: string;
  confirmPassword: string;
};

const Signin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<SignInMode>('signin');
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '', orgName: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', orgName: '', confirmPassword: '' });
    setError('');
  };

  const navigateByRole = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        navigate('/admin-dashboard');
        break;
      case UserRole.PROJECT_MANAGER:
        navigate('/pm-dashboard');
        break;
      case UserRole.DEV:
        navigate('/dev-dashboard');
        break;
      default:
        navigate('/dev-dashboard');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { email, password } = formData;

    // NOTE : two admin accounts are hard-coded for "company1" and "company2" with the password "admin123" for testing
    // and demo purposes. These shortcuts allow signing in as an admin without
    // a backend authentication flow.
    //
    // - Admin emails: admin@company1.com and admin@company2.com
    // - Shared password: "admin123"
    //
    // When a user submits one of the above emails with the password
    // 'admin123', the app simulates an admin login by creating a token and a
    // user payload (name, username, email, companyId) and navigates to the
    // admin dashboard. This is intended only for demonstration or interview
    // scenarios — remove or replace with real authentication in production.
    const companyAdmin = (['company1', 'company2'] as const).find(
      (id) => email.toLowerCase() === `admin@${id}.com`
    );

    if (companyAdmin) {
      if (password !== 'admin123') {
        setError('Invalid credentials for this organization.');
        return;
      }
      const credentials = {
        company1: { name: 'Company 1 Admin', companyId: 'company1' },
        company2: { name: 'Company 2 Admin', companyId: 'company2' },
      }[companyAdmin];

      login({
        token: btoa(email + ':' + password),
        user: { name: credentials.name, username: email, email, companyId: credentials.companyId },
        role: UserRole.ADMIN,
      });
      navigate('/admin-dashboard');
      resetForm();
      return;
    }

    const customUser = getUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.passwordSet
    );
    if (customUser) {
      if (!customUser.companyId) {
        setError('No organization associated with this account.');
        return;
      }
      login({
        token: btoa(customUser.email + ':' + customUser.password),
        user: { name: customUser.name, username: customUser.email, email: customUser.email, companyId: customUser.companyId },
        role: normalizeRole(customUser.role),
      });
      navigateByRole(normalizeRole(customUser.role));
      resetForm();
      return;
    }

    setError('Invalid email or password.');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { name, email, password, orgName, confirmPassword } = formData;

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!orgName.trim()) {
      setError('Please enter an organization name.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const newAdmin = registerAdmin(name.trim(), email.trim(), password, orgName.trim());
      login({
        token: btoa(newAdmin.email + ':' + newAdmin.password),
        user: { name: newAdmin.name, username: newAdmin.email, email: newAdmin.email, companyId: newAdmin.companyId },
        role: normalizeRole(newAdmin.role),
      });
      navigate('/admin-dashboard');
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (mode === 'signin') {
      handleSignIn(e);
    } else {
      handleRegister(e);
    }
    setLoading(false);
  };

  const switchMode = (newMode: SignInMode) => {
    setMode(newMode);
    resetForm();
  };

  const fieldErrors: Record<string, string | undefined> = {};
  if (error) {
    if (/email/i.test(error)) fieldErrors.email = error;
    if (/password/i.test(error)) fieldErrors.password = error;
  }

  return (
    <div className="auth-page">
      <div
        className="auth-card"
      >
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="32" height="32" rx="10" fill="url(#logo-g)" />
              <path d="M10 18L15 23L26 12" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="logo-g" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 className="auth-title">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'signin'
              ? 'Sign in to your workspace'
              : 'Start your journey with us'}
          </p>
        </div>

        <div className="auth-mode-toggle">
          <button
            type="button"
            className={`auth-mode-btn ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => switchMode('signin')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className={`auth-mode-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a2 2 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <span>Register</span>
          </button>
        </div>

        <div className="auth-error-wrapper">
          {error && (
            <div className="auth-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className={`auth-field ${mode === 'register' ? 'auth-field--open' : ''}`}>
            <input
              name="name"
              type="text"
              placeholder=" "
              required={mode === 'register'}
              value={formData.name}
              onChange={handleChange}
              className={fieldErrors.name ? 'input-error' : ''}
              autoComplete="name"
            />
            <label className="auth-field__label">Your Name</label>
            <div className="auth-field__border" />
            {fieldErrors.name && <span className="auth-field__err">{fieldErrors.name}</span>}
          </div>

          <div className="auth-field">
            <input
              name="email"
              type="email"
              placeholder=" "
              required
              value={formData.email}
              onChange={handleChange}
              className={fieldErrors.email ? 'input-error' : ''}
              autoComplete="email"
            />
            <label className="auth-field__label">Email Address</label>
            <div className="auth-field__border" />
            {fieldErrors.email && <span className="auth-field__err">{fieldErrors.email}</span>}
          </div>

          <div className="auth-field">
            <input
              name="password"
              type="password"
              placeholder=" "
              required
              value={formData.password}
              onChange={handleChange}
              className={fieldErrors.password ? 'input-error' : ''}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
            <label className="auth-field__label">Password</label>
            <div className="auth-field__border" />
            {fieldErrors.password && <span className="auth-field__err">{fieldErrors.password}</span>}
          </div>

          {mode === 'register' && (
            <>
              <div className={`auth-field ${mode === 'register' ? 'auth-field--open' : ''}`}>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder=" "
                  required={mode === 'register'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <label className="auth-field__label">Confirm Password</label>
                <div className="auth-field__border" />
              </div>

              <div className={`auth-field ${mode === 'register' ? 'auth-field--open' : ''}`}>
                <input
                  name="orgName"
                  type="text"
                  placeholder=" "
                  required
                  value={formData.orgName}
                  onChange={handleChange}
                  autoComplete="organization"
                />
                <label className="auth-field__label">Organization Name</label>
                <div className="auth-field__border" />
              </div>
            </>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading && (
              <span className="auth-button__spinner" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="40 20" strokeLinecap="round" />
                </svg>
              </span>
            )}
            <span className="auth-button__text">{mode === 'signin' ? 'Sign In' : 'Register Admin'}</span>
          </button>
        </form>

        <div className="auth-footer">
          <button type="button" className="auth-back-button" onClick={() => navigate('/')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signin;
