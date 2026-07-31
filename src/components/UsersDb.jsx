import React from 'react';
import { useMarket } from '../context/MarketContext';
import { Database, ShieldAlert, Key, Mail, User } from 'lucide-react';

const UsersDb = () => {
  const { users } = useMarket();

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Registered Users Database</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Security Auditing Panel: View credential records of accounts created on the paper trading platform.
        </p>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <Database size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Credential Records</h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            Total Registrations: <strong>{users.length}</strong>
          </span>
        </div>

        {/* Info warning */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(245, 158, 11, 0.05)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          fontSize: '0.8rem',
          color: '#fbbf24'
        }}>
          <ShieldAlert size={18} />
          <span>Notice: This is a simulated learning dashboard. Passwords are saved client-side and displayed in plain text for demonstration and testing purposes.</span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700 }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Username</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Email Address</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Plain-Text Password</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr
                  key={idx}
                  className="glass-card-interactive"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    fontSize: '0.85rem',
                    transition: 'background var(--transition-fast)'
                  }}
                >
                  <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600, color: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={14} color="var(--accent)" />
                      {u.username}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={14} color="var(--text-muted)" />
                      {u.email}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Key size={14} color="var(--primary)" />
                      {u.password}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersDb;
