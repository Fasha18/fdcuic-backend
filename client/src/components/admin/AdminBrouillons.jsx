import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const AdminBrouillons = () => {
  const [brouillons, setBrouillons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBrouillons();
  }, []);

  const fetchBrouillons = async () => {
    try {
      setLoading(true);
      const data = await adminService.getTousDossiers();
      const drafts = (data.dossiers || []).filter(d => d.statut === 'brouillon');
      setBrouillons(drafts);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (error) return (
    <div className="content-grid">
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--color-red)', fontWeight: 600 }}>Erreur : {error}</p>
        <button className="btn-secondary" onClick={fetchBrouillons} style={{ marginTop: 16 }}>Réessayer</button>
      </div>
    </div>
  );

  return (
    <div className="content-grid">
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
            Dossiers Brouillons
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 14 }}>
            Dossiers en cours de rédaction par les candidats, non encore soumis.
          </p>
        </div>
      </div>

      {/* STAT CARD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Total brouillons', value: brouillons.length, borderColor: '#FFB020', color: '#FFB020',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          },
          { label: 'Candidats actifs', value: [...new Set(brouillons.map(b => b.candidat?.id))].filter(Boolean).length, borderColor: '#0144BD', color: '#0144BD',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          },
          { label: 'Étape moy. atteinte', value: brouillons.length > 0 ? (brouillons.reduce((s, b) => s + (b.etape_courante || 1), 0) / brouillons.length).toFixed(1) : '—', borderColor: '#7C5CFC', color: '#7C5CFC',
            icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          },
        ].map((s, idx) => (
          <div key={s.label} className="animate-fade-in-up" style={{
            padding: '20px 20px 20px 16px',
            display: 'flex', alignItems: 'center', gap: 16,
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-light)',
            borderLeft: `4px solid ${s.borderColor}`,
            borderRadius: 12,
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.2s',
            animationDelay: `${idx * 0.06}s`,
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${s.borderColor}18`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden', animationDelay: '0.18s' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>Liste des brouillons</h3>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', background: 'var(--color-bg-body)', padding: '4px 12px', borderRadius: 8 }}>
            {brouillons.length} dossier{brouillons.length > 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-body)' }}>
                {['Candidat', 'Appel à projets', 'Étape courante', 'Dernière modification'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', fontSize: 11,
                    fontWeight: 700, color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                  </td>
                </tr>
              ) : brouillons.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ color: 'var(--color-text-muted)', margin: '0 auto 14px', display: 'block' }}>
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: 15, marginBottom: 6 }}>Aucun brouillon en cours</div>
                      <div style={{ color: 'var(--color-text-tertiary)', fontSize: 13 }}>Tous les candidats ont soumis leurs dossiers ou aucun dossier n'a encore été commencé.</div>
                    </div>
                  </td>
                </tr>
              ) : brouillons.map((dossier, i) => (
                <tr
                  key={dossier.id}
                  style={{ borderBottom: i === brouillons.length - 1 ? 'none' : '1px solid var(--color-border-light)', transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>
                    {dossier.candidat ? `${dossier.candidat.prenom} ${dossier.candidat.nom}` : 'Inconnu'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    {dossier.appel?.titre || <span style={{ opacity: 0.5 }}>N/A</span>}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: '#FFB02018', color: '#FFB020',
                      padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                      Étape {dossier.etape_courante} / 4
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    {formatDate(dossier.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBrouillons;
