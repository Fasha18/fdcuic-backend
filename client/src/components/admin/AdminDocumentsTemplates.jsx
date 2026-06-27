import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './styles/admin-documents-templates.css';

function AdminDocumentsTemplates({ typeCode }) {
  // STATE
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // MODALS
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [editedDocument, setEditedDocument] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  
  // MESSAGES
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // EFFECTS
  useEffect(() => {
    fetchDocuments();
  }, [typeCode]);

  // API CALLS
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/types-projet/${typeCode}/documents`);
      // Parse sections JSON si elles arrivent sous forme de string
      const docs = (response.data.documents || []).map(doc => ({
        ...doc,
        sections: typeof doc.sections === 'string' ? JSON.parse(doc.sections) : (doc.sections || [])
      }));
      setDocuments(docs);
      setError(null);
    } catch (err) {
      console.error('Erreur chargement documents:', err);
      setError('Impossible de charger les documents');
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async () => {
    try {
      // VALIDATIONS
      if (!editedDocument.label || editedDocument.label.length < 3) {
        setErrorMessage('❌ Le label doit faire au moins 3 caractères');
        return;
      }
      if (editedDocument.description && editedDocument.description.length > 500) {
        setErrorMessage('❌ La description ne peut pas dépasser 500 caractères');
        return;
      }
      if (!editedDocument.sections || editedDocument.sections.length === 0) {
        setErrorMessage('❌ Le document doit avoir au moins une section');
        return;
      }

      // API CALL
      await api.put(`/admin/templates/${editedDocument.id}`, editedDocument);

      setSuccessMessage('✅ Document modifié avec succès');
      setShowEditModal(false);
      fetchDocuments();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setErrorMessage('❌ Erreur lors de la sauvegarde');
    }
  };

  const deleteDocument = async () => {
    try {
      await api.delete(`/admin/templates/${selectedDocument.id}`);

      setSuccessMessage('✅ Document supprimé avec succès');
      setShowDeleteModal(false);
      fetchDocuments();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erreur suppression:', err);
      setErrorMessage('❌ Erreur lors de la suppression');
    }
  };

  // HANDLERS
  const handleEdit = (doc) => {
    setSelectedDocument(doc);
    setEditedDocument(JSON.parse(JSON.stringify(doc))); // Deep copy
    setExpandedSections({});
    setShowEditModal(true);
  };

  const handlePreview = (doc) => {
    setSelectedDocument(doc);
    setShowPreviewModal(true);
  };

  const handleDelete = (doc) => {
    setSelectedDocument(doc);
    setShowDeleteModal(true);
  };

  const handleAddSection = () => {
    const newSection = {
      id: `section_${Date.now()}`,
      titre: '',
      type: 'table',
      colonnes: [],
      min_lignes: 1,
      description: ''
    };
    setEditedDocument({
      ...editedDocument,
      sections: [...editedDocument.sections, newSection]
    });
  };

  const handleDeleteSection = (sectionId) => {
    setEditedDocument({
      ...editedDocument,
      sections: editedDocument.sections.filter(s => s.id !== sectionId)
    });
  };

  const handleUpdateSection = (sectionId, updates) => {
    setEditedDocument({
      ...editedDocument,
      sections: editedDocument.sections.map(s =>
        s.id === sectionId ? { ...s, ...updates } : s
      )
    });
  };

  const toggleSection = (sectionId) => {
    setExpandedSections({
      ...expandedSections,
      [sectionId]: !expandedSections[sectionId]
    });
  };

  // RENDER
  if (loading) return <div className="loading-state">Chargement des documents...</div>;

  return (
    <div className="admin-documents-templates">
      {/* MESSAGES */}
      {successMessage && <div className="message-success">{successMessage}</div>}
      {errorMessage && <div className="message-error">{errorMessage}</div>}
      {error && <div className="message-error">{error}</div>}

      {/* TITRE */}
      {/* <h2>Documents & Templates</h2> */}
      {/* <p className="subtitle">Configurez les documents pour ce type de projet</p> */}

      {/* DOCUMENTS LIST */}
      {documents.length === 0 ? (
        <div className="empty-state">
          <p>Aucun template configuré pour ce type de projet.</p>
          <p>Lancez le seeder pour créer les templates initiaux.</p>
        </div>
      ) : (
        <div className="documents-list">
          {documents.map(doc => (
            <div key={doc.id} className="document-card">
              {doc.obligatoire && <span className="badge-obligatoire">⚠️ OBLIGATOIRE</span>}
              
              <h3 className="doc-label">{doc.label}</h3>
              <p className="doc-description">{doc.description}</p>

              <div className="doc-sections">
                <strong>Sections ({doc.sections ? doc.sections.length : 0}) :</strong>
                <div>
                  {doc.sections && doc.sections.map((sec, idx) => (
                    <div key={idx} className="section-item">
                      • {sec.titre} ({sec.type})
                    </div>
                  ))}
                </div>
              </div>

              <div className="btn-group">
                <button className="btn-action btn-edit" onClick={() => handleEdit(doc)}>
                  📝 Modifier
                </button>
                <button className="btn-action btn-preview" onClick={() => handlePreview(doc)}>
                  👁️ Aperçu
                </button>
                <button className="btn-action btn-delete" onClick={() => handleDelete(doc)}>
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL EDIT */}
      {showEditModal && editedDocument && (
        <ModalEdit
          document={editedDocument}
          onClose={() => setShowEditModal(false)}
          onChange={setEditedDocument}
          onSave={saveDocument}
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
          onAddSection={handleAddSection}
          onDeleteSection={handleDeleteSection}
          onUpdateSection={handleUpdateSection}
        />
      )}

      {/* MODAL PREVIEW */}
      {showPreviewModal && selectedDocument && (
        <ModalPreview
          document={selectedDocument}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {/* MODAL DELETE */}
      {showDeleteModal && selectedDocument && (
        <ModalDelete
          document={selectedDocument}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={deleteDocument}
        />
      )}
    </div>
  );
}

// COMPONENTS MODALS
function ModalEdit({ document, onClose, onChange, onSave, expandedSections, onToggleSection, onAddSection, onDeleteSection, onUpdateSection }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>✏️ Modifier : {document.label}</h2>
        
        <div className="form-group">
          <label>Label du document *</label>
          <input
            type="text"
            maxLength="100"
            value={document.label}
            onChange={e => onChange({ ...document, label: e.target.value })}
            placeholder="Budget prévisionnel"
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            maxLength="500"
            value={document.description || ''}
            onChange={e => onChange({ ...document, description: e.target.value })}
            placeholder="Détaillez votre budget..."
            rows="3"
          />
          <small>{document.description ? document.description.length : 0}/500</small>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={document.obligatoire}
              onChange={e => onChange({ ...document, obligatoire: e.target.checked })}
            />
            Obligatoire pour ce type
          </label>
        </div>

        {/* SECTIONS */}
        <div className="sections-container">
          <h3>Sections ({document.sections ? document.sections.length : 0})</h3>
          {document.sections && document.sections.map((section, idx) => (
            <SectionEditor
              key={section.id}
              section={section}
              isExpanded={expandedSections[section.id]}
              onToggle={() => onToggleSection(section.id)}
              onUpdate={(updates) => onUpdateSection(section.id, updates)}
              onDelete={() => onDeleteSection(section.id)}
            />
          ))}
          <button className="btn-add-section" onClick={onAddSection}>
            + Ajouter une nouvelle section
          </button>
        </div>

        <div className="modal-actions">
          <button className="btn-save" onClick={onSave}>💾 Sauvegarder</button>
          <button className="btn-cancel" onClick={onClose}>❌ Annuler</button>
        </div>
      </div>
    </div>
  );
}

function SectionEditor({ section, isExpanded, onToggle, onUpdate, onDelete }) {
  return (
    <div className="section-editor">
      <div className="section-header" onClick={onToggle}>
        <span>{isExpanded ? '▼' : '▶'} {section.titre || 'Sans titre'} ({section.type})</span>
        <button className="btn-delete-section" onClick={(e) => { e.stopPropagation(); onDelete(); }}>🗑️</button>
      </div>

      {isExpanded && (
        <div className="section-body">
          <div className="form-group">
            <label>Titre *</label>
            <input
              type="text"
              value={section.titre}
              onChange={e => onUpdate({ titre: e.target.value })}
              placeholder="Titre de la section"
            />
          </div>

          <div className="form-group">
            <label>Type *</label>
            <select value={section.type} onChange={e => onUpdate({ type: e.target.value })}>
              <option value="table">table</option>
              <option value="textarea">textarea</option>
              <option value="input">input</option>
              <option value="checkbox">checkbox</option>
              <option value="calcul_auto">calcul_auto</option>
              <option value="section">section</option>
              <option value="text">text</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={section.description || ''}
              onChange={e => onUpdate({ description: e.target.value })}
              placeholder="Description (optionnel)"
            />
          </div>

          {section.type === 'table' && (
            <>
              <div className="form-group">
                <label>Colonnes *</label>
                {section.colonnes && section.colonnes.map((col, idx) => (
                  <div key={idx} className="column-item">
                    <input
                      type="text"
                      value={col}
                      onChange={e => {
                        const newColonnes = [...section.colonnes];
                        newColonnes[idx] = e.target.value;
                        onUpdate({ colonnes: newColonnes });
                      }}
                    />
                    <button onClick={() => {
                      const newColonnes = section.colonnes.filter((_, i) => i !== idx);
                      onUpdate({ colonnes: newColonnes });
                    }}>×</button>
                  </div>
                ))}
                <button className="btn-add-column" onClick={() => {
                  onUpdate({ colonnes: [...(section.colonnes || []), ''] });
                }}>+ Ajouter colonne</button>
              </div>

              <div className="form-group">
                <label>Minimum de lignes *</label>
                <input
                  type="number"
                  value={section.min_lignes || 1}
                  onChange={e => onUpdate({ min_lignes: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
            </>
          )}

          {section.type === 'textarea' && (
            <>
              <div className="form-group">
                <label>Minimum de caractères *</label>
                <input
                  type="number"
                  value={section.min_chars || 0}
                  onChange={e => onUpdate({ min_chars: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Maximum de caractères *</label>
                <input
                  type="number"
                  value={section.max_chars || 500}
                  onChange={e => onUpdate({ max_chars: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ModalPreview({ document, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-preview" onClick={e => e.stopPropagation()}>
        <h2>👁️ APERÇU CANDIDAT</h2>
        
        <h3>{document.label}</h3>
        <p>{document.description}</p>

        <hr />

        {document.sections && document.sections.map((section, idx) => (
          <div key={idx} className="section-preview">
            <h4>Section {idx + 1} : {section.titre}</h4>
            
            {section.type === 'table' && section.colonnes && (
              <table className="preview-table">
                <thead>
                  <tr>
                    {section.colonnes.map((col, i) => <th key={i}>{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Array(section.min_lignes || 1).fill(0).map((_, i) => (
                    <tr key={i}>
                      {section.colonnes.map((_, j) => <td key={j}>[____]</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {section.type === 'textarea' && (
              <textarea disabled placeholder="Texte à remplir..." rows="3" />
            )}

            {(section.type === 'input' || section.type === 'text' || section.type === 'calcul_auto') && (
              <input type="text" disabled placeholder="Champ à remplir..." />
            )}

            {section.type === 'checkbox' && (
              <label><input type="checkbox" disabled /> {section.titre}</label>
            )}
            
            {section.type === 'section' && (
                <div style={{ padding: '10px', border: '1px dashed #2A2B36' }}>[Contenu de la sous-section à remplir]</div>
            )}
          </div>
        ))}

        <button className="btn-close" onClick={onClose}>Fermer aperçu</button>
      </div>
    </div>
  );
}

function ModalDelete({ document, onClose, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-delete" onClick={e => e.stopPropagation()}>
        <h2>⚠️ {document.obligatoire ? 'ATTENTION!' : 'SUPPRIMER CE DOCUMENT'}</h2>
        
        <p style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '20px' }}>
          {document.label}
        </p>

        {document.obligatoire ? (
          <p style={{ color: '#FF6B6B', marginTop: '20px' }}>
            Ce document est OBLIGATOIRE. Les candidats ne pourront plus soumettre de dossier.
          </p>
        ) : (
          <p style={{ marginTop: '20px' }}>
            ⚠️ Cette action est IRRÉVERSIBLE.
          </p>
        )}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>❌ Annuler</button>
          <button className="btn-delete-confirm" onClick={onConfirm}>🗑️ Supprimer</button>
        </div>
      </div>
    </div>
  );
}

export default AdminDocumentsTemplates;
