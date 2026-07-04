import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileText, CheckCircle, Search, File } from 'lucide-react';
import adminService from '../../services/adminService';
import api from '../../api/axios';
import AdminDocumentsModeles from './AdminDocumentsModeles';

const TYPE_CONFIG = {
  structuration: { emoji: '🏗️', color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
  formation: { emoji: '🎓', color: 'var(--color-violet)', bg: 'var(--color-violet-light)' },
  evenementiel: { emoji: '🎪', color: 'var(--color-orange)', bg: 'var(--color-orange-light)' },
};

const AdminTypesProjet = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null); // null = mode création
  const [formData, setFormData] = useState({ label: '', description: '' });
  const [saving, setSaving] = useState(false);
  
  // Confirm Delete
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const data = await adminService.getTypesProjet();
      
      // On va aussi fetcher le nombre de documents modèles pour chaque type
      const typesWithStats = await Promise.all(data.types.map(async (t) => {
        try {
          const docsRes = await api.get(`/admin/types-projet/${t.id}/documents-modeles`);
          return { ...t, docsCount: docsRes.data.documents?.length || 0 };
        } catch (e) {
          return { ...t, docsCount: 0 };
        }
      }));
      setTypes(typesWithStats);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type = null) => {
    setSelectedType(type);
    if (type) {
      setFormData({ label: type.label, description: type.description || '' });
    } else {
      setFormData({ label: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedType(null);
    setFormData({ label: '', description: '' });
  };

  const handleSave = async () => {
    if (!formData.label.trim()) {
      alert("Le titre est obligatoire.");
      return;
    }
    
    try {
      setSaving(true);
      if (selectedType) {
        await adminService.updateTypeProjet(selectedType.id, formData);
      } else {
        await adminService.createTypeProjet(formData);
      }
      handleCloseModal();
      fetchTypes();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteTypeProjet(id);
      setConfirmDelete(null);
      fetchTypes();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  if (loading && types.length === 0) {
    return (
      <div className="content-grid">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[1, 2, 3].map(n => <div key={n} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}
        </div>
      </div>
    );
  }

  if (error && types.length === 0) {
    return (
      <div className="content-grid">
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--color-red)', fontWeight: 600 }}>{error}</p>
          <button className="btn-secondary" onClick={fetchTypes} style={{ marginTop: 16 }}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-grid">
      
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
            Types de projet
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 14 }}>
            Gérez les types de projets disponibles et leurs modèles de documents.
          </p>
        </div>
        <button
          className="btn-primary"
          style={{ padding: '10px 20px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} strokeWidth={2.5} />
          Créer un nouveau type de projet
        </button>
      </div>

      {/* ── LISTE EN CARTES ── */}
      {types.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-tertiary)' }}>
          <File size={40} strokeWidth={1.5} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.5 }} />
          Aucun type de projet. Créez-en un pour commencer.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {types.map((type, i) => {
            // Configuration visuelle fallback
            const conf = TYPE_CONFIG[type.code] || { emoji: '📁', color: 'var(--color-text-secondary)', bg: 'var(--color-bg-body)' };
            
            return (
              <div
                key={type.id}
                className="card animate-fade-in-up"
                style={{ 
                  padding: 24, 
                  background: 'var(--color-bg-card)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 16, 
                  animationDelay: `${i * 0.05}s`, 
                  transition: 'all 0.25s', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => handleOpenModal(type)}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--color-primary-light)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              >
                {/* Actions Absolues */}
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => handleOpenModal(type)}
                    style={{ background: 'var(--color-bg-body)', border: '1px solid var(--color-border-light)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                    onMouseOut={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--color-border-light)'; }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => setConfirmDelete(type)}
                    style={{ background: 'var(--color-bg-body)', border: '1px solid var(--color-border-light)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-red)', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--color-red-light)'; e.currentTarget.style.borderColor = 'var(--color-red)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'var(--color-bg-body)'; e.currentTarget.style.borderColor = 'var(--color-border-light)'; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: conf.bg, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {conf.emoji}
                  </div>
                  <div style={{ flex: 1, paddingRight: 60 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>{type.label}</h3>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-tertiary)', marginTop: 2, background: 'var(--color-bg-body)', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>{type.code}</div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5, flex: 1 }}>
                  {type.description || 'Aucune description fournie.'}
                </p>

                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border-light)', paddingTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={16} color="var(--color-primary)" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {type.docsCount !== undefined ? `${type.docsCount} document${type.docsCount > 1 ? 's' : ''} modèle${type.docsCount > 1 ? 's' : ''}` : 'Chargement...'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODALE CRÉATION/ÉDITION ── */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'var(--color-overlay)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24
        }}>
          <div className="card animate-slide-up" style={{ width: '100%', maxWidth: 700, padding: 0, background: 'var(--color-bg-card)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>
            
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {selectedType ? 'Modifier le type de projet' : 'Nouveau type de projet'}
              </h2>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <Trash2 size={20} style={{ display: 'none' }} /> {/* Just a placeholder trick */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div style={{ padding: '32px', overflowY: 'auto' }}>
              
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Edit2 size={14} color="var(--color-text-tertiary)" />
                  Titre du type de projet <span style={{ color: 'var(--color-red)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Ex: Formation, Structuration..."
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-body)', color: 'var(--color-text-primary)', fontSize: 15, outline: 'none', transition: 'border 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Edit2 size={14} color="var(--color-text-tertiary)" />
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Courte description de ce type de projet..."
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-body)', color: 'var(--color-text-primary)', fontSize: 15, outline: 'none', resize: 'vertical', transition: 'border 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>

              {/* SECTION DOCUMENTS MODELES */}
              {selectedType ? (
                <div style={{ marginTop: 16 }}>
                  <AdminDocumentsModeles typeId={selectedType.id} />
                </div>
              ) : (
                <div style={{ padding: 32, background: 'var(--color-bg-body)', border: '1px dashed var(--color-border)', borderRadius: 16, textAlign: 'center' }}>
                  <FileText size={40} color="var(--color-text-tertiary)" style={{ marginBottom: 12, opacity: 0.5 }} />
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>Documents modèles</h4>
                  <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 8 }}>
                    Enregistrez d'abord ce type de projet pour pouvoir y joindre des documents modèles (PDF, Word, Excel).
                  </p>
                </div>
              )}
            </div>

            <div style={{ padding: '20px 32px', borderTop: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'flex-end', gap: 12, background: 'var(--color-bg-card)' }}>
              <button className="btn-secondary" onClick={handleCloseModal} style={{ padding: '12px 24px', borderRadius: 10 }}>Annuler</button>
              <button 
                className="btn-primary" 
                onClick={handleSave} 
                disabled={saving}
                style={{ padding: '12px 24px', borderRadius: 10, opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Enregistrement...' : (selectedType ? 'Enregistrer les modifications' : 'Ajouter le type de projet')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE ── */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'var(--color-overlay)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
        }}>
          <div className="card animate-slide-up" style={{ padding: 32, maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={26} color="var(--color-red)" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: 'var(--color-text-primary)' }}>Supprimer ce type ?</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>
              Vous êtes sur le point de supprimer le type <strong>{confirmDelete.label}</strong>. Les dossiers existants seront conservés.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)} style={{ padding: '10px 20px', borderRadius: 10, fontWeight: 600 }}>Annuler</button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--color-red)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminTypesProjet;
