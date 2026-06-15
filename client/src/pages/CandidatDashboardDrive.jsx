import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import candidatService from '../services/candidatService';
import CandidatLayout from '../components/CandidatLayout';

export default function CandidatDashboardDrive({ onLogout }) {
  const navigate = useNavigate();
  const [appelsOuverts, setAppelsOuverts] = useState([]);
  const [mesDossiers, setMesDossiers] = useState([]);
  const [mesMobilites, setMesMobilites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resAppels, resDossiers, resMob] = await Promise.all([
          candidatService.getAppelsOuverts(),
          candidatService.getMesAppels(),
          candidatService.getMesMobilites(),
        ]);
        setAppelsOuverts(resAppels.appels || []);
        setMesDossiers(resDossiers.dossiers || []);
        setMesMobilites(resMob.projets || []);
      } catch (error) {
        console.error("Erreur chargement dashboard candidat:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalCandidatures = mesDossiers.length + mesMobilites.length;
  const allCandidatures = [
    ...mesDossiers.map(d => ({ ...d, type: 'Appel à projet', date: d.updatedAt })),
    ...mesMobilites.map(m => ({ ...m, type: 'Mobilité', date: m.updatedAt }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredCandidatures = allCandidatures.filter(c => 
    (c.nom_structure || c.appel?.titre || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusText = (statut) => {
    const s = statut?.toLowerCase();
    if (s === 'accepte') return 'Accepté';
    if (s === 'rejete') return 'Rejeté';
    if (s === 'brouillon') return 'Brouillon';
    return 'En attente';
  };

  const getStatusColor = (statut) => {
    const s = statut?.toLowerCase();
    if (s === 'accepte') return '#0F9D58';
    if (s === 'rejete') return '#DB4437';
    if (s === 'brouillon') return '#F4B400';
    return '#4285F4';
  };

  const timeAgo = (dateInput) => {
    const date = new Date(dateInput);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F5F5F7' }}>
        <div className="spinner" style={{ borderTopColor: '#2B62FF' }} />
      </div>
    );
  }

  return (
    <CandidatLayout 
      activeTab="apercu" 
      title="Vue d'ensemble" 
      onLogout={onLogout}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      {/* QUICK ACCESS */}
      <div className="section-title">Accès Rapide</div>
      
      <div className="quick-access-grid">
        
        {/* Folder 1: Mes Dossiers */}
        <div className="folder-card-wrapper folder-blue" onClick={() => navigate('/candidat/mes-dossiers')}>
          <div className="folder-tab"></div>
          <div className="folder-body">
            <div>
              <div className="folder-title">Mes Candidatures</div>
              <div className="avatars-group">
                <div className="avatar-mini">M</div>
                <div className="avatar-mini">D</div>
                <div className="avatar-mini" style={{ background: '#1A73E8', color: 'white', border: '2px solid #2B62FF' }}>+{totalCandidatures}</div>
              </div>
            </div>
            <div className="folder-footer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              Dossiers en cours
            </div>
          </div>
        </div>

        {/* Folder 2: Appels */}
        <div className="folder-card-wrapper folder-white" onClick={() => navigate('/candidat/appels')}>
          <div className="folder-tab"></div>
          <div className="folder-body">
            <div>
              <div className="folder-title" style={{ color: '#5F6368' }}>Appels à Projets</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#1A2332' }}>{appelsOuverts.length}</div>
            </div>
            <div className="folder-footer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5F6368" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Opportunités ouvertes
            </div>
          </div>
        </div>

        {/* Folder 3: Mobilité */}
        <div className="folder-card-wrapper folder-white" onClick={() => navigate('/candidat/mobilite')}>
          <div className="folder-tab"></div>
          <div className="folder-body">
            <div>
              <div className="folder-title" style={{ color: '#5F6368' }}>Programme Mobilité</div>
              <div style={{ fontSize: 13, color: '#5F6368', lineHeight: 1.4 }}>Financement de vos voyages professionnels.</div>
            </div>
            <div className="folder-footer" style={{ marginTop: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5F6368" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              En savoir plus
            </div>
          </div>
        </div>

      </div>

      {/* ALL FILES */}
      <div className="section-title">Toutes vos candidatures</div>
      
      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #E0E4E9' }}>
        <table className="files-table">
          <thead>
            <tr>
              <th>Nom du projet</th>
              <th>Type</th>
              <th>Dernière modif.</th>
              <th>Statut</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidatures.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#5F6368' }}>
                  Vous n'avez pas encore de candidature.
                </td>
              </tr>
            ) : (
              filteredCandidatures.map((c, idx) => (
                <tr key={idx} style={{ cursor: 'pointer' }} onClick={() => {
                  if (c.type === 'Mobilité') navigate('/candidat/mobilite/postuler');
                  else navigate(`/candidat/candidature/${c.appel_id}`);
                }}>
                  <td className="file-name-cell">
                    {c.type === 'Mobilité' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#E8F0FE" stroke="#1A73E8" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#FCE8E6" stroke="#D93025" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    )}
                    {c.nom_structure || c.appel?.titre || 'Candidature sans nom'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#F1F3F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5F6368" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                      {c.type}
                    </div>
                  </td>
                  <td>{timeAgo(c.date)}</td>
                  <td style={{ color: getStatusColor(c.statut), fontWeight: 600 }}>{getStatusText(c.statut)}</td>
                  <td>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5F6368" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </CandidatLayout>
  );
}
