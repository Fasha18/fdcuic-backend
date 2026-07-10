import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api/axios';

export default function Profile({ onLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  
  // State for Personal Info Form
  const [nom, setNom] = useState(user.nom || '');
  const [prenom, setPrenom] = useState(user.prenom || '');
  const [telephone, setTelephone] = useState(user.telephone || '');
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [messageInfo, setMessageInfo] = useState({ text: '', type: '' });

  // State for Password Form
  const [motDePasseActuel, setMotDePasseActuel] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);
  const [messagePass, setMessagePass] = useState({ text: '', type: '' });

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoadingInfo(true);
    setMessageInfo({ text: '', type: '' });
    try {
      const res = await api.put('/users', { nom, prenom, telephone });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setMessageInfo({ text: res.data.message, type: 'success' });
      
      setTimeout(() => setMessageInfo({ text: '', type: '' }), 4000);
    } catch (err) {
      setMessageInfo({ text: err.response?.data?.message || 'Erreur lors de la mise à jour.', type: 'error' });
    }
    setLoadingInfo(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoadingPass(true);
    setMessagePass({ text: '', type: '' });
    try {
      const res = await api.put('/users/password', {
        mot_de_passe_actuel: motDePasseActuel,
        nouveau_mot_de_passe: nouveauMotDePasse,
        confirmation_mot_de_passe: confirmationMotDePasse
      });
      setMessagePass({ text: res.data.message, type: 'success' });
      setMotDePasseActuel('');
      setNouveauMotDePasse('');
      setConfirmationMotDePasse('');

      setTimeout(() => setMessagePass({ text: '', type: '' }), 4000);
    } catch (err) {
      setMessagePass({ text: err.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe.', type: 'error' });
    }
    setLoadingPass(false);
  };

  const goBack = () => {
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/candidat');
    }
  };

  const isAdminRoute = window.location.pathname.startsWith('/admin');

  const content = (
    <>
      {/* BOUTON RETOUR INTELLIGENT */}
      <button 
        onClick={goBack}
        className="animate-fade-in-up"
        style={{ 
          display: 'inline-flex', alignItems: 'center', gap: 8, 
          background: isAdminRoute ? 'var(--color-bg-card)' : 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)',
          padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)',
          color: '#4B5563', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          marginBottom: 32, transition: 'all 0.3s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateX(-4px)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.color = '#4B5563'; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Retour au tableau de bord
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, alignItems: 'start' }}>

            
            {/* COLONNE GAUCHE - CARTE D'IDENTITÉ UTILISATEUR */}
            <div className="animate-fade-in-up" style={{ 
              background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)',
              borderRadius: 24, padding: '40px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(74, 123, 247, 0.05)'
            }}>
              {/* Decorative shapes */}
              <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'radial-gradient(circle, rgba(79, 106, 246, 0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', bottom: -50, left: -50, width: 150, height: 150, background: 'radial-gradient(circle, rgba(124, 92, 252, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 120, height: 120, borderRadius: '50%', background: 'white', 
                  padding: 8, margin: '0 auto 20px', boxShadow: '0 12px 32px rgba(79, 106, 246, 0.15)'
                }}>
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4F6AF6 0%, #7C5CFC 100%)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 40, fontWeight: 800, letterSpacing: '-1px'
                  }}>
                    {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                  </div>
                </div>

                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1A2332', marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>
                  {user.prenom} {user.nom}
                </h2>
                <div style={{ 
                  display: 'inline-block', padding: '6px 16px', background: 'rgba(79, 106, 246, 0.1)', 
                  borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#4F6AF6', textTransform: 'uppercase', 
                  letterSpacing: '1px', marginBottom: 32 
                }}>
                  {user.role}
                </div>

                <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 24, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 2 }}>Adresse Email</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1A2332' }}>{user.email}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 2 }}>Identifiant unique</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1A2332' }}>USR-{user.id?.toString().padStart(4, '0')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLONNE DROITE - FORMULAIRES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Informations Personnelles */}
              <div className="animate-fade-in-up" style={{ 
                background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)',
                borderRadius: 24, padding: 32, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(74, 123, 247, 0.05)', animationDelay: '0.1s' 
              }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1A2332', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(79, 106, 246, 0.1)', color: '#4F6AF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  Informations Personnelles
                </h3>

                {messageInfo.text && (
                  <div style={{ padding: '16px 20px', borderRadius: 12, marginBottom: 24, fontSize: 14, fontWeight: 600, background: messageInfo.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: messageInfo.type === 'success' ? '#16A34A' : '#DC2626', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    {messageInfo.text}
                  </div>
                )}

                <form onSubmit={handleUpdateInfo} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#4B5563', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Prénom</label>
                    <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} required style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', background: 'white', color: '#1A2332', fontSize: 15, fontWeight: 500, outline: 'none', transition: '0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} onFocus={e => e.target.style.borderColor = '#4F6AF6'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#4B5563', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Nom</label>
                    <input type="text" value={nom} onChange={e => setNom(e.target.value)} required style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', background: 'white', color: '#1A2332', fontSize: 15, fontWeight: 500, outline: 'none', transition: '0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} onFocus={e => e.target.style.borderColor = '#4F6AF6'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#4B5563', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Téléphone</label>
                    <input type="text" value={telephone} onChange={e => setTelephone(e.target.value)} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', background: 'white', color: '#1A2332', fontSize: 15, fontWeight: 500, outline: 'none', transition: '0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} placeholder="+221 XX XXX XX XX" onFocus={e => e.target.style.borderColor = '#4F6AF6'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button type="submit" disabled={loadingInfo} style={{ background: 'linear-gradient(135deg, #4F6AF6 0%, #3B5BDB 100%)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: loadingInfo ? 'not-allowed' : 'pointer', opacity: loadingInfo ? 0.8 : 1, transition: 'all 0.3s', boxShadow: '0 8px 24px rgba(79, 106, 246, 0.3)', display: 'flex', alignItems: 'center', gap: 8 }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                      {loadingInfo ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Sécurité */}
              <div className="animate-fade-in-up" style={{ 
                background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)',
                borderRadius: 24, padding: 32, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(74, 123, 247, 0.05)', animationDelay: '0.2s' 
              }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1A2332', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245, 159, 0, 0.1)', color: '#F59F00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  Sécurité du compte
                </h3>

                {messagePass.text && (
                  <div style={{ padding: '16px 20px', borderRadius: 12, marginBottom: 24, fontSize: 14, fontWeight: 600, background: messagePass.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: messagePass.type === 'success' ? '#16A34A' : '#DC2626', display: 'flex', alignItems: 'center', gap: 10 }}>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    {messagePass.text}
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#4B5563', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mot de passe actuel</label>
                    <input type="password" value={motDePasseActuel} onChange={e => setMotDePasseActuel(e.target.value)} required style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', background: 'white', color: '#1A2332', fontSize: 15, fontWeight: 500, outline: 'none', transition: '0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} onFocus={e => e.target.style.borderColor = '#F59F00'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#4B5563', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Nouveau mot de passe</label>
                      <input type="password" value={nouveauMotDePasse} onChange={e => setNouveauMotDePasse(e.target.value)} required style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', background: 'white', color: '#1A2332', fontSize: 15, fontWeight: 500, outline: 'none', transition: '0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} onFocus={e => e.target.style.borderColor = '#F59F00'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#4B5563', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Confirmer le mot de passe</label>
                      <input type="password" value={confirmationMotDePasse} onChange={e => setConfirmationMotDePasse(e.target.value)} required style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', background: 'white', color: '#1A2332', fontSize: 15, fontWeight: 500, outline: 'none', transition: '0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} onFocus={e => e.target.style.borderColor = '#F59F00'} onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.1)'} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button type="submit" disabled={loadingPass} style={{ background: '#1A2332', color: 'white', border: 'none', padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: loadingPass ? 'not-allowed' : 'pointer', opacity: loadingPass ? 0.8 : 1, transition: 'all 0.3s', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                      {loadingPass ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
    </>
  );

  if (isAdminRoute) {
    return <div style={{ maxWidth: 1200, margin: '0 auto' }}>{content}</div>;
  }

  return (
    <div className="dashboard-layout" style={{ background: 'linear-gradient(135deg, #E8EFF9 0%, #F0F4F8 100%)', minHeight: '100vh' }}>
      <Sidebar 
        onLogout={onLogout} 
        activeTab="profil" 
        role={user.role}
        onTabChange={(tab) => {
          if (user.role === 'candidat') {
            if (tab === 'apercu') navigate('/candidat');
            if (tab === 'opportunites') navigate('/candidat/appels');
            if (tab === 'mes-candidatures') navigate('/candidat/mes-dossiers');
            if (tab === 'mobilite') navigate('/candidat/mobilite');
          } else {
            if (tab === 'apercu') navigate('/admin');
          }
        }} 
      />
      
      <main className="dashboard-main" style={{ padding: '0' }}>
        <Topbar title="Mon Profil" subtitle="Gérez vos informations personnelles et votre sécurité" />

        <div className="dashboard-content" style={{ padding: '32px 40px', paddingTop: 'calc(72px + 32px)', maxWidth: 1200, margin: '0 auto' }}>
          {content}
        </div>
      </main>
    </div>
  );
}
