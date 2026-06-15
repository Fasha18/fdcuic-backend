import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const AdminBrouillons = () => {
  const [brouillons, setBrouillons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBrouillons();
  }, []);

  const fetchBrouillons = async () => {
    try {
      setLoading(true);
      const data = await adminService.getTousDossiers();
      // Filtrer pour ne garder que les brouillons
      const drafts = (data.dossiers || []).filter(d => d.statut === 'brouillon');
      setBrouillons(drafts);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Chargement des brouillons...</div>;
  if (error) return <div className="p-4 text-red-500">Erreur : {error}</div>;

  return (
    <div className="content-grid">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>Dossiers Brouillons</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>Dossiers en cours de rédaction par les candidats</p>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border-light)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-text-tertiary)' }}>Candidat</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-text-tertiary)' }}>Appel</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-text-tertiary)' }}>Étape courante</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-text-tertiary)' }}>Dernière modification</th>
            </tr>
          </thead>
          <tbody>
            {brouillons.map((dossier, i) => (
              <tr key={dossier.id} style={{ borderBottom: i === brouillons.length - 1 ? 'none' : '1px solid var(--color-border-light)' }}>
                <td style={{ padding: '14px 12px', fontWeight: 600 }}>{dossier.candidat ? `${dossier.candidat.prenom} ${dossier.candidat.nom}` : 'Inconnu'}</td>
                <td style={{ padding: '14px 12px' }}>{dossier.appel?.titre || 'N/A'}</td>
                <td style={{ padding: '14px 12px' }}>
                   <span style={{ background: 'var(--color-bg-body)', padding: '4px 8px', borderRadius: '4px', fontSize: 12, fontWeight: 600 }}>
                     Étape {dossier.etape_courante} / 4
                   </span>
                </td>
                <td style={{ padding: '14px 12px', color: 'var(--color-text-secondary)' }}>{new Date(dossier.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
            ))}
            {brouillons.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Aucun brouillon en cours.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBrouillons;
