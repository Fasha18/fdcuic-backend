import api from '../api/axios';

const adminService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats dashboard:', error);
      throw error;
    }
  },
  
  // ── GESTION DES CAMPAGNES (Appels à Projets Admin) ──
  getCampagnes: async () => {
    try {
      const response = await api.get('/admin/appels');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCampagneById: async (id) => {
    try {
      const response = await api.get(`/admin/appels/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  creerCampagne: async (data) => {
    try {
      const payload = {
        ...data,
        date_ouverture: data.date_debut,
        date_cloture: data.date_fin
      };
      const response = await api.post('/appels', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  modifierCampagne: async (id, data) => {
    try {
      const response = await api.put(`/admin/appels/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  supprimerCampagne: async (id) => {
    try {
      const response = await api.delete(`/admin/appels/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  cloturerCampagne: async (id) => {
    try {
      const response = await api.put(`/appels/${id}/cloturer`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  uploadImageCampagne: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('image_couverture', file);
      const response = await api.post(`/admin/appels/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCandidaturesAppel: async (id, page = 1, search = '', statut = '') => {
    try {
      const response = await api.get(`/admin/appels/${id}/candidatures`, {
        params: { page, search, statut }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ── GESTION DU PROGRAMME MOBILITÉ (Unique) ──
  getProgrammeMobilite: async () => {
    try {
      const response = await api.get('/admin/mobilite/programme');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  modifierProgrammeMobilite: async (data) => {
    try {
      const response = await api.put('/admin/mobilite/programme', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  uploadImageProgrammeMobilite: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image_couverture', file);
      const response = await api.post('/admin/mobilite/programme/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCandidaturesMobilite: async (page = 1, search = '', statut = '') => {
    try {
      const response = await api.get('/admin/mobilite', {
        params: { page, search, statut }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  changerStatutMobilite: async (id, statut) => {
    try {
      const response = await api.put(`/admin/mobilite/${id}/statut`, { statut });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // ── PERSONNEL FDCUIC ──
  getPersonnel: async () => {
    const res = await api.get('/admin/personnel');
    return res.data;
  },
  creerPersonnel: async (data) => {
    const res = await api.post('/admin/personnel', data);
    return res.data;
  },
  modifierPersonnel: async (id, data) => {
    const res = await api.put(`/admin/personnel/${id}`, data);
    return res.data;
  },
  supprimerPersonnel: async (id) => {
    const res = await api.delete(`/admin/personnel/${id}`);
    return res.data;
  },

  // ── CANDIDATS (SOUMISSIONNAIRES) ──
  getCandidats: async (page = 1, limit = 20) => {
    const res = await api.get('/admin/candidats', { params: { page, limit } });
    return res.data;
  },
  getDetailCandidat: async (id) => {
    const res = await api.get(`/admin/candidats/${id}`);
    return res.data;
  },
  getCandidatAppels: async (id) => {
    const res = await api.get(`/admin/candidats/${id}/appels`);
    return res.data;
  },
  getCandidatMobilites: async (id) => {
    const res = await api.get(`/admin/candidats/${id}/mobilites`);
    return res.data;
  },
  getCandidatHistorique: async (id) => {
    const res = await api.get(`/admin/candidats/${id}/historique`);
    return res.data;
  },
  getCandidatNotifications: async (id) => {
    const res = await api.get(`/admin/candidats/${id}/notifications`);
    return res.data;
  },
  supprimerCandidat: async (id) => {
    const res = await api.delete(`/admin/candidats/${id}`);
    return res.data;
  },

  // ── TYPES DE PROJET ──
  getTypesProjet: async () => {
    const res = await api.get('/admin/types-projet');
    return res.data;
  },
  getChampsTypeProjet: async (code) => {
    const res = await api.get(`/admin/types-projet/${code}/champs`);
    return res.data;
  },
  ajouterChampTypeProjet: async (code, data) => {
    const res = await api.post(`/admin/types-projet/${code}/champs`, data);
    return res.data;
  },
  modifierChampTypeProjet: async (id, data) => {
    const res = await api.put(`/admin/types-projet/champs/${id}`, data);
    return res.data;
  },
  supprimerChampTypeProjet: async (id) => {
    const res = await api.delete(`/admin/types-projet/champs/${id}`);
    return res.data;
  },

  // ── SECTEURS D'ACTIVITÉ ──
  getSecteurs: async () => {
    const res = await api.get('/secteurs');
    return res.data;
  },
  creerSecteur: async (data) => {
    const res = await api.post('/secteurs', data);
    return res.data;
  },
  modifierSecteur: async (id, data) => {
    const res = await api.put(`/secteurs/${id}`, data);
    return res.data;
  },
  supprimerSecteur: async (id) => {
    const res = await api.delete(`/secteurs/${id}`);
    return res.data;
  },
  
  // ── DOSSIERS BROUILLONS ──
  // Note: Un endpoint spécifique peut être nécessaire sur le backend, ou filtrer côté frontend si on utilise `getTousDossiers`.
  getTousDossiers: async () => {
    const res = await api.get('/dossiers');
    return res.data;
  },
  changerStatutDossier: async (id, statut) => {
    const res = await api.put(`/dossiers/${id}/statut`, { statut });
    return res.data;
  },
  supprimerDossier: async (id) => {
    const res = await api.delete(`/dossiers/${id}`);
    return res.data;
  },

  // ── STATS MOBILITÉ & SUPPRESSION ──
  getStatsMobilite: async () => {
    const res = await api.get('/admin/mobilite/stats');
    return res.data;
  },
  supprimerCandidatureMobilite: async (id) => {
    const res = await api.delete(`/admin/mobilite/${id}`);
    return res.data;
  },

  // ── DOCUMENT TEMPLATES ──
  getDocumentTemplatesParType: async (code) => {
    const res = await api.get(`/admin/types-projet/${code}/documents`);
    return res.data;
  },
  getTousDocumentTemplates: async () => {
    const res = await api.get('/admin/templates');
    return res.data;
  },
  creerDocumentTemplate: async (data) => {
    const res = await api.post('/admin/templates', data);
    return res.data;
  },
  modifierDocumentTemplate: async (id, data) => {
    const res = await api.put(`/admin/templates/${id}`, data);
    return res.data;
  },
  supprimerDocumentTemplate: async (id) => {
    const res = await api.delete(`/admin/templates/${id}`);
    return res.data;
  },
  uploadFichierTemplate: async (id, file) => {
    const formData = new FormData();
    formData.append('fichier', file);
    const res = await api.post(`/admin/templates/${id}/fichier`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
};

export default adminService;
