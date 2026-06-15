/* ── CandidatDetailAppel.jsx ────────────────────────────────── */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import candidatService from '../services/candidatService';

const STATUS_CONFIG = {
  ouvert: { label: 'Ouvert', color: 'var(--color-green)', bg: 'var(--color-green-light)', icon: '🟢' },
  a_venir: { label: 'À venir', color: 'var(--color-orange)', bg: 'var(--color-orange-light)', icon: '🟡' },
  fermé: { label: 'Clôturé', color: 'var(--color-red)', bg: 'var(--color-red-light)', icon: '🔴' },
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getComputedStatus = (appel) => {
  const now = new Date();
  const debut = new Date(appel.date_debut);
  const fin = new Date(appel.date_fin);

  if (appel.statut === 'fermé') return 'fermé';
  if (debut > now) return 'a_venir';
  if (fin < now) return 'fermé';
  return 'ouvert';
};

const daysRemaining = (dateFin) => {
  const now = new Date();
  const end = new Date(dateFin);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
};

export default function CandidatDetailAppel({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appel, setAppel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppel = async () => {
      try {
        const res = await candidatService.getDetailAppel(id);
        setAppel(res.appel);
      } catch (err) {
        console.error('Erreur chargement appel:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppel();
  }, [id]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar activeTab="opportunites" onTabChange={() => {}} role="candidat" />
        <main className="dashboard-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </main>
      </div>
    );
  }

  if (!appel) {
    return (
      <div className="dashboard-layout">
        <Sidebar activeTab="opportunites" onTabChange={(t) => { if(t==='apercu') navigate('/candidat'); }} role="candidat" />
        <main className="dashboard-main">
          <Topbar title="Appel à Projets" subtitle="Introuvable" />
          <div className="dashboard-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div className="mobilite-premium-empty">
              <div className="empty-icon">📂</div>
              <h3>Appel à projets introuvable</h3>
              <p>Cet appel n'existe pas ou a été supprimé.</p>
              <button className="btn-primary" onClick={() => navigate('/candidat/appels')}>Retour aux appels</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const computedStatus = getComputedStatus(appel);
  const statusConfig = STATUS_CONFIG[computedStatus] || STATUS_CONFIG.fermé;
  const days = daysRemaining(appel.date_fin);

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab="opportunites" onTabChange={(tab) => {
        if (tab === 'apercu') navigate('/candidat');
        if (tab === 'opportunites') navigate('/candidat/appels');
        if (tab === 'mes-candidatures') navigate('/candidat/mes-dossiers');
        if (tab === 'mobilite') navigate('/candidat/mobilite');
      }} onLogout={onLogout} role="candidat" />

      <main className="dashboard-main">
        <Topbar 
          title="Détail de l'Appel" 
          subtitle="Informations complètes et critères" 
          onBack={() => navigate('/candidat/appels')}
        />

        <div className="dashboard-content">
          <div className="content-grid" style={{ paddingBottom: 60 }}>
            
            {/* ==========================================
                SECTION 1 — HERO DE L'APPEL
               ========================================== */}
            <div className="detail-appel-hero animate-fade-in-up">
              <div className="hero-text-content">
                <div className="detail-badges" style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
                  <span className="appels-status-badge" style={{ background: statusConfig.bg, color: statusConfig.color, padding: '6px 12px', fontSize: 13, fontWeight: 700, borderRadius: 20 }}>
                    {statusConfig.label}
                  </span>
                  {appel.type_projet && (
                    <span className="appels-type-badge" style={{ padding: '6px 12px', fontSize: 13 }}>
                      {appel.type_projet}
                    </span>
                  )}
                </div>
                
                <h1 className="hero-title">{appel.titre}</h1>
                
                <div className="hero-dates" style={{ display: 'flex', gap: 24, marginTop: 16, color: 'var(--color-text-secondary)', fontSize: 14 }}>
                  <div><strong>Début :</strong> {formatDate(appel.date_debut)}</div>
                  <div><strong>Clôture :</strong> {formatDate(appel.date_fin)}</div>
                </div>

                <div className="hero-actions" style={{ marginTop: 32 }}>
                  {computedStatus === 'ouvert' ? (
                    <button className="btn-primary hero-btn" onClick={() => navigate(`/candidat/appels/${id}/candidature`)}>
                      Déposer ma candidature
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </button>
                  ) : (
                    <button className="btn-primary hero-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                      Candidatures fermées
                    </button>
                  )}
                </div>
              </div>
              
              <div className="hero-image-wrapper">
                {appel.image_couverture ? (
                  <img src={`http://localhost:3000/uploads/${appel.image_couverture}`} alt={appel.titre} />
                ) : (
                  <div className="hero-image-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                )}
                <div className="hero-image-overlay"></div>
              </div>
            </div>

            {/* ==========================================
                SECTION 4 — INFORMATIONS IMPORTANTES (Cartes)
               ========================================== */}
            <div className="detail-appel-stats animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: statusConfig.bg, color: statusConfig.color }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className="stat-info">
                  <div className="stat-value" style={{ fontSize: 18 }}>{statusConfig.label}</div>
                  <div className="stat-label">Statut actuel</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div className="stat-info">
                  <div className="stat-value" style={{ fontSize: 18 }}>{formatDate(appel.date_fin)}</div>
                  <div className="stat-label">Date limite</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'var(--color-orange-light)', color: 'var(--color-orange)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <div className="stat-info">
                  <div className="stat-value" style={{ fontSize: 18 }}>{appel.type_projet ? appel.type_projet : 'Standard'}</div>
                  <div className="stat-label">Type de projet</div>
                </div>
              </div>

              {computedStatus === 'ouvert' && (
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'var(--color-green-light)', color: 'var(--color-green)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ fontSize: 18 }}>{days} jours</div>
                    <div className="stat-label">Restants</div>
                  </div>
                </div>
              )}
            </div>

            <div className="detail-appel-grid">
              {/* ==========================================
                  SECTION 2 — DESCRIPTION COMPLÈTE
                 ========================================== */}
              <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="section-header">
                  <div className="section-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
                  </div>
                  <h2 className="section-title">Présentation de l'appel</h2>
                </div>
                <div className="rich-text" dangerouslySetInnerHTML={{ __html: appel.description.replace(/\n/g, '<br/>') }} />
              </div>

              {/* ==========================================
                  SECTION 3 — CONDITIONS D'ÉLIGIBILITÉ
                 ========================================== */}
              <div className="card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="section-header">
                  <div className="section-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  </div>
                  <h2 className="section-title">Critères d'éligibilité</h2>
                </div>
                <div className="eligibility-content">
                  {appel.criteres ? (
                    <div className="rich-text" dangerouslySetInnerHTML={{ __html: appel.criteres.replace(/\n/g, '<br/>') }} />
                  ) : (
                    <p className="empty-text">Aucun critère spécifique n'a été renseigné pour cet appel.</p>
                  )}
                </div>
              </div>
            </div>

            {/* ==========================================
                SECTION 5 — APPEL À L'ACTION FINAL
               ========================================== */}
            <div className="mobilite-premium-cta animate-fade-in-up" style={{ animationDelay: '0.4s', marginTop: 24 }}>
              <div className="cta-content">
                <h2>Prêt à soumettre votre projet ?</h2>
                <p>N'attendez pas la dernière minute. Préparez vos documents et commencez à remplir votre dossier de candidature dès aujourd'hui.</p>
                {computedStatus === 'ouvert' ? (
                  <button className="btn-primary cta-btn" onClick={() => navigate(`/candidat/appels/${id}/candidature`)}>
                    Déposer ma candidature
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                ) : (
                  <button className="btn-primary cta-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                    Clôturé
                  </button>
                )}
              </div>
              <div className="cta-decoration">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path fill="rgba(255,255,255,0.05)" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.1,-46.3C90.4,-33.5,96,-18,95.4,-2.8C94.7,12.4,87.8,27.3,77.5,38.9C67.2,50.5,53.4,58.8,39.6,65.8C25.8,72.8,11.9,78.5,-2.3,82C-16.5,85.5,-33.1,86.8,-46.5,80.1C-59.9,73.4,-70.2,58.7,-78.7,43.2C-87.2,27.7,-93.8,11.4,-92.9,-4.6C-92,-20.6,-83.5,-36.2,-72,-48.3C-60.5,-60.4,-46.1,-69,-31.8,-75.6C-17.5,-82.2,-3.3,-86.8,10.6,-85.1C24.4,-83.4,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
                </svg>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
