import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import candidatService from '../services/candidatService';

export default function CandidatRessources({ onLogout }) {
  const navigate = useNavigate();
  const [typesProjet, setTypesProjet] = useState([]);
  const [typesStats, setTypesStats] = useState([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    if (selectedType) {
      fetchDocuments(selectedType.id);
    }
  }, [selectedType]);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const types = await candidatService.getTypesProjetPublic();
      setTypesProjet(types);
      if (types.length > 0) {
        setSelectedType(types[0]);
      }
      
      let total = 0;
      const stats = await Promise.all(types.map(async (type) => {
        try {
          const docs = await candidatService.getDocumentsModeles(type.id);
          total += docs.length;
          return { ...type, docCount: docs.length };
        } catch (e) {
          return { ...type, docCount: 0 };
        }
      }));
      setTypesStats(stats.filter(t => t.docCount > 0));
      setTotalDocs(total);
      
    } catch (error) {
      console.error('Erreur chargement types:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (typeId) => {
    try {
      const docs = await candidatService.getDocumentsModeles(typeId);
      setDocuments(docs);
    } catch (error) {
      console.error('Erreur chargement documents:', error);
      setDocuments([]);
    }
  };

  const getFileIcon = (mimeType, originalName) => {
    if (mimeType?.includes('pdf') || originalName?.endsWith('.pdf')) {
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#e03131" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M9 15h6M9 11h6"/>
        </svg>
      );
    }
    if (mimeType?.includes('word') || originalName?.endsWith('.doc') || originalName?.endsWith('.docx')) {
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#1c7ed6" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13l-4 4-4-4"/>
        </svg>
      );
    }
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet') || originalName?.endsWith('.xls') || originalName?.endsWith('.xlsx')) {
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2b8a3e" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8M8 9h8"/>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#8a90a0" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/>
      </svg>
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar 
        activeTab="ressources" 
        onTabChange={(tab) => {
          if (tab === 'apercu') navigate('/candidat');
          if (tab === 'opportunites') navigate('/candidat/appels');
          if (tab === 'mes-candidatures') navigate('/candidat/mes-dossiers');
          if (tab === 'mobilite') navigate('/candidat/mobilite');
          if (tab === 'ressources') navigate('/candidat/ressources');
          if (tab === 'parametres') navigate('/candidat/parametres');
          if (tab === 'profil') navigate('/candidat/profil');
        }} 
        onLogout={onLogout} 
        role="candidat" 
      />
      <main className="dashboard-main" style={{ background: '#F5F7FB', padding: 0 }}>
        <Topbar title="Documents importants" subtitle="Retrouvez ici les documents-modèles à télécharger, remplir et reverser lors de votre soumission, classés par type de projet." />
        <div className="dashboard-content" style={{ padding: '32px 40px', overflowY: 'auto' }}>
          
          {/* CARTES DE STATISTIQUES */}
          {!loading && typesProjet.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid #e9ecef', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: '#0144BD' }}></div>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#E6F0FF', color: '#0144BD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#0b1b3a', lineHeight: 1.1, marginBottom: 4 }}>{totalDocs}</div>
                    <div style={{ fontSize: 13, color: '#6b7182' }}>Documents disponibles</div>
                  </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid #e9ecef', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: '#7C5CFC' }}></div>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F0EBFF', color: '#7C5CFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#0b1b3a', lineHeight: 1.1, marginBottom: 4 }}>{typesStats.length}</div>
                    <div style={{ fontSize: 13, color: '#6b7182' }}>Types de projets couverts</div>
                  </div>
                </div>
              </div>

              {/* LISTE COMPACTE DES TYPES (CHIPS) */}
              {typesStats.length > 0 && (
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'thin' }}>
                  {typesStats.map(stat => (
                    <div key={stat.id} style={{
                      padding: '6px 12px', background: '#fff', border: '1px solid #e9ecef', borderRadius: 20,
                      fontSize: 13, fontWeight: 500, color: '#4a5164', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0144BD' }}></span>
                      {stat.label} <span style={{ color: '#8a90a0', fontSize: 12 }}>({stat.docCount})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{
            background: '#E6F0FF', borderLeft: '4px solid #0144BD', padding: '16px 20px',
            borderRadius: '0 8px 8px 0', marginBottom: 32,
            color: '#0b1b3a', fontSize: 14, lineHeight: 1.6
          }}>
            <p style={{ margin: 0 }}>
              <strong>Important :</strong> Ces documents-modèles doivent être téléchargés, remplis avec soin, 
              puis reversés (uploadés) à l'étape "Documents et annexes" lors de la soumission de votre dossier. 
              <br/><em>L'utilisation d'un document non conforme aux modèles fournis peut entraîner l'élimination du dossier lors de l'évaluation administrative.</em>
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Chargement des données...</div>
          ) : typesProjet.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: 12, border: '1px dashed #ced4da', color: '#8a90a0' }}>
              Aucun type de projet n'est actuellement configuré.
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e9ecef', overflow: 'hidden' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e9ecef', overflowX: 'auto', background: '#fafbfc' }}>
                {typesProjet.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    style={{
                      padding: '16px 24px', border: 'none', background: 'none', cursor: 'pointer',
                      fontSize: 14, fontWeight: selectedType?.id === type.id ? 700 : 500,
                      color: selectedType?.id === type.id ? '#0144BD' : '#647087',
                      borderBottom: selectedType?.id === type.id ? '2px solid #0144BD' : '2px solid transparent',
                      transition: 'all 0.2s', whiteSpace: 'nowrap'
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Contenu */}
              <div style={{ padding: '32px' }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: 18, color: '#0b1b3a', display: 'flex', alignItems: 'center', gap: 10 }}>
                  Documents requis pour : <span style={{ color: '#0144BD' }}>{selectedType?.label}</span>
                </h3>

                {documents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', background: '#F5F7FB', borderRadius: 12, color: '#647087', fontSize: 14 }}>
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ced4da" strokeWidth="1" style={{ marginBottom: 12 }}>
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/>
                    </svg>
                    <p style={{ margin: 0 }}>Aucun modèle n'est actuellement requis par l'administration pour ce type de projet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {documents.map(doc => (
                      <div key={doc.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 20px', border: '1px solid #e9ecef', borderRadius: 12,
                        background: '#fff', transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: 10, background: '#F5F7FB',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {getFileIcon(doc.type_mime, doc.nom_fichier_original)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0b1b3a', fontSize: 15, marginBottom: 4 }}>
                              {doc.nom_document}
                            </div>
                            <div style={{ fontSize: 13, color: '#8a90a0' }}>
                              {(doc.taille / 1024).toFixed(0)} KB • Fichier original : {doc.nom_fichier_original}
                            </div>
                          </div>
                        </div>

                        <a 
                          href={`/api/admin/documents-modeles/${doc.id}/telecharger`}
                          download
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 16px', background: '#F5F7FB', color: '#0144BD',
                            border: '1px solid #eef3ff', borderRadius: 8, textDecoration: 'none',
                            fontWeight: 600, fontSize: 13, transition: 'all 0.2s', cursor: 'pointer'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = '#E6F0FF'; e.currentTarget.style.borderColor = '#cfe0ff'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = '#F5F7FB'; e.currentTarget.style.borderColor = '#eef3ff'; }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          Télécharger
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
