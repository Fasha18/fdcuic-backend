import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CandidatLayout({ children, activeTab, title, onLogout, onSearchChange, searchTerm, customHeaderAction }) {
  const navigate = useNavigate();
  const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});

  return (
    <div className="drive-layout">
      {/* 
        INJECTIONS CSS DIRECTES POUR ISOLER LE DESIGN
        (Appliqué globalement pour l'espace candidat)
      */}
      <style>{`
        .drive-layout {
          display: flex;
          height: 100vh;
          background: #F4F5F8;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          overflow: hidden;
        }

        /* --- SIDEBAR --- */
        .drive-sidebar {
          width: 260px;
          background: #2B62FF;
          color: white;
          display: flex;
          flex-direction: column;
          border-top-right-radius: 24px;
          border-bottom-right-radius: 24px;
          box-shadow: 4px 0 15px rgba(43, 98, 255, 0.1);
          z-index: 10;
        }

        .drive-brand {
          padding: 32px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .new-btn-container {
          padding: 0 24px 24px 24px;
        }

        .btn-new {
          background: white;
          color: #2B62FF;
          border: none;
          padding: 14px 20px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-new:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }

        .drive-nav {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .nav-item {
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          color: rgba(255,255,255,0.7);
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .nav-item:hover {
          color: white;
          background: rgba(255,255,255,0.1);
        }

        .nav-item.active {
          color: white;
          background: rgba(255,255,255,0.15);
          font-weight: 600;
        }
        
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 4px;
          background: white;
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
        }

        .storage-info {
          padding: 24px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .storage-bar {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
          margin-top: 8px;
          margin-bottom: 8px;
        }

        .storage-fill {
          width: 30%;
          height: 100%;
          background: white;
          border-radius: 2px;
        }

        /* --- MAIN AREA --- */
        .drive-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: white;
          margin: 12px 12px 12px 0;
          border-radius: 24px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.03);
          overflow: hidden;
        }

        /* HEADER */
        .drive-header {
          padding: 20px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #F0F2F5;
        }

        .header-title {
          font-size: 20px;
          font-weight: 700;
          color: #1A2332;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background: #F1F3F4;
          padding: 10px 16px;
          border-radius: 8px;
          width: 400px;
        }
        .search-bar input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          margin-left: 12px;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: #2B62FF;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
        }

        .drive-content {
          flex: 1;
          padding: 32px 40px;
          overflow-y: auto;
          background: #F8F9FA; /* Fond très léger pour faire ressortir les cartes SalesMonk */
        }

        /* COMMON SALESMONK STYLES FOR INNER PAGES */
        .salesmonk-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.02);
        }
        .salesmonk-card.primary {
          background: #1A73E8;
          color: white;
        }
        .salesmonk-section-title {
          font-size: 16px;
          font-weight: 700;
          color: #1A2332;
          margin-bottom: 20px;
        }
      `}</style>

      {/* --- SIDEBAR --- */}
      <aside className="drive-sidebar">
        <div className="drive-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 2 22 22 22"></polygon></svg>
          FDCUIC
        </div>

        <div className="new-btn-container">
          <button className="btn-new" onClick={() => navigate('/candidat/appels')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Nouvelle demande
          </button>
        </div>

        <nav className="drive-nav">
          <div className={`nav-item ${activeTab === 'apercu' ? 'active' : ''}`} onClick={() => navigate('/candidat')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Vue d'ensemble
          </div>
          <div className={`nav-item ${activeTab === 'opportunites' ? 'active' : ''}`} onClick={() => navigate('/candidat/appels')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Appels à projets
          </div>
          <div className={`nav-item ${activeTab === 'mobilite' ? 'active' : ''}`} onClick={() => navigate('/candidat/mobilite')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            Mobilité
          </div>
          <div className={`nav-item ${activeTab === 'mes-candidatures' ? 'active' : ''}`} onClick={() => navigate('/candidat/mes-dossiers')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            Mes candidatures
          </div>
          <div className={`nav-item ${activeTab === 'profil' ? 'active' : ''}`} onClick={() => navigate('/candidat/profil')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Profil
          </div>
        </nav>

        <div className="storage-info">
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Activité Profil</div>
          <div className="storage-bar">
            <div className="storage-fill"></div>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Profil complété à 30%</div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="drive-main">
        
        {/* HEADER INTÉGRÉ */}
        <header className="drive-header">
          <div className="header-title">
            <span>{title || "Mon Espace"}</span>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            {onSearchChange !== undefined && (
              <div className="search-bar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5F6368" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input 
                  type="text" 
                  placeholder="Rechercher..."
                  value={searchTerm || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            )}
            {customHeaderAction}
          </div>

          <div className="header-actions">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5F6368" strokeWidth="2" style={{ cursor: 'pointer' }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5F6368" strokeWidth="2" style={{ cursor: 'pointer' }}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <div className="user-avatar" onClick={onLogout} title="Déconnexion">
              {user.prenom ? user.prenom.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        <div className="drive-content">
          {children}
        </div>
      </main>
    </div>
  );
}
