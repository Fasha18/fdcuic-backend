import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import candidatService from '../services/candidatService';

export default function CandidatMobilite({ onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, accepte: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await candidatService.getMesMobilites();
        const projets = res.projets || [];
        setStats({
          total: projets.length,
          accepte: projets.filter(p => p.statut === 'accepte').length
        });
      } catch (err) {
        console.error('Erreur chargement stats mobilité:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar activeTab="mobilite" onTabChange={() => {}} role="candidat" />
        <main className="dashboard-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab="mobilite" onTabChange={(tab) => {
        if (tab === 'apercu') navigate('/candidat');
        if (tab === 'opportunites') navigate('/candidat/appels');
        if (tab === 'mes-candidatures') navigate('/candidat/mes-dossiers');
        if (tab === 'mobilite') navigate('/candidat/mobilite');
      }} onLogout={onLogout} role="candidat" />

      <main className="dashboard-main" style={{ background: 'linear-gradient(155deg, #eef3ff, #dce8ff 60%, #cfe0ff)', minHeight: '100vh' }}>
        <Topbar title="Mobilité" subtitle="Développez vos projets à l'international" />

        <div className="dashboard-content" style={{ padding: '24px 32px', maxWidth: 1000, margin: '0 auto' }}>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700&family=Inter:wght@400;500;600;700&display=swap');

            .mobilite-stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
              gap: 12px;
              margin-bottom: 48px;
            }

            .m-stat-card {
              background: white;
              border-radius: 12px;
              padding: 20px 24px;
              display: flex;
              align-items: center;
              gap: 16px;
              box-shadow: 0 4px 16px rgba(0,0,0,0.03);
              position: relative;
            }
            .m-stat-card.blue { border-left: 4px solid #0144BD; }
            .m-stat-card.green { border-left: 4px solid #1baf7a; }

            .m-stat-icon-wrapper {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .m-stat-card.blue .m-stat-icon-wrapper { background: #E6F0FF; color: #0144BD; }
            .m-stat-card.green .m-stat-icon-wrapper { background: #E1F5EE; color: #1baf7a; }

            .m-stat-number {
              font-family: 'Inter', sans-serif;
              font-size: 24px;
              font-weight: 600;
              color: #0b1b3a;
              line-height: 1.1;
              margin-bottom: 2px;
            }
            .m-stat-label {
              font-family: 'Inter', sans-serif;
              font-size: 12px;
              color: #6b7182;
            }

            /* COLLAGE SECTION */
            .collage-container {
              position: relative;
              margin-top: 40px;
              padding: 20px;
            }

            @keyframes cardFloat {
              0%, 100% { transform: translateY(0) rotate(1.2deg); }
              50% { transform: translateY(-8px) rotate(1.2deg); }
            }
            @keyframes badgeBob {
              0%, 100% { transform: translateY(0) rotate(-7deg); }
              50% { transform: translateY(-10px) rotate(-7deg); }
            }
            @keyframes pulseDot {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.5); opacity: 0.5; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes dotBob {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-12px); }
            }

            .collage-bg-card {
              position: absolute;
              inset: 20px;
              background: #0144BD;
              border-radius: 18px;
              transform: translate(6px, 10px) rotate(-1.5deg);
              z-index: 1;
            }

            .collage-main-card {
              position: relative;
              padding: 40px 32px;
              z-index: 2;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              animation: cardFloat 5.5s ease-in-out infinite;
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              border-radius: 18px;
            }

            .collage-main-card::before {
              content: '';
              position: absolute;
              inset: 0;
              background: #fdfcf6;
              border-radius: 18px;
              clip-path: polygon(0 1.5%, 3% 0, 97% 0.8%, 100% 2%, 100% 98%, 96% 100%, 4% 99.2%, 0 98%);
              z-index: -1;
            }

            .c-tape {
              position: absolute;
              height: 20px;
              width: 65px;
              backdrop-filter: blur(2px);
              box-shadow: 0 2px 5px rgba(0,0,0,0.15);
              z-index: 5;
            }
            .c-tape.amber {
              background: rgba(255, 176, 32, 0.85);
              top: -10px;
              right: 40px;
              transform: rotate(8deg);
            }
            .c-tape.green {
              background: rgba(27, 175, 122, 0.85);
              bottom: -10px;
              left: 40px;
              transform: rotate(-5deg);
            }

            .c-badge {
              position: absolute;
              top: -20px;
              left: -12px;
              background: #0144BD;
              color: white;
              font-family: 'Inter', sans-serif;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 1px;
              border-radius: 8px;
              padding: 8px 14px;
              z-index: 10;
              display: flex;
              align-items: center;
              gap: 8px;
              box-shadow: 0 8px 16px rgba(1, 68, 189, 0.3);
              animation: badgeBob 4s ease-in-out infinite;
            }
            .c-badge-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #FFB020;
              animation: pulseDot 1.8s ease-in-out infinite;
            }

            .c-title {
              font-family: 'Bricolage Grotesque', sans-serif;
              font-weight: 700;
              font-size: 36px;
              line-height: 1.05;
              color: #141824;
              transform: rotate(-1deg);
              margin-bottom: 24px;
              max-width: 600px;
            }
            .c-highlight {
              background: #fff2cf;
              padding: 0 6px;
              border-radius: 4px;
            }

            .c-desc {
              font-family: 'Inter', sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #4c5468;
              max-width: 480px;
              transform: rotate(-0.4deg);
              margin-bottom: 40px;
            }

            .c-btn {
              background: #141824;
              color: white;
              font-family: 'Inter', sans-serif;
              font-weight: 600;
              font-size: 14px;
              padding: 14px 24px;
              border-radius: 12px;
              border: none;
              cursor: pointer;
              transform: rotate(-2deg);
              box-shadow: 0 8px 20px rgba(20, 24, 36, 0.2);
              transition: all 0.2s;
            }
            .c-btn:hover {
              transform: rotate(0deg) translateY(-2px);
              box-shadow: 0 12px 24px rgba(20, 24, 36, 0.3);
            }

            .c-dot {
              position: absolute;
              bottom: 30px;
              right: 50px;
              width: 16px;
              height: 16px;
              background: #7C5CFC;
              border-radius: 50%;
              animation: dotBob 3.4s ease-in-out infinite;
            }

            @media (max-width: 768px) {
              .collage-main-card { padding: 40px 24px; transform: rotate(0deg) !important; animation: none !important; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
              .collage-main-card::before { clip-path: none; }
              .collage-bg-card { display: none; }
              .c-title { font-size: 32px; transform: rotate(0); }
              .c-desc { transform: rotate(0); }
              .c-btn { transform: rotate(0); }
              .c-badge { left: 16px; animation: none; transform: rotate(0); }
              .c-tape { display: none; }
            }
          `}</style>
          
          {/* STATS CARDS */}
          <div className="mobilite-stats-grid animate-fade-in-up">
            <div className="m-stat-card blue">
              <div className="m-stat-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
              </div>
              <div>
                <div className="m-stat-number">{stats.total}</div>
                <div className="m-stat-label">Projets soumis</div>
              </div>
            </div>
            <div className="m-stat-card green">
              <div className="m-stat-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <div className="m-stat-number">{stats.accepte}</div>
                <div className="m-stat-label">Projets soutenus</div>
              </div>
            </div>
          </div>

          {/* COLLAGE CARNET DE BORD */}
          <div style={{ marginBottom: 24, paddingLeft: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0b1b3a', margin: '0 0 8px 0' }}>Découvrir le dispositif</h2>
            <p style={{ margin: 0, color: '#6b7182', fontSize: 15, lineHeight: 1.5, maxWidth: 800 }}>
              Le Programme Mobilité est une formidable opportunité pour développer vos projets à l'international. Lisez attentivement la description ci-dessous et lancez-vous !
            </p>
          </div>

          <div className="collage-container animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="collage-bg-card"></div>
            
            <div className="collage-main-card">
              <div className="c-tape amber"></div>
              <div className="c-tape green"></div>
              
              <div className="c-badge">
                <div className="c-badge-dot"></div>
                EN CONTINU
              </div>

              <h1 className="c-title">
                Mobilité <span className="c-highlight">Internationale</span>
              </h1>
              
              <p className="c-desc">
                Ce dispositif soutient les acteurs culturels et créatifs du Sénégal. Il vise à favoriser votre rayonnement international, participer à des formations pointues et développer de solides partenariats. Ce guichet est ouvert en permanence, sans date butoir.
              </p>

              <button className="c-btn" onClick={() => navigate('/candidat/mobilite/candidature')}>
                Déposer ma candidature →
              </button>

              <div className="c-dot"></div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
