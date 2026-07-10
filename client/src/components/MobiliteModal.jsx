import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { getImageUrl } from '../utils/imageUrl';

const MobiliteModal = ({ isOpen, onClose, onSaveSuccess, programme = null }) => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    criteres_eligibilite: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (programme) {
      setFormData({
        titre: programme.titre || '',
        description: programme.description || '',
        criteres_eligibilite: programme.criteres_eligibilite || '',
      });
    } else {
      setFormData({
        titre: '',
        description: '',
        criteres_eligibilite: '',
      });
    }
    setImageFile(null);
    setImagePreview(programme?.image_couverture ? getImageUrl(programme.image_couverture) : null);
  }, [programme, isOpen]);

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
      const result = await adminService.modifierProgrammeMobilite(formData);
      let finalProgramme = result.programme;
      
      if (imageFile) {
        const imageResult = await adminService.uploadImageProgrammeMobilite(imageFile);
        if (imageResult.programme) {
          finalProgramme = imageResult.programme;
        }
      }

      onSaveSuccess(finalProgramme);
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
          <h2>Configuration du Programme Mobilité</h2>
          <button className="modal-close" onClick={onClose} type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          
          <div className="form-group" style={{ marginBottom: '8px' }}>
             <label>Image de couverture (Bannière du programme)</label>
             <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Aperçu" 
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                  />
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} />
             </div>
          </div>

          <div className="form-group">
            <label>Titre du programme</label>
            <input type="text" name="titre" value={formData.titre} onChange={handleChange} required placeholder="Ex: Programme de Mobilité Internationale" />
          </div>

          <div className="form-group">
            <label>Description globale</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows={5} placeholder="Décrivez le programme de mobilité permanent..."></textarea>
          </div>

          <div className="form-group">
            <label>Conditions d'éligibilité pour les candidats</label>
            <textarea name="criteres_eligibilite" value={formData.criteres_eligibilite} onChange={handleChange} rows={4} placeholder="Listez les conditions requises pour soumettre un dossier..."></textarea>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Mettre à jour le programme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MobiliteModal;
