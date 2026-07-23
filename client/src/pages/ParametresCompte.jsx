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
  const [typePieceIdentite, setTypePieceIdentite] = useState('CNI');
  const [numeroPieceIdentite, setNumeroPieceIdentite] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  
  const [ancienMotDePasse, setAncienMotDePasse] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmationNouveauMotDePasse, setConfirmationNouveauMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [notificationsEmail, setNotificationsEmail] = useState(true);

  // Avatar upload
  const fileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

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
      setTypePieceIdentite(data.type_piece_identite || 'CNI');
      setNumeroPieceIdentite(data.numero_piece_identite || '');
      setDateNaissance(data.date_naissance || '');
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
      await meService.updateProfile({ 
        nom, prenom, telephone, 
        type_piece_identite: typePieceIdentite, 
        numero_piece_identite: numeroPieceIdentite, 
        date_naissance: dateNaissance 
      });
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
    setLoadingPass(true);
    try {
      await meService.updatePassword({ ancienMotDePasse, nouveauMotDePasse, confirmationNouveauMotDePasse });
      showToast('Mot de passe modifié avec succès.');
      setAncienMotDePasse('');
      setNouveauMotDePasse('');
      setConfirmationNouveauMotDePasse('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la modification du mot de passe.', true);
    } finally {
      setLoadingPass(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check size
    if (file.size > 5 * 1024 * 1024) {
      showToast("L'image est trop volumineuse (max 5 Mo).", true);
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

  const calculateCompletion = () => {
    const fields = [
      { name: 'Nom', val: nom },
      { name: 'Prénom', val: prenom },
      { name: 'Email', val: user.email },
      { name: 'Téléphone', val: telephone },
      { name: 'Photo de profil', val: user.avatar_url },
      { name: 'Numéro de pièce d\'identité', val: numeroPieceIdentite },
      { name: 'Date de naissance', val: dateNaissance }
    ];
    const filled = fields.filter(f => f.val && f.val.toString().trim() !== '');
    const percentage = Math.round((filled.length / fields.length) * 100);
    const missing = fields.filter(f => !f.val || f.val.toString().trim() === '').map(f => f.name);
    return { percentage, missing };
  };

  const { percentage, missing } = calculateCompletion();
  
  // Custom logic for bar color avoiding solid red unless very low
  let barColor = '#ef4444'; // Red
  if (percentage === 100) barColor = '#1baf7a'; // Green
  else if (percentage >= 70) barColor = '#0144BD'; // Blue
  else if (percentage >= 40) barColor = '#FFB020'; // Amber/Orange

  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split('T')[0];

  const cardStyle = {
    background: 'var(--color-bg-card)',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border-light)'
  };

  const inputClass = "param-input";
  const labelClass = "param-label";

  return (
    <>
      <style>{`
        .param-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .param-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .param-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: var(--color-bg-body);
          font-size: 14px;
          color: var(--color-text-primary);
          transition: all 0.2s;
        }
        .param-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(1, 68, 189, 0.1);
          outline: none;
        }
      `}</style>
      <div style={{ maxWidth: 840, margin: '0 auto', paddingBottom: 40, position: 'relative' }}>
        
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
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>Paramètres du compte</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 14 }}>Gérez vos informations, votre sécurité et vos préférences.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
          
          {/* COLONNE GAUCHE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* PHOTO DE PROFIL & IDENTITE */}
            <div className="animate-fade-in-up" style={cardStyle}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ 
                  width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px',
                  background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 36, fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(1, 68, 189, 0.2)'
                }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`
                  )}
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                  {user.prenom} {user.nom}
                </h2>
                <div style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', background: 'var(--color-primary-light)', padding: '4px 12px', display: 'inline-block' }}>
                  {user.role === 'admin' ? 'Administrateur' : user.role === 'evaluateur' ? 'Évaluateur' : 'Candidat'}
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 20 }}>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 14, lineHeight: 1.5, textAlign: 'center' }}>
                  Format recommandé : JPG/PNG.<br/>Max 5 Mo.
                </p>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} />
                <button className="btn-primary" onClick={() => fileInputRef.current?.click()} disabled={avatarUploading} style={{ width: '100%', padding: '10px', fontSize: 13, fontWeight: 600 }}>
                  {avatarUploading ? 'Téléversement...' : 'Changer la photo'}
                </button>
              </div>
            </div>

            {/* BARRE DE COMPLETUDE */}
            <div className="animate-fade-in-up" style={{ ...cardStyle, animationDelay: '0.05s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Profil à {percentage}%</h2>
              </div>
              <div style={{ width: '100%', height: 6, background: 'var(--color-bg-body)', overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', width: `${percentage}%`, background: barColor, transition: 'width 0.5s ease-out, background 0.5s ease-out' }} />
              </div>
              {missing.length > 0 ? (
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  <strong>Manquant:</strong> {missing.join(', ')}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--color-green)', fontWeight: 600 }}>Profil complété à 100%</div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* INFORMATIONS PERSONNELLES */}
            <div className="animate-fade-in-up" style={{ ...cardStyle, animationDelay: '0.1s' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 20 }}>Informations personnelles</h2>
              <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="param-group">
                  <label className={labelClass}>Prénom</label>
                  <input type="text" className={inputClass} value={prenom} onChange={e => setPrenom(e.target.value)} required />
                </div>
                <div className="param-group">
                  <label className={labelClass}>Nom</label>
                  <input type="text" className={inputClass} value={nom} onChange={e => setNom(e.target.value)} required />
                </div>
                <div className="param-group">
                  <label className={labelClass}>Téléphone</label>
                  <input type="tel" className={inputClass} value={telephone} onChange={e => setTelephone(e.target.value)} />
                </div>
                <div className="param-group">
                  <label className={labelClass}>Date de naissance</label>
                  <input type="date" className={inputClass} value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} max={maxDate} />
                </div>
                <div className="param-group">
                  <label className={labelClass}>Type de pièce</label>
                  <select className={inputClass} value={typePieceIdentite} onChange={e => setTypePieceIdentite(e.target.value)}>
                    <option value="CNI">CNI</option>
                    <option value="Passeport">Passeport</option>
                  </select>
                </div>
                <div className="param-group">
                  <label className={labelClass}>N° de pièce</label>
                  <input type="text" className={inputClass} value={numeroPieceIdentite} onChange={e => setNumeroPieceIdentite(e.target.value)} />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>Enregistrer</button>
                </div>
              </form>
            </div>

            {/* DETAILS & PREFERENCES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="animate-fade-in-up" style={{ ...cardStyle, animationDelay: '0.15s' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 16 }}>Détails d'accès</h2>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Email</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 600 }}>{user.email}</div>
                </div>
                {user.derniere_connexion && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase' }}>Dernière connexion</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{new Date(user.derniere_connexion).toLocaleString('fr-FR')}</div>
                  </div>
                )}
              </div>
              
              <div className="animate-fade-in-up" style={{ ...cardStyle, animationDelay: '0.2s' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 16 }}>Préférences</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Notifications Email</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>Recevoir les alertes</div>
                  </div>
                  <div onClick={handleToggleNotifications} style={{ width: 40, height: 20, borderRadius: 10, background: notificationsEmail ? 'var(--color-primary)' : 'var(--color-border-light)', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: notificationsEmail ? 22 : 2, transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* SECURITE */}
            <div className="animate-fade-in-up" style={{ ...cardStyle, animationDelay: '0.25s' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 20 }}>Sécurité</h2>
              <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="param-group" style={{ gridColumn: '1 / -1' }}>
                  <label className={labelClass}>Mot de passe actuel</label>
                  <input type="password" className={inputClass} value={ancienMotDePasse} onChange={e => setAncienMotDePasse(e.target.value)} required />
                </div>
                <div className="param-group">
                  <label className={labelClass}>Nouveau mot de passe</label>
                  <input type="password" className={inputClass} value={nouveauMotDePasse} onChange={e => setNouveauMotDePasse(e.target.value)} required minLength={8} />
                </div>
                <div className="param-group">
                  <label className={labelClass}>Confirmer mot de passe</label>
                  <input type="password" className={inputClass} value={confirmationNouveauMotDePasse} onChange={e => setConfirmationNouveauMotDePasse(e.target.value)} required />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-start', marginTop: 8 }}>
                  <button type="submit" className="btn-primary" disabled={loadingPass} style={{ padding: '10px 20px', fontSize: 13 }}>
                    {loadingPass ? 'Mise à jour...' : 'Mettre à jour'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
