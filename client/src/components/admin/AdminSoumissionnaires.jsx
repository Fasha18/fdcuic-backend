import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Eye, Users, FileSearch, CheckCircle, XCircle } from 'lucide-react';

const statutDossierConfig = {
  soumis: { label: '📩 Soumis', color: '#5C7CFA', bg: '#5C7CFA20' },
  en_examen: { label: '🔍 En examen', color: '#FFA726', bg: '#FFA72620' },
  accepte: { label: '✅ Accepté', color: '#4CAF50', bg: '#4CAF5020' },
  rejete: { label: '❌ Rejeté', color: '#FF6B6B', bg: '#FF6B6B20' }
};

const AdminSoumissionnaires = () => {
  const [soumissionnaires, setSoumissionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSoumissionnaires();
    const interval = setInterval(fetchSoumissionnaires, 30000); // Auto-refresh 30s
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [page, search, filtreStatut]);

  const fetchSoumissionnaires = async () => {
    try {
      const res = await api.get('/admin/soumissionnaires', {
        params: { page, search, statut: filtreStatut, limit: 20 }
      });
      setSoumissionnaires(res.data.soumissionnaires);
      setTotalPages(res.data.totalPages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading && soumissionnaires.length === 0) return (
    <div className="content-grid">
      {[1,2,3].map(n => (
        <div key={n} className="skeleton" style={{ height: 80, borderRadius: 12, marginBottom: 12 }} />
      ))}
    </div>
  );

  if (error && soumissionnaires.length === 0) return (
    <div className="content-grid">
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p style={{ color: 'var(--color-red)', fontWeight: 600 }}>{error}</p>
        <button className="btn-secondary" onClick={fetchSoumissionnaires} style={{ marginTop: 16 }}>Réessayer</button>
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
            Liste des candidats ayant soumis au moins un dossier d'appel à projets ou de mobilité.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          {/* Filtre Statut */}
          <select
            value={filtreStatut}
            onChange={(e) => { setFiltreStatut(e.target.value); setPage(1); }}
            style={{
              padding: '10px 16px', borderRadius: 10, border: '1px solid var(--color-border)',
              background: 'var(--color-bg-card)', color: 'var(--color-text-primary)',
              fontSize: 14, outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="">Tous les statuts</option>
            <option value="soumis">Soumis</option>
            <option value="en_examen">En examen</option>
            <option value="accepte">Accepté</option>
            <option value="rejete">Rejeté</option>
          </select>

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
              onChange={e => { setSearch(e.target.value); setPage(1); }}
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
          { label: 'Total candidats', value: soumissionnaires.length, icon: Users, color: '#7C5CFC', borderColor: '#7C5CFC' },
          { label: 'Dossiers en examen', value: soumissionnaires.filter(s => s.dernier_statut === 'en_examen').length, icon: FileSearch, color: '#FFB020', borderColor: '#FFB020' },
          { label: 'Dossiers acceptés', value: soumissionnaires.filter(s => s.dernier_statut === 'accepte').length, icon: CheckCircle, color: '#1baf7a', borderColor: '#1baf7a' },
          { label: 'Dossiers rejetés', value: soumissionnaires.filter(s => s.dernier_statut === 'rejete').length, icon: XCircle, color: '#ef4444', borderColor: '#ef4444' },
        ].map((stat, idx) => (
          <div key={idx} className="animate-fade-in-up" style={{ 
            padding: '20px 20px 20px 16px',
            display: 'flex', 
            alignItems: 'center', 
            gap: 16,
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border-light)',
            borderLeft: `4px solid ${stat.borderColor}`,
            borderRadius: 12,
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.2s',
            animationDelay: `${idx * 0.06}s`,
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: `${stat.borderColor}18`, color: stat.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <stat.icon size={22} strokeWidth={2}/>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: 3 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── TABLE PREMIUM ── */}
      <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-card)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Liste des candidats
          </h3>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', background: 'var(--color-bg-body)', padding: '4px 12px', borderRadius: 8 }}>
            {soumissionnaires.length} résultat{soumissionnaires.length > 1 ? 's' : ''} (page {page})
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-body)' }}>
                {['Candidat', 'Email', 'Nb Dossiers', 'Dernier Statut', 'Date Dernière Soumission', 'Actions'].map(h => (
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
              {soumissionnaires.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }}>
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    Aucun candidat trouvé
                  </td>
                </tr>
              ) : soumissionnaires.map((c, i) => {
                const total = c.nombre_dossiers + c.nombre_mobilites;
                const initiales = `${c.prenom?.[0] || ''}${c.nom?.[0] || ''}`.toUpperCase();
                const colors = ['var(--color-primary)', 'var(--color-green)', 'var(--color-orange)', 'var(--color-violet)'];
                const bgColors = ['var(--color-primary-light)', 'var(--color-green-light)', 'var(--color-orange-light)', 'var(--color-violet-light)'];
                const colorIdx = c.id % 4;
                
                const statutConf = statutDossierConfig[c.dernier_statut] || { label: c.dernier_statut || '—', color: '#999', bg: '#f0f0f0' };

                return (
                  <tr
                    key={c.id}
                    style={{ borderBottom: i === soumissionnaires.length - 1 ? 'none' : '1px solid var(--color-border-light)', transition: 'background 0.15s', cursor: 'pointer' }}
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
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {c.email}
                    </td>

                    {/* Nb Dossiers */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: total > 0 ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                        background: total > 0 ? 'var(--color-primary-light)' : 'var(--color-bg-body)',
                        padding: '4px 10px', borderRadius: 8,
                      }}>
                        {total}
                      </span>
                    </td>

                    {/* Dernier Statut */}
                    <td style={{ padding: '14px 16px' }}>
                      {c.dernier_statut ? (
                        <span style={{
                          padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                          color: statutConf.color, background: statutConf.bg, whiteSpace: 'nowrap'
                        }}>
                          {statutConf.label}
                        </span>
                      ) : '—'}
                    </td>

                    {/* Date Dernière Soumission */}
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {formatDate(c.derniere_soumission)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          title="Voir les détails"
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/soumissionnaires/${c.id}`); }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 32, height: 32, borderRadius: 8, border: 'none',
                            background: 'transparent', cursor: 'pointer', transition: 'all 0.2s',
                            color: 'var(--color-text-secondary)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#7C5CFC20';
                            e.currentTarget.style.color = '#7C5CFC';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--color-text-secondary)';
                          }}
                        >
                          <Eye size={18} />
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

      {/* Pagination Simple */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 8 }}>
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary" style={{ padding: '8px 16px' }}>Précédent</button>
        <span style={{ padding: '8px 16px', background: 'var(--color-bg-card)', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
          Page {page} / {totalPages || 1}
        </span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary" style={{ padding: '8px 16px' }}>Suivant</button>
      </div>

    </div>
  );
};

export default AdminSoumissionnaires;
