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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resAppels, resDossiers, resMob] = await Promise.all([
          candidatService.getAppelsOuverts(),
          candidatService.getMesAppels(),
          candidatService.getMesMobilites(),
        ]);
        setAppelsOuverts(resAppels.appels || []);
        setMesDossiers(resDossiers.dossiers || []);
        setMesMobilites(resMob.projets || []);
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
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredCandidatures = allCandidatures.filter(c =>
    (c.nom_structure || c.appel?.titre || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderBadge = (statut) => {
    const s = statut?.toLowerCase();
    if (s === 'accepte') return <span className="sp-badge sp-badge-green">Accepté</span>;
    if (s === 'rejete') return <span className="sp-badge sp-badge-red">Rejeté</span>;
    if (s === 'brouillon') return <span className="sp-badge sp-badge-orange">Brouillon</span>;
    return <span className="sp-badge sp-badge-blue">En attente</span>;
  };

  const timeAgo = (dateInput) => {
    const date = new Date(dateInput);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

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

      <main className="dashboard-main" style={{ padding: 0, background: 'linear-gradient(145deg, hsl(255, 20%, 93%) 0%, hsl(260, 18%, 90%) 50%, hsl(250, 15%, 88%) 100%)' }}>
        <Topbar title="Mon Espace FDCUIC" subtitle="Vue d'ensemble de vos activités" />

        <div className="dashboard-content" style={{ padding: '32px 40px', paddingTop: 'calc(72px + 32px)', maxWidth: 1500, margin: '0 auto' }}>

          {/* ═══════════════════════════════════════════════════════════
              SPLIT-SCREEN HERO — 3D Depth Layout
              ═══════════════════════════════════════════════════════════ */}
          <div className="sp-stage animate-fade-in-up">

            {/* Hidden SVG Definitions */}
            <svg className="sp-defs" aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
              <defs>
                <clipPath id="curveClipLeft" clipPathUnits="objectBoundingBox">
                  <path d="
                    M 0,0
                    L 0.52,0
                    C 0.54,0.12  0.58,0.22  0.55,0.35
                    C 0.52,0.48  0.46,0.52  0.48,0.65
                    C 0.50,0.78  0.56,0.85  0.53,0.95
                    L 0.50,1
                    L 0,1
                    Z
                  " />
                </clipPath>
                <clipPath id="curveClipRight" clipPathUnits="objectBoundingBox">
                  <path d="
                    M 0.52,0
                    L 1,0
                    L 1,1
                    L 0.50,1
                    L 0.53,0.95
                    C 0.56,0.85  0.50,0.78  0.48,0.65
                    C 0.46,0.52  0.52,0.48  0.55,0.35
                    C 0.58,0.22  0.54,0.12  0.52,0
                    Z
                  " />
                </clipPath>
                <linearGradient id="shimmerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(220,225,240,0.9)" />
                  <stop offset="25%" stopColor="rgba(255,255,255,0.95)" />
                  <stop offset="50%" stopColor="rgba(200,210,230,0.8)" />
                  <stop offset="75%" stopColor="rgba(255,255,255,0.9)" />
                  <stop offset="100%" stopColor="rgba(190,200,220,0.7)" />
                </linearGradient>
                <linearGradient id="sweepGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="500">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="40%" stopColor="rgba(255,255,255,0.95)" />
                  <stop offset="60%" stopColor="rgba(220,230,255,1)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="shadowBlur" x="-10%" y="-5%" width="120%" height="110%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
                </filter>
              </defs>
            </svg>

            {/* ── RIGHT PANEL (recessed, light) ── */}
            <div className="sp-panel-right">
              <div className="sp-panel-right-inner">
                <div className="sp-panel-right-grid" />
                {/* Right panel content: Stats + Quick Actions */}
                <div className="sp-right-content">
                  <h2 className="sp-section-title-light">Tableau de bord</h2>
                  <div className="sp-stats-row">
                    <div className="sp-stat-card-light">
                      <div className="sp-stat-icon" style={{ background: 'rgba(74, 123, 247, 0.1)', color: '#4A7BF7' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      </div>
                      <span className="sp-stat-number">{totalCandidatures}</span>
                      <span className="sp-stat-label">Soumis</span>
                    </div>
                    <div className="sp-stat-card-light">
                      <div className="sp-stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16A34A' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                      </div>
                      <span className="sp-stat-number">{candidaturesAcceptees}</span>
                      <span className="sp-stat-label">Acceptés</span>
                    </div>
                    <div className="sp-stat-card-light">
                      <div className="sp-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#D97706' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </div>
                      <span className="sp-stat-number">{candidaturesEnAttente}</span>
                      <span className="sp-stat-label">En attente</span>
                    </div>
                  </div>

                  {/* Quick Access Cards */}
                  <h3 className="sp-section-subtitle-light">Accès rapide</h3>
                  <div className="sp-quick-cards">
                    <button className="sp-quick-card" onClick={() => navigate('/candidat/appels')}>
                      <div className="sp-quick-icon" style={{ background: '#4A7BF7' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>
                      <div className="sp-quick-text">
                        <span className="sp-quick-title">Appels à projets</span>
                        <span className="sp-quick-count">{appelsOuverts.length} ouverts</span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                    <button className="sp-quick-card" onClick={() => navigate('/candidat/mobilite')}>
                      <div className="sp-quick-icon" style={{ background: '#C49C55' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"></path></svg>
                      </div>
                      <div className="sp-quick-text">
                        <span className="sp-quick-title">Programme Mobilité</span>
                        <span className="sp-quick-count">Découvrir</span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                    <button className="sp-quick-card" onClick={() => navigate('/candidat/mes-dossiers')}>
                      <div className="sp-quick-icon" style={{ background: '#1A2332' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                      </div>
                      <div className="sp-quick-text">
                        <span className="sp-quick-title">Mes dossiers</span>
                        <span className="sp-quick-count">{totalCandidatures} dossier(s)</span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── DEPTH SHADOW along curve ── */}
            <div className="sp-depth-shadow">
              <svg viewBox="0 0 1400 500" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <path fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="30" filter="url(#shadowBlur)" d="
                  M 728,0
                  C 756,60  812,110  770,175
                  C 728,240  644,260  672,325
                  C 700,390  784,425  742,475
                  L 700,500
                " />
              </svg>
            </div>

            {/* ── LEFT PANEL (elevated, dark) ── */}
            <div className="sp-panel-left">
              <div className="sp-panel-left-inner">
                <div className="sp-panel-left-frost" />
                <div className="sp-panel-left-glow" />
                {/* Left panel content: Hero + User info */}
                <div className="sp-left-content">
                  <div className="sp-welcome-area">
                    <div className="sp-avatar-ring">
                      <div className="sp-avatar-circle">
                        {user.prenom ? user.prenom.charAt(0).toUpperCase() : 'U'}
                        {user.nom ? user.nom.charAt(0).toUpperCase() : ''}
                      </div>
                      <div className="sp-avatar-online" />
                    </div>
                    <h1 className="sp-hero-title">
                      Bonjour, {user.prenom || 'Candidat'} <span role="img" aria-label="wave">👋</span>
                    </h1>
                    <p className="sp-hero-subtitle">
                      {totalCandidatures > 0
                        ? `Vous avez ${totalCandidatures} dossier(s) en cours sur la plateforme.`
                        : "Bienvenue ! Explorez nos opportunités pour commencer."}
                    </p>
                  </div>

                  {/* Dark mini-stat chips */}
                  <div className="sp-dark-chips">
                    <div className="sp-dark-chip">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                      <span>{appelsOuverts.length} Opportunités</span>
                    </div>
                    <div className="sp-dark-chip">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      <span>{totalCandidatures} Candidatures</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="sp-cta-area">
                    <button className="sp-cta-primary" onClick={() => navigate('/candidat/appels')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      Explorer les appels
                    </button>
                    <button className="sp-cta-ghost" onClick={() => navigate('/candidat/profil')}>
                      Mon profil
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SHIMMER DIVIDER ── */}
            <div className="sp-shimmer-divider">
              <svg viewBox="0 0 1400 500" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <path className="sp-shimmer-path" fill="none" stroke="url(#shimmerGrad)" strokeWidth="2.5" filter="url(#glow)" d="
                  M 728,0
                  C 756,60  812,110  770,175
                  C 728,240  644,260  672,325
                  C 700,390  784,425  742,475
                  L 700,500
                " />
                <path className="sp-shimmer-path-thin" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" d="
                  M 731,0
                  C 759,60  815,110  773,175
                  C 731,240  647,260  675,325
                  C 703,390  787,425  745,475
                  L 703,500
                " />
                <path className="sp-shimmer-sweep" fill="none" stroke="url(#sweepGrad)" strokeWidth="3.5" strokeLinecap="round" d="
                  M 728,0
                  C 756,60  812,110  770,175
                  C 728,240  644,260  672,325
                  C 700,390  784,425  742,475
                  L 700,500
                " />
              </svg>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════
              CANDIDATURES TABLE — Below the split-screen
              ═══════════════════════════════════════════════════════════ */}
          <div className="sp-table-section animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="sp-table-header">
              <h2 className="sp-table-title">Toutes vos candidatures</h2>
              <div className="sp-table-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  type="text"
                  placeholder="Rechercher un dossier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Nom du dossier</th>
                    <th>Type</th>
                    <th>Modifié le</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidatures.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '40px 32px', textAlign: 'center', color: '#6B7280', fontSize: 14 }}>
                        Aucun dossier trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredCandidatures.map((c, idx) => (
                      <tr key={`${c.type}-${c.id}`} className="sp-table-row">
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="sp-table-file-icon" style={{ background: c.type === 'Mobilité' ? 'rgba(196, 156, 85, 0.1)' : 'rgba(74, 123, 247, 0.1)', color: c.type === 'Mobilité' ? '#C49C55' : '#4A7BF7' }}>
                              {c.type === 'Mobilité' ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"></path></svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                              )}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#1A2332' }}>{c.nom_structure || c.appel?.titre || 'Dossier'}</span>
                          </div>
                        </td>
                        <td><span style={{ fontSize: 13, color: '#4B5563' }}>{c.type}</span></td>
                        <td><span style={{ fontSize: 13, color: '#4B5563' }}>{timeAgo(c.date)}</span></td>
                        <td>{renderBadge(c.statut)}</td>
                        <td>
                          <button
                            className="sp-table-btn"
                            onClick={() => {
                              if (c.type === 'Mobilité') navigate('/candidat/mobilite/postuler');
                              else navigate(`/candidat/candidature/${c.appel_id}`);
                            }}
                          >
                            Ouvrir
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
