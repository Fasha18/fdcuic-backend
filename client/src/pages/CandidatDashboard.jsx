import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import candidatService from '../services/candidatService';

export default function CandidatDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('apercu');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});

  // Données dynamiques
  const [appelsOuverts, setAppelsOuverts] = useState([]);
  const [mesDossiers, setMesDossiers] = useState([]);
  const [mesMobilites, setMesMobilites] = useState([]);
  const [progMobilite, setProgMobilite] = useState(null);
  
  const [loading, setLoading] = useState(true);

  // Activité sélectionnée pour l'explorateur (Main Column)
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resAppels, resDossiers, resMob, resProg] = await Promise.all([
          candidatService.getAppelsOuverts(),
          candidatService.getMesAppels(),
          candidatService.getMesMobilites(),
          candidatService.getProgrammeMobilite().catch(() => ({ programme: null }))
        ]);

        const appelsData = resAppels.appels || [];
        const dossiersData = resDossiers.dossiers || [];
        const mobilitesData = resMob.projets || [];
        const progData = resProg.programme || null;

        setAppelsOuverts(appelsData);
        setMesDossiers(dossiersData);
        setMesMobilites(mobilitesData);
        setProgMobilite(progData);

        // Construction du flux d'activité global
        const acts = [];

        // Dossiers
        dossiersData.forEach(d => {
          let actTitle = 'Dossier mis à jour';
          if (d.statut === 'soumis') actTitle = 'Dossier soumis';
          if (d.statut === 'accepte' || d.statut === 'rejete') actTitle = 'Résultat disponible';
          acts.push({
            id: `dossier_${d.id}`,
            type: 'dossier',
            title: actTitle,
            subtitle: `Appel : ${d.appel?.titre || 'Inconnu'}`,
            date: new Date(d.updatedAt),
            data: d
          });
        });

        // Mobilités
        mobilitesData.forEach(m => {
          let actTitle = 'Projet mobilité mis à jour';
          if (m.statut === 'soumis') actTitle = 'Projet mobilité soumis';
          if (m.statut === 'accepte' || m.statut === 'rejete') actTitle = 'Résultat mobilité';
          acts.push({
            id: `mymob_${m.id}`,
            type: 'mon_projet_mobilite',
            title: actTitle,
            subtitle: m.nom_structure || 'Projet mobilité',
            date: new Date(m.updatedAt),
            data: m
          });
        });

        // Nouveaux appels
        appelsData.slice(0, 3).forEach(appel => {
          acts.push({
            id: `appel_${appel.id}`,
            type: 'appel',
            title: 'Nouvelle opportunité',
            subtitle: appel.titre,
            date: new Date(appel.createdAt),
            data: appel
          });
        });

        acts.sort((a, b) => b.date - a.date);
        setActivities(acts);
        if (acts.length > 0) setSelectedActivity(acts[0]);

      } catch (error) {
        console.error("Erreur chargement dashboard candidat:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const totalCandidatures = mesDossiers.length + mesMobilites.length;
  
  // Calcul dynamique du taux de complétion du profil
  const calculateProfileCompletion = () => {
    let score = 0;
    let totalFields = 4;
    if (user.prenom) score++;
    if (user.nom) score++;
    if (user.email) score++;
    if (user.role) score++;
    return Math.round((score / totalFields) * 100);
  };
  const completionRate = calculateProfileCompletion();

  // Helper pour formater les dates relatives
  const timeAgo = (dateInput) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'À l\'instant';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  // --- Composants de l'Explorateur d'Activité ---
  const renderActivityPreview = () => {
    if (!selectedActivity) return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-tertiary)' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: 12, opacity: 0.5 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <p style={{ fontSize: 13, margin: 0 }}>Sélectionnez un élément pour le prévisualiser</p>
      </div>
    );

    const { type, data } = selectedActivity;

    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {data.image_couverture && (
          <div style={{ height: 140, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
            <img src={`http://localhost:3000/uploads/${data.image_couverture}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            background: type === 'appel' ? 'var(--color-primary-light)' : type === 'mobilite' ? 'var(--color-violet-light)' : 'var(--color-bg-hover)',
            color: type === 'appel' ? 'var(--color-primary)' : type === 'mobilite' ? 'var(--color-violet)' : 'var(--color-text-secondary)'
          }}>
            {type === 'dossier' || type === 'mon_projet_mobilite' ? data.statut : 'Ouvert'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{timeAgo(selectedActivity.date)}</span>
        </div>
        
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
          {data.titre || data.nom_structure || (data.appel && data.appel.titre) || 'Détails du dossier'}
        </h3>
        
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20, lineHeight: 1.5, flex: 1 }}>
          {data.description || 'Aucune description détaillée n\'est disponible pour cet élément. Vous pouvez consulter les détails complets en cliquant sur le bouton ci-dessous.'}
        </p>
        
        <button 
          onClick={() => {
            if (type === 'appel') navigate(`/candidat/appels/${data.id}`);
            else if (type === 'mobilite') navigate('/candidat/mobilite');
            else if (type === 'dossier') navigate(`/candidat/candidature/${data.appel_id}`);
            else if (type === 'mon_projet_mobilite') navigate('/candidat/mobilite/postuler');
          }}
          style={{ background: 'var(--color-text-primary)', color: 'var(--color-bg-card)', padding: '12px 16px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', width: '100%', fontSize: 13, transition: 'transform 0.2s' }}
        >
          {type === 'dossier' || type === 'mon_projet_mobilite' ? 'Ouvrir le dossier' : 'Découvrir'}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar activeTab="apercu" onTabChange={() => {}} role="candidat" />
        <main className="dashboard-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        if (tab === 'opportunites') navigate('/candidat/appels');
        if (tab === 'mes-candidatures') navigate('/candidat/mes-dossiers');
        if (tab === 'mobilite') navigate('/candidat/mobilite');
      }} onLogout={onLogout} role="candidat" />
      
      <main className="dashboard-main">
        <Topbar title="Vue d'ensemble" subtitle="Espace Candidat" />

        <div className="dashboard-content" style={{ paddingBottom: 40, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          
          {/* ========================================================= */}
          {/* ZONE PRINCIPALE (GAUCHE - ~65%)                           */}
          {/* ========================================================= */}
          <div style={{ flex: '1 1 65%', display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
            
            {/* 1. Hero Action Area */}
            <div className="card animate-fade-in-up" style={{ 
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-violet) 100%)',
              color: 'white', padding: '24px 32px', position: 'relative', overflow: 'hidden',
              borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ position: 'absolute', top: -100, right: -50, width: 300, height: 300, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
              
              <div style={{ position: 'relative', zIndex: 1, maxWidth: '60%' }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>
                  Bonjour {user.prenom || 'Candidat'} 👋
                </h1>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.5 }}>
                  Bienvenue sur votre portail d'opportunités. Prêt à concrétiser vos idées ?
                </p>
              </div>

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 12, flexDirection: 'column' }}>
                <button onClick={() => navigate('/candidat/appels')} style={{ background: 'white', color: 'var(--color-primary)', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  Voir les {appelsOuverts.length} opportunités
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
                {progMobilite?.statut === 'actif' && (
                  <button onClick={() => navigate('/candidat/mobilite')} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 20px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                    Découvrir le prog. Mobilité
                  </button>
                )}
              </div>
            </div>

            {/* 2. Opportunités Ouvertes (Cartes) */}
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                Nouvelles Opportunités
              </h2>
              {appelsOuverts.length === 0 ? (
                <div style={{ background: 'var(--color-bg-card)', padding: 24, borderRadius: 12, textAlign: 'center', border: '1px solid var(--color-border-light)' }}>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>Aucun appel à projets n'est ouvert pour le moment.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                  {appelsOuverts.slice(0, 3).map(appel => (
                    <div key={appel.id} className="card animate-fade-in-up" onClick={() => navigate(`/candidat/appels/${appel.id}`)} style={{ padding: 12, borderRadius: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: 100, borderRadius: 8, background: 'var(--color-bg-hover)', marginBottom: 12, overflow: 'hidden' }}>
                        {appel.image_couverture ? (
                          <img src={`http://localhost:3000/uploads/${appel.image_couverture}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                          </div>
                        )}
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {appel.titre}
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8 }}>
                        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Jusqu'au {new Date(appel.date_fin).toLocaleDateString('fr-FR')}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '2px 8px', borderRadius: 12 }}>Ouvert</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Mes Candidatures (Cartes Compactes) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Mes Candidatures
                </h2>
                <button onClick={() => navigate('/candidat/mes-dossiers')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Tout voir</button>
              </div>
              
              {totalCandidatures === 0 ? (
                <div style={{ background: 'var(--color-bg-card)', padding: 24, borderRadius: 12, border: '1px dashed var(--color-border)', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>Vous n'avez soumis aucun dossier pour le moment.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {[...mesDossiers, ...mesMobilites].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4).map(item => (
                    <div key={item.id} className="card animate-fade-in-up" style={{ padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: item.statut === 'accepte' ? 'var(--color-green-light)' : item.statut === 'rejete' ? 'var(--color-red-light)' : 'var(--color-bg-hover)', color: item.statut === 'accepte' ? 'var(--color-green)' : item.statut === 'rejete' ? 'var(--color-red)' : 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.statut === 'accepte' ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> : 
                         item.statut === 'rejete' ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> : 
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
                          {item.nom_structure || item.appel?.titre || 'Candidature'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: item.statut === 'accepte' ? 'var(--color-green)' : item.statut === 'brouillon' ? 'var(--color-orange)' : 'var(--color-text-secondary)' }}></span>
                          <span style={{ textTransform: 'capitalize' }}>{item.statut}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Explorateur d'Activité (Split View) */}
            <div className="card animate-fade-in-up" style={{ padding: 0, borderRadius: 16, border: '1px solid var(--color-border-light)', overflow: 'hidden', display: 'flex', height: 400 }}>
              {/* Colonne Liste */}
              <div style={{ width: '40%', borderRight: '1px solid var(--color-border-light)', background: 'var(--color-bg-card)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-light)', background: 'var(--color-bg-body)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Parcourir</h3>
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {activities.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>Aucun élément</div>
                  ) : (
                    activities.map(act => (
                      <div 
                        key={act.id} 
                        onClick={() => setSelectedActivity(act)}
                        style={{ 
                          padding: '16px 20px', cursor: 'pointer', borderBottom: '1px solid var(--color-border-light)',
                          background: selectedActivity?.id === act.id ? 'var(--color-primary-light)' : 'transparent',
                          borderLeft: `3px solid ${selectedActivity?.id === act.id ? 'var(--color-primary)' : 'transparent'}`,
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 700, color: selectedActivity?.id === act.id ? 'var(--color-primary)' : 'var(--color-text-primary)', marginBottom: 4 }}>{act.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.subtitle}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Colonne Prévisualisation */}
              <div style={{ width: '60%', padding: 24, background: 'var(--color-bg-body)' }}>
                {renderActivityPreview()}
              </div>
            </div>

          </div>


          {/* ========================================================= */}
          {/* ZONE LATÉRALE (DROITE - ~35%)                             */}
          {/* ========================================================= */}
          <div style={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 90 }}>
            
            {/* 1. Profil Élégant */}
            <div className="card animate-fade-in-up" style={{ padding: 24, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-bg-body)', border: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>
                  {user.prenom ? user.prenom.charAt(0).toUpperCase() : 'U'}{user.nom ? user.nom.charAt(0).toUpperCase() : ''}
                </div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: '50%', background: 'var(--color-green)', border: '3px solid var(--color-bg-card)' }}></div>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>{user.prenom} {user.nom}</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, marginBottom: 20 }}>Candidat • FDCUIC</p>
              
              <div style={{ width: '100%', background: 'var(--color-bg-body)', padding: 16, borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Profil complété</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>{completionRate}%</span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--color-border-light)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${completionRate}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 3 }} />
                </div>
              </div>
            </div>

            {/* 2. Carte Intelligente Contextuelle */}
            <div className="card animate-fade-in-up" style={{ padding: 24, borderRadius: 16, background: totalCandidatures === 0 ? 'var(--color-bg-body)' : 'var(--color-primary-light)', border: totalCandidatures === 0 ? '1px dashed var(--color-border)' : 'none', animationDelay: '0.1s' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ fontSize: 24 }}>{totalCandidatures === 0 ? '💡' : '🚀'}</div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: totalCandidatures === 0 ? 'var(--color-text-primary)' : 'var(--color-primary)', marginBottom: 6 }}>
                    {totalCandidatures === 0 ? 'Prêt à vous lancer ?' : 'Candidatures en cours'}
                  </h4>
                  <p style={{ fontSize: 13, color: totalCandidatures === 0 ? 'var(--color-text-secondary)' : 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5, marginBottom: 12 }}>
                    {totalCandidatures === 0 
                      ? "Vous n'avez encore soumis aucune candidature. Explorez nos appels à projets pour commencer."
                      : `Vous avez actuellement ${totalCandidatures} dossier(s) sur la plateforme. Restez à l'affût des notifications pour connaître les résultats.`
                    }
                  </p>
                  {totalCandidatures === 0 && (
                    <button onClick={() => navigate('/candidat/appels')} style={{ background: 'var(--color-text-primary)', color: 'var(--color-bg-card)', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Découvrir les appels</button>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Timeline d'Activité Récente */}
            <div className="card animate-fade-in-up" style={{ padding: 24, borderRadius: 16, animationDelay: '0.2s' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 20 }}>Activité récente</h2>
              {activities.length === 0 ? (
                <div style={{ color: 'var(--color-text-tertiary)', fontSize: 13, textAlign: 'center' }}>Aucune activité</div>
              ) : (
                <div style={{ position: 'relative', paddingLeft: 16 }}>
                  <div style={{ position: 'absolute', left: 3, top: 8, bottom: 8, width: 2, background: 'var(--color-border-light)' }}></div>
                  {activities.slice(0, 4).map((act, index) => (
                    <div key={act.id} style={{ position: 'relative', paddingBottom: index === 3 || index === activities.length - 1 ? 0 : 20 }}>
                      <div style={{ position: 'absolute', left: -16, top: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', border: '2px solid var(--color-bg-card)', zIndex: 2 }}></div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase' }}>{timeAgo(act.date)}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>{act.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.subtitle}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Aide Rapide Discrète */}
            <div className="animate-fade-in-up" style={{ padding: '0 8px', animationDelay: '0.3s' }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Aide & Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                  Guide Candidature
                </a>
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  Centre d'Assistance
                </a>
              </div>
            </div>

          </div>
          
        </div>
      </main>
    </div>
  );
}
