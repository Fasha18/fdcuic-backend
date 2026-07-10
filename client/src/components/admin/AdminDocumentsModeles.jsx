import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Trash2, FileText, FileSpreadsheet, File as FileIcon, Download, Eye } from 'lucide-react';
import api from '../../api/axios';
import { DocumentViewerButton } from '../DocumentViewer';


const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Octets';
  const k = 1024;
  const sizes = ['Octets', 'Ko', 'Mo', 'Go', 'To'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (mimeType) => {
  if (mimeType.includes('pdf')) return <FileText color="#FF3B30" size={24} />;
  if (mimeType.includes('excel') || mimeType.includes('spreadsheetml')) return <FileSpreadsheet color="#34C759" size={24} />;
  if (mimeType.includes('word') || mimeType.includes('document')) return <FileText color="#007AFF" size={24} />;
  return <FileIcon color="#8E8E93" size={24} />;
};

export default function AdminDocumentsModeles({ typeId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line
  }, [typeId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/types-projet/${typeId}/documents-modeles`);
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Erreur chargement documents modèles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('documents', files[i]);
    }

    try {
      setUploading(true);
      await api.post(`/admin/types-projet/${typeId}/documents-modeles`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = (doc) => {
    setDocumentToDelete(doc);
  };

  const confirmDelete = async () => {
    if (!documentToDelete || deleting) return;
    try {
      setDeleting(true);
      await api.delete(`/admin/documents-modeles/${documentToDelete.id}`);
      setDocumentToDelete(null);
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
      // On ferme quand même le modal si le document n'existe plus en base
      if (err.response?.status === 404) {
        setDocumentToDelete(null);
        fetchDocuments();
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ paddingTop: 16 }}>
      
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)' }}>Documents modèles à fournir aux candidats</h3>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>
          Uploadez les fichiers vierges (Word, Excel, PDF) que les candidats devront télécharger, remplir et reverser lors de leur candidature.
        </p>
      </div>

      {/* ZONE D'UPLOAD */}
      <div 
        style={{
          border: '2px dashed var(--color-border)',
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
          background: 'var(--color-bg-body)',
          marginBottom: 32,
          position: 'relative',
          transition: 'all 0.2s',
          cursor: 'pointer'
        }}
        onClick={() => fileInputRef.current?.click()}
        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
      >
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          onChange={handleFileChange}
        />
        <UploadCloud size={48} color="var(--color-primary)" style={{ marginBottom: 16, opacity: 0.8 }} />
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {uploading ? 'Upload en cours...' : 'Cliquez ou glissez-déposez pour uploader des fichiers'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginTop: 8 }}>
          Formats acceptés : PDF, Word, Excel (Max 10 Mo par fichier)
        </div>
      </div>

      {/* LISTE DES DOCUMENTS */}
      <div>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>
          Documents uploadés ({documents.length})
        </h4>
        
        {loading ? (
          <div style={{ color: 'var(--color-text-tertiary)' }}>Chargement...</div>
        ) : documents.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', background: 'var(--color-bg-body)', borderRadius: 12, color: 'var(--color-text-tertiary)' }}>
            Aucun document uploadé pour ce type de projet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {documents.map((doc) => (
              <div key={doc.id} style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                padding: '16px 20px', borderRadius: 12, border: '1px solid var(--color-border-light)',
                background: 'var(--color-bg-body)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--color-bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getFileIcon(doc.type_mime)}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{doc.nom_document}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{formatBytes(doc.taille)}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Bouton Visualiser — Ouvre la visionneuse intégrée */}
                  <DocumentViewerButton
                    url={doc.chemin_fichier}
                    nom={doc.nom_document}
                    style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Eye size={16} />
                  </DocumentViewerButton>
                  {/* Bouton Télécharger */}
                  <a
                    href={doc.chemin_fichier}
                    download={doc.nom_fichier_original || doc.nom_document}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: 36, height: 36, borderRadius: 8, border: 'none',
                      background: 'rgba(52,199,89,0.12)', color: '#34C759',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s'
                    }}
                    title="Télécharger"
                  >
                    <Download size={16} />
                  </a>
                  {/* Bouton Supprimer */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}
                    style={{
                      width: 36, height: 36, borderRadius: 8, border: 'none',
                      background: 'var(--color-red-light)', color: 'var(--color-red)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    title="Supprimer ce document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMATION DE SUPPRESSION */}
      {documentToDelete && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            background: 'var(--color-bg-card)', padding: '32px', borderRadius: '16px',
            width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 28, background: 'var(--color-red-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
            }}>
              <Trash2 size={28} color="var(--color-red)" />
            </div>
            
            <h3 style={{ textAlign: 'center', fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 12 }}>
              Supprimer le document
            </h3>
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Êtes-vous sûr de vouloir supprimer définitivement le document <br/>
              <strong style={{ color: 'var(--color-text-primary)' }}>{documentToDelete.nom_document}</strong> ?<br/>
              <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', display: 'block', marginTop: 8 }}>
                Cette action est irréversible.
              </span>
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setDocumentToDelete(null)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  background: 'var(--color-bg-body)', color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete}
                disabled={deleting}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  background: deleting ? 'var(--color-bg-body)' : 'var(--color-red)',
                  color: deleting ? 'var(--color-text-secondary)' : 'white',
                  border: 'none', fontWeight: 600, 
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  boxShadow: deleting ? 'none' : '0 4px 12px rgba(240, 62, 62, 0.3)'
                }}
              >
                {deleting ? 'Suppression...' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
