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
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>

      {/* COLONNE GAUCHE - IDENTITÉ */}
      <div className="animate-fade-in-up card" style={{ padding: 32, textAlign: 'center', background: 'var(--color-bg-card)', border: '1px solid var(--color-border-light)' }}>
        <div style={{ 
          width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px',
          background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 36, fontWeight: 700,
          boxShadow: '0 4px 12px rgba(1, 68, 189, 0.2)'
        }}>
          {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          {user.prenom} {user.nom}
        </h2>
        <div style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', background: 'var(--color-primary-light)', padding: '4px 12px', display: 'inline-block', marginBottom: 24 }}>
          {user.role}
        </div>

        <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 20, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 2 }}>Adresse Email</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{user.email}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 2 }}>Identifiant unique</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>USR-{user.id?.toString().padStart(4, '0')}</div>
          </div>
        </div>
      </div>

      {/* COLONNE DROITE - FORMULAIRES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Informations Personnelles */}
        <div className="animate-fade-in-up card" style={{ padding: 32, background: 'var(--color-bg-card)', border: '1px solid var(--color-border-light)', animationDelay: '0.1s' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 20 }}>Informations Personnelles</h2>

          {messageInfo.text && (
            <div style={{ padding: '12px 16px', marginBottom: 20, fontSize: 14, fontWeight: 600, background: messageInfo.type === 'success' ? 'var(--color-green-light)' : 'var(--color-red-light)', color: messageInfo.type === 'success' ? 'var(--color-green)' : 'var(--color-red)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {messageInfo.text}
            </div>
          )}

          <form onSubmit={handleUpdateInfo} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Prénom</label>
              <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} required style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--color-border)', background: 'var(--color-bg-body)', color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Nom</label>
              <input type="text" value={nom} onChange={e => setNom(e.target.value)} required style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--color-border)', background: 'var(--color-bg-body)', color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Téléphone</label>
              <input type="text" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+221 XX XXX XX XX" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--color-border)', background: 'var(--color-bg-body)', color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="submit" className="btn-primary" disabled={loadingInfo} style={{ padding: '10px 20px', fontSize: 13 }}>
                {loadingInfo ? 'Enregistrement...' : 'Sauvegarder les modifications'}
              </button>
            </div>
          </form>
        </div>

        {/* Sécurité */}
        <div className="animate-fade-in-up card" style={{ padding: 32, background: 'var(--color-bg-card)', border: '1px solid var(--color-border-light)', animationDelay: '0.2s' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 20 }}>Sécurité du compte</h2>

          {messagePass.text && (
            <div style={{ padding: '12px 16px', marginBottom: 20, fontSize: 14, fontWeight: 600, background: messagePass.type === 'success' ? 'var(--color-green-light)' : 'var(--color-red-light)', color: messagePass.type === 'success' ? 'var(--color-green)' : 'var(--color-red)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {messagePass.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Mot de passe actuel</label>
              <input type="password" value={motDePasseActuel} onChange={e => setMotDePasseActuel(e.target.value)} required style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--color-border)', background: 'var(--color-bg-body)', color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Nouveau mot de passe</label>
              <input type="password" value={nouveauMotDePasse} onChange={e => setNouveauMotDePasse(e.target.value)} required minLength={8} style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--color-border)', background: 'var(--color-bg-body)', color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Confirmer le mot de passe</label>
              <input type="password" value={confirmationMotDePasse} onChange={e => setConfirmationMotDePasse(e.target.value)} required style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--color-border)', background: 'var(--color-bg-body)', color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-start', marginTop: 8 }}>
              <button type="submit" className="btn-primary" disabled={loadingPass} style={{ padding: '10px 20px', fontSize: 13 }}>
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
