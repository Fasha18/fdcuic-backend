import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const AdminSoumissionnaires = () => {
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCandidat, setSelectedCandidat] = useState(null);

  useEffect(() => { fetchCandidats(); }, []);

  const fetchCandidats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCandidats(1, 100);
      setCandidats(data.candidats || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = candidats.filter(c =>
    `${c.prenom} ${c.nom} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalDossiers = candidats.reduce((acc, c) =>
    acc + (c.nb_dossiers_appel || 0) + (c.nb_dossiers_mobilite || 0), 0
  );
  const avecDossiers = candidats.filter(c =>
    (c.nb_dossiers_appel || 0) + (c.nb_dossiers_mobilite || 0) > 0
  ).length;

  if (loading) return (
    <div className="content-grid">
      {[1,2,3].map(n => (
        <div key={n} className="skeleton" style={{ height: 80, borderRadius: 12, marginBottom: 12 }} />
      ))}
    </div>
  );

  if (error) return (
    <div className="content-grid">
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p style={{ color: 'var(--color-red)', fontWeight: 600 }}>{error}</p>
        <button className="btn-secondary" onClick={fetchCandidats} style={{ marginTop: 16 }}>Réessayer</button>
      </div>
    </div>
  );

  return (
    <div className="content-grid">

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
            Soumissionnaires
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 14 }}>
            Liste de tous les candidats inscrits sur la plateforme
          </p>
        </div>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher un candidat..."
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

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {/* Total candidats */}
        <div className="card animate-fade-in-up" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{candidats.length}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Candidats inscrits</div>
          </div>
        </div>

        {/* Avec dossiers */}
        <div className="card animate-fade-in-up" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, animationDelay: '0.05s' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><polyline points="9 15 12 18 15 15"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{avecDossiers}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avec dossiers</div>
          </div>
        </div>

        {/* Total dossiers */}
        <div className="card animate-fade-in-up" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, animationDelay: '0.1s' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-orange-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-orange)" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{totalDossiers}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total dossiers</div>
          </div>
        </div>
      </div>

      {/* ── TABLE PREMIUM ── */}
      <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden', animationDelay: '0.15s' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Liste des candidats
          </h3>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', background: 'var(--color-bg-body)', padding: '4px 12px', borderRadius: 8 }}>
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-body)' }}>
                {['Candidat', 'Email', 'Téléphone', 'Dossiers Appels', 'Dossiers Mobilité', 'Total', 'Actions'].map(h => (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }}>
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    Aucun candidat trouvé
                  </td>
                </tr>
              ) : filtered.map((c, i) => {
                const total = (c.nb_dossiers_appel || 0) + (c.nb_dossiers_mobilite || 0);
                const initiales = `${c.prenom?.[0] || ''}${c.nom?.[0] || ''}`.toUpperCase();
                const colors = ['var(--color-primary)', 'var(--color-green)', 'var(--color-orange)', 'var(--color-violet)'];
                const bgColors = ['var(--color-primary-light)', 'var(--color-green-light)', 'var(--color-orange-light)', 'var(--color-violet-light)'];
                const colorIdx = c.id % 4;

                return (
                  <tr
                    key={c.id}
                    style={{ borderBottom: i === filtered.length - 1 ? 'none' : '1px solid var(--color-border-light)', transition: 'background 0.15s', cursor: 'pointer' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Candidat */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: bgColors[colorIdx],
                          color: colors[colorIdx],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 13, flexShrink: 0,
                        }}>
                          {initiales || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>
                            {c.prenom} {c.nom}
                          </div>
                          {!c.est_active && (
                            <span style={{ fontSize: 10, color: 'var(--color-red)', fontWeight: 600 }}>Compte inactif</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {c.email}
                    </td>

                    {/* Téléphone */}
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {c.telephone || <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>}
                    </td>

                    {/* Dossiers Appels */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: c.nb_dossiers_appel > 0 ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                        background: c.nb_dossiers_appel > 0 ? 'var(--color-primary-light)' : 'var(--color-bg-body)',
                        padding: '4px 10px', borderRadius: 8,
                      }}>
                        {c.nb_dossiers_appel || 0}
                      </span>
                    </td>

                    {/* Dossiers Mobilité */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: c.nb_dossiers_mobilite > 0 ? 'var(--color-orange)' : 'var(--color-text-tertiary)',
                        background: c.nb_dossiers_mobilite > 0 ? 'var(--color-orange-light)' : 'var(--color-bg-body)',
                        padding: '4px 10px', borderRadius: 8,
                      }}>
                        {c.nb_dossiers_mobilite || 0}
                      </span>
                    </td>

                    {/* Total */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: total > 0 ? 'var(--color-green)' : 'var(--color-text-tertiary)',
                        background: total > 0 ? 'var(--color-green-light)' : 'var(--color-bg-body)',
                        padding: '4px 10px', borderRadius: 8,
                      }}>
                        {total}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => setSelectedCandidat(selectedCandidat?.id === c.id ? null : c)}
                        style={{
                          padding: '7px 14px', borderRadius: 8, border: '1px solid var(--color-border)',
                          background: selectedCandidat?.id === c.id ? 'var(--color-primary)' : 'var(--color-bg-card)',
                          color: selectedCandidat?.id === c.id ? '#fff' : 'var(--color-text-primary)',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        Détails
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── DÉTAILS PANEL (inline expand) ── */}
        {selectedCandidat && (
          <div style={{
            margin: '0 24px 24px', padding: '20px 24px',
            background: 'var(--color-bg-body)', borderRadius: 12,
            border: '1px solid var(--color-border)',
            animation: 'fadeIn 0.2s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Profil de {selectedCandidat.prenom} {selectedCandidat.nom}
              </h4>
              <button
                onClick={() => setSelectedCandidat(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 4 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { label: 'Email', value: selectedCandidat.email },
                { label: 'Téléphone', value: selectedCandidat.telephone || '—' },
                { label: 'Dossiers Appels', value: selectedCandidat.nb_dossiers_appel || 0 },
                { label: 'Dossiers Mobilité', value: selectedCandidat.nb_dossiers_mobilite || 0 },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--color-bg-card)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--color-border-light)' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSoumissionnaires;
