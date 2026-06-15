// ── FDCUIC Main Application ──
const App = {
  init() {
    // Auth guard + routing
    this.registerRoutes();
    Router.init();
  },

  registerRoutes() {
    // Public routes
    Router.register('/connexion', () => { this.clearLayout(); AuthPages.loginPage(); });
    Router.register('/inscription', () => { this.clearLayout(); AuthPages.registerPage(); });

    // Candidat routes
    Router.register('/dashboard', () => this.guard('candidat', () => { this.renderShell('candidat'); CandidatPages.dashboard(); }));
    Router.register('/appels', () => this.guard('candidat', () => { this.renderShell('candidat'); CandidatPages.appels(); }));
    Router.register('/appels/:id', (p) => this.guard('candidat', () => { this.renderShell('candidat'); CandidatPages.appelDetail(p); }));
    Router.register('/mes-projets', () => this.guard('candidat', () => { this.renderShell('candidat'); CandidatPages.mesProjets(); }));
    Router.register('/mes-dossiers', () => this.guard('candidat', () => { this.renderShell('candidat'); CandidatPages.mesDossiers(); }));
    Router.register('/mobilite', () => this.guard('candidat', () => { this.renderShell('candidat'); CandidatPages.mobilite(); }));
    Router.register('/notifications', () => this.guard('candidat', () => { this.renderShell('candidat'); CandidatPages.notifications(); }));

    // Admin routes
    Router.register('/admin', () => this.guard('admin', () => { this.renderShell('admin'); AdminPages.dashboard(); }));
    Router.register('/admin/appels', () => this.guard('admin', () => { this.renderShell('admin'); AdminPages.appels(); }));
    Router.register('/admin/projets', () => this.guard('admin', () => { this.renderShell('admin'); AdminPages.projets(); }));
    Router.register('/admin/mobilites', () => this.guard('admin', () => { this.renderShell('admin'); AdminPages.mobilites(); }));
    Router.register('/admin/subventions', () => this.guard('admin', () => { this.renderShell('admin'); AdminPages.subventions(); }));
    Router.register('/admin/dossiers', () => this.guard('admin', () => { this.renderShell('admin'); AdminPages.dossiers(); }));

    // Evaluateur routes
    Router.register('/evaluateur', () => this.guard('evaluateur', () => { this.renderShell('evaluateur'); EvaluateurPages.dashboard(); }));

    // Default / fallback
    Router.register('/', () => {
      if (!Api.isLoggedIn()) return Router.navigate('/connexion');
      const role = Api.getUser()?.role;
      if (role === 'admin') Router.navigate('/admin');
      else if (role === 'evaluateur') Router.navigate('/evaluateur');
      else Router.navigate('/dashboard');
    });
    Router.register('/404', () => {
      this.clearLayout();
      document.getElementById('app').innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh">${UI.emptyState('🔍', 'Page introuvable', 'La page demandée n\'existe pas.', '<a href="#/" class="btn btn-primary">Retour à l\'accueil</a>')}</div>`;
    });
  },

  guard(role, callback) {
    if (!Api.isLoggedIn()) return Router.navigate('/connexion');
    const user = Api.getUser();
    if (user?.role !== role) {
      UI.toast('Accès non autorisé', 'error');
      return Router.navigate('/');
    }
    callback();
  },

  clearLayout() {
    this._currentShell = null;
  },

  renderShell(role) {
    if (this._currentShell === role) return; // Don't re-render shell
    this._currentShell = role;
    const user = Api.getUser();
    const initials = `${(user?.prenom || 'U')[0]}${(user?.nom || '')[0] || ''}`.toUpperCase();

    const navItems = this.getNavItems(role);
    const navHtml = navItems.map(section => `
      <div class="nav-section">
        ${section.title ? `<div class="nav-section-title">${section.title}</div>` : ''}
        ${section.items.map(item => `
          <a class="nav-item" data-route="${item.route}" href="#${item.route}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
            ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
          </a>
        `).join('')}
      </div>
    `).join('');

    document.getElementById('app').innerHTML = `
      <div class="app-layout">
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-brand">
            <h2>FDCUIC</h2>
            <small>Culture · Créativité · Innovation</small>
          </div>
          <nav class="sidebar-nav">${navHtml}</nav>
          <div class="sidebar-footer">
            <div class="sidebar-user">
              <div class="sidebar-avatar">${initials}</div>
              <div class="sidebar-user-info">
                <div class="name">${user?.prenom || ''} ${user?.nom || ''}</div>
                <div class="role">${user?.role || ''}</div>
              </div>
            </div>
          </div>
        </aside>
        <div class="main-wrapper">
          <header class="topbar">
            <div class="topbar-left">
              <button class="topbar-btn" onclick="document.getElementById('sidebar').classList.toggle('open')" id="menu-toggle" style="display:none">☰</button>
              <div class="topbar-breadcrumb"><strong>FDCUIC</strong> — ${this.getRoleLabel(role)}</div>
            </div>
            <div class="topbar-right">
              ${role === 'candidat' ? `<a href="#/notifications" class="topbar-btn" title="Notifications">🔔</a>` : ''}
              <button class="btn-logout" onclick="App.logout()">Déconnexion</button>
            </div>
          </header>
          <main class="main-content" id="main-content"></main>
        </div>
      </div>
    `;

    // Show hamburger on mobile
    const mq = window.matchMedia('(max-width: 1024px)');
    const toggle = document.getElementById('menu-toggle');
    const check = () => { if (toggle) toggle.style.display = mq.matches ? 'flex' : 'none'; };
    check();
    mq.addEventListener('change', check);

    // Close sidebar on mobile when clicking a nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        if (mq.matches) {
          document.getElementById('sidebar')?.classList.remove('open');
        }
      });
    });
  },

  getNavItems(role) {
    if (role === 'candidat') {
      return [
        { title: 'Principal', items: [
          { route: '/dashboard', icon: '🏠', label: 'Tableau de bord' },
          { route: '/appels', icon: '📢', label: 'Appels à projets' },
        ]},
        { title: 'Mes dossiers', items: [
          { route: '/mes-projets', icon: '📁', label: 'Mes projets' },
          { route: '/mes-dossiers', icon: '📑', label: 'Mes dossiers' },
          { route: '/mobilite', icon: '✈️', label: 'Mobilité' },
        ]},
        { title: '', items: [
          { route: '/notifications', icon: '🔔', label: 'Notifications' },
        ]},
      ];
    }
    if (role === 'admin') {
      return [
        { title: 'Tableau de bord', items: [
          { route: '/admin', icon: '📊', label: 'Vue d\'ensemble' },
        ]},
        { title: 'Gestion', items: [
          { route: '/admin/appels', icon: '📢', label: 'Appels à projets' },
          { route: '/admin/projets', icon: '📁', label: 'Projets' },
          { route: '/admin/dossiers', icon: '📑', label: 'Dossiers' },
          { route: '/admin/mobilites', icon: '✈️', label: 'Mobilités' },
          { route: '/admin/subventions', icon: '💰', label: 'Subventions' },
        ]},
      ];
    }
    if (role === 'evaluateur') {
      return [
        { title: 'Évaluation', items: [
          { route: '/evaluateur', icon: '📝', label: 'Espace évaluateur' },
        ]},
      ];
    }
    return [];
  },

  getRoleLabel(role) {
    const labels = { candidat: 'Espace Candidat', admin: 'Administration', evaluateur: 'Espace Évaluateur' };
    return labels[role] || '';
  },

  logout() {
    Api.logout();
    this._currentShell = null;
    Router.navigate('/connexion');
    UI.toast('Déconnexion réussie', 'info');
  }
};

// Start the application
document.addEventListener('DOMContentLoaded', () => App.init());
