import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import ChampModal from './ChampModal';

const TYPE_CONFIG = {
  structuration: { emoji: '🏗️', color: 'var(--color-primary)', bg: 'var(--color-primary-light)', desc: 'Développement organisationnel des structures' },
  formation: { emoji: '🎓', color: 'var(--color-violet)', bg: 'var(--color-violet-light)', desc: 'Programmes de formation et renforcement de capacités' },
  evenementiel: { emoji: '🎪', color: 'var(--color-orange)', bg: 'var(--color-orange-light)', desc: 'Projets culturels et événements' },
};

const AdminTypesProjet = () => {
  // Liste View State
  const [types, setTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [errorTypes, setErrorTypes] = useState(null);

  // Detail View State
  const [selectedType, setSelectedType] = useState(null);
  const [champs, setChamps] = useState([]);
  const [loadingChamps, setLoadingChamps] = useState(false);
  const [errorChamps, setErrorChamps] = useState(null);
  const [activeTab, setActiveTab] = useState('champs'); // 'champs' | 'documents'

  // Documents state
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChamp, setSelectedChamp] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoadingTypes(true);
      const data = await adminService.getTypesProjet();
      setTypes(data.types || []);
    } catch (err) {
      setErrorTypes(err.response?.data?.message || err.message);
    } finally {
      setLoadingTypes(false);
    }
  };

  const fetchChamps = async (code) => {
    try {
      setLoadingChamps(true);
      setErrorChamps(null);
      const data = await adminService.getChampsTypeProjet(code);
      setChamps(data.champs || []);
    } catch (err) {
      setErrorChamps(err.response?.data?.message || err.message);
    } finally {
      setLoadingChamps(false);
    }
  };

  const fetchDocuments = async (code) => {
    try {
      setLoadingDocs(true);
      const data = await adminService.getDocumentTemplatesParType(code);
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Erreur chargement documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleSelectType = (type) => {
    setSelectedType(type);
    setActiveTab('champs');
    fetchChamps(type.code);
    fetchDocuments(type.code);
  };

  const handleBack = () => {
    setSelectedType(null);
    setChamps([]);
    setDocuments([]);
    fetchTypes();
  };

  const handleDeleteDoc = async (id) => {
    try {
      await adminService.supprimerDocumentTemplate(id);
      setConfirmDeleteDoc(null);
      fetchDocuments(selectedType.code);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  const handleUploadFichierTemplate = async (id, file) => {
    try {
      setUploadingDoc(id);
      await adminService.uploadFichierTemplate(id, file);
      fetchDocuments(selectedType.code);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'upload.");
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDeleteChamp = async (id) => {
    try {
      await adminService.supprimerChampTypeProjet(id);
      setConfirmDelete(null);
      fetchChamps(selectedType.code);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  const TYPE_CONFIG = {
    structuration: {
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-light)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
    },
    formation: {
      color: 'var(--color-violet)',
      bg: 'var(--color-violet-light)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
    },
    evenementiel: {
      color: 'var(--color-orange)',
      bg: 'var(--color-orange-light)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
    }
  };

  if (loadingTypes && !selectedType) {
    return (
      <div className="content-grid">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[1, 2, 3].map(n => <div key={n} className="skeleton" style={{ height: 280, borderRadius: 16 }} />)}
        </div>
      </div>
    );
  }

  if (errorTypes && !selectedType) {
    return (
      <div className="content-grid">
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ color: 'var(--color-red)', fontWeight: 600 }}>{errorTypes}</p>
          <button className="btn-secondary" onClick={fetchTypes} style={{ marginTop: 16 }}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-grid">
      
      {/* ── VUE DÉTAIL ── */}
      {selectedType ? (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <button 
                onClick={handleBack}
                style={{ 
                  background: 'transparent', border: 'none', cursor: 'pointer', 
                  display: 'flex', alignItems: 'center', gap: 6, 
                  color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: 14,
                  marginBottom: 16, padding: '4px 0', transition: 'color 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Retour aux types
              </button>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
                {selectedType.label}
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 14 }}>
                Gérez les champs de formulaire et les templates de documents pour ce type de projet.
              </p>
            </div>
            <button
              className="btn-primary"
              style={{ padding: '10px 20px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => { setSelectedChamp(null); setIsModalOpen(true); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>

              Ajouter un champ
            </button>
          </div>

          {/* ── TABS ── */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid var(--color-border-light)', paddingBottom: 0 }}>
            {[
              { key: 'champs', label: 'Champs du formulaire' },
              { key: 'documents', label: `Documents & Templates (${documents.length})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '10px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--color-primary)' : '2px solid transparent',
                  marginBottom: -2, transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── ONGLET CHAMPS ── */}
          {activeTab === 'champs' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loadingChamps ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 8, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 8, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 8 }} />
              </div>
            ) : errorChamps ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-red)', fontWeight: 600 }}>{errorChamps}</div>
            ) : (

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-bg-body)' }}>
                      {['Ordre', 'Label', 'Clé technique', 'Type', 'Obligatoire', 'Actif', 'Actions'].map(h => (
                        <th key={h} style={{
                          padding: '12px 16px', textAlign: h === 'Ordre' ? 'center' : 'left', fontSize: 11,
                          fontWeight: 700, color: 'var(--color-text-tertiary)',
                          textTransform: 'uppercase', letterSpacing: '0.6px',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {champs.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }}>
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                          </svg>
                          Aucun champ configuré pour ce type de projet.
                        </td>
                      </tr>
                    ) : champs.map((champ, i) => {
                      const typeConf = {
                        fichier: { color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
                        texte: { color: 'var(--color-text-primary)', bg: 'var(--color-bg-hover)' },
                        boolean: { color: 'var(--color-violet)', bg: 'var(--color-violet-light)' },
                        date: { color: 'var(--color-orange)', bg: 'var(--color-orange-light)' }
                      }[champ.type_champ] || { color: 'var(--color-text-secondary)', bg: 'var(--color-bg-body)' };
                      
                      return (
                        <tr
                          key={champ.id}
                          style={{ borderBottom: i === champs.length - 1 ? 'none' : '1px solid var(--color-border-light)', transition: 'background 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Ordre */}
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', background: 'var(--color-bg-body)', padding: '4px 10px', borderRadius: 8 }}>
                              {champ.ordre}
                            </span>
                          </td>

                          {/* Label */}
                          <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>
                            {champ.label}
                          </td>

                          {/* Clé technique */}
                          <td style={{ padding: '14px 16px' }}>
                            <code style={{ fontSize: 12, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '4px 8px', borderRadius: 6, fontWeight: 600 }}>
                              {champ.nom_champ}
                            </code>
                          </td>

                          {/* Type */}
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                              background: typeConf.bg, color: typeConf.color, textTransform: 'capitalize'
                            }}>
                              {champ.type_champ}
                            </span>
                          </td>

                          {/* Obligatoire */}
                          <td style={{ padding: '14px 16px' }}>
                            {champ.obligatoire ? (
                              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-green)', background: 'var(--color-green-light)', padding: '4px 10px', borderRadius: 6 }}>
                                Obligatoire
                              </span>
                            ) : (
                              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', background: 'var(--color-bg-body)', padding: '4px 10px', borderRadius: 6 }}>
                                Optionnel
                              </span>
                            )}
                          </td>

                          {/* Actif */}
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                              background: champ.actif ? 'var(--color-green-light)' : 'var(--color-red-light)',
                              color: champ.actif ? 'var(--color-green)' : 'var(--color-red)',
                            }}>
                              {champ.actif ? 'Actif' : 'Inactif'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <button
                                onClick={() => { setSelectedChamp(champ); setIsModalOpen(true); }}
                                style={{
                                  padding: '7px 14px', borderRadius: 8, border: '1px solid var(--color-border)',
                                  background: 'var(--color-bg-card)', color: 'var(--color-primary)',
                                  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = 'var(--color-primary-light)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'var(--color-bg-card)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => setConfirmDelete(champ.id)}
                                style={{
                                  width: 34, height: 34, borderRadius: 8, border: '1px solid var(--color-border)',
                                  background: 'var(--color-bg-card)', color: 'var(--color-red)',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.2s',
                                }}
                                onMouseOver={e => { e.currentTarget.style.background = 'var(--color-red-light)'; e.currentTarget.style.borderColor = 'var(--color-red)'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'var(--color-bg-card)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )} {/* fin activeTab === 'champs' */}

          {/* ── ONGLET DOCUMENTS & TEMPLATES ── */}
          {activeTab === 'documents' && (
            <div>
              {loadingDocs ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[1,2,3].map(n => <div key={n} className="skeleton" style={{ height: 180, borderRadius: 12 }} />)}
                </div>
              ) : documents.length === 0 ? (
                <div className="card" style={{ padding: 48, textAlign: 'center' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block' }}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <p style={{ color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Aucun template configuré pour ce type de projet.</p>
                  <p style={{ color: 'var(--color-text-tertiary)', fontSize: 13, marginTop: 4 }}>Lancez le seeder pour créer les templates initiaux.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {documents.map(doc => (
                    <div key={doc.id} className="card" style={{ padding: 20, border: '1px solid var(--color-border)', borderLeft: `4px solid ${doc.obligatoire ? 'var(--color-primary)' : 'var(--color-border)'}` }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, marginBottom: 6, display: 'inline-block',
                            background: doc.obligatoire ? 'var(--color-primary-light)' : 'var(--color-bg-body)',
                            color: doc.obligatoire ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                            textTransform: 'uppercase', letterSpacing: '0.5px'
                          }}>
                            {doc.obligatoire ? 'OBLIGATOIRE' : 'OPTIONNEL'}
                          </span>
                          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{doc.label}</h4>
                        </div>
                        {/* Statut fichier */}
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                          background: doc.a_fichier ? 'var(--color-green-light)' : 'var(--color-orange-light)',
                          color: doc.a_fichier ? 'var(--color-green)' : 'var(--color-orange)',
                        }}>
                          {doc.a_fichier ? '✓ Fichier OK' : '⚠ Sans fichier'}
                        </span>
                      </div>

                      {/* Description */}
                      {doc.description && (
                        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
                          {doc.description.length > 100 ? doc.description.substring(0, 100) + '...' : doc.description}
                        </p>
                      )}

                      {/* Sections */}
                      {doc.sections && doc.sections.length > 0 && (
                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
                          {doc.sections.length} section{doc.sections.length > 1 ? 's' : ''} : {doc.sections.map(s => s.titre).join(', ').substring(0, 60)}...
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                        {doc.a_fichier && (
                          <a
                            href={doc.lien_template}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-primary)',
                              background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                              fontSize: 11, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4
                            }}
                          >
                            ↓ Télécharger template
                          </a>
                        )}
                        <label style={{
                          padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border)',
                          background: 'var(--color-bg-card)', color: 'var(--color-text-secondary)',
                          fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                        }}>
                          {uploadingDoc === doc.id ? '⟳ Upload...' : '↑ Uploader fichier'}
                          <input type="file" accept=".pdf,.xlsx,.xls,.docx,.doc" style={{ display: 'none' }}
                            onChange={e => e.target.files?.[0] && handleUploadFichierTemplate(doc.id, e.target.files[0])}
                          />
                        </label>
                        <button
                          onClick={() => setConfirmDeleteDoc(doc.id)}
                          style={{
                            padding: '6px 10px', borderRadius: 8, border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-card)', color: 'var(--color-red)',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer'
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (

      /* ── VUE LISTE ── */

        <div className="animate-fade-in">
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
              Types de projet
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 14 }}>
              Gérez les types de projets et leurs champs de formulaire personnalisés (Étape 3)
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 24 }}>
            {types.map((type, i) => {
              const conf = TYPE_CONFIG[type.code] || TYPE_CONFIG['structuration'];
              const stats = type.stats || {};
              const total = stats.total || 0;
              const taux = stats.taux_acceptation || 0;

              return (
                <div
                  key={type.code}
                  className="animate-fade-in-up"
                  style={{ 
                    padding: 28, 
                    background: 'var(--color-bg-card)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: 16, 
                    animationDelay: `${i * 0.08}s`, 
                    transition: 'all 0.25s', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer'
                  }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* HAUT */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ 
                      width: 42, height: 42, borderRadius: 12, 
                      background: conf.bg, color: conf.color, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      {conf.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)' }}>{type.label}</div>
                      <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-text-tertiary)', marginTop: 2 }}>{type.code}</div>
                    </div>
                  </div>

                  {/* MILIEU (séparateur) */}
                  <div style={{ 
                    borderTop: '1px solid var(--color-border-light)', 
                    borderBottom: '1px solid var(--color-border-light)', 
                    padding: '20px 0', 
                    margin: '20px 0', 
                    display: 'flex', 
                    justifyContent: 'space-between' 
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total dossiers</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)' }}>{total}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Taux acceptation</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: taux >= 50 ? 'var(--color-green)' : taux > 0 ? 'var(--color-orange)' : 'var(--color-text-primary)' }}>{taux}%</div>
                    </div>
                  </div>

                  {/* BAS */}
                  <div style={{ marginTop: 'auto' }}>
                    {/* Barre de progression */}
                    <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden', marginBottom: 20 }}>
                      <div style={{
                        height: '100%', borderRadius: 3, transition: 'width 1s ease',
                        width: `${taux}%`,
                        background: taux >= 50 ? 'var(--color-green)' : taux > 0 ? 'var(--color-orange)' : 'var(--color-border)',
                      }} />
                    </div>

                    {/* Bouton */}
                    <button
                      onClick={() => handleSelectType(type)}
                      style={{
                        width: '100%', padding: '10px', borderRadius: 10,
                        border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-primary)',
                        fontSize: 14, fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'transparent'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                    >
                      Gérer les champs du formulaire
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODAL CHAMP ── */}
      <ChampModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedChamp(null); }}
        onSaveSuccess={() => { setIsModalOpen(false); setSelectedChamp(null); fetchChamps(selectedType.code); }}
        champ={selectedChamp}
        typeCode={selectedType?.code}
      />

      {/* ── CONFIRM DELETE ── */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
        }}>
          <div className="card animate-slide-up" style={{ padding: 32, maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: 'var(--color-text-primary)' }}>Confirmer la suppression</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>
              Cette action est irréversible. Le champ sera définitivement supprimé du formulaire.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)} style={{ padding: '10px 20px', borderRadius: 10, fontWeight: 600 }}>Annuler</button>
              <button
                onClick={() => handleDeleteChamp(confirmDelete)}
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
