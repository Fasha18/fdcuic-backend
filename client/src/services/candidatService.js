import api from '../api/axios';

const candidatService = {
  // Appels à projets
  getMesAppels: async () => {
    const res = await api.get('/dossiers/mes-dossiers');
    return res.data;
  },
  getAppelsOuverts: async () => {
    // Il faut utiliser /appels qui est public
    const res = await api.get('/appels');
    return res.data;
  },
  getTousAppels: async () => {
    const res = await api.get('/appels/tous');
    return res.data;
  },
  getDetailAppel: async (id) => {
    const res = await api.get(`/appels/${id}`);
    return res.data;
  },

  // Candidatures (Appels)
  soumettreEtape1: async (data) => {
    const res = await api.post('/dossiers/etape1', data);
    return res.data;
  },
  soumettreEtape2: async (id, data) => {
    const res = await api.put(`/dossiers/${id}/etape2`, data);
    return res.data;
  },
  soumettreEtape3: async (id, formData) => {
    const res = await api.put(`/dossiers/${id}/etape3`, formData);
    return res.data;
  },
  soumettreDossier: async (id) => {
    const res = await api.put(`/dossiers/${id}/soumettre`);
    return res.data;
  },

  // Mobilité
  getMesMobilites: async () => {
    const res = await api.get('/mobilite/mes-projets');
    return res.data;
  },
  getProgrammeMobilite: async () => {
    const res = await api.get('/mobilite/programme-infos');
    return res.data;
  },
  getProgrammeMobiliteStats: async () => {
    const res = await api.get('/mobilite/programme-stats');
    return res.data;
  },
  soumettreMobiliteEtape1: async (data) => {
    const res = await api.post('/mobilite/etape1', data);
    return res.data;
  },
  soumettreMobiliteEtape2: async (id, data) => {
    const res = await api.put(`/mobilite/${id}/etape2`, data);
    return res.data;
  },
  soumettreMobiliteEtape3: async (id, data) => {
    const res = await api.put(`/mobilite/${id}/etape3`, data);
    return res.data;
  },
  soumettreMobiliteEtape4: async (id, formData) => {
    const res = await api.put(`/mobilite/${id}/etape4`, formData);
    return res.data;
  },
  soumettreMobiliteDossier: async (id) => {
    const res = await api.put(`/mobilite/${id}/soumettre`);
    return res.data;
  },

  // Notifications
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  }
};

export default candidatService;
