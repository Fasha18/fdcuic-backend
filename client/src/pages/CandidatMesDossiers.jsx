import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import candidatService from '../services/candidatService';

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
        const [appelsRes, mobilitesRes] = await Promise.all([
          candidatService.getMesAppels().catch(() => ({ dossiers: [] })),
          candidatService.getMesMobilites().catch(() => ({ projets: [] }))
        ]);

        const appelsList = (appelsRes.dossiers || []).map(d => ({
          ...d,
          isMobilite: false,
          displayTitle: d.appel ? d.appel.titre : 'Appel inconnu',
          displayType: d.type_projet || (d.appel ? d.appel.type_projet : 'Dossier'),
        }));

        const mobilitesList = (mobilitesRes.projets || []).map(m => ({
          ...m,
          isMobilite: true,
          displayTitle: m.nom_structure ? `Mobilité - ${m.nom_structure}` : 'Projet de mobilité',
          displayType: 'Mobilité',
        }));

        const combined = [...appelsList, ...mobilitesList].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setDossiers(combined);
      } catch (err) {
        console.error('Erreur chargement dossiers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDossiers();
  }, []);

  const stats = useMemo(() => {
    return {
      total: dossiers.length,
      soumis: dossiers.filter(d => d.statut === 'soumis').length,
      enAttente: dossiers.filter(d => d.statut === 'en_examen').length,
      acceptes: dossiers.filter(d => d.statut === 'accepte').length,
    };
  }, [dossiers]);

  const getAppelTimeline = (statut) => {
    let currentIndex = 0;
    if (statut === 'soumis') currentIndex = 1;
    if (statut === 'en_examen') currentIndex = 2;
    if (statut === 'accepte' || statut === 'rejete') currentIndex = 3;
    
    return {
      index: currentIndex,
      totalSteps: 3, // 0 to 3
      steps: [
        { label: 'Brouillon' },
        { label: 'Soumis' },
        { label: 'En examen' },
        { label: statut === 'rejete' ? 'Refusé' : 'Accepté' }
      ]
    };
  };

  const getMobiliteTimeline = (statut) => {
    let currentIndex = 0;
    if (statut === 'soumis' || statut === 'en_examen') currentIndex = 1;
    if (statut === 'accepte' || statut === 'rejete') currentIndex = 2;
    
    return {
      index: currentIndex,
      totalSteps: 2, // 0 to 2
      steps: [
        { label: 'Soumission' },
        { label: 'Examen' },
        { label: statut === 'rejete' ? 'Refusé' : 'Décision' }
      ]
    };
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

      <main className="dashboard-main" style={{ background: '#F5F7FB', padding: 0 }}>
        <Topbar title="Mes Candidatures" subtitle="Suivez ici la progression de chacun de vos dossiers soumis, du dépôt jusqu'à la décision finale." />
        <div className="dashboard-content" style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
          
          {/* STATS CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
            <div style={{ background: 'white', borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', borderLeft: '4px solid #7C5CFC', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: 24, fontWeight: 500, color: '#0b1b3a', marginBottom: 4 }}>{stats.total}</span>
              <span style={{ fontSize: 12, color: '#6b7182' }}>Total dossiers</span>
            </div>
            <div style={{ background: 'white', borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', borderLeft: '4px solid #0144BD', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: 24, fontWeight: 500, color: '#0b1b3a', marginBottom: 4 }}>{stats.soumis}</span>
              <span style={{ fontSize: 12, color: '#6b7182' }}>Soumis</span>
            </div>
            <div style={{ background: 'white', borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', borderLeft: '4px solid #FFB020', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: 24, fontWeight: 500, color: '#0b1b3a', marginBottom: 4 }}>{stats.enAttente}</span>
              <span style={{ fontSize: 12, color: '#6b7182' }}>En attente / examen</span>
            </div>
            <div style={{ background: 'white', borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', borderLeft: '4px solid #1baf7a', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: 24, fontWeight: 500, color: '#0b1b3a', marginBottom: 4 }}>{stats.acceptes}</span>
              <span style={{ fontSize: 12, color: '#6b7182' }}>Acceptés</span>
            </div>
          </div>

          <div className="content-grid" style={{ paddingBottom: 60 }}>
            {dossiers.length === 0 ? (
              <div className="card animate-fade-in-up" style={{ textAlign: 'center', padding: 60, borderRadius: 14 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
                <h3 style={{ fontSize: 18, color: '#0b1b3a', marginBottom: 8 }}>Aucun dossier</h3>
                <p style={{ color: '#6b7182', marginBottom: 24 }}>Vous n'avez soumis aucune candidature pour le moment.</p>
                <button className="btn-primary" onClick={() => navigate('/candidat/appels')}>
                  Explorer les appels à projets
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {dossiers.map((dossier, i) => {
                  const isRejete = dossier.statut === 'rejete';
                  const isAccept = dossier.statut === 'accepte';
                  const timeline = dossier.isMobilite ? getMobiliteTimeline(dossier.statut) : getAppelTimeline(dossier.statut);
                  const { index: currentIndex, steps, totalSteps } = timeline;

                  return (
                    <div key={`${dossier.isMobilite ? 'mob' : 'app'}-${dossier.id}`} className="card animate-fade-in-up" style={{ background: 'white', borderRadius: 14, padding: '1.5rem 1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', animationDelay: `${0.05 * i}s` }}>
                      
                      {/* HEADER */}
                      <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 11, color: '#8a90a0', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                          DOSSIER N° {dossier.id} • MIS À JOUR LE {formatDate(dossier.updatedAt)}
                        </div>
                        <h3 style={{ fontSize: 19, fontWeight: 600, color: '#0b1b3a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                          {dossier.displayTitle}
                          {dossier.statut === 'brouillon' && !dossier.isMobilite && (
                            <button onClick={() => navigate(`/candidat/appels/${dossier.appel_id}/candidature`)} className="btn-secondary small" style={{ fontSize: 11, padding: '4px 10px', marginLeft: 'auto' }}>
                              Continuer la saisie
                            </button>
                          )}
                          {dossier.statut === 'brouillon' && dossier.isMobilite && (
                            <button onClick={() => navigate(`/candidat/mobilite`)} className="btn-secondary small" style={{ fontSize: 11, padding: '4px 10px', marginLeft: 'auto' }}>
                              Continuer la saisie
                            </button>
                          )}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7182' }}>
                          {dossier.isMobilite ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFB020" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0144BD" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          )}
                          {dossier.displayType}
                        </div>
                      </div>

                      {/* TRACKER */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: 24, padding: '0 20px' }}>
                        {/* Background line */}
                        <div style={{ position: 'absolute', top: 15, left: 40, right: 40, height: 2, background: '#e2e6ee', zIndex: 1 }}></div>
                        {/* Progress line */}
                        <div style={{ position: 'absolute', top: 15, left: 40, width: `${(currentIndex / totalSteps) * 100}%`, maxWidth: 'calc(100% - 80px)', height: 3, background: isRejete && currentIndex === totalSteps ? '#d64545' : '#0144BD', zIndex: 2, transition: 'width 0.5s ease' }}></div>

                        {steps.map((step, stepIndex) => {
                          const isCompleted = stepIndex < currentIndex;
                          const isCurrent = stepIndex === currentIndex;
                          const isFuture = stepIndex > currentIndex;

                          let circleStyles = {};
                          let labelStyles = { fontSize: 12, marginTop: 10, textAlign: 'center', width: 80 };

                          if (isCompleted) {
                            circleStyles = { width: 30, height: 30, borderRadius: '50%', background: '#1baf7a', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 };
                            labelStyles = { ...labelStyles, color: '#8a90a0' };
                          } else if (isCurrent) {
                            const isFail = isRejete && stepIndex === totalSteps;
                            const isSuccess = isAccept && stepIndex === totalSteps;
                            const currentBg = isFail ? '#d64545' : (isSuccess ? '#1baf7a' : '#0144BD');
                            const currentHalo = isFail ? '0 0 0 4px #FDEBEA' : (isSuccess ? '0 0 0 4px #E1F5EE' : '0 0 0 4px #E6F0FF');
                            
                            circleStyles = { width: 34, height: 34, borderRadius: '50%', background: currentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3, boxShadow: currentHalo };
                            labelStyles = { ...labelStyles, color: currentBg, fontWeight: 700 };
                          } else {
                            circleStyles = { width: 30, height: 30, borderRadius: '50%', background: 'white', border: '2px solid #e2e6ee', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 };
                            labelStyles = { ...labelStyles, color: '#8a90a0' };
                          }

                          return (
                            <div key={stepIndex} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: 80 }}>
                              <div style={circleStyles}>
                                {(isCompleted || (isCurrent && !isFuture)) && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{ marginTop: 1 }}><polyline points="20 6 9 17 4 12"/></svg>
                                )}
                              </div>
                              <div style={labelStyles}>
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
