import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import adminService from '../../services/adminService';

const Accordion = ({ title, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--color-border)', marginBottom: 16, overflow: 'hidden' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'var(--color-bg-body)', border: 'none', cursor: 'pointer', outline: 'none' }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</h3>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {isOpen && (
        <div style={{ padding: '24px', borderTop: '1px solid var(--color-border-light)' }}>
          {children}
        </div>
      )}
    </div>
  );
};

const getStatusBadge = (statut) => {
  const styles = {
    brouillon:              { bg: '#F5F5F5',   color: '#757575', label: 'Brouillon' },
    soumis:                 { bg: '#E3F2FD',   color: '#1E88E5', label: 'Soumis' },
    en_examen:              { bg: '#FFF3E0',   color: '#F57C00', label: 'En examen' },
    en_examen_conformite:   { bg: '#FFF3E0',   color: '#F57C00', label: 'Vérif. conformité' },
    non_conforme:           { bg: '#FFEBEE',   color: '#E53935', label: 'Non conforme' },
    en_evaluation_contenu:  { bg: '#EDE7F6',   color: '#7C5CFC', label: 'Évaluation contenu' },
    accepte:                { bg: '#E8F5E9',   color: '#43A047', label: 'Accepté' },
    rejete:                 { bg: '#FFEBEE',   color: '#E53935', label: 'Rejeté' },
  };
  const s = styles[statut] || styles.brouillon;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
      {s.label}
    </span>
  );
};

