import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const SecteurModal = ({ isOpen, onClose, onSaveSuccess, secteur }) => {
  const isEditing = !!secteur;
  
  const ICONS = [
    { name: 'music_note', label: 'Musique' },
    { name: 'theater_comedy', label: 'Théâtre' },
    { name: 'directions_run', label: 'Danse' },
    { name: 'palette', label: 'Arts visuels' },
    { name: 'book', label: 'Littérature' },
    { name: 'movie', label: 'Cinéma' },
    { name: 'landscape', label: 'Patrimoine' },
    { name: 'celebration', label: 'Cirque' },
    { name: 'camera_alt', label: 'Photographie' },
    { name: 'mic', label: 'Performance' },
    { name: 'computer', label: 'Arts numériques' },
    { name: 'public', label: 'Géographie' },
  ];

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    icone: 'palette',
    actif: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (secteur) {
        setFormData({
          nom: secteur.nom,
          description: secteur.description || '',
          icone: secteur.icone || 'palette',
          actif: secteur.actif,
        });
      } else {
        setFormData({ nom: '', description: '', icone: 'palette', actif: true });
      }
      setError(null);
    }
  }, [isOpen, secteur]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Frontend Validations
    if (formData.nom.length < 3 || formData.nom.length > 50) {
      setError("Le nom doit contenir entre 3 et 50 caractères.");
      setLoading(false);
      return;
    }
    if (formData.description.length < 10 || formData.description.length > 500) {
      setError("La description doit contenir entre 10 et 500 caractères.");
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        await adminService.modifierSecteur(secteur.id, formData);
      } else {
        await adminService.creerSecteur(formData);
      }
      setLoading(false);
      onSaveSuccess(isEditing ? 'Secteur modifié avec succès.' : 'Secteur créé avec succès.');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="modal-content animate-slide-up" style={{
        background: 'var(--color-bg-body)', padding: '32px', borderRadius: '16px',
        width: '100%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {isEditing ? 'Modifier le secteur' : 'Nouveau secteur'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '20px', fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)' }}>Nom *</label>
            <input 
              type="text" 
              name="nom" 
              value={formData.nom} 
              onChange={handleChange} 
              required 
              placeholder="Ex: Musique"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-body)', color: 'var(--color-text-primary)' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)' }}>Description *</label>
              <span style={{ fontSize: 12, color: formData.description.length < 10 || formData.description.length > 500 ? 'var(--color-red)' : 'var(--color-text-tertiary)' }}>
                {formData.description.length} / 500
              </span>
            </div>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              required
              placeholder="Décrivez ce secteur..."
              rows="3"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-body)', color: 'var(--color-text-primary)', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)' }}>Icône *</label>
              {formData.icone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                  Aperçu: <span className="material-icons" style={{ fontSize: 18 }}>{formData.icone}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', maxHeight: '160px', overflowY: 'auto', padding: '4px' }}>
              {ICONS.map((icon) => (
                <div
                  key={icon.name}
                  onClick={() => setFormData({ ...formData, icone: icon.name })}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '8px', borderRadius: '8px', cursor: 'pointer',
                    border: formData.icone === icon.name ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: formData.icone === icon.name ? 'var(--color-primary-light)' : 'var(--color-bg-body)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 24, color: formData.icone === icon.name ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                    {icon.name}
                  </span>
                  <span style={{ fontSize: 10, marginTop: 4, textAlign: 'center', color: formData.icone === icon.name ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
                    {icon.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 14, color: 'var(--color-text-primary)' }}>
                <input 
                  type="checkbox" 
                  name="actif" 
                  checked={formData.actif} 
                  onChange={handleChange} 
                  style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
                />
                Secteur actif
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-primary)', cursor: 'pointer', fontWeight: 500 }}>
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: 600 }}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecteurModal;
