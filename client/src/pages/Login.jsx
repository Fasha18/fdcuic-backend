import { useState } from 'react';
import api from '../api/axios';

const Login = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  
  const [erreur, setErreur] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validatePhoneKey = (e) => {
    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '+'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmit = async () => {
    setLoading(true); setErreur(''); setSuccess(''); setFieldErrors({});
    try {
      if (isRegistering) {
        let errors = {};
        if (!nom) errors.nom = 'Ce champ est obligatoire';
        if (!prenom) errors.prenom = 'Ce champ est obligatoire';
        if (!email) errors.email = 'Ce champ est obligatoire';
        if (!telephone) errors.telephone = 'Ce champ est obligatoire';
        else if (!/^(\+221|00221)?[7][0|5|6|7|8][0-9]{7}$/.test(telephone)) errors.telephone = 'Numéro de téléphone sénégalais invalide';
        
        if (!motDePasse) errors.motDePasse = 'Ce champ est obligatoire';
        else if (motDePasse.length < 8) errors.motDePasse = 'Le mot de passe doit contenir au moins 8 caractères.';
        if (motDePasse !== confirmationMotDePasse) errors.confirmationMotDePasse = 'Les mots de passe ne correspondent pas.';

        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          setErreur('Veuillez corriger les erreurs dans le formulaire.');
          setLoading(false);
          return;
        }

        const res = await api.post('/auth/inscription', {
          nom, prenom, email, telephone, mot_de_passe: motDePasse, confirmation_mot_de_passe: confirmationMotDePasse
        });
        setSuccess(res.data.message || 'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.');
        setIsRegistering(false);
        // Clear fields
        setMotDePasse('');
        setConfirmationMotDePasse('');
      } else {
        if (!email || !motDePasse) { setErreur('Veuillez remplir tous les champs.'); setLoading(false); return; }
        const res = await api.post('/auth/connexion', { email, mot_de_passe: motDePasse });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onLogin(res.data.user.role);
      }
    } catch (err) {
      setErreur(err.response?.data?.message || 'Une erreur est survenue.');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .login-root {
          min-height: 100vh;
          background: var(--color-bg-body);
          display: flex;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Grille de fond subtile */
        .login-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(79, 106, 246, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79, 106, 246, 0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* Lumière ambiante */
        .glow {
          position: fixed;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(79, 106, 246, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .glow-1 { top: -200px; right: -100px; }
        .glow-2 { bottom: -200px; left: -100px; background: radial-gradient(circle, rgba(21, 170, 191, 0.06) 0%, transparent 70%); }

        /* Panneau gauche */
        .left-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px;
          position: relative;
        }

        .left-panel::after {
          content: '';
          position: absolute;
          right: 0; top: 10%; bottom: 10%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(79, 106, 246, 0.3), transparent);
        }

        .brand-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(79, 106, 246, 0.1);
          border: 1px solid rgba(79, 106, 246, 0.2);
          border-radius: 20px;
          padding: 6px 14px;
          margin-bottom: 48px;
          width: fit-content;
        }

        .brand-tag-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--color-primary);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .brand-tag span {
          color: var(--color-primary);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .left-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 72px;
          font-weight: 300;
          color: var(--color-text-primary);
          line-height: 1;
          margin-bottom: 8px;
          letter-spacing: -1px;
        }

        .left-title em {
          font-style: italic;
          color: var(--color-primary);
        }

        .left-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          color: var(--color-text-secondary);
          font-weight: 300;
          margin-bottom: 56px;
          font-style: italic;
        }

        .stats-row {
          display: flex;
          gap: 48px;
        }

        .stat-item {
          position: relative;
        }

        .stat-item::before {
          content: '';
          position: absolute;
          left: -16px; top: 50%;
          transform: translateY(-50%);
          width: 2px; height: 24px;
          background: var(--color-primary);
          border-radius: 2px;
        }

        .stat-item:first-child::before { display: none; }

        .stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px;
          font-weight: 600;
          color: var(--color-text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 11px;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 4px;
        }

        /* Panneau droit — formulaire */
        .right-panel {
          width: 480px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 48px;
          overflow-y: auto;
        }
        
        .right-panel::-webkit-scrollbar {
          width: 4px;
        }
        .right-panel::-webkit-scrollbar-thumb {
          background: var(--color-border);
          border-radius: 4px;
        }

        .form-card {
          width: 100%;
          animation: slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .form-header {
          margin-bottom: 40px;
        }

        .form-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 38px;
          font-weight: 400;
          color: var(--color-text-primary);
          margin-bottom: 8px;
          line-height: 1.1;
        }

        .form-header p {
          font-size: 13px;
          color: var(--color-text-secondary);
          font-weight: 300;
          letter-spacing: 0.3px;
        }

        .gold-line {
          width: 40px; height: 2px;
          background: var(--color-primary-gradient);
          margin: 12px 0 20px;
          border-radius: 2px;
        }

        .field-wrap {
          margin-bottom: 20px;
        }
        
        .field-row {
          display: flex;
          gap: 16px;
        }
        .field-row .field-wrap {
          flex: 1;
        }

        .field-label {
          display: block;
          font-size: 10px;
          font-weight: 500;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }

        .field-input {
          width: 100%;
          padding: 14px 16px;
          background: var(--color-bg-input);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          color: var(--color-text-primary);
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          outline: none;
        }

        .field-input.active {
          border-color: var(--color-border-focus);
          background: var(--color-bg-hover);
          box-shadow: 0 0 0 3px rgba(79, 106, 246, 0.15);
        }

        .field-input::placeholder { color: var(--color-text-tertiary); }

        .error-msg {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          padding: 12px 14px;
          margin-bottom: 20px;
          color: #f87171;
          font-size: 13px;
        }
        
        .success-msg {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(34,176,125,0.08);
          border: 1px solid rgba(34,176,125,0.2);
          border-radius: 8px;
          padding: 12px 14px;
          margin-bottom: 20px;
          color: #22B07D;
          font-size: 13px;
        }

        .submit-btn {
          width: 100%;
          padding: 15px;
          background: var(--color-primary-gradient);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
          position: relative;
          overflow: hidden;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .submit-btn:hover::before { opacity: 1; }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(79, 106, 246, 0.3); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        
        .toggle-mode {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: var(--color-text-secondary);
        }
        .toggle-mode span {
          color: var(--color-primary);
          font-weight: 600;
          cursor: pointer;
          margin-left: 4px;
        }
        .toggle-mode span:hover {
          text-decoration: underline;
        }

        .footer-note {
          text-align: center;
          font-size: 11px;
          color: var(--color-text-tertiary);
          margin-top: 32px;
          letter-spacing: 0.5px;
        }

        /* Ornement décoratif */
        .ornament {
          position: fixed;
          bottom: 40px; right: 40px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 11px;
          color: var(--color-text-tertiary);
          letter-spacing: 3px;
          text-transform: uppercase;
          writing-mode: vertical-rl;
          opacity: 0.5;
        }

        @media (max-width: 900px) {
          .left-panel { display: none; }
          .right-panel { width: 100%; }
        }
      `}</style>

      <div className="login-root">
        <div className="glow glow-1" />
        <div className="glow glow-2" />

        {/* Panneau gauche */}
        <div className="left-panel">
          <div className="brand-tag">
            <div className="brand-tag-dot" />
            <span>Plateforme Officielle</span>
          </div>

          <h1 className="left-title">
            FD<em>CUIC</em>
          </h1>
          <p className="left-subtitle">
            Plateforme des Opportunités & Subventions
          </p>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-num">4</div>
              <div className="stat-label">Types de projets</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">14</div>
              <div className="stat-label">Régions couvertes</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">8</div>
              <div className="stat-label">Secteurs d'activité</div>
            </div>
          </div>
        </div>

        {/* Panneau droit */}
        <div className="right-panel">
          <div className="form-card">
            <div className="form-header">
              <h2>Espace<br />{isRegistering ? 'Inscription' : 'Connexion'}</h2>
              <div className="gold-line" />
              <p>{isRegistering ? 'Créez votre compte pour soumettre vos dossiers' : 'Connectez-vous pour accéder à votre espace'}</p>
            </div>

            {erreur && (
              <div className="error-msg">
                <span>⚠</span> {erreur}
              </div>
            )}
            
            {success && (
              <div className="success-msg">
                <span>✓</span> {success}
              </div>
            )}

            {isRegistering && (
              <div className="field-row">
                <div className="field-wrap">
                  <label className="field-label">Nom</label>
                  <input
                    className={`field-input ${focused === 'nom' ? 'active' : ''}`}
                    type="text"
                    value={nom}
                    onChange={e => setNom(e.target.value)}
                    onFocus={() => setFocused('nom')}
                    onBlur={() => setFocused('')}
                    placeholder="Votre nom"
                  />
                </div>
                <div className="field-wrap">
                  <label className="field-label">Prénom</label>
                  <input
                    className={`field-input ${focused === 'prenom' ? 'active' : ''}`}
                    type="text"
                    value={prenom}
                    onChange={e => setPrenom(e.target.value)}
                    onFocus={() => setFocused('prenom')}
                    onBlur={() => setFocused('')}
                    placeholder="Votre prénom"
                  />
                </div>
              </div>
            )}

            {isRegistering && (
              <div className="field-wrap">
                <label className="field-label">Téléphone</label>
                <input
                  className={`field-input ${focused === 'tel' ? 'active' : ''}`}
                  type="tel"
                  value={telephone}
                  onChange={e => setTelephone(e.target.value)}
                  onFocus={() => setFocused('tel')}
                  onBlur={() => setFocused('')}
                  onKeyDown={validatePhoneKey}
                  placeholder="+221 XX XXX XX XX"
                  style={{ borderColor: fieldErrors.telephone ? 'var(--color-red)' : '' }}
                />
                {fieldErrors.telephone && (
                  <div style={{ color: 'var(--color-red)', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="12" height="12">⚠️</svg> {fieldErrors.telephone}
                  </div>
                )}
              </div>
            )}

            <div className="field-wrap">
              <label className="field-label">Adresse email</label>
              <input
                className={`field-input ${focused === 'email' ? 'active' : ''}`}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="votre@email.com"
              />
            </div>

            <div className="field-wrap">
              <label className="field-label">Mot de passe</label>
              <input
                className={`field-input ${focused === 'pass' ? 'active' : ''}`}
                type="password"
                value={motDePasse}
                onChange={e => setMotDePasse(e.target.value)}
                onFocus={() => setFocused('pass')}
                onBlur={() => setFocused('')}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••"
              />
            </div>
            
            {isRegistering && (
              <div className="field-wrap">
                <label className="field-label">Confirmer le mot de passe</label>
                <input
                  className={`field-input ${focused === 'conf' ? 'active' : ''}`}
                  type="password"
                  value={confirmationMotDePasse}
                  onChange={e => setConfirmationMotDePasse(e.target.value)}
                  onFocus={() => setFocused('conf')}
                  onBlur={() => setFocused('')}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading 
                ? 'Traitement en cours...' 
                : isRegistering ? 'Créer mon compte' : 'Accéder au tableau de bord'}
            </button>
            
            <div className="toggle-mode">
              {isRegistering ? (
                <>Déjà un compte ? <span onClick={() => {setIsRegistering(false); setErreur(''); setSuccess('');}}>Se connecter</span></>
              ) : (
                <>Pas encore de compte ? <span onClick={() => {setIsRegistering(true); setErreur(''); setSuccess('');}}>S'inscrire</span></>
              )}
            </div>

            <p className="footer-note">
              © 2026 FDCUIC — Plateforme des cultures urbaines
            </p>
          </div>
        </div>

        <div className="ornament">Cultures Urbaines</div>
      </div>
    </>
  );
};

export default Login;