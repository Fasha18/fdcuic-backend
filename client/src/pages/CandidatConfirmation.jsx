/* ── CandidatConfirmation.jsx ────────────────────────────────── */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function CandidatConfirmation({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab="opportunites" onTabChange={(tab) => {
        if (tab === 'apercu') navigate('/candidat');
        if (tab === 'opportunites') navigate('/candidat/appels');
        if (tab === 'mes-candidatures') navigate('/candidat/mes-dossiers');
        if (tab === 'mobilite') navigate('/candidat/mobilite');
      }} onLogout={onLogout} role="candidat" />

      <main className="dashboard-main">
        <Topbar title="Confirmation" subtitle="Candidature soumise" />

        <div className="dashboard-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="confirmation-card card animate-fade-in-up" style={{ textAlign: 'center', maxWidth: 500, padding: 40 }}>
            <div className="confirmation-icon" style={{ 
              width: 80, height: 80, borderRadius: '50%', background: 'var(--color-green-light)', color: 'var(--color-green)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>Félicitations !</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>
              Votre dossier de candidature (N° {id}) a été soumis avec succès. 
              Il passera prochainement en phase d'examen par nos équipes. Vous serez notifié 
              de tout changement d'état.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => navigate('/candidat/appels')}>
                Retour aux appels
              </button>
              <button className="btn-primary" onClick={() => navigate('/candidat/mes-dossiers')}>
                Suivre mon dossier
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
