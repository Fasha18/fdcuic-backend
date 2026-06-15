import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const TABS = [
  { id: 'apercu', label: 'Tableau de bord' },
  { id: 'campagnes', label: 'Appels à projets' },
  { id: 'mobilite', label: 'Mobilité' },
  { id: 'finances', label: 'Finances' },
  { id: 'projets', label: 'Candidatures' },
  { id: 'brouillons', label: 'Dossiers Brouillons' },
  { id: 'soumissionnaires', label: 'Soumissionnaires' },
  { id: 'personnel', label: 'Personnel FDCUIC' },
  { id: 'types-projet', label: 'Types de projet' },
  { id: 'secteurs', label: 'Secteurs d\'activité' },
  { id: 'notifications-admin', label: 'Notifications' },
  { id: 'statistiques', label: 'Statistiques' },
  { id: 'legal', label: 'Paramètres légaux' },
  { id: 'parametres', label: 'Paramètres compte' },
];

export default function AdminLayout({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('apercu');

  // Déduire l'onglet actif depuis l'URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin') setActiveTab('apercu');
    else if (path === '/admin/appels' || path.startsWith('/admin/appels/')) setActiveTab('campagnes');
    else if (path.startsWith('/admin/projets') || path.startsWith('/admin/candidatures')) setActiveTab('projets');
    else if (path === '/admin/mobilite' || path.startsWith('/admin/mobilite/')) setActiveTab('mobilite');
    else if (path.startsWith('/admin/types-projet')) setActiveTab('types-projet');
    else if (path.startsWith('/admin/secteurs')) setActiveTab('secteurs');
    else if (path.startsWith('/admin/soumissionnaires')) setActiveTab('soumissionnaires');
    else if (path.startsWith('/admin/brouillons')) setActiveTab('brouillons');
    else if (path.startsWith('/admin/personnel')) setActiveTab('personnel');
    else if (path.startsWith('/admin/notifications-admin') || path.startsWith('/admin/notifications')) setActiveTab('notifications-admin');
    else if (path.startsWith('/admin/statistiques')) setActiveTab('statistiques');
    else if (path.startsWith('/admin/finances')) setActiveTab('finances');
    else if (path.startsWith('/admin/legal')) setActiveTab('legal');
    else if (path.startsWith('/admin/profil') || path.startsWith('/admin/parametres')) setActiveTab('parametres');
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
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} onLogout={onLogout} role="admin" />
      <div className="dashboard-main">
        <Topbar title={currentTab?.label || 'Tableau de bord'} subtitle={`Dernière mise à jour : ${dateStr}`} />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
