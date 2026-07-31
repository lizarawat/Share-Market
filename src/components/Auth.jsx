import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { TrendingUp, User, Mail, Lock } from 'lucide-react';

const Auth = () => {
  const { signInUser, signUpUser } = useMarket();
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  
  // Inputs
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (activeTab === 'signup') {
      if (!username.trim()) {
        setError('Please enter a username.');
        return;
      }
      signUpUser(username, email, password);
    } else {
      signInUser(email, password);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, rgba(99, 102, 241, 0.15), var(--bg-dark) 60%)',
      padding: '1.5rem',
      width: '100%'
    }}>
      <div className="glass-card fade-in-up" style={{
        maxWidth: '400px',
        width: '100%',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            padding: '0.65rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>
            <TrendingUp size={28} color="#fff" />
          </div>
          <h1 className="brand-font" style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.25rem' }}>TradeCraft</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Master the stock market using real-time paper trading simulations.</p>
        </div>

        {/* Tab switchers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(255,255,255,0.03)',
          padding: '0.2rem',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          <button
            onClick={() => { setActiveTab('signin'); setError(''); }}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'signin' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'signin' ? '#fff' : 'var(--text-secondary)',
              transition: 'background var(--transition-fast)'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setError(''); }}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'signup' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'signup' ? '#fff' : 'var(--text-secondary)',
              transition: 'background var(--transition-fast)'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'var(--danger-glow)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            color: 'var(--danger)',
            borderRadius: '6px',
            padding: '0.5rem 0.75rem',
            fontSize: '0.75rem',
            textAlign: 'center',
            fontWeight: 600
          }}>
            {error}
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {activeTab === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <User size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Create username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '0.55rem 0.55rem 0.55rem 1.85rem',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={14} />
              </span>
              <input
                type="email"
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.55rem 0.55rem 0.55rem 1.85rem',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={14} />
              </span>
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.55rem 0.55rem 0.55rem 1.85rem',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.65rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              marginTop: '0.5rem',
              transition: 'opacity var(--transition-fast)'
            }}
          >
            {activeTab === 'signin' ? 'Sign In to Trade' : 'Register Account'}
          </button>
        </form>

        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
          {activeTab === 'signin' ? (
            <p>Demo admin account: <strong>admin@tradecraft.com</strong> (adminpass)</p>
          ) : (
            <p>Registering will automatically log you in to the trading room.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
