import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import ChampModal from './ChampModal';

const AdminChampsType = ({ typeCode, typeName, onBack }) => {
  const [champs, setChamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChamp, setSelectedChamp] = useState(null);

  useEffect(() => {
    fetchChamps();
  }, [typeCode]);

  const fetchChamps = async () => {
    try {
      setLoading(true);
      const data = await adminService.getChampsTypeProjet(typeCode);
      setChamps(data.champs || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  const handleOpenModal = (champ = null) => {
    setSelectedChamp(champ);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedChamp(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModal();
    fetchChamps();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce champ ?')) {
      try {
        await adminService.supprimerChampTypeProjet(id);
        fetchChamps();
      } catch (err) {
        alert(err.response?.data?.message || 'Erreur lors de la suppression.');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button 
          onClick={onBack}
          style={{ background: 'var(--color-bg-body)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px', color: 'var(--color-text-secondary)', fontWeight: 600 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Retour
        </button>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>Champs : {typeName}</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>Gérez le formulaire dynamique pour ce type de projet</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn-primary" style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)' }} onClick={() => handleOpenModal()}>
            + Ajouter un champ
          </button>
        </div>
      </div>

      {loading && champs.length === 0 ? (
        <div className="p-4">Chargement des champs...</div>
      ) : error ? (
        <div className="p-4 text-red-500">Erreur : {error}</div>
      ) : (
        <div className="card" style={{ padding: '24px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border-light)' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-text-tertiary)' }}>Ordre</th>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-text-tertiary)' }}>Nom technique</th>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-text-tertiary)' }}>Label</th>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-text-tertiary)' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'left', color: 'var(--color-text-tertiary)' }}>Obligatoire</th>
                <th style={{ padding: '12px', textAlign: 'right', color: 'var(--color-text-tertiary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {champs.map((champ, i) => (
                <tr key={champ.id} style={{ borderBottom: i === champs.length - 1 ? 'none' : '1px solid var(--color-border-light)' }}>
                  <td style={{ padding: '14px 12px', color: 'var(--color-text-tertiary)' }}>{champ.ordre}</td>
                  <td style={{ padding: '14px 12px', fontWeight: 600, fontFamily: 'monospace' }}>{champ.nom_champ}</td>
                  <td style={{ padding: '14px 12px' }}>{champ.label}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ background: 'var(--color-bg-body)', padding: '4px 8px', borderRadius: '4px', fontSize: 12 }}>
                      {champ.type_champ}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    {champ.obligatoire ? (
                      <span style={{ color: 'var(--color-red)', fontWeight: 600 }}>Oui</span>
                    ) : (
                      <span style={{ color: 'var(--color-text-secondary)' }}>Non</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleOpenModal(champ)}
                      className="action-btn primary"
                      title="Modifier">
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(champ.id)}
                      className="action-btn danger"
                      title="Supprimer">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {champs.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                    Aucun champ configuré pour ce type de projet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ChampModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSaveSuccess={handleSaveSuccess}
        champ={selectedChamp}
        typeCode={typeCode}
      />
    </div>
  );
};

export default AdminChampsType;
