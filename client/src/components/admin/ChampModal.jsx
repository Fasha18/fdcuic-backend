import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const ChampModal = ({ isOpen, onClose, onSaveSuccess, champ, typeCode }) => {
  const isEditing = !!champ;
  
  const [formData, setFormData] = useState({
    nom_champ: '',
    label: '',
    type_champ: 'fichier',
    obligatoire: false,
    ordre: 1,
    actif: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (champ) {
        setFormData({
          nom_champ: champ.nom_champ,
          label: champ.label,
          type_champ: champ.type_champ || 'fichier',
          obligatoire: champ.obligatoire,
          ordre: champ.ordre || 1,
          actif: champ.actif ?? true,
        });
      } else {
        setFormData({ nom_champ: '', label: '', type_champ: 'fichier', obligatoire: false, ordre: 1, actif: true });
      }
      setError(null);
    }
  }, [isOpen, champ]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For nom_champ, remove spaces
    if (name === 'nom_champ') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\s+/g, '_').toLowerCase() }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await adminService.modifierChampTypeProjet(champ.id, formData);
      } else {
        await adminService.ajouterChampTypeProjet(typeCode, formData);
      }
      setLoading(false);
      onSaveSuccess(isEditing ? 'Champ modifié avec succès.' : 'Champ ajouté avec succès.');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card animate-slide-up" style={{
        padding: '32px', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)',
        background: 'var(--color-bg-body)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
            {isEditing ? 'Modifier le champ' : 'Nouveau champ'}
          </h3>
          <button onClick={onClose} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px', width: 32, height: 32, cursor: 'pointer', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'var(--color-red-light)', color: 'var(--color-red)', borderRadius: '8px', marginBottom: '20px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Label affiché *</label>
            <input 
              type="text" 
              name="label" 
              value={formData.label} 
              onChange={handleChange} 
              required 
              placeholder="ex: Budget prévisionnel"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Clé technique (sans espace) *</label>
            <input 
              type="text" 
              name="nom_champ" 
              value={formData.nom_champ} 
              onChange={handleChange} 
              required 
              disabled={isEditing}
              placeholder="ex: doc_budget"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--color-border)', background: isEditing ? 'var(--color-bg-body)' : 'var(--color-bg-card)', color: isEditing ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)', fontSize: 14, outline: 'none', opacity: isEditing ? 0.7 : 1 }}
              onFocus={e => { if(!isEditing) e.target.style.borderColor = 'var(--color-primary)' }}
              onBlur={e => { if(!isEditing) e.target.style.borderColor = 'var(--color-border)' }}
            />
            {isEditing && <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4, display: 'block' }}>La clé technique ne peut pas être modifiée après création.</span>}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Type de champ *</label>
              <select 
                name="type_champ" 
                value={formData.type_champ} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: 14, outline: 'none', cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              >
                <option value="fichier">Fichier</option>
                <option value="texte">Texte</option>
                <option value="boolean">Booléen (Oui/Non)</option>
                <option value="date">Date</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>Ordre *</label>
              <input 
                type="number" 
                name="ordre" 
                value={formData.ordre} 
                onChange={handleChange} 
                min="1"
                required
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', padding: '16px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                <input 
                  type="checkbox" 
                  name="obligatoire" 
                  checked={formData.obligatoire} 
                  onChange={handleChange} 
                  style={{ width: 18, height: 18, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
                Obligatoire
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                <input 
                  type="checkbox" 
                  name="actif" 
                  checked={formData.actif} 
                  onChange={handleChange} 
                  style={{ width: 18, height: 18, accentColor: 'var(--color-green)', cursor: 'pointer' }}
                />
                Actif
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '12px 20px', borderRadius: '10px', fontWeight: 600, fontSize: 14 }}>
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px 24px', borderRadius: '10px', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                  Enregistrement...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChampModal;
