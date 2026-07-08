import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import SecteurModal from './SecteurModal';

const SECTEUR_COLORS = [
  { color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
  { color: 'var(--color-green)', bg: 'var(--color-green-light)' },
  { color: 'var(--color-orange)', bg: 'var(--color-orange-light)' },
  { color: 'var(--color-violet)', bg: 'var(--color-violet-light)' },
];

const AdminSecteurs = () => {
  const [secteurs, setSecteurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSecteur, setSelectedSecteur] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  const userRole = JSON.parse(localStorage.getItem('user'))?.role;
  const isEvaluateur = userRole === 'evaluateur';

  useEffect(() => { fetchSecteurs(); }, []);

  const fetchSecteurs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSecteurs();
      setSecteurs(data.secteurs || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.supprimerSecteur(id);
      setConfirmDelete(null);
      fetchSecteurs();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  const totalDossiers = secteurs.reduce((acc, s) => acc + (s.total_dossiers || 0), 0);
  const totalCandidats = secteurs.reduce((acc, s) => acc + (s.total_candidats || 0), 0);
  const secteursActifs = secteurs.filter(s => s.actif).length;
  const topSecteur = [...secteurs].sort((a, b) => (b.total_dossiers || 0) - (a.total_dossiers || 0))[0];

  if (loading) return (
    <div className="content-grid">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[1,2,3,4].map(n => <div key={n} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[1,2,3,4,5,6].map(n => <div key={n} className="skeleton" style={{ height: 140, borderRadius: 12 }} />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="content-grid">
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--color-red)', fontWeight: 600 }}>{error}</p>
        <button className="btn-secondary" onClick={fetchSecteurs} style={{ marginTop: 16 }}>Réessayer</button>
      </div>
    </div>
  );

  return (
    <div className="content-grid">

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
            Secteurs d'activité
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 14 }}>
            Gérez les secteurs pour les appels à projets
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Toggle vue */}
          <div style={{ display: 'flex', background: 'var(--color-bg-body)', borderRadius: 10, padding: 4, border: '1px solid var(--color-border)' }}>
            {[
              { id: 'cards', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
              { id: 'table', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
            ].map(v => (
              <button key={v.id} onClick={() => setViewMode(v.id)} style={{
                width: 34, height: 30, borderRadius: 7, border: 'none', cursor: 'pointer',
                background: viewMode === v.id ? 'var(--color-bg-card)' : 'transparent',
                color: viewMode === v.id ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: viewMode === v.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
              }}>{v.icon}</button>
            ))}
          </div>
          {!isEvaluateur && (
            <button
              className="btn-primary"
              style={{ padding: '10px 20px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => { setSelectedSecteur(null); setIsModalOpen(true); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Ajouter un secteur
            </button>
          )}
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total secteurs', value: secteurs.length, color: 'var(--color-primary)', bg: 'var(--color-primary-light)',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg> },
          { label: 'Actifs', value: secteursActifs, color: 'var(--color-green)', bg: 'var(--color-green-light)',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: 'Total dossiers', value: totalDossiers, color: 'var(--color-orange)', bg: 'var(--color-orange-light)',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-orange)" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
          { label: 'Total candidats', value: totalCandidats, color: 'var(--color-violet)', bg: 'var(--color-violet-light)',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet)" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
        ].map((s, i) => (
          <div key={s.label} className="card animate-fade-in-up" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, animationDelay: `${i * 0.05}s` }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── VUE CARDS ── */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {secteurs.map((secteur, i) => {
            const colorConf = SECTEUR_COLORS[i % SECTEUR_COLORS.length];
            const maxDossiers = Math.max(...secteurs.map(s => s.total_dossiers || 0), 1);
            const pct = Math.round(((secteur.total_dossiers || 0) / maxDossiers) * 100);
            const isTop = topSecteur?.id === secteur.id && (secteur.total_dossiers || 0) > 0;

            return (
              <div
                key={secteur.id}
                className="card animate-fade-in-up"
                style={{
                  padding: '20px 22px', position: 'relative', overflow: 'hidden',
                  animationDelay: `${i * 0.04}s`,
                  border: isTop ? `2px solid ${colorConf.color}` : '1px solid var(--color-border)',
                  transition: 'all 0.25s',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
              >
                {isTop && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                    background: colorConf.bg, color: colorConf.color, textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>⭐ Top</div>
                )}

                {/* Icône + Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: colorConf.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-icons" style={{ fontSize: 18 }}>
                      {secteur.icone || 'category'}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)' }}>{secteur.nom}</div>
                    <code style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontFamily: 'monospace' }}>{secteur.code}</code>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <div style={{ flex: 1, background: 'var(--color-bg-body)', padding: '10px 12px', borderRadius: 9 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{secteur.total_dossiers || 0}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 600, marginTop: 2 }}>DOSSIERS</div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--color-bg-body)', padding: '10px 12px', borderRadius: 9 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{secteur.total_candidats || 0}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 600, marginTop: 2 }}>CANDIDATS</div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Activité relative</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: colorConf.color }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--color-bg-body)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: colorConf.color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                  </div>
                </div>

                {/* Statut + Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 7,
                    background: secteur.actif ? 'var(--color-green-light)' : 'var(--color-red-light)',
                    color: secteur.actif ? 'var(--color-green)' : 'var(--color-red)',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: secteur.actif ? 'var(--color-green)' : 'var(--color-red)', display: 'inline-block' }} />
                    {secteur.actif ? 'Actif' : 'Inactif'}
                  </span>
                  {!isEvaluateur && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => { setSelectedSecteur(secteur); setIsModalOpen(true); }}
                        style={{
                          padding: '6px 12px', borderRadius: 7, border: '1px solid var(--color-border)',
                          background: 'var(--color-bg-card)', color: 'var(--color-primary)',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => setConfirmDelete(secteur.id)}
                        style={{
                          width: 30, height: 30, borderRadius: 7, border: '1px solid var(--color-border)',
                          background: 'var(--color-bg-card)', color: 'var(--color-red)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── VUE TABLE ── */}
      {viewMode === 'table' && (
        <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border-light)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>Tous les secteurs</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-body)' }}>
                {['Icône', 'Nom', 'Code', 'Dossiers', 'Candidats', 'Activité', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {secteurs.map((s, i) => {
                const colorConf = SECTEUR_COLORS[i % SECTEUR_COLORS.length];
                const maxDossiers = Math.max(...secteurs.map(x => x.total_dossiers || 0), 1);
                const pct = Math.round(((s.total_dossiers || 0) / maxDossiers) * 100);
                return (
                  <tr key={s.id} style={{ borderBottom: i === secteurs.length - 1 ? 'none' : '1px solid var(--color-border-light)', transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="material-icons" style={{ width: 34, height: 34, borderRadius: 9, background: colorConf.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                          {s.icone || 'category'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>{s.nom}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <code style={{ fontSize: 12, color: 'var(--color-text-tertiary)', background: 'var(--color-bg-body)', padding: '3px 8px', borderRadius: 6 }}>{s.code}</code>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: (s.total_dossiers || 0) > 0 ? 'var(--color-primary)' : 'var(--color-text-tertiary)', background: (s.total_dossiers || 0) > 0 ? 'var(--color-primary-light)' : 'var(--color-bg-body)', padding: '4px 10px', borderRadius: 8 }}>
                        {s.total_dossiers || 0}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600 }}>{s.total_candidats || 0}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 80, height: 5, background: 'var(--color-bg-body)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: colorConf.color, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: colorConf.color }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 7, background: s.actif ? 'var(--color-green-light)' : 'var(--color-red-light)', color: s.actif ? 'var(--color-green)' : 'var(--color-red)' }}>
                        {s.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {!isEvaluateur && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { setSelectedSecteur(s); setIsModalOpen(true); }} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Modifier</button>
                          <button onClick={() => setConfirmDelete(s.id)} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── CONFIRM DELETE ── */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ padding: 32, maxWidth: 400, width: '90%', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Supprimer ce secteur ?</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>Cette action est irréversible. Les dossiers liés ne seront pas supprimés.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--color-red)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <SecteurModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedSecteur(null); }}
        onSaveSuccess={() => { setIsModalOpen(false); setSelectedSecteur(null); fetchSecteurs(); }}
        secteur={selectedSecteur}
      />
    </div>
  );
};

export default AdminSecteurs;
