/* ── CandidatMobilite.jsx ────────────────────────────────── */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import candidatService from '../services/candidatService';

export default function CandidatMobilite({ onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await candidatService.getProgrammeMobiliteStats();
        setStats(statsRes);
      } catch (err) {
        console.error('Erreur chargement stats mobilité:', err);
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
        <Topbar title="Mobilité" subtitle="Développez vos projets à l'international" />

        <div className="dashboard-content">
          <div className="content-grid" style={{ paddingBottom: 60 }}>
            
            {/* HERO */}
            <div className="detail-appel-hero animate-fade-in-up">
              <div className="hero-text-content">
                <div className="detail-badges" style={{ marginBottom: 16 }}>
                  <span className="appels-status-badge" style={{ background: 'var(--color-green-light)', color: 'var(--color-green)', padding: '6px 12px', fontSize: 13, fontWeight: 700, borderRadius: 20 }}>
                    En continu
                  </span>
                </div>
                
                <h1 className="hero-title">Mobilité Internationale</h1>
                <p style={{ marginTop: 16, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  Ce dispositif de mobilité soutient les acteurs culturels et créatifs du Sénégal, afin de favoriser le rayonnement international, la formation, et le développement de partenariats. Les candidatures sont ouvertes en permanence.
                </p>

                <div className="hero-actions" style={{ marginTop: 32 }}>
                  <button className="btn-primary hero-btn" onClick={() => navigate('/candidat/mobilite/candidature')}>
                    Déposer ma candidature
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
              
              <div className="hero-image-wrapper">
                <div className="hero-image-placeholder" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <div className="hero-image-overlay"></div>
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
        </div>
      </main>
    </div>
  );
}

