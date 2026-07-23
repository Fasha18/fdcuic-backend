import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import PersonnelModal from './PersonnelModal';

const ROLE_CONFIG = {
  admin: { label: 'Admin', color: 'var(--color-violet)', bg: 'var(--color-violet-light)' },
  evaluateur: { label: 'Évaluateur', color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
};

const AdminPersonnel = () => {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchPersonnel(); }, []);

  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPersonnel();
      setPersonnel(data.personnel || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.supprimerPersonnel(id);
      setConfirmDelete(null);
      fetchPersonnel();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  const nbAdmins = personnel.filter(u => u.role === 'admin').length;
  const nbEvaluateurs = personnel.filter(u => u.role === 'evaluateur').length;
  const nbActifs = personnel.filter(u => u.est_active).length;

  if (loading) return (
    <div className="content-grid">
      {[1, 2, 3].map(n => (
        <div key={n} className="skeleton" style={{ height: 80, borderRadius: 12, marginBottom: 12 }} />
      ))}
    </div>
  );

  if (error) return (
    <div className="content-grid">
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--color-red)', fontWeight: 600 }}>{error}</p>
        <button className="btn-secondary" onClick={fetchPersonnel} style={{ marginTop: 16 }}>Réessayer</button>
      </div>
    </div>
  );

  return (
    <div className="content-grid">

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
            Personnel FDCUIC
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 14 }}>
            Gérez les administrateurs et évaluateurs de la plateforme
          </p>
        </div>
        <button
          className="btn-primary"
          style={{ padding: '10px 20px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter membre
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          {
            label: 'Total membres', value: personnel.length, borderColor: '#0144BD', color: 'var(--color-primary)',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          },
          {
            label: 'Admins', value: nbAdmins, borderColor: '#7C5CFC', color: 'var(--color-violet)',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-violet)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          },
          {
            label: 'Actifs', value: nbActifs, borderColor: '#1baf7a', color: 'var(--color-green)',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          },
        ].map((s, i) => (
          <div key={s.label} className="animate-fade-in-up" style={{
            padding: '20px 20px 20px 16px', display: 'flex', alignItems: 'center', gap: 16,
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-light)',
            borderLeft: `4px solid ${s.borderColor}`,
            borderRadius: 12, boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.2s', animationDelay: `${i * 0.05}s`,
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${s.borderColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── TABLE PREMIUM ── */}
      <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden', animationDelay: '0.15s' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border-light)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>Membres de l'équipe</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-body)' }}>
                {['Membre', 'Email', 'Rôle', 'Actions effectuées', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', fontSize: 11,
                    fontWeight: 700, color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase', letterSpacing: '0.6px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {personnel.map((user, i) => {
                const roleConf = ROLE_CONFIG[user.role] || { label: user.role, color: 'var(--color-text-secondary)', bg: 'var(--color-bg-body)' };
                const initiales = `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase();

                return (
                  <tr
                    key={user.id}
                    style={{ borderBottom: i === personnel.length - 1 ? 'none' : '1px solid var(--color-border-light)', transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Membre */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: roleConf.bg, color: roleConf.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 13, flexShrink: 0,
                        }}>
                          {initiales || '?'}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>
                          {user.prenom} {user.nom}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {user.email}
                    </td>

                    {/* Rôle */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 8,
                        background: roleConf.bg, color: roleConf.color,
                        textTransform: 'capitalize',
                      }}>
                        {roleConf.label}
                      </span>
                    </td>

                    {/* Actions effectuées */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: user.nb_actions > 0 ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                        background: user.nb_actions > 0 ? 'var(--color-primary-light)' : 'var(--color-bg-body)',
                        padding: '4px 10px', borderRadius: 8,
                      }}>
                        {user.nb_actions || 0}
                      </span>
                    </td>

                    {/* Statut */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: user.est_active ? 'var(--color-green)' : 'var(--color-red)',
                          display: 'inline-block',
                          boxShadow: user.est_active ? '0 0 0 3px var(--color-green-light)' : 'none',
                        }} />
                        <span style={{
                          fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 8,
                          background: user.est_active ? 'var(--color-green-light)' : 'var(--color-red-light)',
                          color: user.est_active ? 'var(--color-green)' : 'var(--color-red)',
                        }}>
                          {user.est_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                          style={{
                            padding: '7px 14px', borderRadius: 8,
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-card)',
                            color: 'var(--color-primary)',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseOver={e => { e.currentTarget.style.background = 'var(--color-primary-light)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'var(--color-bg-card)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => setConfirmDelete(user.id)}
                          style={{
                            width: 34, height: 34, borderRadius: 8,
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-card)',
                            color: 'var(--color-red)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s',
                          }}
                          onMouseOver={e => { e.currentTarget.style.background = 'var(--color-red-light)'; e.currentTarget.style.borderColor = 'var(--color-red)'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'var(--color-bg-card)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CONFIRM DELETE ── */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div className="card" style={{ padding: 32, maxWidth: 400, width: '90%', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Confirmer la suppression</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>
              Cette action est irréversible. Le membre sera définitivement supprimé.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--color-red)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <PersonnelModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
        onSaveSuccess={() => { setIsModalOpen(false); setSelectedUser(null); fetchPersonnel(); }}
        user={selectedUser}
      />
    </div>
  );
};

export default AdminPersonnel;
