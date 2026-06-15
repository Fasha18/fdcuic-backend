// ── Auth Pages (Login / Register) ──
const AuthPages = {
  loginPage() {
    document.getElementById('app').innerHTML = `
      <div class="auth-layout">
        <div class="auth-panel auth-brand">
          <h1>FDCUIC</h1>
          <p>Fonds de Développement Culturel et des Industries Créatives — Plateforme de gestion des projets et subventions</p>
        </div>
        <div class="auth-panel auth-form-panel">
          <div class="auth-card">
            <h2>Connexion</h2>
            <p class="auth-subtitle">Accédez à votre espace personnel</p>
            <form id="login-form">
              <div class="form-group">
                <label class="form-label" for="login-email">Adresse email</label>
                <input class="form-input" type="email" id="login-email" placeholder="votre@email.com" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="login-password">Mot de passe</label>
                <input class="form-input" type="password" id="login-password" placeholder="••••••••" required />
              </div>
              <button type="submit" class="btn btn-primary btn-lg" id="login-btn">Se connecter</button>
            </form>
            <p class="auth-link">Pas encore de compte ? <a href="#/inscription">Créer un compte</a></p>
          </div>
        </div>
      </div>`;
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-btn');
      btn.textContent = 'Connexion...';
      btn.disabled = true;
      try {
        const data = await Api.connexion({
          email: document.getElementById('login-email').value,
          mot_de_passe: document.getElementById('login-password').value,
        });
        Api.setAuth(data.token, data.user);
        UI.toast('Connexion réussie !', 'success');
        const role = data.user.role;
        if (role === 'admin') Router.navigate('/admin');
        else if (role === 'evaluateur') Router.navigate('/evaluateur');
        else Router.navigate('/dashboard');
      } catch (err) {
        UI.toast(err.message || 'Identifiants incorrects', 'error');
        btn.textContent = 'Se connecter';
        btn.disabled = false;
      }
    });
  },

  registerPage() {
    document.getElementById('app').innerHTML = `
      <div class="auth-layout">
        <div class="auth-panel auth-brand">
          <h1>FDCUIC</h1>
          <p>Créez votre compte candidat pour soumettre vos projets et demandes de mobilité</p>
        </div>
        <div class="auth-panel auth-form-panel">
          <div class="auth-card">
            <h2>Inscription</h2>
            <p class="auth-subtitle">Créez votre compte candidat</p>
            <form id="register-form">
              <div class="form-row">
                <div class="form-group"><label class="form-label" for="reg-nom">Nom</label><input class="form-input" id="reg-nom" placeholder="Nom" required /></div>
                <div class="form-group"><label class="form-label" for="reg-prenom">Prénom</label><input class="form-input" id="reg-prenom" placeholder="Prénom" required /></div>
              </div>
              <div class="form-group"><label class="form-label" for="reg-tel">Téléphone</label><input class="form-input" id="reg-tel" placeholder="+221 7X XXX XX XX" /></div>
              <div class="form-group"><label class="form-label" for="reg-email">Adresse email</label><input class="form-input" type="email" id="reg-email" placeholder="votre@email.com" required /></div>
              <div class="form-row">
                <div class="form-group"><label class="form-label" for="reg-pass">Mot de passe</label><input class="form-input" type="password" id="reg-pass" placeholder="Min. 8 caractères" required /></div>
                <div class="form-group"><label class="form-label" for="reg-confirm">Confirmation</label><input class="form-input" type="password" id="reg-confirm" placeholder="Confirmer" required /></div>
              </div>
              <button type="submit" class="btn btn-primary btn-lg" id="reg-btn">Créer mon compte</button>
            </form>
            <p class="auth-link">Déjà inscrit ? <a href="#/connexion">Se connecter</a></p>
          </div>
        </div>
      </div>`;
    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('reg-btn');
      btn.textContent = 'Création...';
      btn.disabled = true;
      try {
        await Api.inscription({
          nom: document.getElementById('reg-nom').value,
          prenom: document.getElementById('reg-prenom').value,
          telephone: document.getElementById('reg-tel').value,
          email: document.getElementById('reg-email').value,
          mot_de_passe: document.getElementById('reg-pass').value,
          confirmation_mot_de_passe: document.getElementById('reg-confirm').value,
        });
        UI.toast('Compte créé avec succès !', 'success');
        Router.navigate('/connexion');
      } catch (err) {
        UI.toast(err.message || 'Erreur lors de l\'inscription', 'error');
        btn.textContent = 'Créer mon compte';
        btn.disabled = false;
      }
    });
  }
};

window.AuthPages = AuthPages;
