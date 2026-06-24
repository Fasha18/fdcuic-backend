/* ── CandidatRessources.jsx ───────────────────────── */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
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

export default function CandidatRessources({ onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [templatesByType, setTemplatesByType] = useState({});
  const [expandedType, setExpandedType] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          TYPES_ORDER.map(code =>
            api.get(`/admin/types-projet/${code}/documents`)
              .then(r => ({ code, data: r.data }))
              .catch(() => ({ code, data: { documents: [] } }))
          )
        );
        const map = {};
        results.forEach(({ code, data }) => {
          map[code] = data.documents || [];
        });
        setTemplatesByType(map);
      } catch (err) {
        console.error('Erreur chargement templates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleDownload = (url, label) => {
    if (!url) {
      alert(`Le template "${label}" n'est pas encore disponible. L'administrateur doit uploader le fichier.`);
      return;
    }
    window.open(url, '_blank');
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
        }}
        onLogout={onLogout}
        role="candidat"
      />

      <main className="dashboard-main">
        <Topbar
          title="Mes Ressources"
          subtitle="Templates et documents à télécharger"
        />

        <div className="dashboard-content">
          <div className="content-grid" style={{ maxWidth: 900, margin: '0 auto' }}>

            {/* ── INTRO ── */}
            <div className="card animate-fade-in-up" style={{
              padding: 28,
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-violet) 100%)',
              color: 'white', marginBottom: 24, border: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 40 }}>📁</div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Ressources & Templates</h2>
                  <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: 14, lineHeight: 1.6 }}>
                    Téléchargez les templates correspondant à vos projets, remplissez-les hors ligne et conservez-les.
                    Vous pourrez les uploader lors de votre candidature à un appel à projets.
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gap: 16 }}>
                {[1, 2, 3].map(n => <div key={n} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 20 }}>
                {TYPES_ORDER.map(typeCode => {
                  const conf = TYPE_CONFIG[typeCode];
                  const docs = templatesByType[typeCode] || [];
                  const isExpanded = expandedType === typeCode;

                  return (
                    <div key={typeCode} className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                      {/* Header type */}
                      <div
                        onClick={() => setExpandedType(isExpanded ? null : typeCode)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '20px 24px', cursor: 'pointer', transition: 'background 0.2s',
                          background: isExpanded ? conf.bg : 'transparent',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = conf.bg}
                        onMouseOut={e => e.currentTarget.style.background = isExpanded ? conf.bg : 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: 12,
                            background: conf.bg, color: conf.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 22, border: `2px solid ${conf.color}20`
                          }}>
                            {conf.emoji}
                          </div>
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                              {conf.label}
                            </h3>
                            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                              {conf.description}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{
                            fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                            background: conf.bg, color: conf.color
                          }}>
                            {docs.length} document{docs.length !== 1 ? 's' : ''}
                          </span>
                          <svg
                            width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="var(--color-text-tertiary)" strokeWidth="2"
                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
                          >
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </div>
                      </div>

                      {/* Documents list */}
                      {isExpanded && (
                        <div style={{ borderTop: '1px solid var(--color-border-light)' }}>
                          {docs.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
                              Aucun template disponible pour ce type de projet pour le moment.
                            </div>
                          ) : (
                            docs.map((doc, idx) => (
                              <div
                                key={doc.id}
                                style={{
                                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                                  padding: '16px 24px',
                                  borderBottom: idx < docs.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                                  gap: 16,
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                      {doc.label}
                                    </span>
                                    <span style={{
                                      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                                      background: doc.obligatoire ? 'var(--color-primary-light)' : 'var(--color-bg-body)',
                                      color: doc.obligatoire ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                                      textTransform: 'uppercase'
                                    }}>
                                      {doc.obligatoire ? 'OBLIGATOIRE' : 'OPTIONNEL'}
                                    </span>
                                  </div>
                                  {doc.description && (
                                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                                      {doc.description}
                                    </p>
                                  )}
                                  {doc.sections && doc.sections.length > 0 && (
                                    <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                      {doc.sections.map(s => (
                                        <span key={s.id} style={{
                                          fontSize: 10, padding: '2px 6px', borderRadius: 4,
                                          background: 'var(--color-bg-body)', color: 'var(--color-text-tertiary)',
                                          border: '1px solid var(--color-border-light)'
                                        }}>
                                          {s.titre}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                  <button
                                    onClick={() => handleDownload(doc.lien_template, doc.label)}
                                    style={{
                                      padding: '8px 16px', borderRadius: 8,
                                      background: doc.a_fichier ? conf.color : 'var(--color-bg-body)',
                                      color: doc.a_fichier ? 'white' : 'var(--color-text-tertiary)',
                                      border: doc.a_fichier ? 'none' : '1px solid var(--color-border)',
                                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', gap: 6,
                                      transition: 'all 0.2s', whiteSpace: 'nowrap'
                                    }}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                                    </svg>
                                    {doc.a_fichier ? 'Télécharger template' : 'Bientôt disponible'}
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── GUIDE D'UTILISATION ── */}
            <div className="card animate-fade-in-up" style={{ padding: 28, marginTop: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-primary)' }}>
                📋 Comment utiliser ces ressources ?
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { num: '1', text: 'Téléchargez le template correspondant à votre type de projet' },
                  { num: '2', text: 'Remplissez-le hors ligne (Excel, Word) avec toutes les informations requises' },
                  { num: '3', text: 'Conservez le fichier complété sur votre ordinateur' },
                  { num: '4', text: 'Uploadez-le à l\'étape Documents lors de votre candidature' },
                ].map(step => (
                  <div key={step.num} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: 'var(--color-primary)',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, flexShrink: 0
                    }}>
                      {step.num}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
