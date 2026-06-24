import React, { useState, useEffect } from 'react';
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
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  
  const [selectedCandidature, setSelectedCandidature] = useState(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  useEffect(() => {
    fetchCandidatures();
  }, [page, search, statutFilter]);

  const fetchCandidatures = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCandidaturesMobilite(page, search, statutFilter);
      setCandidatures(data.candidatures || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatut) => {
    if (!selectedCandidature) return;
    try {
      setIsChangingStatus(true);
      await adminService.changerStatutMobilite(selectedCandidature.id, newStatut);
      // Update local state to reflect the change
      setSelectedCandidature({ ...selectedCandidature, statut: newStatut });
      fetchCandidatures();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du changement de statut');
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // prevent row click
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette candidature de mobilité ?")) {
      try {
        await adminService.supprimerCandidatureMobilite(id);
        if (selectedCandidature?.id === id) setSelectedCandidature(null);
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
      <div style={{ flex: selectedCandidature ? '1' : '1 1 100%', transition: 'all 0.3s' }}>
        
        {/* TOPBAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
              Candidatures Mobilité
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 14 }}>
              Gérez les demandes de financement pour la mobilité internationale ({totalItems} demandes)
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

        {/* TABLE */}
        <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-body)', borderBottom: '1px solid var(--color-border-light)' }}>
                  {['Candidat', 'Structure', 'Discipline', 'Destination', 'Dates', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
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
                    const isSelected = selectedCandidature?.id === c.id;
                    
                    return (
                      <tr 
                        key={c.id} 
                        onClick={() => setSelectedCandidature(c)}
                        style={{ 
                          borderBottom: i === candidatures.length - 1 ? 'none' : '1px solid var(--color-border-light)', 
                          background: isSelected ? 'var(--color-primary-light)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => { if(!isSelected) e.currentTarget.style.background = 'var(--color-bg-hover)' }}
                        onMouseOut={(e) => { if(!isSelected) e.currentTarget.style.background = 'transparent' }}
                      >
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{c.candidat ? `${c.candidat.prenom} ${c.candidat.nom}` : 'Inconnu'}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{c.candidat?.email}</div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                          {c.nom_structure}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                          {c.discipline}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                          {c.pays_destination}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                          {formatDate(c.date_depart)} → {formatDate(c.date_arrivee)}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ 
                            fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 8, 
                            background: statusInfo.bg, color: statusInfo.color 
                          }}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button style={{ 
                              padding: '6px 12px', borderRadius: 6, border: '1px solid var(--color-border)', 
                              background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', 
                              fontSize: 12, fontWeight: 600, cursor: 'pointer' 
                            }}>
                              Détails
                            </button>
                            <button 
                              onClick={(e) => handleDelete(e, c.id)}
                              style={{ 
                              padding: '6px 12px', borderRadius: 6, border: 'none', 
                              background: 'var(--color-red-light)', color: 'var(--color-red)', 
                              fontSize: 12, fontWeight: 600, cursor: 'pointer' 
                            }}>
                              Supprimer
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

      {/* ── RIGHT DETAIL PANEL ── */}
      {selectedCandidature && (
        <div className="card animate-slide-left" style={{ width: 380, flexShrink: 0, padding: 0, position: 'sticky', top: 24, maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}>
          
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'sticky', top: 0, background: 'var(--color-bg-card)', zIndex: 10 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>Détails de la demande</h3>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Soumise le {formatDate(selectedCandidature.createdAt)}</div>
            </div>
            <button onClick={() => setSelectedCandidature(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            {/* Statut Control */}
            <div style={{ marginBottom: 24, padding: 16, background: 'var(--color-bg-body)', borderRadius: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 12 }}>Gestion du statut</div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedCandidature.statut === 'soumis' && (
                  <>
                    <button disabled={isChangingStatus} onClick={() => handleStatusChange('en_examen')} className="btn-primary" style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}>Passer en examen</button>
                    <button disabled={isChangingStatus} onClick={() => handleStatusChange('rejete')} className="btn-secondary" style={{ flex: 1, padding: '8px 12px', fontSize: 13, background: 'var(--color-red-light)', color: 'var(--color-red)', borderColor: 'var(--color-red-light)' }}>Rejeter</button>
                  </>
                )}
                
                {selectedCandidature.statut === 'en_examen' && (
                  <>
                    <button disabled={isChangingStatus} onClick={() => handleStatusChange('accepte')} className="btn-primary" style={{ flex: 1, padding: '8px 12px', fontSize: 13, background: 'var(--color-green)' }}>Accepter</button>
                    <button disabled={isChangingStatus} onClick={() => handleStatusChange('rejete')} className="btn-secondary" style={{ flex: 1, padding: '8px 12px', fontSize: 13, background: 'var(--color-red-light)', color: 'var(--color-red)', borderColor: 'var(--color-red-light)' }}>Rejeter</button>
                  </>
                )}

                {(selectedCandidature.statut === 'accepte' || selectedCandidature.statut === 'rejete') && (
                  <div style={{ width: '100%', textAlign: 'center', fontSize: 13, fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
                    Statut final atteint.
                  </div>
                )}
              </div>
            </div>

            {/* Info Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <section>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Candidat</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{selectedCandidature.candidat ? `${selectedCandidature.candidat.prenom} ${selectedCandidature.candidat.nom}` : 'Inconnu'}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>{selectedCandidature.candidat?.email}</div>
              </section>

              <section>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Projet</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Structure :</span>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{selectedCandidature.nom_structure}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Discipline :</span>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{selectedCandidature.discipline}</div>
                  </div>
                </div>
              </section>

              <section>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Destination</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{selectedCandidature.pays_destination}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>{selectedCandidature.region_destination || 'Région non spécifiée'}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {formatDate(selectedCandidature.date_depart)} au {formatDate(selectedCandidature.date_arrivee)}
                </div>
              </section>
              
              <section>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Documents</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['doc_ninea', 'doc_recepisse', 'doc_invitation', 'doc_cv_portfolio', 'doc_note_structure'].map(docKey => {
                    if (!selectedCandidature[docKey]) return null;
                    return (
                      <a 
                        key={docKey}
                        href={`https://fdcuic-backend-production.up.railway.app/uploads/${selectedCandidature[docKey]}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--color-bg-body)', borderRadius: 8, textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: 13, transition: 'all 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {docKey.replace('doc_', '').replace('_', ' ')}
                        </span>
                      </a>
                    );
                  })}
                  {!selectedCandidature.doc_ninea && !selectedCandidature.doc_recepisse && !selectedCandidature.doc_invitation && (
                    <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>Aucun document.</div>
                  )}
                </div>
              </section>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMobilite;
