import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const SecteurModal = ({ isOpen, onClose, onSaveSuccess, secteur }) => {
  const isEditing = !!secteur;
  
  const [formData, setFormData] = useState({
    code: '',
    label: '',
    description: '',
    ordre: 0,
    actif: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (secteur) {
        setFormData({
          code: secteur.code,
          label: secteur.label,
          description: secteur.description || '',
          ordre: secteur.ordre || 0,
          actif: secteur.actif,
        });
      } else {
        setFormData({ code: '', label: '', description: '', ordre: 0, actif: true });
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
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)' }}>Code *</label>
            <input 
              type="text" 
              name="code" 
              value={formData.code} 
              onChange={handleChange} 
              required 
              disabled={isEditing}
              placeholder="ex: STRUCTURATION"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: isEditing ? 'var(--color-bg-input)' : 'var(--color-bg-body)', color: 'var(--color-text-primary)' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)' }}>Label *</label>
            <input 
              type="text" 
              name="label" 
              value={formData.label} 
              onChange={handleChange} 
              required 
              placeholder="ex: Aide à la structuration"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-body)', color: 'var(--color-text-primary)' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)' }}>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="3"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-body)', color: 'var(--color-text-primary)', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)' }}>Ordre d'affichage</label>
              <input 
                type="number" 
                name="ordre" 
                value={formData.ordre} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-body)', color: 'var(--color-text-primary)' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingTop: '28px' }}>
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
