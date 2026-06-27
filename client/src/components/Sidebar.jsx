import { useState, useRef, useEffect } from 'react';

const NAV_ADMIN = [
  {
    section: 'Menu',
    items: [
      { id: 'apercu', label: "Tableau de bord",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
      { id: 'campagnes', label: 'Appels à projets',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
      { id: 'projets', label: 'Candidatures',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg> },
      { id: 'mobilite', label: 'Mobilité',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg> },
      { id: 'types-projet', label: 'Types de projet',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
      { id: 'secteurs', label: "Secteurs d'activité",
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg> },
      { id: 'soumissionnaires', label: 'Soumissionnaires',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
      { id: 'brouillons', label: 'Dossiers Brouillons',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
      { id: 'personnel', label: 'Personnel FDCUIC',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
      { id: 'notifications-admin', label: 'Notifications',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> },
      { id: 'statistiques', label: 'Statistiques',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
      { id: 'finances', label: 'Finances',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
      { id: 'faqs', label: 'Gestion FAQs',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
      { id: 'legal', label: 'Paramètres légaux',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
      { id: 'parametres', label: 'Paramètres compte',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
    ]
  }
];

const NAV_CANDIDAT = [
  {
    section: 'Menu',
    items: [
      { id: 'apercu', label: 'Tableau de bord',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
      { id: 'opportunites', label: 'Appels à Projets',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
      { id: 'mes-candidatures', label: 'Mes Candidatures',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
      { id: 'mobilite', label: 'Programme Mobilité',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg> },
      { id: 'ressources', label: 'Mes Ressources',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
    ]
  }
];

const Sidebar = ({ activeTab, onTabChange, onLogout, role = 'admin' }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isCollapsed);
    document.documentElement.style.setProperty(
      '--sidebar-width', isCollapsed ? '72px' : '260px'
    );
  }, [isCollapsed]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navGroups = role === 'admin' ? NAV_ADMIN : NAV_CANDIDAT;

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden',
    }}>

      {/* ── LOGO ── */}
      <div className="sidebar-header" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isCollapsed ? '20px 16px' : '20px 20px',
        borderBottom: '1px solid var(--color-border-light)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #4F6AF6, #7C5CFC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '-0.5px',
          }}>F</div>
          {!isCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>FDCUIC</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {role === 'admin' ? 'Administration' : 'Espace Candidat'}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            width: 28, height: 28, borderRadius: 8, border: '1px solid var(--color-border)',
            background: 'var(--color-bg-body)', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text-tertiary)', transition: 'all 0.2s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isCollapsed
              ? <><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></>
              : <><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></>
            }
          </svg>
        </button>
      </div>

      {/* ── NAV ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: isCollapsed ? '12px 10px' : '12px 12px', scrollbarWidth: 'none' }}>
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 8 }}>
            {false && !isCollapsed && (
              <div style={{
                fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase', letterSpacing: '1px',
                padding: '8px 8px 4px', marginTop: gi > 0 ? 8 : 0,
              }}>
                {group.section}
              </div>
            )}
            {gi > 0 && isCollapsed && false && (
              <div style={{ height: 1, background: 'var(--color-border-light)', margin: '8px 0' }} />
            )}
            {group.items.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: 10, padding: isCollapsed ? '10px' : '10px 12px',
                    borderRadius: 10, border: 'none', cursor: 'pointer',
                    marginBottom: 2, transition: 'all 0.15s ease',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    background: isActive
                      ? 'linear-gradient(135deg, #4F6AF610, #7C5CFC10)'
                      : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    position: 'relative',
                    boxShadow: isActive ? 'inset 0 0 0 1px #4F6AF620' : 'none',
                  }}
                  onMouseOver={e => {
                    if (!isActive) e.currentTarget.style.background = 'var(--color-bg-hover)';
                  }}
                  onMouseOut={e => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {/* Indicateur actif */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: 3, borderRadius: '0 3px 3px 0',
                      background: 'linear-gradient(180deg, #4F6AF6, #7C5CFC)',
                    }} />
                  )}
                  <span style={{
                    width: 18, height: 18, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── HELP CARD (REMOVED) ── */}

      {/* ── USER ── */}
      <div ref={dropdownRef} style={{
        padding: isCollapsed ? '12px 10px' : '12px',
        borderTop: '1px solid var(--color-border-light)',
        flexShrink: 0, position: 'relative',
      }}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            gap: 10, padding: isCollapsed ? '8px' : '8px 10px',
            borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'var(--color-bg-body)', transition: 'all 0.2s',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #4F6AF6, #7C5CFC)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13,
          }}>
            {role === 'admin' ? 'A' : 'C'}
          </div>
          {!isCollapsed && (
            <>
              <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
                  {role === 'admin' ? 'Admin' : 'Candidat'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>FDCUIC</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </>
          )}
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 12, right: 12,
            background: 'var(--color-bg-card)', borderRadius: 12,
            border: '1px solid var(--color-border)', padding: 6,
            boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
            marginBottom: 8,
          }}>
            {[
              { label: 'Mon Profil', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
              { label: 'Paramètres', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
            ].map(item => (
              <button key={item.label} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'transparent', color: 'var(--color-text-secondary)',
                fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
              }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ width: 16, height: 16 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div style={{ height: 1, background: 'var(--color-border-light)', margin: '4px 0' }} />
            <button
              onClick={onLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'transparent', color: 'var(--color-red)',
                fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--color-red-light)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
