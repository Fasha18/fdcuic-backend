import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ParametresCompte from './ParametresCompte';

export default function CandidatParametres({ onLogout }) {
  const navigate = useNavigate();
  return (
    <div className="dashboard-layout">
      <Sidebar 
        activeTab="parametres" 
        onTabChange={(tab) => {
          if (tab === 'apercu') navigate('/candidat');
          if (tab === 'opportunites') navigate('/candidat/appels');
          if (tab === 'mes-candidatures') navigate('/candidat/mes-dossiers');
          if (tab === 'mobilite') navigate('/candidat/mobilite');
          if (tab === 'parametres') navigate('/candidat/parametres');
          if (tab === 'profil') navigate('/candidat/profil');
        }} 
        onLogout={onLogout} 
        role="candidat" 
      />
      <main className="dashboard-main" style={{ background: '#F5F7FB', padding: 0 }}>
        <Topbar title="Paramètres" subtitle="Gérez vos informations et votre sécurité" />
        <div className="dashboard-content" style={{ padding: '32px 40px', overflowY: 'auto' }}>
          <ParametresCompte />
        </div>
      </main>
    </div>
  );
}
