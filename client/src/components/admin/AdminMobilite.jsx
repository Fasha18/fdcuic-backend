import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';

const STATUS_CONFIG = {
  soumis: { color: 'var(--color-primary)', bg: 'var(--color-primary-light)', label: 'Soumis' },
  en_examen: { color: 'var(--color-orange)', bg: 'var(--color-orange-light)', label: 'En examen' },
  accepte: { color: 'var(--color-green)', bg: 'var(--color-green-light)', label: 'Accepté' },
  rejete: { color: 'var(--color-red)', bg: 'var(--color-red-light)', label: 'Rejeté' },
};

const AdminMobilite = () => {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, en_analyse: 0, valides: 0, rejetes: 0 });
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidatures();
  }, [page, search, statutFilter]);

  const fetchCandidatures = async () => {
    try {
      setLoading(true);
      const [data, statsData] = await Promise.all([
        adminService.getCandidaturesMobilite(page, search, statutFilter),
        adminService.getStatsMobilite()
      ]);
      setCandidatures(data.candidatures || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
      if (statsData?.stats) setStats(statsData.stats);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = async (e, id) => {
    e.stopPropagation(); // prevent row click
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette candidature de mobilité ?")) {
      try {
        await adminService.supprimerCandidatureMobilite(id);
        fetchCandidatures();
      } catch (err) {
        alert(err.response?.data?.message || 'Erreur lors de la suppression');
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  if (error) return (
    <div className="content-grid">
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--color-red)', fontWeight: 600 }}>{error}</p>
        <button className="btn-secondary" onClick={fetchCandidatures} style={{ marginTop: 16 }}>Réessayer</button>
      </div>
    </div>
  );

  return (
    <div className="content-grid" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      
      {/* ── LEFT TABLE SECTION ── */}
      <div style={{ flex: '1 1 100%', transition: 'all 0.3s', minWidth: 0 }}>
        
        {/* TOPBAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
              Candidatures Mobilité
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 14 }}>
              Gérez les demandes de financement pour la mobilité internationale
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 12, top: 10, color: 'var(--color-text-tertiary)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ padding: '8px 12px 8px 36px', borderRadius: 8, border: '1px solid var(--color-border)', width: 200, fontSize: 14 }}
              />
            </div>
            
            <select 
              value={statutFilter} 
              onChange={(e) => { setStatutFilter(e.target.value); setPage(1); }}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg-body)', fontSize: 14, outline: 'none' }}
            >
              <option value="">Tous les statuts</option>
              <option value="soumis">Soumis</option>
              <option value="en_examen">En examen</option>
              <option value="accepte">Acceptés</option>
              <option value="rejete">Rejetés</option>
            </select>
          </div>
        </div>

        {/* STATS CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div className="card animate-fade-in-up" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-bg-body)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Total</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{stats.total}</div>
            </div>
          </div>
          <div className="card animate-fade-in-up" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16, animationDelay: '0.05s' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-orange-light)', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>En analyse</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{stats.en_analyse}</div>
            </div>
          </div>
          <div className="card animate-fade-in-up" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16, animationDelay: '0.1s' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-green-light)', color: 'var(--color-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Acceptées</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{stats.valides}</div>
            </div>
          </div>
          <div className="card animate-fade-in-up" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16, animationDelay: '0.15s' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-red-light)', color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Rejetées</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{stats.rejetes}</div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-body)', borderBottom: '1px solid var(--color-border-light)' }}>
                  {['Candidat', 'Structure', 'Discipline', 'Destination', 'Dates', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ padding: 40, textAlign: 'center' }}>
                      <div className="spinner" style={{ margin: '0 auto' }}></div>
                    </td>
                  </tr>
                ) : candidatures.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                      Aucune candidature trouvée.
                    </td>
                  </tr>
                ) : (
                  candidatures.map((c, i) => {
                    const statusInfo = STATUS_CONFIG[c.statut] || { color: '#64748b', bg: '#f1f5f9', label: c.statut };
                    return (
                      <tr 
                        key={c.id} 
                        onClick={() => navigate(`/admin/mobilite/candidature/${c.id}`)}
                        style={{ 
                          borderBottom: i === candidatures.length - 1 ? 'none' : '1px solid var(--color-border-light)', 
                          background: 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 12px', maxWidth: 150 }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.candidat ? `${c.candidat.prenom} ${c.candidat.nom}` : 'Inconnu'}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.candidat?.email}</div>
                        </td>
                        <td style={{ padding: '12px 12px', fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 500, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.nom_structure}
                        </td>
                        <td style={{ padding: '12px 12px', fontSize: 13, color: 'var(--color-text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.discipline}
                        </td>
                        <td style={{ padding: '12px 12px', fontSize: 13, color: 'var(--color-text-secondary)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.pays_destination}
                        </td>
                        <td style={{ padding: '12px 12px', fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                          {new Date(c.date_depart).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} – {new Date(c.date_arrivee).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <span style={{ 
                            fontSize: 12, fontWeight: 600, padding: '6px 10px', borderRadius: 8, 
                            background: statusInfo.bg, color: statusInfo.color,
                            display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusInfo.color }} />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button title="Détails" onClick={(e) => { e.stopPropagation(); navigate(`/admin/mobilite/candidature/${c.id}`); }} style={{ 
                              width: 32, height: 32, borderRadius: 8, border: 'none', 
                              background: 'var(--color-bg-body)', color: 'var(--color-text-secondary)', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                              transition: 'all 0.2s'
                            }} onMouseOver={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-primary-light)'; }} onMouseOut={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'var(--color-bg-body)'; }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            <button title="Supprimer" onClick={(e) => handleDelete(e, c.id)} style={{ 
                              width: 32, height: 32, borderRadius: 8, border: 'none', 
                              background: 'var(--color-bg-body)', color: 'var(--color-text-secondary)', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                              transition: 'all 0.2s'
                            }} onMouseOver={e => { e.currentTarget.style.color = 'var(--color-red)'; e.currentTarget.style.background = 'var(--color-red-light)'; }} onMouseOut={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'var(--color-bg-body)'; }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>Page {page} sur {totalPages}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                  style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-border)', background: page === 1 ? 'var(--color-bg-body)' : 'var(--color-bg-card)', color: page === 1 ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                >
                  Précédent
                </button>
                <button 
                  disabled={page === totalPages} 
                  onClick={() => setPage(p => p + 1)}
                  style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-border)', background: page === totalPages ? 'var(--color-bg-body)' : 'var(--color-bg-card)', color: page === totalPages ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMobilite;
