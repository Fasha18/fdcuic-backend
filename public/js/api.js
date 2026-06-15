// ── FDCUIC API Service Layer ──
const API_BASE = '/api';

const Api = {
  _token: localStorage.getItem('fdcuic_token'),
  _user: JSON.parse(localStorage.getItem('fdcuic_user') || 'null'),

  _headers(isJson = true) {
    const h = {};
    if (isJson) h['Content-Type'] = 'application/json';
    if (this._token) h['Authorization'] = `Bearer ${this._token}`;
    return h;
  },

  async _request(method, path, body, isFormData = false) {
    try {
      const opts = { method, headers: this._headers(!isFormData) };
      if (body) opts.body = isFormData ? body : JSON.stringify(body);
      const res = await fetch(`${API_BASE}${path}`, opts);
      let data;
      try { data = await res.json(); } catch { data = { message: `Erreur serveur (${res.status})` }; }
      if (!res.ok) throw { status: res.status, message: data.message || 'Erreur serveur', ...data };
      return data;
    } catch (err) {
      if (err.status) throw err;
      throw { status: 0, message: 'Impossible de joindre le serveur. Vérifiez votre connexion.' };
    }
  },

  setAuth(token, user) {
    this._token = token;
    this._user = user;
    localStorage.setItem('fdcuic_token', token);
    localStorage.setItem('fdcuic_user', JSON.stringify(user));
  },

  logout() {
    this._token = null;
    this._user = null;
    localStorage.removeItem('fdcuic_token');
    localStorage.removeItem('fdcuic_user');
  },

  getUser() { return this._user; },
  isLoggedIn() { return !!this._token; },

  // Auth
  inscription(data) { return this._request('POST', '/auth/inscription', data); },
  connexion(data) { return this._request('POST', '/auth/connexion', data); },

  // Appels
  listerAppels() { return this._request('GET', '/appels'); },
  detailAppel(id) { return this._request('GET', `/appels/${id}`); },
  creerAppel(data) { return this._request('POST', '/appels', data); },
  cloturerAppel(id) { return this._request('PUT', `/appels/${id}/cloturer`); },

  // Projets
  soumettreProjet(formData) { return this._request('POST', '/projets', formData, true); },
  mesProjets() { return this._request('GET', '/projets/mes-projets'); },
  tousLesProjets() { return this._request('GET', '/projets'); },
  detailProjet(id) { return this._request('GET', `/projets/${id}`); },
  changerStatutProjet(id, status) { return this._request('PUT', `/projets/${id}/statut`, { status }); },

  // Mobilité
  mobiliteEtape1(data) { return this._request('POST', '/mobilite/etape1', data); },
  mobiliteEtape2(id, data) { return this._request('PUT', `/mobilite/${id}/etape2`, data); },
  mobiliteEtape3(id, data) { return this._request('PUT', `/mobilite/${id}/etape3`, data); },
  mobiliteEtape4(id, formData) { return this._request('PUT', `/mobilite/${id}/etape4`, formData, true); },
  mobiliteSoumettre(id) { return this._request('PUT', `/mobilite/${id}/soumettre`); },
  mesMobilites() { return this._request('GET', '/mobilite/mes-projets'); },
  toutesMobilites() { return this._request('GET', '/mobilite'); },
  changerStatutMobilite(id, statut) { return this._request('PUT', `/mobilite/${id}/statut`, { statut }); },

  // Évaluations
  evaluerProjet(data) { return this._request('POST', '/evaluations', data); },
  detailEvaluation(id) { return this._request('GET', `/evaluations/${id}`); },
  modifierEvaluation(id, data) { return this._request('PUT', `/evaluations/${id}`, data); },

  // Subventions
  attribuerSubvention(data) { return this._request('POST', '/subventions', data); },
  detailSubvention(id) { return this._request('GET', `/subventions/${id}`); },
  majStatutSubvention(id, data) { return this._request('PUT', `/subventions/${id}`, data); },

  // Notifications
  mesNotifications() { return this._request('GET', '/notifications'); },
  marquerLu(id) { return this._request('PUT', `/notifications/${id}/lu`); },
  toutMarquerLu() { return this._request('PUT', '/notifications/tout-lire'); },

  // Dossiers (AppelProjet)
  dossierEtape1(data) { return this._request('POST', '/dossiers/etape1', data); },
  dossierEtape2(id, data) { return this._request('PUT', `/dossiers/${id}/etape2`, data); },
  dossierEtape3(id, formData) { return this._request('PUT', `/dossiers/${id}/etape3`, formData, true); },
  dossierSoumettre(id) { return this._request('PUT', `/dossiers/${id}/soumettre`); },
  mesDossiers() { return this._request('GET', '/dossiers/mes-dossiers'); },
  tousDossiers() { return this._request('GET', '/dossiers'); },
  changerStatutDossier(id, statut) { return this._request('PUT', `/dossiers/${id}/statut`, { statut }); },
};

window.Api = Api;
