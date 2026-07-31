import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { TrendingUp, User, Mail, Lock, Key, ShieldCheck } from 'lucide-react';

const Auth = () => {
  const { signInUser, signUpUser, continueAsGuest, users, triggerAlert } = useMarket();
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  
  // Inputs
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');

  // OTP Verification States
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpInputs, setOtpInputs] = useState(['', '', '', '']);
  const [pendingUser, setPendingUser] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const emailTrimmed = email.trim();
    const passwordTrimmed = password.trim();

    if (!emailTrimmed || !passwordTrimmed) {
      setError('Please fill in all fields.');
      return;
    }

    if (activeTab === 'signup') {
      const usernameTrimmed = username.trim();
      if (!usernameTrimmed) {
        setError('Please enter a username.');
        return;
      }
      
      // Verify if email already registered
      if (users.some(u => u.email.toLowerCase() === emailTrimmed.toLowerCase())) {
        setError('An account with this email already exists.');
        return;
      }

      // Generate a mock 4-digit registration OTP code
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setOtpCode(code);
      setOtpInputs(['', '', '', '']);
      setPendingUser({
        username: usernameTrimmed,
        email: emailTrimmed,
        password: passwordTrimmed
      });
      setIsVerifyingOtp(true);
      triggerAlert(`Email OTP Verification code: ${code}`, "info");

      // Send actual email via FormSubmit AJAX helper in background
      fetch(`https://formsubmit.co/ajax/${emailTrimmed}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: "TradeCraft Academy - Registration Verification Code",
          message: `Hello ${usernameTrimmed},\n\nYour 4-digit verification code to register at TradeCraft Academy is: ${code}\n\nEnter this code in the simulator to activate your trading account.\n\nHappy Trading!`,
          _captcha: "false"
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log("FormSubmit response:", data);
        triggerAlert("A verification code has been dispatched to your email address.", "success");
      })
      .catch(err => {
        console.warn("FormSubmit background dispatch failed:", err);
      });
    } else {
      signInUser(emailTrimmed, passwordTrimmed);
    }
  };

  const handleOtpInputChange = (value, idx) => {
    if (isNaN(value)) return;
    const newInputs = [...otpInputs];
    newInputs[idx] = value.substring(value.length - 1);
    setOtpInputs(newInputs);

    // Auto-focus next field
    if (value && idx < 3) {
      setTimeout(() => {
        const nextInput = document.getElementById(`reg-otp-${idx + 1}`);
        if (nextInput) nextInput.focus();
      }, 10);
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otpInputs[idx] && idx > 0) {
      setTimeout(() => {
        const prevInput = document.getElementById(`reg-otp-${idx - 1}`);
        if (prevInput) prevInput.focus();
      }, 10);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const enteredCode = otpInputs.join('');
    if (enteredCode === otpCode) {
      // Execute the signup
      signUpUser(pendingUser.username, pendingUser.email, pendingUser.password);
      setIsVerifyingOtp(false);
      setPendingUser(null);
    } else {
      triggerAlert("Invalid verification code. Please enter the correct email OTP.", "error");
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
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        
        {/* Verification Mode */}
        {isVerifyingOtp && pendingUser ? (
          <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                background: 'var(--primary-glow)',
                color: 'var(--primary)',
                padding: '0.75rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={28} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Verify Your Email</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                A 4-digit verification code has been sent to your email <strong style={{ color: '#fff' }}>{pendingUser.email}</strong>. Enter it below to activate your account.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Digit Inputs Row */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                {otpInputs.map((val, idx) => (
                  <input
                    key={idx}
                    id={`reg-otp-${idx}`}
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={val}
                    onChange={(e) => handleOtpInputChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    style={{
                      width: '46px',
                      height: '46px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#fff',
                      outline: 'none'
                    }}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {/* Helper badge with code */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '0.45rem',
                fontSize: '0.7rem',
                color: 'var(--text-muted)'
              }}>
                OTP sent via email simulator: <strong style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>{otpCode}</strong>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => { setIsVerifyingOtp(false); setPendingUser(null); }}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '0.65rem',
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Verify & Register
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
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
                {activeTab === 'signin' ? 'Sign In to Trade' : 'Verify Email & Register'}
              </button>
            </form>

            {/* Guest Entry Control */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Don't want an account? Explore trading anonymously:
              </div>
              <button
                onClick={continueAsGuest}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  color: 'var(--accent)',
                  borderRadius: '8px',
                  padding: '0.6rem',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                Continue as Guest
              </button>
            </div>

            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
              {activeTab === 'signin' ? (
                <p>Demo admin account: <strong>admin@tradecraft.com</strong> (adminpass)</p>
              ) : (
                <p>Sign up creates a profile to persist your paper trading statistics.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
