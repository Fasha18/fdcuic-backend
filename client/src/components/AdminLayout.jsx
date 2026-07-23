import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const TABS = [
  { id: 'apercu', label: 'Tableau de bord' },
  { id: 'campagnes', label: 'Appels à projets' },
  { id: 'mobilite', label: 'Mobilité' },
  { id: 'finances', label: 'Finances' },
  { id: 'brouillons', label: 'Dossiers Brouillons' },
  { id: 'candidatures-admin', label: 'Candidats' },
  { id: 'soumissionnaires', label: 'Soumissionnaires' },
  { id: 'personnel', label: 'Personnel FDCUIC' },
  { id: 'types-projet', label: 'Types de projet' },
  { id: 'secteurs', label: 'Secteurs d\'activité' },
  { id: 'notifications-admin', label: 'Notifications' },

  { id: 'faqs', label: 'Gestion FAQs' },
  { id: 'legal', label: 'Paramètres légaux' },
  { id: 'parametres', label: 'Paramètres compte' },
];

export default function AdminLayout({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Récupérer le rôle de l'utilisateur connecté
  const userRole = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u).role : 'admin';
    } catch { return 'admin'; }
  })();

  // Déduire l'onglet actif depuis l'URL
  const getTabFromPath = (path) => {
    if (path === '/admin') return 'apercu';
    if (path === '/admin/appels' || path.startsWith('/admin/appels/')) return 'campagnes';
    if (path === '/admin/mobilite' || path.startsWith('/admin/mobilite/')) return 'mobilite';
    if (path.startsWith('/admin/types-projet')) return 'types-projet';
    if (path.startsWith('/admin/secteurs')) return 'secteurs';
    if (path.startsWith('/admin/candidatures-admin')) return 'candidatures-admin';
    if (path.startsWith('/admin/soumissionnaires')) return 'soumissionnaires';
    if (path.startsWith('/admin/brouillons')) return 'brouillons';
    if (path.startsWith('/admin/personnel')) return 'personnel';
    if (path.startsWith('/admin/notifications-admin') || path.startsWith('/admin/notifications')) return 'notifications-admin';

    if (path.startsWith('/admin/finances')) return 'finances';
    if (path.startsWith('/admin/faqs')) return 'faqs';
    if (path.startsWith('/admin/legal')) return 'legal';
    if (path.startsWith('/admin/profil') || path.startsWith('/admin/parametres')) return 'parametres';
    if (path.startsWith('/admin/dossiers')) return 'soumissionnaires';
    return 'apercu';
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'apercu') navigate('/admin');
    else if (tabId === 'campagnes') navigate('/admin/appels');
    else navigate(`/admin/${tabId}`);
  };

  const currentTab = TABS.find(t => t.id === activeTab);
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="dashboard-layout" style={{ background: 'linear-gradient(155deg, #eef3ff, #dce8ff 60%, #cfe0ff)', position: 'relative', overflow: 'hidden' }}>
      
      {/* ── METABALLS BACKGROUND ── */}
      <div className="ag-metaballs" aria-hidden="true" style={{ opacity: 0.12, position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <svg style={{ width: '100%', height: '100%' }}>
          <defs>
            <filter id="goo-admin">
              <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="b"/>
              <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -11" result="g"/>
            </filter>
          </defs>
          <g filter="url(#goo-admin)">
            <circle className="mb-1" cx="320" cy="340" r="180" />
            <circle className="mb-2" cx="400" cy="420" r="150" />
            <circle className="mb-3" cx="200" cy="240" r="130" />
            <circle className="mb-4" cx="440" cy="270" r="110" />
            <circle className="mb-5" cx="240" cy="440" r="90" />
            
            {/* Added a few more on the right side for wider dashboard screens */}
            <circle className="mb-1" cx="80%" cy="30%" r="200" style={{ animationDelay: '-5s' }} />
            <circle className="mb-3" cx="70%" cy="60%" r="160" style={{ animationDelay: '-2s' }} />
            <circle className="mb-5" cx="90%" cy="80%" r="140" style={{ animationDelay: '-7s' }} />
          </g>
        </svg>
      </div>

      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} onLogout={onLogout} role={userRole} />
      <div className="dashboard-main" style={{ position: 'relative', zIndex: 10 }}>
        <Topbar title={currentTab?.label || 'Tableau de bord'} subtitle={`Dernière mise à jour : ${dateStr}`} />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
