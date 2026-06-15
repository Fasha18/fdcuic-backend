import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const LABEL_STATUT = {
  brouillon: 'Brouillon',
  soumis: 'Soumis',
  en_examen: 'En examen',
  accepte: 'Accepté',
  rejete: 'Rejeté',
};

const AdminProjets = () => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDossiers();
  }, []);

  const fetchDossiers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getTousDossiers();
      // On filtre pour exclure les brouillons dans cette vue principale (ou on garde tout selon le besoin)
      const soumis = (data.dossiers || []).filter(d => d.statut !== 'brouillon');
      setDossiers(soumis);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Chargement des candidatures...</div>;
  if (error) return <div className="p-4 text-red-500">Erreur : {error}</div>;

  return (
    <div className="content-grid">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>Toutes les candidatures</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>Liste globale des dossiers soumis</p>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border-light)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-text-tertiary)' }}>Candidat</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-text-tertiary)' }}>Appel</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-text-tertiary)' }}>Type</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-text-tertiary)' }}>Date de soumission</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-text-tertiary)' }}>Statut</th>
              <th style={{ padding: '12px', textAlign: 'right', color: 'var(--color-text-tertiary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dossiers.map((dossier, i) => (
              <tr key={dossier.id} style={{ borderBottom: i === dossiers.length - 1 ? 'none' : '1px solid var(--color-border-light)' }}>
                <td style={{ padding: '14px 12px', fontWeight: 600 }}>{dossier.candidat ? `${dossier.candidat.prenom} ${dossier.candidat.nom}` : 'Inconnu'}</td>
                <td style={{ padding: '14px 12px' }}>{dossier.appel?.titre || 'N/A'}</td>
                <td style={{ padding: '14px 12px', textTransform: 'capitalize' }}>{dossier.type_projet}</td>
                <td style={{ padding: '14px 12px' }}>{new Date(dossier.updatedAt).toLocaleDateString('fr-FR')}</td>
                <td style={{ padding: '14px 12px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: 12, fontWeight: 600,
                    background: dossier.statut === 'accepte' ? 'var(--color-green-light)' : dossier.statut === 'rejete' ? 'var(--color-red-light)' : 'var(--color-orange-light)',
                    color: dossier.statut === 'accepte' ? 'var(--color-green)' : dossier.statut === 'rejete' ? 'var(--color-red)' : 'var(--color-orange)'
                  }}>
                    {LABEL_STATUT[dossier.statut] || dossier.statut}
                  </span>
                </td>
                <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                  <button className="action-btn primary" title="Voir le dossier">
                    Voir le dossier
                  </button>
                </td>
              </tr>
            ))}
            {dossiers.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Aucune candidature soumise pour le moment.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProjets;
