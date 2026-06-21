/* ── CandidatAppels.jsx ───────────────────────────────────── */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import candidatService from '../services/candidatService';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getAppelStatus = (appel) => {
  const now = new Date();
  const debut = new Date(appel.date_debut);
  const fin = new Date(appel.date_fin);

  if (appel.statut === 'fermé') return 'cloture';
  if (debut > now) return 'a_venir';
  if (fin < now) return 'cloture';
  return 'ouvert';
};

const daysRemaining = (dateFin) => {
  const now = new Date();
  const end = new Date(dateFin);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff;
};

export default function CandidatAppels({ onLogout }) {
  const navigate = useNavigate();
  const [appels, setAppels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAppels = async () => {
      setLoading(true);
      try {
        const res = await candidatService.getTousAppels();
        setAppels(res.appels || []);
      } catch (err) {
        console.error('Erreur chargement appels:', err);
      }
      setLoading(false);
    };
    fetchAppels();
  }, []);

  const appelsWithStatus = useMemo(() => {
    return appels.map(a => ({ ...a, computedStatus: getAppelStatus(a) }));
  }, [appels]);

  const stats = useMemo(() => {
    const ouverts = appelsWithStatus.filter(a => a.computedStatus === 'ouvert').length;
    const aVenir = appelsWithStatus.filter(a => a.computedStatus === 'a_venir').length;
    const clotures = appelsWithStatus.filter(a => a.computedStatus === 'cloture').length;
    return { ouverts, aVenir, clotures, total: appelsWithStatus.length };
  }, [appelsWithStatus]);

  const filtered = useMemo(() => {
    let list = appelsWithStatus;
    if (filter !== 'tous') {
      list = list.filter(a => a.computedStatus === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.titre?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.type_projet?.toLowerCase().includes(q)
      );
    }
    // Sort by status: ouvert first, then a_venir, then cloture
    const statusOrder = { ouvert: 1, a_venir: 2, cloture: 3 };
    list.sort((a, b) => statusOrder[a.computedStatus] - statusOrder[b.computedStatus]);

    return list;
  }, [appelsWithStatus, filter, search]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar activeTab="opportunites" onTabChange={() => {}} role="candidat" />
        <main className="dashboard-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab="opportunites" onTabChange={(tab) => {
        if (tab === 'apercu') navigate('/candidat');
        if (tab === 'opportunites') navigate('/candidat/appels');
        if (tab === 'mes-candidatures') navigate('/candidat/mes-dossiers');
        if (tab === 'mobilite') navigate('/candidat/mobilite');
      }} onLogout={onLogout} role="candidat" />

      <main className="dashboard-main">
        <Topbar
          title="Appels à Projets"
          subtitle="Explorez toutes les opportunités disponibles"
          searchTerm={search}
          onSearchChange={setSearch}
        />

        <div className="dashboard-content">
          <style>{`
            .appels-stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 24px;
              margin-bottom: 32px;
            }
            .appels-stat-card {
              background: var(--color-bg-card);
              border-radius: var(--radius-lg);
              padding: 24px;
              border: 1px solid var(--color-border);
              box-shadow: var(--shadow-sm);
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              justify-content: center;
              transition: var(--transition-base);
            }
            .appels-stat-card:hover {
              transform: translateY(-2px);
              box-shadow: var(--shadow-md);
            }
            .appels-stat-card.primary {
              background: var(--color-primary-light);
              border-color: var(--color-primary);
              color: var(--color-primary-dark);
            }
            .appels-stat-value {
              font-size: 32px;
              font-weight: 800;
              line-height: 1.2;
              margin-bottom: 8px;
            }
            .appels-stat-label {
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              opacity: 0.8;
            }
            
            .appels-filter-tabs {
              display: flex;
              gap: 12px;
              margin-bottom: 32px;
              flex-wrap: wrap;
            }
            .appels-tab {
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              border: 1px solid var(--color-border);
              background: var(--color-bg-card);
              color: var(--color-text-secondary);
              cursor: pointer;
              transition: var(--transition-base);
            }
            .appels-tab:hover {
              background: var(--color-bg-hover);
            }
            .appels-tab.active {
              background: var(--color-primary);
              color: white;
              border-color: var(--color-primary);
              box-shadow: 0 4px 12px rgba(79, 106, 246, 0.2);
            }

            .appels-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 24px;
            }
            .appel-card {
              background: var(--color-bg-card);
              border-radius: var(--radius-lg);
              padding: 24px;
              border: 1px solid var(--color-border);
              box-shadow: var(--shadow-sm);
              display: flex;
              flex-direction: column;
              transition: var(--transition-base);
              position: relative;
              overflow: hidden;
            }
            .appel-card:hover {
              transform: translateY(-4px);
              box-shadow: var(--shadow-md);
              border-color: var(--color-border-focus);
            }
            .appel-card.ouvert {
              border: 2px solid var(--color-primary);
              box-shadow: 0 8px 32px rgba(79, 106, 246, 0.15);
              transform: translateY(-2px);
            }
            .appel-card.ouvert:hover {
              transform: translateY(-6px);
              box-shadow: 0 16px 48px rgba(79, 106, 246, 0.25);
            }
            .appel-card-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 16px;
            }
            .appel-card-icon {
              width: 40px;
              height: 40px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: var(--color-bg-hover);
              color: var(--color-text-primary);
            }
            .appel-card-icon.green { background: var(--color-green-light); color: var(--color-green); }
            .appel-card-icon.orange { background: var(--color-orange-light); color: var(--color-orange); }
            .appel-card-icon.grey { background: var(--color-border-light); color: var(--color-text-secondary); }

            .appel-card-img {
              width: calc(100% + 48px);
              margin: -24px -24px 20px -24px;
              height: 160px;
              object-fit: cover;
              display: block;
              border-radius: var(--radius-lg) var(--radius-lg) 0 0;
            }
            .appel-card-no-img {
              width: calc(100% + 48px);
              margin: -24px -24px 20px -24px;
              height: 120px;
              border-radius: var(--radius-lg) var(--radius-lg) 0 0;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 36px;
              position: relative;
              overflow: hidden;
            }
            .appel-card-no-img::after {
              content: '';
              position: absolute;
              inset: 0;
              background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.05) 10px,
                rgba(255,255,255,0.05) 20px
              );
            }
            
            .appels-status-badge {
              font-size: 12px;
              font-weight: 700;
              padding: 4px 10px;
              border-radius: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .appels-status-badge.open { background: var(--color-green-light); color: var(--color-green); }
            .appels-status-badge.upcoming { background: var(--color-orange-light); color: var(--color-orange); }
            .appels-status-badge.closed { background: var(--color-red-light); color: var(--color-red); }
            
            .appel-card-title {
              font-size: 18px;
              font-weight: 700;
              color: var(--color-text-primary);
              margin-bottom: 8px;
              line-height: 1.4;
            }
            .appel-card-desc {
              font-size: 14px;
              color: var(--color-text-secondary);
              line-height: 1.5;
              margin-bottom: 24px;
              flex: 1;
            }
            .appel-card-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-top: 16px;
              border-top: 1px solid var(--color-border-light);
            }
            .appel-card-date {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 13px;
              font-weight: 500;
              color: var(--color-text-secondary);
            }
            .appel-days-badge {
              font-size: 12px;
              font-weight: 600;
              color: var(--color-primary);
              background: var(--color-primary-light);
              padding: 4px 10px;
              border-radius: 12px;
            }
          `}</style>
          <div className="content-grid" style={{ paddingBottom: 60 }}>

            {/* STATS */}
            <div className="appels-stats-grid animate-fade-in-up">
              <div className="appels-stat-card primary">
                <div className="appels-stat-value">{stats.ouverts}</div>
                <div className="appels-stat-label">Appels Ouverts</div>
              </div>
              <div className="appels-stat-card">
                <div className="appels-stat-value">{stats.aVenir}</div>
                <div className="appels-stat-label">À venir</div>
              </div>
              <div className="appels-stat-card">
                <div className="appels-stat-value">{stats.clotures}</div>
                <div className="appels-stat-label">Clôturés</div>
              </div>
            </div>

            {/* TABS */}
            <div className="appels-filter-tabs">
              {[
                { id: 'tous', label: 'Tous' },
                { id: 'ouvert', label: 'Ouverts' },
                { id: 'a_venir', label: 'À venir' },
                { id: 'cloture', label: 'Clôturés' },
              ].map(f => (
                <button
                  key={f.id}
                  className={`appels-tab ${filter === f.id ? 'active' : ''}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* GRID */}
            {filtered.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                <div className="empty-icon">🔍</div>
                <h3>Aucun appel trouvé</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>Essayez de modifier vos filtres ou votre recherche.</p>
              </div>
            ) : (
              <div className="appels-grid">
                {filtered.map((appel, idx) => {
                  const isOuvert = appel.computedStatus === 'ouvert';
                  const isAVenir = appel.computedStatus === 'a_venir';
                  const days = daysRemaining(appel.date_fin);

                  return (
                    <div
                      key={appel.id}
                      className={`card appel-card animate-fade-in-up ${isOuvert ? 'ouvert' : ''}`}
                      style={{ cursor: 'pointer', animationDelay: `${0.05 * (idx % 8)}s`, padding: 24 }}
                      onClick={() => navigate(`/candidat/appels/${appel.id}`)}
                    >
                      {/* IMAGE ou PLACEHOLDER */}
                      {appel.image_couverture ? (
                        <img
                          className="appel-card-img"
                          src={`https://fdcuic-backend-production.up.railway.app/uploads/${appel.image_couverture}`}
                          alt={appel.titre}
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      {/* Fallback visuel coloré */}
                      <div
                        className="appel-card-no-img"
                        style={{
                          display: appel.image_couverture ? 'none' : 'flex',
                          background: isOuvert
                            ? 'linear-gradient(135deg, #4F6AF6 0%, #3B5BDB 100%)'
                            : isAVenir
                            ? 'linear-gradient(135deg, #F59F00 0%, #E08C00 100%)'
                            : 'linear-gradient(135deg, #868e96 0%, #495057 100%)',
                        }}
                      >
                        <span style={{ position: 'relative', zIndex: 1 }}>
                          {isOuvert ? '📋' : isAVenir ? '🕐' : '🔒'}
                        </span>
                      </div>

                      <div className="appel-card-header">
                        <div className={`appel-card-icon ${isOuvert ? 'green' : isAVenir ? 'orange' : 'grey'}`}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                          </svg>
                        </div>
                        <span className={`appels-status-badge ${isOuvert ? 'open' : isAVenir ? 'upcoming' : 'closed'}`}>
                          {isOuvert ? 'Ouvert' : isAVenir ? 'À venir' : 'Clôturé'}
                        </span>
                      </div>

                      <h3 className="appel-card-title">{appel.titre}</h3>
                      <p className="appel-card-desc">
                        {appel.description
                          ? (appel.description.length > 100 ? appel.description.substring(0, 100) + '...' : appel.description)
                          : 'Aucune description fournie.'}
                      </p>

                      <div className="appel-card-footer">
                        <div className="appel-card-date">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          Clôture : {formatDate(appel.date_fin)}
                        </div>
                        {isOuvert && days > 0 && (
                          <div className="appel-days-badge">{days}j restants</div>
                        )}
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
