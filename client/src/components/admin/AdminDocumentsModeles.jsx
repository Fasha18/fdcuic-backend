import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Trash2, FileText, FileSpreadsheet, File as FileIcon } from 'lucide-react';
import api from '../../api/axios';

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

  const handleDelete = async (docId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;
    try {
      await api.delete(`/admin/documents-modeles/${docId}`);
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
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
                
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: 'none', background: 'var(--color-red-light)',
                    color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                  title="Supprimer ce document"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
