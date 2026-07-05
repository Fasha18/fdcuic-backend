import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';

const AppelModal = ({ isOpen, onClose, onSaveSuccess, appel = null }) => {
  const [formData, setFormData] = useState({
    titre: '',
    date_debut: '',
    date_fin: '',
    description: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appel) {
      setFormData({
        titre: appel.titre || '',
        date_debut: appel.date_debut || '',
        date_fin: appel.date_fin || '',
        description: appel.description || '',
      });
    } else {
      setFormData({
        titre: '',
        date_debut: '',
        date_fin: '',
        description: '',
      });
    }
    setImageFile(null);
    setImagePreview(appel?.image_couverture ? (appel.image_couverture.startsWith('http') ? appel.image_couverture : `https://fdcuic-backend-production.up.railway.app/uploads/${appel.image_couverture}`) : null);
  }, [appel, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let result;
      // 1. Sauvegarder le texte d'abord
      if (appel?.id) {
        result = await adminService.modifierCampagne(appel.id, formData);
      } else {
        result = await adminService.creerCampagne(formData);
      }
      
      let finalCampagne = result.campagne || result.appel;

      // 2. Si une nouvelle image a été sélectionnée, l'uploader maintenant que nous avons l'ID
      if (imageFile && finalCampagne && finalCampagne.id) {
        const imageResult = await adminService.uploadImageCampagne(finalCampagne.id, imageFile);
        if (imageResult.campagne) {
          finalCampagne = imageResult.campagne;
        }
      }

      // 3. Informer le parent avec l'objet final (mise à jour optimiste)
      onSaveSuccess(finalCampagne);
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in-up">
        <div className="modal-header">
          <h2>{appel ? 'Consulter la Campagne' : 'Nouvelle Campagne'}</h2>
          <button className="modal-close" onClick={onClose} type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Avertissement de verrouillage */}
          {appel && appel.statut === 'ouvert' && (
            <div style={{ background: 'var(--color-red-light)', color: 'var(--color-red)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: '500' }}>
              Cet appel à projets est ouvert et publié. Ses informations sont verrouillées pour garantir l'équité des candidatures.
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '8px' }}>
             <label>Image de couverture</label>
             <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Aperçu" 
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                  />
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} disabled={appel && appel.statut === 'ouvert'} />
             </div>
          </div>

          <div className="form-group">
            <label>Titre de l'appel</label>
            <input type="text" name="titre" value={formData.titre} onChange={handleChange} required placeholder="Ex: Fonds d'innovation 2026" disabled={appel && appel.statut === 'ouvert'} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date d'ouverture</label>
              <input type="date" name="date_debut" value={formData.date_debut} 
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDebut = e.target.value;
                  let newFin = formData.date_fin;
                  if (newDebut && newFin && new Date(newDebut) >= new Date(newFin)) {
                    newFin = '';
                  }
                  setFormData({ ...formData, date_debut: newDebut, date_fin: newFin });
                }} 
                required disabled={appel && appel.statut === 'ouvert'} />
            </div>
            <div className="form-group">
              <label>Date de fermeture</label>
              <input type="date" name="date_fin" value={formData.date_fin} 
                min={formData.date_debut ? (() => { const d = new Date(formData.date_debut); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })() : ''}
                disabled={(appel && appel.statut === 'ouvert') || !formData.date_debut}
                onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} placeholder="Décrivez les objectifs de cet appel à projets..." disabled={appel && appel.statut === 'ouvert'}></textarea>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Fermer
            </button>
            {(!appel || appel.statut !== 'ouvert') && (
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Enregistrement...' : (appel ? 'Mettre à jour' : 'Publier l\'appel')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppelModal;
