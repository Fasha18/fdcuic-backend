import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { FileText, FileSpreadsheet, File as FileIcon, DownloadCloud } from 'lucide-react';
import api from '../api/axios';

const TYPE_CONFIG = {
  formation: {
    label: 'Formation',
    emoji: '🎓',
    color: 'var(--color-violet)',
    bg: 'var(--color-violet-light)',
    description: 'Programmes de formation et renforcement de capacités',
  },
  structuration: {
    label: 'Structuration',
    emoji: '🏗️',
    color: 'var(--color-primary)',
    bg: 'var(--color-primary-light)',
    description: 'Développement organisationnel des structures culturelles',
  },
  evenementiel: {
    label: 'Événementiel',
    emoji: '🎪',
    color: 'var(--color-orange)',
    bg: 'var(--color-orange-light)',
    description: 'Projets culturels et événements artistiques',
  },
};

const TYPES_ORDER = ['formation', 'structuration', 'evenementiel'];

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

export default function CandidatRessources({ onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('formation');
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments(activeTab);
  }, [activeTab]);

  const fetchDocuments = async (typeCode) => {
    try {
      setLoading(true);
      const res = await api.get(`/types-projet/${typeCode}/documents-modeles`);
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Erreur chargement documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeConfig = TYPE_CONFIG[activeTab];

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeTab="ressources"
        onTabChange={(tab) => {
          if (tab === 'apercu') navigate('/candidat');
          if (tab === 'opportunites') navigate('/candidat/appels');
          if (tab === 'mes-candidatures') navigate('/candidat/mes-dossiers');
          if (tab === 'mobilite') navigate('/candidat/mobilite');
        }}
        onLogout={onLogout}
        role="candidat"
      />

      <main className="dashboard-main">
        <Topbar
          title="Documents Importants"
          subtitle="Modèles à télécharger et remplir"
        />

        <div className="dashboard-content">
          <div className="content-grid" style={{ maxWidth: 900, margin: '0 auto' }}>

            {/* 1. SÉLECTEUR DE TYPE DE PROJET (Onglets) */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
              {TYPES_ORDER.map((code) => {
                const conf = TYPE_CONFIG[code];
                const isActive = activeTab === code;
                return (
                  <button
                    key={code}
                    onClick={() => setActiveTab(code)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '12px 24px', borderRadius: 12, border: 'none',
                      background: isActive ? conf.color : 'var(--color-bg-card)',
                      color: isActive ? '#fff' : 'var(--color-text-secondary)',
                      fontSize: 15, fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: isActive ? `0 4px 12px ${conf.color}40` : 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>{conf.emoji}</span>
                    {conf.label}
                  </button>
                );
              })}
            </div>

            {/* 2. TEXTE D'EXPLICATION CLAIR */}
            <div className="card animate-fade-in-up" style={{
              padding: 24,
              background: activeConfig.bg,
              border: `1px solid ${activeConfig.color}40`,
              marginBottom: 32
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: activeConfig.color, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 20, flexShrink: 0
                }}>!</div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 8, marginTop: 0 }}>
                    Directives importantes
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    Téléchargez ces documents, remplissez-les avec vos informations, puis reversez-les (remplis) à l'étape "Documents et annexes" lors de la soumission de votre dossier pour un projet de type <strong>{activeConfig.label}</strong>.
                    <br/><br/>
                    <strong style={{ color: 'var(--color-red)' }}>Attention :</strong> vous devez impérativement utiliser ces modèles — tout document non conforme peut entraîner l'élimination de votre dossier dès la première étape d'évaluation.
                  </p>
                </div>
              </div>
            </div>

            {/* 3 & 4. LISTE DES DOCUMENTS / ETAT VIDE */}
            <div className="card animate-fade-in-up" style={{ padding: 32, background: 'var(--color-bg-card)' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 24 }}>
                Modèles disponibles
              </h2>

              {loading ? (
                <div style={{ display: 'grid', gap: 16 }}>
                  {[1, 2].map(n => <div key={n} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
                </div>
              ) : documents.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', background: 'var(--color-bg-body)', borderRadius: 16 }}>
                  <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.5 }}>📂</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-secondary)', margin: 0 }}>Aucun modèle requis pour le moment</h3>
                  <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)', marginTop: 8 }}>
                    L'administrateur n'a pas encore configuré de documents pour la catégorie {activeConfig.label}.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                  {documents.map((doc) => (
                    <div key={doc.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '20px', borderRadius: 16, border: '1px solid var(--color-border-light)',
                      background: 'var(--color-bg-body)', transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--color-bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                          {getFileIcon(doc.type_mime)}
                        </div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 4 }}>{doc.nom_document}</div>
                          <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>{formatBytes(doc.taille)}</div>
                        </div>
                      </div>
                      
                      <a 
                        href={doc.chemin_fichier}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '10px 20px', borderRadius: 10, border: 'none',
                          background: activeConfig.color, color: 'white',
                          fontSize: 14, fontWeight: 700, cursor: 'pointer',
                          textDecoration: 'none', transition: 'opacity 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                        onMouseOut={e => e.currentTarget.style.opacity = '1'}
                      >
                        <DownloadCloud size={18} />
                        Télécharger
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
