import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../StatCard';
import DataTable from '../DataTable';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    user_id: 'tous',
    message: '',
    type: 'in_app'
  });
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const resNotifs = await axios.get('https://fdcuic-backend.onrender.com/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(resNotifs.data.notifications || []);

      const resCandidats = await axios.get('https://fdcuic-backend.onrender.com/api/admin/candidats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidats(resCandidats.data.data || []);
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) return alert('Le message est obligatoire.');
    try {
      setSending(true);
      setSuccessMsg('');
      const token = localStorage.getItem('token');
      await axios.post('https://fdcuic-backend.onrender.com/api/admin/notifications/envoyer', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Notification envoyée avec succès !');
      setFormData({ ...formData, message: '' });
      fetchData();
      
      // Cacher le message après 3 secondes
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert("Erreur lors de l'envoi: " + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  const total = notifications.length;
  const nonLues = notifications.filter(n => !n.lu).length;
  const inApp = notifications.filter(n => n.type === 'in_app').length;
  const emails = notifications.filter(n => n.type === 'email').length;

  const columns = [
    { key: 'destinataire', field: 'destinataire', label: 'Destinataire', render: (_, n) => <span style={{ fontWeight: 600 }}>{n.destinataire ? `${n.destinataire.prenom} ${n.destinataire.nom}` : 'Système/Global'}</span> },
    { key: 'message', field: 'message', label: 'Message', render: (_, n) => <div style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={n.message}>{n.message}</div> },
    { key: 'type', field: 'type', label: 'Type', render: (_, n) => (
      <span style={{ 
        padding: '4px 10px', borderRadius: '20px', fontSize: 12, fontWeight: 700,
        background: n.type === 'email' ? 'var(--color-blue-light)' : 'var(--color-violet-light)',
        color: n.type === 'email' ? 'var(--color-blue)' : 'var(--color-violet)'
      }}>
        {n.type === 'email' ? 'Email' : 'In-App'}
      </span>
    ) },
    { key: 'statut', field: 'lu', label: 'Statut', render: (_, n) => (
      <span style={{ 
        padding: '4px 10px', borderRadius: '20px', fontSize: 12, fontWeight: 700,
        background: n.lu ? 'var(--color-green-light)' : 'var(--color-orange-light)',
        color: n.lu ? 'var(--color-green)' : 'var(--color-orange)'
      }}>
        {n.lu ? 'Lue' : 'Non lue'}
      </span>
    ) },
    { key: 'date', field: 'date_envoi', label: 'Date d\'envoi', render: (_, n) => new Date(n.date_envoi || n.createdAt).toLocaleString('fr-FR') }
  ];

  if (loading) return <div className="p-4">Chargement des notifications...</div>;
  if (error) return <div className="p-4 text-red-500">Erreur : {error}</div>;

  return (
    <div className="content-grid">
      <div className="stats-grid">
        <StatCard label="Total Envoyées" value={total} icon="mail" accent="blue" delay={0} />
        <StatCard label="Non Lues (Global)" value={nonLues} icon="alert" accent="orange" delay={1} />
        <StatCard label="In-App" value={inApp} icon="bell" accent="violet" delay={2} />
        <StatCard label="Emails" value={emails} icon="mail" accent="green" delay={3} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
        {/* Historique */}
        <div className="card" style={{ padding: '24px', flex: '1 1 600px', minWidth: 0, overflowX: 'auto' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Historique des Notifications</h3>
          <DataTable columns={columns} data={notifications} />
        </div>

        {/* Formulaire d'envoi */}
        <div className="card" style={{ padding: '24px', flex: '1 1 350px', maxWidth: '400px', position: 'sticky', top: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Nouvelle Notification</h3>
          </div>

          {successMsg && (
            <div style={{ 
              background: 'var(--color-green-light)', 
              color: 'var(--color-green)', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontWeight: 600, fontSize: 14,
              border: '1px solid rgba(34, 176, 125, 0.2)'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Destinataire</label>
              <select 
                className="form-control" 
                value={formData.user_id} 
                onChange={e => setFormData({...formData, user_id: e.target.value})}
              >
                <option value="tous">Tous les candidats</option>
                {candidats.map(c => (
                  <option key={c.id} value={c.id}>{c.prenom} {c.nom} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Type de notification</label>
              <select 
                className="form-control" 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="in_app">Dans l'application (In-App)</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea 
                className="form-control" 
                rows="4" 
                placeholder="Rédigez votre message ici..."
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                required
              />
            </div>

            <button type="submit" className="action-btn primary" disabled={sending} style={{ justifyContent: 'center', padding: '12px' }}>
              {sending ? 'Envoi en cours...' : 'Envoyer la notification'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
