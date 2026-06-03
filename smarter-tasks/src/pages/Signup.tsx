import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, getUsers, saveUsers } from '../utils/authUtils';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'dev'
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
        <p className="auth-switch">
          Already have an account? <span onClick={() => navigate('/signin')}>Sign In</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
