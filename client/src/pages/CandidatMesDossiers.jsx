/* ── CandidatMesDossiers.jsx ────────────────────────────────── */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import candidatService from '../services/candidatService';

const STATUTS = ['brouillon', 'soumis', 'en_examen', 'accepte', 'rejete'];

const STATUTS_LABELS = {
  brouillon: 'Brouillon',
  soumis: 'Soumis',
  en_examen: 'En examen',
  accepte: 'Accepté',
  rejete: 'Refusé'
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function CandidatMesDossiers({ onLogout }) {
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        const res = await candidatService.getMesAppels();
        setDossiers(res.dossiers || []);
      } catch (err) {
        console.error('Erreur chargement dossiers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDossiers();
  }, []);

  const getTimelineIndex = (statut) => {
    if (statut === 'rejete') return 3; // On met rejeté au niveau de l'étape finale
    if (statut === 'accepte') return 3;
    if (statut === 'en_examen') return 2;
    if (statut === 'soumis') return 1;
    return 0; // brouillon
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar activeTab="mes-candidatures" onTabChange={() => {}} role="candidat" />
        <main className="dashboard-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab="mes-candidatures" onTabChange={(tab) => {
        if (tab === 'apercu') navigate('/candidat');
        if (tab === 'opportunites') navigate('/candidat/appels');
        if (tab === 'mes-candidatures') navigate('/candidat/mes-dossiers');
        if (tab === 'mobilite') navigate('/candidat/mobilite');
      }} onLogout={onLogout} role="candidat" />

      <main className="dashboard-main">
        <Topbar title="Mes Candidatures" subtitle="Suivi de vos dossiers" />

        <div className="dashboard-content">
          <div className="content-grid" style={{ paddingBottom: 60 }}>
            
            {dossiers.length === 0 ? (
              <div className="card animate-fade-in-up" style={{ textAlign: 'center', padding: 60 }}>
                <div className="empty-icon" style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
                <h3>Aucun dossier</h3>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>Vous n'avez soumis aucune candidature pour le moment.</p>
                <button className="btn-primary" onClick={() => navigate('/candidat/appels')}>
                  Explorer les appels à projets
                </button>
              </div>
            ) : (
              <div className="dossiers-list">
                {dossiers.map((dossier, i) => {
                  const currentIndex = getTimelineIndex(dossier.statut);
                  const isRejete = dossier.statut === 'rejete';

                  return (
                    <div key={dossier.id} className="card animate-fade-in-up" style={{ marginBottom: 24, animationDelay: `${0.1 * i}s` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, borderBottom: '1px solid var(--color-border-light)', paddingBottom: 16 }}>
                        <div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                            Dossier N° {dossier.id} • Mis à jour le {formatDate(dossier.updatedAt)}
                          </div>
                          <h2 style={{ fontSize: 20, marginBottom: 8, color: 'var(--color-text-primary)' }}>
                            {dossier.appel ? dossier.appel.titre : 'Appel inconnu'}
                          </h2>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <span className="appels-type-badge small">{dossier.type_projet}</span>
                            {dossier.statut === 'brouillon' && (
                              <button onClick={() => navigate(`/candidat/appels/${dossier.appel_id}/candidature`)} className="btn-secondary small" style={{ padding: '4px 12px' }}>
                                Continuer la saisie
                              </button>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Statut actuel</div>
                          <span className="appels-status-badge" style={{
                            background: isRejete ? 'var(--color-red-light)' : (dossier.statut === 'accepte' ? 'var(--color-green-light)' : 'var(--color-primary-light)'),
                            color: isRejete ? 'var(--color-red)' : (dossier.statut === 'accepte' ? 'var(--color-green)' : 'var(--color-primary)'),
                            fontSize: 14, padding: '6px 12px'
                          }}>
                            {STATUTS_LABELS[dossier.statut]}
                          </span>
                        </div>
                      </div>

                      {/* TIMELINE */}
                      <div className="dossier-timeline" style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: 32, padding: '0 20px' }}>
                        {/* Barre de fond */}
                        <div style={{ position: 'absolute', top: 12, left: 40, right: 40, height: 4, background: 'var(--color-border-light)', zIndex: 1, borderRadius: 2 }}></div>
                        {/* Barre de progression */}
                        <div style={{ position: 'absolute', top: 12, left: 40, width: `${(currentIndex / 3) * 100}%`, maxWidth: 'calc(100% - 80px)', height: 4, background: isRejete ? 'var(--color-red)' : 'var(--color-green)', zIndex: 2, transition: 'width 0.5s ease', borderRadius: 2 }}></div>

                        {/* Etapes */}
                        {[
                          { index: 0, label: 'Brouillon' },
                          { index: 1, label: 'Soumis' },
                          { index: 2, label: 'En examen' },
                          { index: 3, label: isRejete ? 'Refusé' : 'Accepté' }
                        ].map(step => {
                          const isActive = step.index <= currentIndex;
                          const isCurrent = step.index === currentIndex;
                          const color = isRejete && isActive && step.index === 3 ? 'var(--color-red)' : (isActive ? 'var(--color-green)' : 'var(--color-border)');
                          const bg = isRejete && isActive && step.index === 3 ? 'var(--color-red-light)' : (isActive ? 'var(--color-green-light)' : 'var(--color-bg-body)');

                          return (
                            <div key={step.index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: 80 }}>
                              <div style={{ 
                                width: 28, height: 28, borderRadius: '50%', background: isActive ? color : 'var(--color-bg-card)',
                                border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', marginBottom: 8, transition: 'all 0.3s ease'
                              }}>
                                {isActive ? (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                ) : (
                                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-border)' }}></span>
                                )}
                              </div>
                              <div style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', textAlign: 'center' }}>
                                {step.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}
