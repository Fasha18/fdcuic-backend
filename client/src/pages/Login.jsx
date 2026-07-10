import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [erreur, setErreur] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePhoneKey = (e) => {
    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '+'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErreur(''); setSuccess('');
    try {
      if (isRegistering) {
        if (!nom || !prenom || !email || !telephone || !motDePasse) {
          setErreur('Veuillez remplir tous les champs obligatoires.');
          setLoading(false);
          return;
        }
        if (!/^(\+221|00221)?[7][0|5|6|7|8][0-9]{7}$/.test(telephone)) {
          setErreur('Numéro de téléphone sénégalais invalide.');
          setLoading(false);
          return;
        }
        if (motDePasse.length < 8) {
          setErreur('Le mot de passe doit contenir au moins 8 caractères.');
          setLoading(false);
          return;
        }
        if (motDePasse !== confirmationMotDePasse) {
          setErreur('Les mots de passe ne correspondent pas.');
          setLoading(false);
          return;
        }

        const res = await api.post('/auth/inscription', {
          nom, prenom, email, telephone, mot_de_passe: motDePasse, confirmation_mot_de_passe: confirmationMotDePasse
        });
        setSuccess(res.data.message || 'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.');
        setIsRegistering(false);
        setMotDePasse('');
        setConfirmationMotDePasse('');
      } else {
        if (!email || !motDePasse) { 
          setErreur('Veuillez remplir tous les champs.'); 
          setLoading(false); 
          return; 
        }
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

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setErreur('');
    setSuccess('');
    setMotDePasse('');
    setConfirmationMotDePasse('');
  };

  return (
    <>
      <style>{`
        body, html { margin: 0; padding: 0; background: #fff; min-height: 100vh; }
        .ag-container-full {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #fff;
        }
        .antigravity-login-wrapper {
          position: relative;
          width: 100%;
          max-width: 1280px;
          height: 100vh;
          max-height: 820px;
          overflow: hidden;
          border-radius: 28px;
          background: linear-gradient(155deg, #eef3ff, #dce8ff 60%, #cfe0ff);
          box-shadow: 0 50px 100px -34px rgba(1, 40, 120, 0.28);
        }
        @media (max-width: 1300px) {
          .antigravity-login-wrapper { border-radius: 0; max-height: 100vh; height: 100vh; }
        }
        
        /* Typography */
        .ag-eyebrow { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 0.18em; color: #0144BD; text-transform: uppercase; margin-bottom: 8px; }
        .ag-card-title { font-family: 'DM Serif Display', serif; font-size: 34px; color: #0b1b3a; margin-bottom: 4px; }
        .ag-card-subtitle { font-family: 'Manrope', sans-serif; font-size: 15px; color: #6b7182; margin-bottom: 20px; }
        
        /* Main Title */
        .ag-main-title-block { position: absolute; left: 64px; bottom: 176px; width: 470px; z-index: 10; animation: fadeup 0.8s ease-out 0.12s both; }
        .ag-sur-title { font-family: 'Manrope', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 0.22em; color: #0144BD; margin-bottom: 16px; display: block; }
        .ag-main-title { font-family: 'DM Serif Display', serif; font-size: 74px; line-height: 0.98; letter-spacing: -1px; color: #0b1b3a; margin: 0; }
        .ag-main-title em { color: #0144BD; font-style: italic; }

        /* Card */
        .ag-card {
          position: absolute; right: 72px; top: 80px;
          width: 456px;
          padding: 32px 42px;
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 40px 90px -22px rgba(1, 40, 120, 0.4);
          z-index: 20;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
        }
        
        .ag-card::-webkit-scrollbar { width: 6px; }
        .ag-card::-webkit-scrollbar-thumb { background: rgba(1, 68, 189, 0.2); border-radius: 4px; }

        /* Form fields */
        .ag-form-group { display: flex; flex-direction: column; margin-bottom: 12px; }
        .ag-label { font-family: 'Manrope', sans-serif; font-weight: 600; font-size: 12px; color: #8a90a0; text-transform: uppercase; margin-bottom: 6px; }
        .ag-input-wrap { position: relative; display: flex; align-items: center; }
        .ag-input {
          width: 100%; font-family: 'Manrope', sans-serif; font-size: 15px; color: #0b1b3a;
          background: #fff; border: 1px solid #dbe3f2; border-radius: 12px;
          padding: 12px 16px; outline: none; transition: all 0.25s ease;
        }
        .ag-input::placeholder { color: #a0a6b4; }
        .ag-input:focus { border-color: #0144BD; box-shadow: 0 0 0 4px rgba(1, 68, 189, 0.14); }
        .ag-pwd-toggle {
          position: absolute; right: 16px; background: none; border: none;
          font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 12px;
          color: #a0a6b4; cursor: pointer; transition: color 0.2s;
        }
        .ag-pwd-toggle:hover { color: #0144BD; }
        
        .ag-link { font-family: 'Manrope', sans-serif; font-size: 14px; color: #6b7182; text-decoration: none; transition: color 0.2s; }
        .ag-link:hover { color: #0144BD; text-decoration: underline; }
        
        .ag-btn {
          width: 100%; font-family: 'Space Grotesk', 'Manrope', sans-serif; font-weight: 600; font-size: 16px;
          color: #fff; background: linear-gradient(180deg, #2f6bff, #0144BD);
          border: none; border-radius: 12px; padding: 14px; cursor: pointer;
          transition: all 0.3s ease; margin-top: 4px;
          box-shadow: 0 10px 24px -8px rgba(1, 68, 189, 0.4);
          animation: fadeup 0.6s ease-out 0.38s both;
        }
        .ag-btn:hover:not(:disabled) {
          background: linear-gradient(180deg, #3f78ff, #1052d6);
          transform: translateY(-2px);
          box-shadow: 0 18px 46px -8px rgba(1, 68, 189, 0.75);
        }
        .ag-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }

        .ag-footer-text { text-align: center; margin-top: 24px; font-family: 'Manrope', sans-serif; font-size: 14px; color: #6b7182; animation: fadeup 0.6s ease-out 0.44s both; }
        .ag-footer-text span { color: #0144BD; font-weight: 700; cursor: pointer; margin-left: 4px; }
        .ag-footer-text span:hover { text-decoration: underline; }

        /* Animations */
        @keyframes fadeup { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }

        /* Logo */
        .ag-logo { position: absolute; top: 40px; left: 64px; height: 48px; z-index: 30; animation: fadeup 0.8s ease-out 0.05s both; }

        /* Metaballs */
        .ag-metaballs { position: absolute; inset: 0; pointer-events: none; z-index: 1; overflow: hidden; animation: hueshift 16s ease-in-out infinite; }
        .ag-metaballs svg { width: 100%; height: 100%; }
        .mb-1 { animation: gooA 13s ease-in-out infinite alternate; fill: #2f6bff; }
        .mb-2 { animation: gooB 15s ease-in-out infinite alternate; fill: #0144BD; }
        .mb-3 { animation: gooC 17s ease-in-out infinite alternate; fill: #5b8dff; }
        .mb-4 { animation: gooD 19s ease-in-out infinite alternate; fill: #1e63ff; }
        .mb-5 { animation: gooE 21s ease-in-out infinite alternate; fill: #78a8ff; }
        
        @keyframes gooA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(150px,-110px)} }
        @keyframes gooB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-130px,120px)} }
        @keyframes gooC { 0%,100%{transform:translate(0,0)} 50%{transform:translate(110px,140px)} }
        @keyframes gooD { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-120px,-90px)} }
        @keyframes gooE { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(60px,-60px) scale(1.15)} }
        @keyframes hueshift { 0%,100%{filter:hue-rotate(0)} 50%{filter:hue-rotate(-16deg)} }

        /* Banner */
        .ag-alert { padding: 12px 16px; border-radius: 8px; font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 600; margin-bottom: 24px; animation: fadeup 0.3s ease-out; }
        .ag-alert-error { background: rgba(220, 38, 38, 0.1); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.2); }
        .ag-alert-success { background: rgba(34, 176, 125, 0.1); color: #22b07d; border: 1px solid rgba(34, 176, 125, 0.2); }

        .row-flex { display: flex; gap: 16px; }
        .row-flex > div { flex: 1; }

        /* Responsive */
        @media (max-width: 1024px) {
          .antigravity-login-wrapper { display: flex; align-items: center; justify-content: center; }
          .ag-main-title-block { display: none; }
          .ag-card { position: relative; right: auto; top: auto; margin: auto; width: 100%; max-width: 456px; }
          .ag-logo { left: 50%; transform: translateX(-50%); top: 40px; animation: fadeup 0.8s ease-out 0.05s both; }
        }
        @media (prefers-reduced-motion) {
          .ag-card, .mb-1, .mb-2, .mb-3, .mb-4, .mb-5, .ag-metaballs, .ag-main-title-block, .ag-logo, .ag-btn, .ag-form-group, .ag-footer-text, .ag-alert { animation: none !important; }
        }
      `}</style>
      
      <div className="ag-container-full">
        <div className="antigravity-login-wrapper">
          {/* Métaballes */}
          <div className="ag-metaballs" aria-hidden="true">
            <svg>
              <defs>
                <filter id="goo">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="b"/>
                  <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -11" result="g"/>
                </filter>
              </defs>
              <g filter="url(#goo)">
                <circle className="mb-1" cx="320" cy="340" r="180" />
                <circle className="mb-2" cx="400" cy="420" r="150" />
                <circle className="mb-3" cx="200" cy="240" r="130" />
                <circle className="mb-4" cx="440" cy="270" r="110" />
                <circle className="mb-5" cx="240" cy="440" r="90" />
              </g>
            </svg>
          </div>

          <img src="/FDCUIC_logo.png" alt="FDCUIC Logo" className="ag-logo" />

          {/* Titre Editorial */}
          <div className="ag-main-title-block">
            <span className="ag-sur-title">FONDS DES INDUSTRIES CRÉATIVES</span>
            <h1 className="ag-main-title">Donnez vie à vos <em>projets.</em></h1>
          </div>

          {/* Formulaire Card */}
          <div className="ag-card">
            <div className="ag-eyebrow">Espace porteur de projet</div>
            <h2 className="ag-card-title">{isRegistering ? 'Inscription' : 'Connexion'}</h2>
            <p className="ag-card-subtitle">{isRegistering ? 'Créez votre compte porteur de projet.' : 'Accédez à votre tableau de bord.'}</p>

            {erreur && <div className="ag-alert ag-alert-error">{erreur}</div>}
            {success && <div className="ag-alert ag-alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              {isRegistering && (
                <>
                  <div className="row-flex" style={{ animation: 'fadeup 0.6s ease-out 0.14s both' }}>
                    <div className="ag-form-group" style={{ animation: 'none' }}>
                      <label className="ag-label">Prénom</label>
                      <input type="text" className="ag-input" placeholder="Awa" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
                    </div>
                    <div className="ag-form-group" style={{ animation: 'none' }}>
                      <label className="ag-label">Nom</label>
                      <input type="text" className="ag-input" placeholder="Diop" value={nom} onChange={(e) => setNom(e.target.value)} required />
                    </div>
                  </div>
                  <div className="ag-form-group" style={{ animation: 'fadeup 0.6s ease-out 0.16s both' }}>
                    <label className="ag-label">Téléphone</label>
                    <input type="tel" className="ag-input" placeholder="77 000 00 00" value={telephone} onChange={(e) => setTelephone(e.target.value)} onKeyDown={validatePhoneKey} required />
                  </div>
                </>
              )}

              <div className="ag-form-group" style={{ animation: `fadeup 0.6s ease-out ${isRegistering ? '0.18s' : '0.18s'} both` }}>
                <label className="ag-label">Adresse email</label>
                <div className="ag-input-wrap">
                  <input type="email" className="ag-input" placeholder="vous@exemple.sn" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="ag-form-group" style={{ animation: `fadeup 0.6s ease-out ${isRegistering ? '0.20s' : '0.26s'} both` }}>
                <label className="ag-label">Mot de passe</label>
                <div className="ag-input-wrap">
                  <input type={showPassword ? "text" : "password"} className="ag-input" placeholder="••••••••" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />
                  <button type="button" className="ag-pwd-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'CACHER' : 'VOIR'}</button>
                </div>
              </div>

              {isRegistering && (
                <div className="ag-form-group" style={{ animation: 'fadeup 0.6s ease-out 0.22s both' }}>
                  <label className="ag-label">Confirmer le mot de passe</label>
                  <div className="ag-input-wrap">
                    <input type={showPassword ? "text" : "password"} className="ag-input" placeholder="••••••••" value={confirmationMotDePasse} onChange={(e) => setConfirmationMotDePasse(e.target.value)} required />
                  </div>
                </div>
              )}

              {!isRegistering && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px', animation: 'fadeup 0.6s ease-out 0.32s both' }}>
                  <a href="#" className="ag-link" onClick={(e) => { e.preventDefault(); /* handle forgot password */ }}>Mot de passe oublié ?</a>
                </div>
              )}

              <button type="submit" className="ag-btn" disabled={loading}>
                {loading ? 'Veuillez patienter...' : (isRegistering ? 'Créer mon compte' : 'Accéder au tableau de bord')}
              </button>

              <div className="ag-footer-text">
                {isRegistering ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
                <span onClick={toggleMode}>{isRegistering ? 'Se connecter' : "S'inscrire"}</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
