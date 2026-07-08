import React, { useState, useEffect, useRef } from 'react';
import meService from '../services/meService';

export default function ParametresCompte() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  
  const [ancienMotDePasse, setAncienMotDePasse] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmationNouveauMotDePasse, setConfirmationNouveauMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [notificationsEmail, setNotificationsEmail] = useState(true);

  // Avatar upload
  const fileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await meService.getProfile();
      setUser(data);
      setNom(data.nom || '');
      setPrenom(data.prenom || '');
      setTelephone(data.telephone || '');
      setNotificationsEmail(data.notifications_email !== false);
    } catch (err) {
      setError('Erreur lors du chargement du profil.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 4000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await meService.updateProfile({ nom, prenom, telephone });
      showToast('Informations personnelles mises à jour avec succès.');
      // Mettre à jour le localStorage si besoin
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      localUser.nom = nom;
      localUser.prenom = prenom;
      localStorage.setItem('user', JSON.stringify(localUser));
      // Dispatch event to update topbar
      window.dispatchEvent(new Event('userUpdated'));
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la mise à jour du profil.', true);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (nouveauMotDePasse !== confirmationNouveauMotDePasse) {
      showToast('Les nouveaux mots de passe ne correspondent pas.', true);
      return;
    }
    try {
      await meService.updatePassword({ ancienMotDePasse, nouveauMotDePasse, confirmationNouveauMotDePasse });
      showToast('Mot de passe modifié avec succès.');
      setAncienMotDePasse('');
      setNouveauMotDePasse('');
      setConfirmationNouveauMotDePasse('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la modification du mot de passe.', true);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check size
    if (file.size > 5 * 1024 * 1024) {
      showToast('L\\'image est trop volumineuse (max 5 Mo).', true);
      return;
    }

    try {
      setAvatarUploading(true);
      const res = await meService.uploadAvatar(file);
      setUser({ ...user, avatar_url: res.avatar_url });
      
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      localUser.avatar_url = res.avatar_url;
      localStorage.setItem('user', JSON.stringify(localUser));
      window.dispatchEvent(new Event('userUpdated'));
      
      showToast('Photo de profil mise à jour.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors du téléversement de la photo.', true);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleToggleNotifications = async () => {
    const newVal = !notificationsEmail;
    setNotificationsEmail(newVal);
    try {
      await meService.updatePreferences(newVal);
    } catch (err) {
      setNotificationsEmail(!newVal); // revert
      showToast('Erreur lors de la mise à jour des préférences.', true);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <div>Impossible de charger le profil.</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 40, position: 'relative' }}>
      
      {/* Notifications Toast */}
      {(success || error) && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          background: error ? 'var(--color-red)' : 'var(--color-green)',
          color: '#fff', padding: '12px 24px', borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'slideDown 0.3s ease-out'
        }}>
          {error ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          )}
          {error || success}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)' }}>Paramètres du compte</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>Gérez vos informations, votre sécurité et vos préférences.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* SECTION 1: PHOTO DE PROFIL */}
        <div style={{ background: 'var(--color-bg-container)', padding: 32, borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 20 }}>Photo de profil</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ 
              width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', 
              background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 32, fontWeight: 700, flexShrink: 0,
              boxShadow: '0 4px 12px rgba(1, 68, 189, 0.2)'
            }}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`
              )}
            </div>
            <div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 12 }}>
                Format recommandé : JPG, PNG ou WEBP.<br/>Taille maximale : 5 Mo.
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/jpeg, image/png, image/webp" 
                style={{ display: 'none' }} 
              />
              <button 
                className="btn-outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
              >
                {avatarUploading ? 'Téléversement...' : 'Changer la photo'}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: INFORMATIONS DU COMPTE (Lecture seule) */}
        <div style={{ background: 'var(--color-bg-container)', padding: 32, borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 20 }}>Détails du compte</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rôle d'accès</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 20, fontSize: 14, fontWeight: 600 }}>
                {user.role === 'admin' ? 'Administrateur' : user.role === 'evaluateur' ? 'Évaluateur' : 'Candidat'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email d'authentification</div>
              <div style={{ fontSize: 15, color: 'var(--color-text-primary)', fontWeight: 500 }}>{user.email}</div>
              <div style={{ fontSize: 12, color: 'var(--color-orange)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Contactez l'administration pour modifier
              </div>
            </div>
            {user.derniere_connexion && (
              <div>
                <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dernière connexion</div>
                <div style={{ fontSize: 15, color: 'var(--color-text-secondary)' }}>
                  {new Date(user.derniere_connexion).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: INFORMATIONS PERSONNELLES */}
        <div style={{ background: 'var(--color-bg-container)', padding: 32, borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 20 }}>Informations personnelles</h2>
          <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Prénom</label>
              <input type="text" className="form-input" value={prenom} onChange={e => setPrenom(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input type="text" className="form-input" value={nom} onChange={e => setNom(e.target.value)} required />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Numéro de téléphone</label>
              <input type="tel" className="form-input" value={telephone} onChange={e => setTelephone(e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button type="submit" className="btn-primary">Enregistrer les modifications</button>
            </div>
          </form>
        </div>

        {/* SECTION 4: SECURITE */}
        <div style={{ background: 'var(--color-bg-container)', padding: 32, borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 20 }}>Sécurité</h2>
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 500 }}>
            <div className="form-group">
              <label className="form-label">Mot de passe actuel</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-input" 
                  value={ancienMotDePasse} 
                  onChange={e => setAncienMotDePasse(e.target.value)} 
                  required 
                  style={{ paddingRight: 40 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}>
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nouveau mot de passe</label>
              <input type={showPassword ? "text" : "password"} className="form-input" value={nouveauMotDePasse} onChange={e => setNouveauMotDePasse(e.target.value)} required minLength={8} />
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 6 }}>Minimum 8 caractères.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirmer le nouveau mot de passe</label>
              <input type={showPassword ? "text" : "password"} className="form-input" value={confirmationNouveauMotDePasse} onChange={e => setConfirmationNouveauMotDePasse(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 12 }}>
              <button type="submit" className="btn-primary" style={{ background: 'var(--color-bg-dark)', color: '#fff' }}>Mettre à jour le mot de passe</button>
            </div>
          </form>
        </div>

        {/* SECTION 5: PREFERENCES */}
        <div style={{ background: 'var(--color-bg-container)', padding: 32, borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', border: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 20 }}>Préférences</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 20, borderBottom: '1px solid var(--color-border-light)' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>Notifications par email</div>
              <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>Recevez des alertes concernant l'évolution de vos dossiers et les annonces.</div>
            </div>
            {/* Custom Toggle Switch */}
            <div 
              onClick={handleToggleNotifications}
              style={{ 
                width: 44, height: 24, borderRadius: 12, 
                background: notificationsEmail ? 'var(--color-primary)' : 'var(--color-border-light)',
                position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
              }}
            >
              <div style={{ 
                width: 20, height: 20, borderRadius: '50%', background: '#fff', 
                position: 'absolute', top: 2, left: notificationsEmail ? 22 : 2,
                transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }} />
            </div>
          </div>
          
        </div>

      </div>

    </div>
  );
}
