import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Topbar = ({ title, subtitle }) => {
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const navigate = useNavigate();


  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null);

  // Profile Dropdown
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    const handleClickOutside = (e) => {

      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    fetchNotifications();
    
    const handleUserUpdated = () => setUser(JSON.parse(localStorage.getItem('user')) || null);
    window.addEventListener('userUpdated', handleUserUpdated);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('userUpdated', handleUserUpdated);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://fdcuic-backend-production.up.railway.app/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Erreur notifications', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.lu).length;

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://fdcuic-backend-production.up.railway.app/api/notifications/${id}/lu`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, lu: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('https://fdcuic-backend-production.up.railway.app/api/notifications/tout-lire', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, lu: true })));
    } catch (err) {
      console.error(err);
    }
  };



  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const initials = user ? `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase() : 'FA';
  const userName = user ? `${user.prenom} ${user.nom}` : 'FDCUIC Admin';
  const userRole = user ? user.role : 'admin';

  return (
    <header style={{
      height: '64px',
      background: 'var(--color-bg-card)',
      borderBottom: '1px solid var(--color-border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* GAUCHE — Titre */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>{title}</h1>
        {subtitle && <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{subtitle}</span>}
      </div>


      {/* DROITE — Actions */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        
        {/* Bouton Theme */}
        <button 
          onClick={toggleTheme} 
          title={isDark ? "Mode clair" : "Mode sombre"}
          style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'var(--color-bg-body)', border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            color: 'var(--color-text-secondary)', transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
          onMouseOut={e => e.currentTarget.style.background = 'var(--color-bg-body)'}
        >
          {isDark ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>

        {/* Bouton Notification */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            title="Notifications" 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            style={{
              width: '38px', height: '38px', borderRadius: '10px', position: 'relative',
              background: 'var(--color-bg-body)', border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              color: 'var(--color-text-secondary)', transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--color-bg-body)'}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-2px', right: '-2px',
                width: '12px', height: '12px', borderRadius: '50%',
                background: 'var(--color-red)', border: '2px solid var(--color-bg-card)'
              }} />
            )}
          </button>

          {/* Dropdown Notifs */}
          {showNotifDropdown && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '320px', background: 'var(--color-bg-card)',
              borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid var(--color-border)',
              zIndex: 100, overflow: 'hidden', display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllAsRead} style={{ fontSize: 11, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Tout lire</button>
                )}
              </div>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>Aucune notification</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="dropdown-item-hover" style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-light)', background: n.lu ? 'transparent' : 'var(--color-primary-light)', cursor: 'pointer' }}
                         onClick={() => { if (!n.lu) handleMarkAsRead(n.id); }}>
                      <div style={{ fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 4 }}>{n.message}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{new Date(n.date_envoi).toLocaleString('fr-FR')}</div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '8px', borderTop: '1px solid var(--color-border-light)', textAlign: 'center' }}>
                <button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => { setShowNotifDropdown(false); navigate(user?.role === 'admin' ? '/admin/notifications' : '/candidat/notifications'); }}>
                  Voir toutes les notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profil Admin */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            style={{
              display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer',
              padding: '6px 12px 6px 6px', background: 'var(--color-bg-body)',
              border: '1px solid var(--color-border)', borderRadius: '12px',
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--color-bg-body)'}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F6AF6, #7C5CFC)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 800, overflow: 'hidden'
            }}>
              {user && user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                {userName}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', textTransform: 'capitalize' }}>
                {userRole}
              </span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-tertiary)', marginLeft: '4px' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {/* Profil Dropdown */}
          {showProfileDropdown && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: '180px',
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
              borderRadius: '12px', padding: '6px', zIndex: 200,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }}>
              <div 
                className="profile-dropdown-item"
                onClick={() => { setShowProfileDropdown(false); navigate(user?.role === 'admin' ? '/admin/profil' : '/candidat/profil'); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Mon profil
              </div>
              <div 
                className="profile-dropdown-item"
                onClick={() => { setShowProfileDropdown(false); navigate(user?.role === 'admin' ? '/admin/parametres' : '/candidat/parametres'); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Paramètres du compte
              </div>
              <div style={{ height: '1px', background: 'var(--color-border-light)', margin: '4px 0' }} />
              <div 
                className="profile-dropdown-item"
                style={{ color: 'var(--color-red)' }}
                onClick={handleLogout}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Se déconnecter
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dropdown-item-hover:hover { background: var(--color-bg-hover); }
        .profile-dropdown-item {
          display: flex; gap: 10px; align-items: center;
          padding: 9px 14px; border-radius: 8px; font-size: 13px;
          cursor: pointer; color: var(--color-text-primary); transition: background 0.2s;
        }
        .profile-dropdown-item:hover { background: var(--color-bg-hover); }
      `}</style>
    </header>
  );
};

export default Topbar;
