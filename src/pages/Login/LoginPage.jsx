import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HiLockClosed, HiEye, HiEyeOff, HiMail } from 'react-icons/hi';
import './LoginPage.css';

export default function LoginPage() {
  const { login, signup } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setError('');
    setMessage('');
    setIsLoading(true);

    if (isLoginMode) {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Incorrect email or password');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    } else {
      const res = await signup(email, password);
      if (!res.success) {
        setError(res.error || 'Failed to create account');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      } else {
        setMessage('Account created! Please verify your email if required, or you will be logged in automatically.');
        setTimeout(() => setIsLoginMode(true), 3000);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb orb-1" />
      <div className="login-bg-orb orb-2" />
      <div className="login-bg-orb orb-3" />

      <div className={`login-card glass-card in-view ${isShaking ? 'shake' : ''}`}>
        <div className="login-logo">
          <div className="login-logo-icon">✦</div>
          <h1>Dashboard</h1>
          <p className="text-muted">{isLoginMode ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-wrapper">
            <HiMail className="login-input-icon" />
            <input
              type="email"
              className="login-input"
              placeholder="Email address"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              autoFocus
            />
          </div>

          <div className="login-input-wrapper" style={{ marginTop: 'var(--space-md)' }}>
            <HiLockClosed className="login-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              className="login-input"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
            />
            <button
              type="button"
              className="login-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <HiEyeOff /> : <HiEye />}
            </button>
          </div>

          {error && <p className="login-error" style={{ color: 'var(--accent-red)', marginTop: 'var(--space-sm)' }}>{error}</p>}
          {message && <p className="login-msg" style={{ color: 'var(--accent-green)', marginTop: 'var(--space-sm)' }}>{message}</p>}

          <button type="submit" className="btn btn-primary btn-lg w-full" style={{ marginTop: 'var(--space-md)' }} disabled={isLoading}>
            {isLoading ? 'Processing...' : isLoginMode ? 'Unlock Dashboard' : 'Create Account'}
          </button>
        </form>

        <p className="login-hint" style={{ marginTop: 'var(--space-md)', textAlign: 'center' }}>
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            className="btn btn-ghost btn-sm" 
            onClick={() => { setIsLoginMode(!isLoginMode); setError(''); setMessage(''); }}
          >
            {isLoginMode ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
