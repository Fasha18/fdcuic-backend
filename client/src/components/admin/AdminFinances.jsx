import React, { useState, useEffect } from 'react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import axios from 'axios';

const LABEL_STATUT_PAIEMENT = {
  en_attente: 'En attente',
  verse: 'Versé',
  annule: 'Annulé'
};

const COLOR_STATUT_PAIEMENT = {
  en_attente: 'var(--color-orange)',
  verse: 'var(--color-green)',
  annule: 'var(--color-red)'
};

const BG_STATUT_PAIEMENT = {
  en_attente: 'var(--color-orange-light)',
  verse: 'var(--color-green-light)',
  annule: 'var(--color-red-light)'
};

const AdminFinances = () => {
  const [subventions, setSubventions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    montant_total: 0,
    montant_verse: 0,
    montant_en_attente: 0,
    projets_attente_subvention: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSubventions();
  }, []);

  const fetchSubventions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/admin/subventions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubventions(res.data.data.subventions);
      setStats(res.data.data.stats);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  const handleUpdateStatut = async (id, newStatut) => {
    if (!window.confirm(`Confirmez-vous le passage au statut "${LABEL_STATUT_PAIEMENT[newStatut]}" ?`)) return;
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/admin/subventions/${id}`, { statut_paiement: newStatut }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchSubventions();
    } catch (err) {
      alert("Erreur lors de la mise à jour: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const fmtNum = (num) => new Intl.NumberFormat('fr-FR').format(num || 0);

  const columns = [
    { key: 'candidat', label: 'Candidat', render: (s) => <span style={{ fontWeight: 600 }}>{s.projet?.candidat ? `${s.projet.candidat.prenom} ${s.projet.candidat.nom}` : 'Inconnu'}</span> },
    { key: 'projet', label: 'Projet', render: (s) => <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.projet?.titre}>{s.projet?.titre || 'N/A'}</div> },
    { key: 'montant', label: 'Montant (FCFA)', render: (s) => <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{fmtNum(s.montant)}</span> },
    { key: 'statut', label: 'Statut Paiement', render: (s) => (
      <span style={{ 
        padding: '4px 10px', borderRadius: '20px', fontSize: 12, fontWeight: 700,
        background: BG_STATUT_PAIEMENT[s.statut_paiement],
        color: COLOR_STATUT_PAIEMENT[s.statut_paiement]
      }}>
        {LABEL_STATUT_PAIEMENT[s.statut_paiement]}
      </span>
    ) },
    { key: 'date', label: 'Date', render: (s) => new Date(s.createdAt).toLocaleDateString('fr-FR') },
    { key: 'reference', label: 'Référence', render: (s) => s.reference_virement || '-' },
    { key: 'actions', label: 'Actions', render: (s) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        {s.statut_paiement === 'en_attente' && (
          <button 
            className="action-btn" 
            style={{ color: 'var(--color-green)', borderColor: 'var(--color-green-light)' }}
            onClick={() => handleUpdateStatut(s.id, 'verse')}
            disabled={updating}
            title="Marquer comme versé"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </button>
        )}
        {s.statut_paiement === 'en_attente' && (
          <button 
            className="action-btn" 
            style={{ color: 'var(--color-red)', borderColor: 'var(--color-red-light)' }}
            onClick={() => handleUpdateStatut(s.id, 'annule')}
            disabled={updating}
            title="Annuler le paiement"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </button>
        )}
      </div>
    ) }
  ];

  if (loading) return <div className="p-4">Chargement des données financières...</div>;
  if (error) return <div className="p-4 text-red-500">Erreur : {error}</div>;

  return (
    <div className="content-grid">
      <div className="stats-grid">
        <StatCard label="Total subventions attribuées" value={fmtNum(stats.total)} icon="chart" accent="violet" delay={0} />
        <StatCard label="Montant total (FCFA)" value={fmtNum(stats.montant_total)} icon="bank" accent="blue" delay={1} />
        <StatCard label="Montant versé (FCFA)" value={fmtNum(stats.montant_verse)} icon="bank" accent="green" delay={2} />
        <StatCard label="Montant en attente (FCFA)" value={fmtNum(stats.montant_en_attente)} icon="bank" accent="orange" delay={3} />
      </div>

      {stats.projets_attente_subvention > 0 && (
        <div style={{ background: 'var(--color-orange-light)', color: 'var(--color-orange)', padding: '16px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Il y a {stats.projets_attente_subvention} projet(s) accepté(s) en attente d'attribution de subvention.
        </div>
      )}

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Liste des Subventions</h3>
        <DataTable columns={columns} data={subventions} />
      </div>
    </div>
  );
};

export default AdminFinances;
