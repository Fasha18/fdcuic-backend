/* ── CandidatMobilite.jsx ────────────────────────────────── */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import candidatService from '../services/candidatService';

export default function CandidatMobilite({ onLogout }) {
  const navigate = useNavigate();
  const [programme, setProgramme] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, statsRes] = await Promise.all([
          candidatService.getProgrammeMobilite(),
          candidatService.getProgrammeMobiliteStats()
        ]);
        setProgramme(progRes.programme);
        setStats(statsRes);
      } catch (err) {
        console.error('Erreur chargement mobilité:', err);
        setError('Impossible de charger les informations du programme de mobilité.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar activeTab="mobilite" onTabChange={() => {}} role="candidat" />
        <main className="dashboard-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab="mobilite" onTabChange={(tab) => {
        if (tab === 'apercu') navigate('/candidat');
        if (tab === 'opportunites') navigate('/candidat/appels');
        if (tab === 'mes-candidatures') navigate('/candidat/mes-dossiers');
      }} onLogout={onLogout} role="candidat" />

      <main className="dashboard-main">
        <Topbar title="Programme Mobilité" subtitle="Développez vos projets à l'international" />

        <div className="dashboard-content">
          {error ? (
            <div className="alert alert-error">{error}</div>
          ) : !programme ? (
            <div className="mobilite-premium-empty">
              <div className="empty-icon">🌍</div>
              <h3>Aucun programme actif</h3>
              <p>Le programme de mobilité n'est pas disponible pour le moment.</p>
            </div>
          ) : (
            <div className="content-grid" style={{ paddingBottom: 60 }}>
              
              {/* HERO */}
              <div className="detail-appel-hero animate-fade-in-up">
                <div className="hero-text-content">
                  <div className="detail-badges" style={{ marginBottom: 16 }}>
                    <span className="appels-status-badge" style={{ background: 'var(--color-green-light)', color: 'var(--color-green)', padding: '6px 12px', fontSize: 13, fontWeight: 700, borderRadius: 20 }}>
                      En continu
                    </span>
                  </div>
                  
                  <h1 className="hero-title">{programme.titre || "Programme de Mobilité Internationale"}</h1>
                  <p style={{ marginTop: 16, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    Ce programme soutient la mobilité des acteurs culturels et créatifs du Sénégal, afin de favoriser le rayonnement international, la formation, et le développement de partenariats.
                  </p>

                  <div className="hero-actions" style={{ marginTop: 32 }}>
                    <button className="btn-primary hero-btn" onClick={() => navigate('/candidat/mobilite/candidature')}>
                      Déposer ma candidature
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
                
                <div className="hero-image-wrapper">
                  {programme.image_couverture ? (
                    <img src={`http://localhost:3000/uploads/${programme.image_couverture}`} alt={programme.titre} />
                  ) : (
                    <div className="hero-image-placeholder" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </div>
                  )}
                  <div className="hero-image-overlay"></div>
                </div>
              </div>

              {/* SECTION DESCRIPTION & CRITÈRES */}
              <div className="detail-appel-grid">
                <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <div className="section-header">
                    <div className="section-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
                    </div>
                    <h2 className="section-title">Présentation du programme</h2>
                  </div>
                  <div className="rich-text" dangerouslySetInnerHTML={{ __html: programme.description.replace(/\n/g, '<br/>') }} />
                </div>

                <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <div className="section-header">
                    <div className="section-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <h2 className="section-title">Critères d'éligibilité</h2>
                  </div>
                  <div className="eligibility-content">
                    {programme.criteres_eligibilite ? (
                      <div className="rich-text" dangerouslySetInnerHTML={{ __html: programme.criteres_eligibilite.replace(/\n/g, '<br/>') }} />
                    ) : (
                      <p className="empty-text">Aucun critère spécifique n'a été renseigné.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* STATS (Facultatif, si stats existent) */}
              {stats && (
                <div className="detail-appel-stats animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                    </div>
                    <div className="stat-info">
                      <div className="stat-value" style={{ fontSize: 18 }}>{stats.totalProjets || 0}</div>
                      <div className="stat-label">Projets soumis</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--color-green-light)', color: 'var(--color-green)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div className="stat-info">
                      <div className="stat-value" style={{ fontSize: 18 }}>{stats.accepte || 0}</div>
                      <div className="stat-label">Projets soutenus</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