const AdminDetailSoumissionnaire = () => {
  const navigate = useNavigate();
  const { id: candidatId } = useParams();
  const [data, setData] = useState(null);
  const [appels, setAppels] = useState([]);
  const [mobilites, setMobilites] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States pour les panels détaillés de candidatures (désormais remplacés par une redirection directe)

  useEffect(() => {
    fetchData();
  }, [candidatId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getSoumissionnaireById(candidatId);

      if (!res.infos) {
        throw new Error("Profil du candidat introuvable.");
      }

      setData({ candidat: res.infos, statistiques: res.statistiques });
      setAppels(res.dossiers_appels || []);
      setMobilites(res.dossiers_mobilite || []);
      setHistorique([]); // Not returned by backend yet
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error("Erreur détaillée:", err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des détails du candidat.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Chargement des données...</div>;
  }

  if (error) {
    return (
      <div className="content-grid animate-fade-in-up">
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-bg-card)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFEBEE', color: '#E53935', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: 'var(--color-text-primary)' }}>Impossible de charger le dossier</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/admin/soumissionnaires')}>Retour aux soumissionnaires</button>
        </div>
      </div>
    );
  }

  if (!data || !data.candidat) return null;

  const { candidat, statistiques } = data;
  const initiales = `${candidat.prenom?.[0] || ''}${candidat.nom?.[0] || ''}`.toUpperCase() || '?';

  return (
    <div className="content-grid animate-fade-in-up">
      {/* TOPBAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/admin/soumissionnaires')} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Profil de {candidat.prenom} {candidat.nom}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Détail complet</p>
          </div>
        </div>
      </div>

      {/* HEADER CARD */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, padding: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800 }}>
          {initiales}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{candidat.prenom} {candidat.nom}</h3>
          <div style={{ display: 'flex', gap: 16, color: 'var(--color-text-secondary)', fontSize: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> {candidat.email}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> {candidat.telephone || 'Non renseigné'}</span>
          </div>
        </div>
        <div>
           {candidat.est_active ? 
             <span style={{ background: '#E8F5E9', color: '#43A047', padding: '6px 12px', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Compte Actif</span> :
             <span style={{ background: '#FFEBEE', color: '#E53935', padding: '6px 12px', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Compte Inactif</span>
           }
        </div>
      </div>

      {/* STATISTIQUES */}
      <Accordion title={`Statistiques (${statistiques.total_dossiers} dossiers)`}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {[
            { label: 'Total dossiers', value: statistiques.total_dossiers, color: 'var(--color-primary)' },
            { label: 'Acceptés', value: statistiques.acceptes, color: 'var(--color-green)' },
            { label: 'En examen', value: statistiques.en_examen, color: 'var(--color-orange)' },
            { label: 'Rejetés', value: statistiques.rejetes, color: 'var(--color-red)' },
            { label: 'Taux acceptation', value: `${statistiques.taux_acceptation}%`, color: 'var(--color-violet)' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--color-bg-card)', padding: '20px', borderRadius: 12, border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </Accordion>

      {/* APPELS A PROJETS */}
      <Accordion title={`Candidatures aux appels à projets (${appels.length} dossiers)`}>
        {appels.length === 0 ? (
          <p style={{ color: 'var(--color-text-tertiary)' }}>Aucune candidature aux appels à projets.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border-light)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-tertiary)' }}>Appel</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-tertiary)' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-tertiary)' }}>Structure</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-tertiary)' }}>Statut</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-tertiary)' }}>Date Soumission</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-tertiary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appels.map(a => (
                  <React.Fragment key={a.id}>
                    <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td style={{ padding: '12px', fontWeight: 600, fontSize: 14 }}>{a.appel?.titre || 'Appel inconnu'}</td>
                      <td style={{ padding: '12px' }}><span style={{ background: 'var(--color-bg-body)', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{a.type_projet || 'N/A'}</span></td>
                      <td style={{ padding: '12px', fontSize: 14 }}>{a.nom_structure || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{getStatusBadge(a.statut)}</td>
                      <td style={{ padding: '12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>{new Date(a.createdAt).toLocaleDateString('fr-FR')}</td>
                       <td style={{ padding: '12px' }}>
                         <button
                           onClick={() => navigate(`/admin/dossiers/${a.id}`)}
                           style={{
                             display: 'inline-flex', alignItems: 'center', gap: 6,
                             padding: '7px 14px', borderRadius: 8, border: 'none',
                             background: 'linear-gradient(135deg, #4F6AF620, #7C5CFC20)',
                             color: '#7C5CFC', fontWeight: 700, fontSize: 12,
                             cursor: 'pointer', transition: 'all 0.2s',
                           }}
                           onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #4F6AF6, #7C5CFC)'; e.currentTarget.style.color = '#fff'; }}
                           onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #4F6AF620, #7C5CFC20)'; e.currentTarget.style.color = '#7C5CFC'; }}
                         >
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                           Évaluer le dossier
                         </button>
                       </td>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Accordion>

      {/* PROGRAMME DE MOBILITE */}
      <Accordion title={`Candidatures mobilité (${mobilites.length} dossiers)`}>
        {mobilites.length === 0 ? (
          <p style={{ color: 'var(--color-text-tertiary)' }}>Aucune candidature mobilité.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border-light)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-tertiary)' }}>Structure / Artiste</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-tertiary)' }}>Discipline</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-tertiary)' }}>Destination</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-tertiary)' }}>Dates</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-tertiary)' }}>Statut</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-tertiary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mobilites.map(m => (
                  <React.Fragment key={m.id}>
                    <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td style={{ padding: '12px', fontWeight: 600, fontSize: 14 }}>{m.nom_structure || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: 14 }}>{m.discipline || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: 14 }}>{m.pays_destination || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        {m.date_depart ? new Date(m.date_depart).toLocaleDateString() : '?'} → {m.date_retour ? new Date(m.date_retour).toLocaleDateString() : '?'}
                      </td>
                      <td style={{ padding: '12px' }}>{getStatusBadge(m.statut)}</td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => navigate(`/admin/mobilite/candidature/${m.id}`)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '7px 14px', borderRadius: 8, border: 'none',
                            background: 'linear-gradient(135deg, #4F6AF620, #7C5CFC20)',
                            color: '#7C5CFC', fontWeight: 700, fontSize: 12,
                            cursor: 'pointer', transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #4F6AF6, #7C5CFC)'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #4F6AF620, #7C5CFC20)'; e.currentTarget.style.color = '#7C5CFC'; }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          Voir le dossier
                        </button>
                      </td>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Accordion>

      {/* TIMELINE */}
      <Accordion title="Historique & Timeline">
        {historique.length === 0 ? (
          <p style={{ color: 'var(--color-text-tertiary)' }}>Aucun historique disponible.</p>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'var(--color-border)' }}></div>
            {historique.map((event, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: 24 }}>
                <div style={{ position: 'absolute', left: -24, top: 4, width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)', border: '2px solid #fff' }}></div>
                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 600, marginBottom: 4 }}>
                  {new Date(event.date).toLocaleString('fr-FR')}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {event.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </Accordion>

      {/* NOTIFICATIONS */}
      <Accordion title="Communications & Emails">
        {notifications.length === 0 ? (
          <p style={{ color: 'var(--color-text-tertiary)' }}>Aucune communication envoyée.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border-light)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-tertiary)' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-tertiary)' }}>Sujet / Message</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-tertiary)' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-tertiary)' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map(n => (
                  <tr key={n.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>{new Date(n.date_envoi || n.createdAt).toLocaleString('fr-FR')}</td>
                    <td style={{ padding: '12px', fontSize: 14, fontWeight: 600 }}>{n.message}</td>
                    <td style={{ padding: '12px', fontSize: 13 }}>{n.type}</td>
                    <td style={{ padding: '12px' }}>
                      {n.lu ? <span style={{ color: 'var(--color-green)', fontWeight: 600, fontSize: 12 }}>Lu</span> : <span style={{ color: 'var(--color-orange)', fontWeight: 600, fontSize: 12 }}>Non lu</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Accordion>

    </div>
  );
};

export default AdminDetailSoumissionnaire;
