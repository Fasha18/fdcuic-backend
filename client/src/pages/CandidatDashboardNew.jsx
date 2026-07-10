import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import candidatService from '../services/candidatService';

export default function CandidatDashboardNew({ onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('apercu');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});

  const [appelsOuverts, setAppelsOuverts] = useState([]);
  const [mesDossiers, setMesDossiers] = useState([]);
  const [mesMobilites, setMesMobilites] = useState([]);
  const [activites, setActivites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resAppels, resDossiers, resMob, resNotifs] = await Promise.all([
          candidatService.getAppelsOuverts(),
          candidatService.getMesAppels(),
          candidatService.getMesMobilites(),
          candidatService.getNotifications().catch(() => [])
        ]);
        
        setAppelsOuverts(resAppels.appels || []);
        const dossiers = resDossiers.dossiers || [];
        const mobilites = resMob.projets || [];
        setMesDossiers(dossiers);
        setMesMobilites(mobilites);

        // Build Activities List
        const allCands = [
          ...dossiers.map(d => ({ ...d, type: 'Appel à projet', date: d.updatedAt })),
          ...mobilites.map(m => ({ ...m, type: 'Mobilité', date: m.updatedAt }))
        ];

        const notifs = Array.isArray(resNotifs) ? resNotifs : (resNotifs.notifications || []);
        
        const notifActivities = notifs.map(n => {
          let t = 'info';
          if (n.message.includes('✅') || n.message.includes('🎉') || n.message.includes('accepté')) t = 'accepte';
          else if (n.message.includes('❌') || n.message.includes('regrettons') || n.message.includes('rejeté') || n.message.includes('conforme')) t = 'rejete';
          else if (n.message.includes('examen') || n.message.includes('conformité')) t = 'examen';
          
          return {
            id: `notif-${n.id}`,
            date: new Date(n.createdAt),
            message: n.message.replace(/✅|🎉|❌|📋/g, '').trim(),
            type: t
          };
        });

        const candActivities = allCands
          .filter(c => c.statut === 'brouillon' || c.statut === 'soumis')
          .map(c => ({
            id: `cand-${c.type}-${c.id}`,
            date: new Date(c.date),
            message: c.statut === 'soumis' ? `Vous avez soumis le dossier "${c.nom_structure || c.appel?.titre || 'Sans nom'}"` : `Vous avez enregistré un brouillon pour "${c.nom_structure || c.appel?.titre || 'Sans nom'}"`,
            type: c.statut === 'soumis' ? 'soumis' : 'brouillon'
          }));

        const combinedActivities = [...notifActivities, ...candActivities]
          .sort((a, b) => b.date - a.date)
          .slice(0, 8); // top 8 activities
          
        setActivites(combinedActivities);

      } catch (error) {
        console.error("Erreur chargement dashboard candidat:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalCandidatures = mesDossiers.length + mesMobilites.length;
  const candidaturesAcceptees = [...mesDossiers, ...mesMobilites].filter(c => c.statut === 'accepte').length;
  const candidaturesEnAttente = [...mesDossiers, ...mesMobilites].filter(c => c.statut === 'soumis').length;

  const allCandidatures = [
    ...mesDossiers.map(d => ({ ...d, type: 'Appel à projet', date: d.updatedAt })),
    ...mesMobilites.map(m => ({ ...m, type: 'Mobilité', date: m.updatedAt }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5); // Take only top 5 recent

  const getBadgeStyle = (statut) => {
    const s = statut?.toLowerCase();
    if (s === 'accepte') return { bg: '#E1F5EE', color: '#1baf7a', text: 'Accepté' };
    if (s === 'rejete' || s === 'non_conforme') return { bg: '#FEE2E2', color: '#EF4444', text: s === 'non_conforme' ? 'Non conforme' : 'Rejeté' };
    if (s === 'brouillon') return { bg: '#F3F4F6', color: '#6B7280', text: 'Brouillon' };
    if (s === 'en_examen_conformite' || s === 'en_evaluation_contenu') return { bg: '#FFF3E0', color: '#FFB020', text: 'En examen' };
    return { bg: '#E6F0FF', color: '#0144BD', text: 'Soumis' };
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'soumis': return { bg: '#E6F0FF', color: '#0144BD', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> };
      case 'accepte': return { bg: '#E1F5EE', color: '#1baf7a', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> };
      case 'rejete': return { bg: '#FEE2E2', color: '#EF4444', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> };
      case 'examen': return { bg: '#FFF3E0', color: '#FFB020', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> };
      default: return { bg: '#F3F4F6', color: '#6B7280', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> }; // brouillon/info
    }
  };

  const timeRelative = (d) => {
    const diff = Math.floor((new Date() - new Date(d)) / 1000);
    if (diff < 3600) return "Il y a moins d'une heure";
    if (diff < 86400) return `Il y a ${Math.floor(diff/3600)} heure(s)`;
    if (diff < 172800) return "Hier";
    return `Il y a ${Math.floor(diff/86400)} jour(s)`;
  };

  // Determine greeting based on hour
  const currentHour = new Date().getHours();
  const greeting = currentHour >= 18 ? 'Bonsoir' : 'Bonjour';

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar activeTab="apercu" onTabChange={() => {}} role="candidat" />
        <main className="dashboard-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        if (tab === 'opportunites') navigate('/candidat/appels');
        if (tab === 'mes-candidatures') navigate('/candidat/mes-dossiers');
        if (tab === 'mobilite') navigate('/candidat/mobilite');
      }} onLogout={onLogout} role="candidat" />

      {/* Main content area with gradient background and relative positioning for metaballs */}
      <main className="dashboard-main" style={{ position: 'relative', background: 'linear-gradient(155deg, #eef3ff, #dce8ff 60%, #cfe0ff)', overflow: 'hidden', padding: 0 }}>
        
        {/* GLOBAL METABALLS BACKGROUND */}
        <div className="global-metaballs">
          <svg>
            <defs>
              <filter id="goo">
                <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="b"/>
                <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -11" result="g"/>
              </filter>
            </defs>
            <g filter="url(#goo)">
              {/* Scattered around the page */}
              <circle className="mb-1" cx="80%" cy="20%" r="200" />
              <circle className="mb-2" cx="20%" cy="70%" r="150" />
              <circle className="mb-3" cx="90%" cy="80%" r="180" />
              <circle className="mb-4" cx="10%" cy="30%" r="120" />
            </g>
          </svg>
        </div>

        {/* TOPBAR OVERLAY */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Topbar title="Mon Espace FDCUIC" subtitle="Vue d'ensemble de vos activités" />
        </div>

        {/* CONTENT */}
        <div className="dashboard-content" style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          
          <style>{`
            /* Global Candidate Dashboard CSS */
            .global-metaballs {
              position: absolute;
              top: 0; right: 0; bottom: 0; left: 0;
              opacity: 0.15;
              pointer-events: none;
              overflow: hidden;
              z-index: 0;
            }
            .global-metaballs svg { width: 100%; height: 100%; }
            .mb-1 { animation: gooA 15s ease-in-out infinite alternate; fill: #2f6bff; }
            .mb-2 { animation: gooB 18s ease-in-out infinite alternate; fill: #0144BD; }
            .mb-3 { animation: gooC 20s ease-in-out infinite alternate; fill: #5b8dff; }
            .mb-4 { animation: gooD 22s ease-in-out infinite alternate; fill: #78a8ff; }
            
            @keyframes gooA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(250px,-150px) scale(1.1)} }
            @keyframes gooB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-200px,200px) scale(0.9)} }
            @keyframes gooC { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-150px,-100px) scale(1.05)} }
            @keyframes gooD { 0%,100%{transform:translate(0,0)} 50%{transform:translate(180px,180px) scale(1.2)} }

            .cand-welcome-area {
              margin-bottom: 32px;
              padding-top: 12px;
            }
            .cand-welcome-title { font-size: 24px; font-weight: 600; color: #0b1b3a; margin-bottom: 8px; }
            .cand-welcome-desc { font-size: 13px; color: #5a6178; margin-bottom: 20px; }
            
            .cand-actions { display: flex; gap: 12px; }
            .btn-blue { background: #0144BD; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(1, 68, 189, 0.15); }
            .btn-blue:hover { background: #01379b; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(1, 68, 189, 0.25); }
            .btn-outline-blue { background: rgba(255,255,255,0.7); color: #0144BD; border: 1px solid rgba(1,68,189,0.2); padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; backdrop-filter: blur(8px); }
            .btn-outline-blue:hover { background: rgba(255,255,255,0.95); border-color: rgba(1,68,189,0.4); transform: translateY(-1px); }

            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px; }
            .stat-card-accent {
              background: white;
              border-radius: 12px;
              padding: 20px 24px;
              position: relative;
              overflow: hidden;
              box-shadow: 0 4px 16px rgba(0,0,0,0.04);
              display: flex;
              flex-direction: column;
              border: 1px solid rgba(255,255,255,0.8);
            }
            .stat-accent-line { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; }
            .stat-icon-wrap { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
            .stat-label { font-size: 13px; color: #6b7182; font-weight: 500; }
            .stat-value { font-size: 24px; font-weight: 600; color: #0b1b3a; line-height: 1; }

            .quick-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px; }
            .quick-card {
              background: white;
              border-radius: 12px;
              padding: 16px 20px;
              border: 1px solid rgba(255,255,255,0.8);
              display: flex;
              align-items: center;
              gap: 16px;
              cursor: pointer;
              transition: all 0.2s;
              box-shadow: 0 4px 16px rgba(0,0,0,0.04);
            }
            .quick-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: white; }
            .quick-icon { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .quick-title { font-size: 13px; font-weight: 600; color: #0b1b3a; margin-bottom: 4px; display: block; }
            .quick-sub { font-size: 12px; color: #8a90a0; }

            .bottom-grid {
              display: grid;
              grid-template-columns: 1fr 1.2fr;
              gap: 24px;
            }
            @media (max-width: 1024px) {
              .bottom-grid { grid-template-columns: 1fr; }
            }

            .recent-card { background: white; border-radius: 12px; padding: 24px; border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 4px 16px rgba(0,0,0,0.04); display: flex; flex-direction: column; }
            .recent-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .recent-title { font-size: 16px; font-weight: 600; color: #0b1b3a; }
            .recent-link { font-size: 13px; color: #0144BD; font-weight: 600; cursor: pointer; }
            .recent-link:hover { text-decoration: underline; }
            
            /* Candidatures Récentes (Gauche) */
            .recent-list { display: flex; flex-direction: column; }
            .recent-item { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #eef1f7; }
            .recent-item:last-child { border-bottom: none; padding-bottom: 0; }
            .recent-item-icon { width: 40px; height: 40px; border-radius: 10px; background: #f8fafc; display: flex; align-items: center; justify-content: center; color: #64748b; margin-right: 16px; flex-shrink: 0; }
            .recent-item-content { flex: 1; padding-right: 12px; }
            .recent-item-name { font-size: 14px; font-weight: 600; color: #0b1b3a; margin-bottom: 4px; }
            .recent-item-type { font-size: 12px; color: #8a90a0; }
            .recent-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; flex-shrink: 0; }
            
            /* Activité Récente (Droite) */
            .activity-list { display: flex; flex-direction: column; }
            .activity-item { display: flex; align-items: flex-start; padding: 16px 0; border-bottom: 1px solid #eef1f7; }
            .activity-item:last-child { border-bottom: none; padding-bottom: 0; }
            .activity-icon-wrap { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0; margin-top: 2px; }
            .activity-content { flex: 1; }
            .activity-message { font-size: 13.5px; color: #0b1b3a; line-height: 1.5; margin-bottom: 6px; }
            .activity-time { font-size: 12px; color: #8a90a0; font-weight: 500; }

            .empty-state { text-align: center; padding: 40px 0; color: #8a90a0; font-size: 14px; }
            
            @media (prefers-color-scheme: dark) {
              /* Adaptations très basiques si le thème sombre global est activé sur le dashboard */
              body[data-theme='dark'] .dashboard-main { background: linear-gradient(155deg, #0f172a, #1e293b 60%, #0f172a) !important; }
              body[data-theme='dark'] .cand-welcome-title { color: #f1f5f9; }
              body[data-theme='dark'] .cand-welcome-desc { color: #94a3b8; }
              body[data-theme='dark'] .btn-outline-blue { background: rgba(255,255,255,0.1); color: #60a5fa; }
              body[data-theme='dark'] .stat-card-accent, body[data-theme='dark'] .quick-card, body[data-theme='dark'] .recent-card { background: var(--color-bg-card); border-color: var(--color-border); }
              body[data-theme='dark'] .stat-value, body[data-theme='dark'] .quick-title, body[data-theme='dark'] .recent-title, body[data-theme='dark'] .recent-item-name, body[data-theme='dark'] .activity-message { color: var(--color-text-primary); }
              body[data-theme='dark'] .stat-label, body[data-theme='dark'] .quick-sub, body[data-theme='dark'] .recent-item-type, body[data-theme='dark'] .activity-time { color: var(--color-text-secondary); }
              body[data-theme='dark'] .recent-item, body[data-theme='dark'] .activity-item { border-bottom-color: var(--color-border-light); }
              body[data-theme='dark'] .recent-item-icon { background: var(--color-bg-body); }
            }
          `}</style>

          {/* 1. WELCOME TEXT (Directly on background) */}
          <div className="cand-welcome-area animate-fade-in-up">
            <h1 className="cand-welcome-title">{greeting}, {user.prenom || 'Candidat'} 👋</h1>
            <p className="cand-welcome-desc">Voici un aperçu de votre activité sur la plateforme.</p>
            <div className="cand-actions">
              <button className="btn-blue" onClick={() => navigate('/candidat/appels')}>Explorer les appels</button>
              <button className="btn-outline-blue" onClick={() => navigate('/candidat/profil')}>Mon profil</button>
            </div>
          </div>

          {/* 2. STATS CARDS */}
          <div className="stats-grid animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="stat-card-accent">
              <div className="stat-accent-line" style={{ background: '#0144BD' }}></div>
              <div className="stat-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0144BD" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span className="stat-label">Soumis</span>
              </div>
              <div className="stat-value">{totalCandidatures}</div>
            </div>
            
            <div className="stat-card-accent">
              <div className="stat-accent-line" style={{ background: '#1baf7a' }}></div>
              <div className="stat-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1baf7a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span className="stat-label">Acceptés</span>
              </div>
              <div className="stat-value">{candidaturesAcceptees}</div>
            </div>

            <div className="stat-card-accent">
              <div className="stat-accent-line" style={{ background: '#FFB020' }}></div>
              <div className="stat-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFB020" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span className="stat-label">En attente</span>
              </div>
              <div className="stat-value">{candidaturesEnAttente}</div>
            </div>
          </div>

          {/* 3. QUICK ACCESS */}
          <div className="quick-grid animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="quick-card" onClick={() => navigate('/candidat/appels')}>
              <div className="quick-icon" style={{ background: '#E6F0FF', color: '#0144BD' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div>
                <span className="quick-title">Appels à projets</span>
                <span className="quick-sub">Explorez les opportunités</span>
              </div>
            </div>

            <div className="quick-card" onClick={() => navigate('/candidat/mobilite')}>
              <div className="quick-icon" style={{ background: '#FFF3E0', color: '#FFB020' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"></path></svg>
              </div>
              <div>
                <span className="quick-title">Programme Mobilité</span>
                <span className="quick-sub">Subventions de voyage</span>
              </div>
            </div>

            <div className="quick-card" onClick={() => navigate('/candidat/mes-dossiers')}>
              <div className="quick-icon" style={{ background: '#F3E8FF', color: '#7C5CFC' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div>
                <span className="quick-title">Mes dossiers</span>
                <span className="quick-sub">Gérez vos candidatures</span>
              </div>
            </div>
          </div>

          {/* 4. BOTTOM 2-COLUMNS GRID */}
          <div className="bottom-grid animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            
            {/* LEFT COLUMN: RECENT CANDIDATURES */}
            <div className="recent-card">
              <div className="recent-header">
                <span className="recent-title">Candidatures récentes</span>
                <span className="recent-link" onClick={() => navigate('/candidat/mes-dossiers')}>Tout voir</span>
              </div>
              
              <div className="recent-list">
                {allCandidatures.length === 0 ? (
                  <div className="empty-state">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px auto', opacity: 0.5 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Vous n'avez pas encore soumis de candidature.
                  </div>
                ) : (
                  allCandidatures.map((c, idx) => {
                    const isMobilite = c.type === 'Mobilité';
                    const badge = getBadgeStyle(c.statut);
                    
                    return (
                      <div key={`cand-${c.type}-${c.id}`} className="recent-item">
                        <div className="recent-item-icon">
                          {isMobilite ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"></path></svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          )}
                        </div>
                        <div className="recent-item-content">
                          <div className="recent-item-name">{c.nom_structure || c.appel?.titre || 'Dossier'}</div>
                          <div className="recent-item-type">{c.type} • Modifié le {new Date(c.date).toLocaleDateString('fr-FR')}</div>
                        </div>
                        <div className="recent-badge" style={{ background: badge.bg, color: badge.color }}>
                          {badge.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: RECENT ACTIVITY */}
            <div className="recent-card">
              <div className="recent-header">
                <span className="recent-title">Activité récente</span>
              </div>
              
              <div className="activity-list">
                {activites.length === 0 ? (
                  <div className="empty-state">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px auto', opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Aucune activité récente.
                  </div>
                ) : (
                  activites.map((act) => {
                    const iconStyle = getActivityIcon(act.type);
                    
                    return (
                      <div key={act.id} className="activity-item">
                        <div className="activity-icon-wrap" style={{ background: iconStyle.bg, color: iconStyle.color }}>
                          {iconStyle.icon}
                        </div>
                        <div className="activity-content">
                          <div className="activity-message">{act.message}</div>
                          <div className="activity-time">{timeRelative(act.date)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
