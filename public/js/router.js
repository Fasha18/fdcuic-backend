// ── FDCUIC Client-Side Router ──
const Router = {
  routes: {},
  currentRoute: null,

  register(path, handler) {
    this.routes[path] = handler;
  },

  navigate(path) {
    window.location.hash = path;
  },

  async _resolve() {
    const hash = window.location.hash.slice(1) || '/';
    const parts = hash.split('/').filter(Boolean);

    // Try exact match first
    if (this.routes[hash]) {
      this.currentRoute = hash;
      await this.routes[hash]();
      return;
    }

    // Try pattern match (e.g., /projets/:id)
    for (const [pattern, handler] of Object.entries(this.routes)) {
      const patternParts = pattern.split('/').filter(Boolean);
      if (patternParts.length !== parts.length) continue;

      const params = {};
      let match = true;
      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
          params[patternParts[i].slice(1)] = parts[i];
        } else if (patternParts[i] !== parts[i]) {
          match = false;
          break;
        }
      }

      if (match) {
        this.currentRoute = pattern;
        await handler(params);
        return;
      }
    }

    // Fallback
    if (this.routes['/404']) {
      await this.routes['/404']();
    }
  },

  init() {
    window.addEventListener('hashchange', () => this._resolve());
    this._resolve();
  }
};

window.Router = Router;
