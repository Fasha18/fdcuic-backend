import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import candidatService from '../services/candidatService';
import { getImageUrl } from '../utils/imageUrl';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
        const allAppels = res.appels || [];
        
        const withStatus = allAppels.map(a => ({ ...a, computedStatus: getAppelStatus(a) }));
        
        const ouverts = withStatus.filter(a => a.computedStatus === 'ouvert')
          .sort((a, b) => new Date(b.date_debut) - new Date(a.date_debut));
        const appelOuvert = ouverts.length > 0 ? ouverts[0] : null;
        
        const clotures = withStatus.filter(a => a.computedStatus === 'cloture')
          .sort((a, b) => new Date(b.date_fin) - new Date(a.date_fin));
        const appelCloture = clotures.length > 0 ? clotures[0] : null;
        
        const selectedAppels = [];
        if (appelOuvert) selectedAppels.push(appelOuvert);
        if (appelCloture) selectedAppels.push(appelCloture);
        
        setAppels(selectedAppels);
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

      <main className="dashboard-main" style={{ background: '#F5F7FB' }}>
        <Topbar
          title="Appels à Projets"
          subtitle="Découvrez les appels à projets urbains et culturels"
          searchTerm={search}
          onSearchChange={setSearch}
        />

        <div className="dashboard-content" style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
          <style>{`
            /* STATS CARDS */
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px; }
            .stat-card-accent {
              background: white;
              border-radius: 12px;
              padding: 20px 24px;
              position: relative;
              overflow: hidden;
              box-shadow: 0 4px 16px rgba(0,0,0,0.02);
              display: flex;
              flex-direction: column;
              border: 1px solid #eef1f7;
            }
            .stat-accent-line { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; }
            .stat-value { font-size: 28px; font-weight: 500; color: #0b1b3a; line-height: 1; margin-bottom: 4px; }
            .stat-label { font-size: 12px; color: #6b7182; font-weight: 500; }

            /* FILTER TABS */
            .appels-filter-tabs { display: flex; gap: 8px; margin-bottom: 32px; flex-wrap: wrap; }
            .appels-tab {
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
              border: 1px solid #eef1f7;
              background: white;
              color: #6b7182;
              cursor: pointer;
              transition: all 0.2s;
            }
            .appels-tab:hover { background: #f8fafc; }
            .appels-tab.active {
              background: #0144BD;
              color: white;
              border-color: #0144BD;
              box-shadow: 0 4px 12px rgba(1, 68, 189, 0.2);
            }

            /* PROJECT CARDS - AFFICHE DE RUE FORMAT */
            .appels-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 32px 24px;
              padding: 10px 0;
            }
            .appel-card {
              position: relative;
              background: linear-gradient(160deg, #cfe0ff, #a9c4f5);
              border-radius: 2px 2px 0 10px;
              box-shadow: 0 12px 24px rgba(0,0,0,0.1);
              display: flex;
              flex-direction: column;
              transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              cursor: pointer;
              margin-top: 10px; /* space for tape */
            }
            .appel-card.odd { transform: rotate(-2deg); }
            .appel-card.even { transform: rotate(1.5deg); }
            .appel-card:hover {
              transform: translateY(-8px) rotate(0deg);
              box-shadow: 0 20px 40px rgba(0,0,0,0.2);
              z-index: 10;
            }
            .appel-card.closed { filter: grayscale(0.3); opacity: 0.95; }

            /* TAPE (Scotch) */
            .tape {
              position: absolute;
              top: -8px;
              width: 36px;
              height: 18px;
              background: rgba(255, 200, 70, 0.75);
              backdrop-filter: blur(2px);
              z-index: 2;
              box-shadow: 0 1px 3px rgba(0,0,0,0.15);
            }
            .tape.left { left: 10px; transform: rotate(-15deg); }
            .tape.right { right: 10px; transform: rotate(12deg); }

            /* IMAGE AREA */
            .appel-card-banner {
              height: 140px;
              position: relative;
              background-color: #0B1B3A;
              border-radius: 2px 2px 0 0;
              overflow: hidden;
            }
            .appel-card-banner img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
            }
            .appel-banner-fallback {
              position: absolute;
              inset: 0;
              background: #0B1B3A;
              overflow: hidden;
            }
            /* Colorful overlapping circles */
            .fallback-circle { position: absolute; border-radius: 50%; }
            .fc-1 { width: 140px; height: 140px; background: #0144BD; top: -40px; left: -20px; opacity: 0.8; }
            .fc-2 { width: 180px; height: 180px; background: #7C5CFC; bottom: -60px; right: 10px; opacity: 0.6; }
            .fc-3 { width: 90px; height: 90px; background: #FFB020; top: 20px; left: 40%; opacity: 0.9; }
            .fc-4 { width: 100px; height: 100px; background: #1baf7a; bottom: -20px; left: -10px; opacity: 0.5; }
            .fallback-veil {
              position: absolute;
              inset: 0;
              background: rgba(11,7,20,0.28);
            }

            /* INFO PANEL */
            .appel-card-body {
              padding: 1.5rem 1.4rem 1.7rem;
              flex: 1;
              display: flex;
              flex-direction: column;
            }
            .appel-card-sur {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #0144BD;
              margin-bottom: 6px;
              font-weight: 700;
            }
            .appel-card-title {
              font-size: 24px;
              font-weight: 700;
              color: #0b1b3a;
              margin-bottom: 12px;
              line-height: 1.05;
            }
            .appel-card-desc {
              font-size: 12px;
              color: #3d4459;
              line-height: 1.5;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              margin-bottom: 24px;
              flex: 1;
            }

            /* FOOTER BANNER */
            .appel-card-footer-banner {
              margin-top: auto;
              background: #0144BD;
              border-radius: 10px;
              padding: 12px 14px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .appel-card-footer-banner.closed {
              background: #4a5164;
            }
            .footer-col-left {
              display: flex;
              flex-direction: column;
            }
            .footer-col-right {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              text-align: right;
            }
            .footer-label {
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #cfe0ff;
              margin-bottom: 2px;
              font-weight: 600;
            }
            .appel-card-footer-banner.closed .footer-label {
              color: #b9c2d9;
            }
            .footer-val {
              font-size: 15px;
              color: white;
              font-weight: 700;
            }
            .footer-val.highlight {
              font-size: 26px;
              color: #FFB020;
              line-height: 1;
              margin-bottom: 2px;
            }
            .footer-val.closed-text {
              font-size: 16px;
              color: #ff8787;
              letter-spacing: 1px;
            }

            .empty-state { text-align: center; padding: 60px 0; background: white; border-radius: 14px; border: 1px solid #eef1f7; }
            .empty-state h3 { font-size: 16px; font-weight: 600; color: #0b1b3a; margin-bottom: 8px; }
            .empty-state p { font-size: 13px; color: #8a90a0; }

            /* Mobile responsiveness for rotation */
            @media (max-width: 768px) {
              .appel-card.odd, .appel-card.even { transform: rotate(0deg); }
              .appel-card:hover { transform: translateY(-4px) rotate(0deg); }
            }
          `}</style>
          
          <div className="content-grid" style={{ paddingBottom: 60 }}>

            {/* 1. STATS CARDS */}
            <div className="stats-grid animate-fade-in-up">
              <div className="stat-card-accent">
                <div className="stat-accent-line" style={{ background: '#0144BD' }}></div>
                <div className="stat-value">{stats.ouverts}</div>
                <div className="stat-label">Appels Ouverts</div>
              </div>
              <div className="stat-card-accent">
                <div className="stat-accent-line" style={{ background: '#FFB020' }}></div>
                <div className="stat-value">{stats.aVenir}</div>
                <div className="stat-label">À venir</div>
              </div>
              <div className="stat-card-accent">
                <div className="stat-accent-line" style={{ background: '#8a90a0' }}></div>
                <div className="stat-value">{stats.clotures}</div>
                <div className="stat-label">Clôturés</div>
              </div>
            </div>

            {/* 2. FILTER TABS */}
            <div className="appels-filter-tabs animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
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

            {/* 3. PROJECT CARDS - AFFICHE DE RUE */}
            {filtered.length === 0 ? (
              <div className="empty-state animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8a90a0" strokeWidth="1.5" style={{ margin: '0 auto 16px auto', opacity: 0.5 }}>
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <h3>Aucun appel trouvé</h3>
                <p>Essayez de modifier vos filtres ou votre recherche.</p>
              </div>
            ) : (
              <div className="appels-grid">
                {filtered.map((appel, idx) => {
                  const isOuvert = appel.computedStatus === 'ouvert';
                  const isAVenir = appel.computedStatus === 'a_venir';
                  const isCloture = appel.computedStatus === 'cloture';
                  const days = daysRemaining(appel.date_fin);
                  
                  // Rotate classes
                  const rotationClass = idx % 2 === 0 ? 'even' : 'odd';
                  const closedClass = isCloture ? 'closed' : '';

                  return (
                    <div
                      key={appel.id}
                      className={`appel-card animate-fade-in-up ${rotationClass} ${closedClass}`}
                      style={{ animationDelay: `${0.05 * (idx % 8)}s` }}
                      onClick={() => navigate(`/candidat/appels/${appel.id}`)}
                    >
                      {/* SCOTCH TAPE */}
                      <div className="tape left"></div>
                      <div className="tape right"></div>

                      {/* BANNER / IMAGE AREA */}
                      <div className="appel-card-banner">
                        {appel.image_couverture ? (
                          <img 
                            src={getImageUrl(appel.image_couverture)} 
                            alt={appel.titre} 
                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                          />
                        ) : null}
                        
                        {/* FALLBACK: COLORFUL CIRCLES */}
                        <div className="appel-banner-fallback" style={{ display: appel.image_couverture ? 'none' : 'block' }}>
                          <div className="fallback-circle fc-1"></div>
                          <div className="fallback-circle fc-2"></div>
                          <div className="fallback-circle fc-3"></div>
                          <div className="fallback-circle fc-4"></div>
                          <div className="fallback-veil"></div>
                        </div>
                      </div>

                      {/* INFO PANEL */}
                      <div className="appel-card-body">
                        <div className="appel-card-sur">
                          APPEL À PROJETS
                        </div>
                        <h3 className="appel-card-title">{appel.titre}</h3>
                        <div className="appel-card-desc">
                          {appel.description || 'Aucune description détaillée fournie pour le moment.'}
                        </div>
                        
                        <div className={`appel-card-footer-banner ${isCloture ? 'closed' : ''}`}>
                          <div className="footer-col-left">
                            <span className="footer-label">CLÔTURE</span>
                            <span className="footer-val">{formatDate(appel.date_fin)}</span>
                          </div>
                          <div className="footer-col-right">
                            {isCloture ? (
                              <span className="footer-val closed-text">CLÔTURÉ</span>
                            ) : isAVenir ? (
                              <>
                                <span className="footer-val highlight" style={{ color: '#cfe0ff', fontSize: 16 }}>À VENIR</span>
                                <span className="footer-label">PROCHAINEMENT</span>
                              </>
                            ) : (
                              <>
                                <span className="footer-val highlight">{Math.max(0, days)}</span>
                                <span className="footer-label">JOURS RESTANTS</span>
                              </>
                            )}
                          </div>
                        </div>
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
