import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { validateInvitation, completeInvitation, getUsers } from '../utils/authUtils';
import { useAuth } from '../context/auth';

const SetPassword = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { token } = useParams<{ token: string }>();
  const [invitation, setInvitation] = useState<{ email: string; name: string; role: string } | null>(null);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (token) {
      const invitation = validateInvitation(token);
      if (invitation) {
        setInvitation(invitation);
      } else {
        setError('Invalid or expired invitation link.');
      }
    } else {
      setError('No invitation token provided.');
    }
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!token || !invitation) return;

    try {
      completeInvitation(token, password);
      
      const users = getUsers();
      const user = users.find((u) => u.email === invitation.email);
      if (user) {
        const updatedUser = { ...user, password, passwordSet: true };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        login({
          token: btoa(invitation.email + ":" + password),
          user: { name: invitation.name, username: invitation.email, email: invitation.email },
          role: invitation.role as any,
        });
      }
      
      alert('Password set successfully! Welcome to Smarter Tasks.');
      navigate('/');
    } catch (err) {
      setError((err as Error).message || 'Failed to set password.');
    }
  };

  if (!invitation && !error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <p>Loading invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {error ? (
          <>
            <h2 className="auth-title">Error</h2>
            <p className="auth-error">{error}</p>
            <button className="auth-back-button" onClick={() => navigate('/signin')}>Back to Sign In</button>
          </>
        ) : (
          <>
            <h2 className="auth-title">Set Your Password</h2>
            <p className="auth-subtitle">
              Welcome {invitation?.name}! Set your password to access your {invitation?.role} account.
            </p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={invitation?.email || ''} 
                  disabled 
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </div>
              <div className="auth-field">
                <input 
                  type="password" 
                  placeholder="New Password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
              <div className="auth-field">
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  required 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
              </div>
              <button type="submit" className="auth-button">Set Password & Continue</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SetPassword;