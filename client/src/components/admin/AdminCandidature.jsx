import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, CheckCircle, Clock, XCircle, Eye, Power, Mail, UserX } from 'lucide-react';

export default function AdminCandidature() {
  const [candidatures, setCandidatures] = useState([]);
  const [totalApi, setTotalApi] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(null);

  useEffect(() => {
    fetchCandidatures();
    // eslint-disable-next-line
  }, [page, search, filtreStatut]);

  const fetchCandidatures = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/candidatures', {
        params: { page, search, statut: filtreStatut, limit: 20 }
      });
      setCandidatures(res.data.candidatures);
      setTotalPages(res.data.totalPages);
      setTotalApi(res.data.total);
    } catch (err) {
      console.error('Erreur chargement candidatures:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDesactiver = async (userId) => {
    try {
      await api.put(`/admin/candidatures/${userId}/desactiver`);
      fetchCandidatures();
      if (selectedUser?.id === userId) fetchUserDetails(userId);
    } catch (err) {
      alert("Erreur lors de la désactivation");
    }
  };

  const handleReactiver = async (userId) => {
    try {
      await api.put(`/admin/candidatures/${userId}/reactiver`);
      fetchCandidatures();
      if (selectedUser?.id === userId) fetchUserDetails(userId);
    } catch (err) {
      alert("Erreur lors de la réactivation");
    }
  };

  const handleSupprimer = async (userId) => {
    try {
      await api.delete(`/admin/candidatures/${userId}`);
      setShowConfirmModal(null);
      setShowDetailModal(false);
      fetchCandidatures();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleRenvoyerActivation = async (userId) => {
    try {
      await api.post(`/admin/candidatures/${userId}/renvoyer-activation`);
      alert("Email renvoyé avec succès");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi de l'email");
    }
  };

  const fetchUserDetails = async (id) => {
    try {
      const res = await api.get(`/admin/candidatures/${id}`);
      setSelectedUser(res.data);
      setShowDetailModal(true);
    } catch (err) {
      alert("Erreur chargement détails");
    }
  };

  const formatDateFr = (dateString) => {
    if (!dateString) return <span style={{ opacity: 0.5 }}>—</span>;
    const d = new Date(dateString);
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatDerniereConnexion = (dateString) => {
    if (!dateString) return <span style={{ color: 'var(--color-text-tertiary)', opacity: 0.7 }}>Jamais connecté</span>;
    const d = new Date(dateString);
    const now = new Date();
    const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    
    if (isToday) {
      return `Aujourd'hui à ${d.getHours().toString().padStart(2, '0')}h${d.getMinutes().toString().padStart(2, '0')}`;
    }
    return formatDateFr(dateString);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'actif':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#4CAF50', background: '#4CAF5020' }}><CheckCircle size={14}/> Actif</span>;
      case 'en_attente':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#FFA726', background: '#FFA72620' }}><Clock size={14}/> En attente</span>;
      case 'desactive':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#FF6B6B', background: '#FF6B6B20' }}><XCircle size={14}/> Désactivé</span>;
      case 'supprime':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#9E9E9E', background: '#9E9E9E20' }}><UserX size={14}/> Supprimé</span>;
      default:
        return null;
    }
  };

  const iconButtonStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 8, border: 'none',
    background: 'transparent', cursor: 'pointer', transition: 'all 0.2s',
    color: 'var(--color-text-secondary)',
  };

  const getIconHoverStyle = (e, color) => {
    e.currentTarget.style.background = `${color}20`;
    e.currentTarget.style.color = color;
  };
  const resetIconHoverStyle = (e) => {
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.color = 'var(--color-text-secondary)';
  };

  // Statistiques calculées sur la page courante si on veut coller strictement au "déjà fetchées",
  // ou on utilise le totalApi pour les inscrits totaux.
  const stats = {
    total: totalApi || candidatures.length,
    actifs: candidatures.filter(c => c.statut_compte === 'actif').length,
    attente: candidatures.filter(c => c.statut_compte === 'en_attente').length,
    desactives: candidatures.filter(c => c.statut_compte === 'desactive' || c.statut_compte === 'supprime').length,
  };

  return (
    <div className="content-grid">
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
            Candidats
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 14 }}>
            Gestion de tous les candidats inscrits sur la plateforme.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          {/* Filtre Statut */}
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            style={{
              padding: '10px 16px', borderRadius: 10, border: '1px solid var(--color-border)',
              background: 'var(--color-bg-card)', color: 'var(--color-text-primary)',
              fontSize: 14, outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="en_attente">En attente</option>
            <option value="desactive">Désactivé</option>
          </select>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Rechercher (nom, email)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                paddingLeft: 38, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
                borderRadius: 10, border: '1px solid var(--color-border)',
                background: 'var(--color-bg-card)', color: 'var(--color-text-primary)',
                fontSize: 14, width: 260, outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total candidats inscrits', value: stats.total, icon: Users, color: '#7C5CFC' },
          { label: 'Comptes actifs', value: stats.actifs, icon: CheckCircle, color: '#4CAF50' },
          { label: 'En attente d\'activation', value: stats.attente, icon: Clock, color: '#FFA726' },
          { label: 'Comptes désactivés', value: stats.desactives, icon: XCircle, color: '#FF6B6B' },
        ].map((stat, idx) => (
          <div key={idx} className="card animate-fade-in-up" style={{ 
            padding: 20, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16, 
            background: 'var(--color-bg-card)', 
            border: '1px solid var(--color-border)' 
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `${stat.color}15`, color: stat.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <stat.icon size={24} strokeWidth={2.5}/>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: stat.color, lineHeight: 1.2 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-body)' }}>
                {['Candidat', 'Email / Tél', 'Statut', 'Date Inscription', 'Dernière Connexion', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', fontSize: 11,
                    fontWeight: 700, color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase', letterSpacing: '0.6px',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Chargement...</td>
                </tr>
              ) : candidatures.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Aucun compte trouvé</td>
                </tr>
              ) : candidatures.map((c, i) => {
                return (
                  <tr key={c.id} style={{ borderBottom: i === candidatures.length - 1 ? 'none' : '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>
                      {c.prenom} {c.nom}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{c.email}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{c.telephone || '—'}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {getStatusBadge(c.statut_compte)}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {formatDateFr(c.createdAt)}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {formatDerniereConnexion(c.derniere_connexion)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          title="Détails"
                          onClick={() => fetchUserDetails(c.id)}
                          style={iconButtonStyle}
                          onMouseEnter={(e) => getIconHoverStyle(e, '#7C5CFC')}
                          onMouseLeave={resetIconHoverStyle}
                        >
                          <Eye size={18} />
                        </button>
                        
                        {c.statut_compte === 'en_attente' && (
                          <button
                            title="Renvoyer email d'activation"
                            onClick={() => handleRenvoyerActivation(c.id)}
                            style={iconButtonStyle}
                            onMouseEnter={(e) => getIconHoverStyle(e, '#FFA726')}
                            onMouseLeave={resetIconHoverStyle}
                          >
                            <Mail size={18} />
                          </button>
                        )}
                        
                        {c.statut_compte === 'actif' && (
                          <button
                            title="Désactiver"
                            onClick={() => handleDesactiver(c.id)}
                            style={iconButtonStyle}
                            onMouseEnter={(e) => getIconHoverStyle(e, '#FF6B6B')}
                            onMouseLeave={resetIconHoverStyle}
                          >
                            <Power size={18} />
                          </button>
                        )}

                        {c.statut_compte === 'desactive' && (
                          <button
                            title="Réactiver"
                            onClick={() => handleReactiver(c.id)}
                            style={iconButtonStyle}
                            onMouseEnter={(e) => getIconHoverStyle(e, '#4CAF50')}
                            onMouseLeave={resetIconHoverStyle}
                          >
                            <Power size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Simple */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 8 }}>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary" style={{ padding: '8px 16px' }}>Précédent</button>
        <span style={{ padding: '8px 16px', background: 'var(--color-bg-card)', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
          Page {page} / {totalPages || 1}
        </span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary" style={{ padding: '8px 16px' }}>Suivant</button>
      </div>

      {/* MODAL DÉTAILS */}
      {showDetailModal && selectedUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'var(--color-overlay)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(4px)'
        }}>
          <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: 500, padding: 32, background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, color: 'var(--color-text-primary)' }}>
              Détail du compte
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-light)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: 14 }}>Nom complet</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{selectedUser.prenom} {selectedUser.nom}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-light)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: 14 }}>Email</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{selectedUser.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-light)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: 14 }}>Téléphone</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{selectedUser.telephone || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-light)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: 14 }}>Statut</span>
                {getStatusBadge(selectedUser.est_supprime ? 'supprime' : selectedUser.est_desactive ? 'desactive' : selectedUser.est_active ? 'actif' : 'en_attente')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-light)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: 14 }}>Inscrit le</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{formatDateFr(selectedUser.createdAt)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-light)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: 14 }}>Dernière connexion</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{formatDerniereConnexion(selectedUser.derniere_connexion)}</span>
              </div>
              
              <div style={{ background: 'var(--color-bg-body)', padding: 16, borderRadius: 12, marginTop: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  📊 A déjà soumis un dossier : {selectedUser.statistiques?.a_deja_soumis ? `OUI (${selectedUser.statistiques.nombre_dossiers_appels + selectedUser.statistiques.nombre_dossiers_mobilite})` : 'NON'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              {!selectedUser.est_supprime && (
                <>
                  {selectedUser.est_desactive ? (
                    <button onClick={() => handleReactiver(selectedUser.id)} className="btn-secondary" style={{ color: 'var(--color-green)', borderColor: 'var(--color-green)' }}>Réactiver</button>
                  ) : (
                    <button onClick={() => handleDesactiver(selectedUser.id)} className="btn-secondary" style={{ color: 'var(--color-orange)', borderColor: 'var(--color-orange)' }}>Désactiver</button>
                  )}
                  <button onClick={() => setShowConfirmModal(selectedUser)} className="btn-secondary" style={{ color: 'var(--color-red)', borderColor: 'var(--color-red)' }}>Supprimer</button>
                </>
              )}
              <button onClick={() => setShowDetailModal(false)} className="btn-primary">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM SUPPRESSION */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'var(--color-overlay)', zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(4px)'
        }}>
          <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: 400, padding: 32, textAlign: 'center', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: 'var(--color-text-primary)' }}>Confirmer la suppression</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
              Voulez-vous vraiment supprimer le compte de <strong>{showConfirmModal.prenom} {showConfirmModal.nom}</strong> ? Cette action (soft delete) empêchera toute connexion future.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button onClick={() => setShowConfirmModal(null)} className="btn-secondary">Annuler</button>
              <button onClick={() => handleSupprimer(showConfirmModal.id)} className="btn-primary" style={{ background: 'var(--color-red)' }}>Oui, supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
