import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { validateInvitation, registerUser, getUsers, saveUsers } from '../utils/authUtils';
import { UserRole } from '../config/constants';

const ALLOWED_SETUP_ROLES: readonly UserRole[] = ['dev', 'projectManager'];

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token') ?? '';
  const invitationFromToken = useMemo(() => {
    if (!initialToken) return null;
    return validateInvitation(initialToken);
  }, [initialToken]);

  const [formData, setFormData] = useState({
    name: invitationFromToken?.name ?? '',
    email: invitationFromToken?.email ?? '',
    password: invitationFromToken ? '' : '________',
    role: invitationFromToken?.role ?? 'dev',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const previousUsers = getUsers();

    try {
      registerUser(formData);
      alert('Account created successfully! Please Sign In.');
      navigate('/signin');
    } catch (err) {
      saveUsers(previousUsers);
      setError((err as Error).message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join Smarter Tasks to manage your workflow</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <input name="name" type="text" placeholder="Full Name" required onChange={handleChange} />
          </div>
          <div className="auth-field">
            <input name="email" type="email" placeholder="Email Address" required onChange={handleChange} />
          </div>
          <div className="auth-field">
            <input name="password" type="password" placeholder="Password" required onChange={handleChange} />
          </div>
          <div className="auth-field">
            <label htmlFor="role">Role</label>
            <select name="role" id="role" value={formData.role} onChange={handleChange}>
              <option value="dev">Developer</option>
              <option value="projectManager">Project Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="auth-button">Sign Up</button>
        </form>
        <button type="button" className="auth-back-button" onClick={() => navigate('/')}>Back to Home</button>
        <p className="auth-switch">
          Already have an account? <span onClick={() => navigate('/signin')}>Sign In</span>
        </p>

      </div>
    </div>
  );
};

export default Signup;
