import React, { useState } from 'react';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', orgName: '', confirmPassword: '' });
    setError('');
  };

  const navigateByRole = (role: string) => {
    const normalized = normalizeRole(role.toLowerCase());
    switch (normalized) {
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

    const { email, password, orgName } = formData;

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
      navigateByRole(customUser.role);
      resetForm();
      return;
    }

    const trimmedOrg = orgName.trim().toLowerCase();
    const admin = getAdminByOrg(trimmedOrg);

    if (!admin) {
      setError('No admin account found for this organization. Please register first.');
      return;
    }

    if (admin.email !== email || admin.password !== password) {
      setError('Invalid email or password for this organization.');
      return;
    }

    login({
      token: btoa(admin.email + ':' + admin.password),
      user: { name: admin.name, username: admin.email, email: admin.email, companyId: admin.companyId },
      role: normalizeRole(admin.role),
    });
    navigate('/admin-dashboard');
    resetForm();
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

  const handleSubmit = (e: React.FormEvent) => {
    if (mode === 'signin') {
      handleSignIn(e);
    } else {
      handleRegister(e);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{mode === 'signin' ? 'Sign In' : 'Register Organization Admin'}</h2>
        <p className="auth-subtitle">
          {mode === 'signin'
            ? 'Sign in with your email and password'
            : 'Create a new organization admin account'}
        </p>

        <div className="auth-mode-toggle">
          <button
            type="button"
            className={`auth-mode-btn ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => { setMode('signin'); resetForm(); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-mode-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); resetForm(); }}
          >
            Register
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="auth-field">
              <input
                name="name"
                type="text"
                placeholder="Your Name"
                required={mode === 'register'}
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="auth-field">
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {mode === 'register' && (
            <div className="auth-field">
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                required={mode === 'register'}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          )}

          {mode === 'register' && (
            <div className="auth-field">
              <input
                name="orgName"
                type="text"
                placeholder="Organization Name"
                required
                value={formData.orgName}
                onChange={handleChange}
              />
            </div>
          )}

          {mode === 'admin-signin' && (
            <div className="auth-field">
              <input
                name="orgName"
                type="text"
                placeholder="Organization Name"
                required
                value={formData.orgName}
                onChange={handleChange}
              />
            </div>
          )}

          <button type="submit" className="auth-button">
            {mode === 'signin' ? 'Sign In' : 'Register Admin'}
          </button>
        </form>

        <button type="button" className="auth-back-button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Signin;
