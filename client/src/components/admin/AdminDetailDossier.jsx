import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';

// ════════════════════════════════════════════════════════════
// CONSTANTES
// ════════════════════════════════════════════════════════════
const STATUT_CONFIG = {
  brouillon:              { label: 'Brouillon',                color: '#94A3B8', bg: '#94A3B820', icon: '📝' },
  soumis:                 { label: 'Soumis',                   color: '#4F6AF6', bg: '#4F6AF620', icon: '📩' },
  en_examen_conformite:   { label: 'Vérification conformité',  color: '#F59F00', bg: '#F59F0020', icon: '🔍' },
  non_conforme:           { label: 'Non conforme',             color: '#F03E3E', bg: '#F03E3E20', icon: '❌' },
  en_evaluation_contenu:  { label: 'Évaluation du contenu',    color: '#7C5CFC', bg: '#7C5CFC20', icon: '📊' },
  accepte:                { label: 'Accepté',                  color: '#22B07D', bg: '#22B07D20', icon: '✅' },
  rejete:                 { label: 'Rejeté',                   color: '#F03E3E', bg: '#F03E3E20', icon: '🚫' },
};

const ETAPES = [
  { id: 'conformite',  label: 'Conformité',    statuts: ['soumis', 'en_examen_conformite'] },
  { id: 'contenu',     label: 'Évaluation',    statuts: ['en_evaluation_contenu'] },
  { id: 'final',       label: 'Décision',       statuts: ['accepte', 'rejete', 'non_conforme'] },
];

const getBaseUrl = () => 'https://fdcuic-backend-production.up.railway.app';

// ════════════════════════════════════════════════════════════
// STEPPER
// ════════════════════════════════════════════════════════════
const Stepper = ({ statut }) => {
  const etapeActive = ETAPES.findIndex(e => e.statuts.includes(statut));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32, padding: '20px 24px', background: 'var(--color-bg-card)', borderRadius: 14, border: '1px solid var(--color-border)' }}>
      {ETAPES.map((etape, idx) => {
        const isActive = idx === etapeActive;
        const isDone = etapeActive > idx;
        const isDecisionStep = idx === 2;
        const isAccepted = isDecisionStep && statut === 'accepte';
        const isRejected = isDecisionStep && (statut === 'rejete' || statut === 'non_conforme');

        let color = isDone ? '#22B07D' : isActive ? '#7C5CFC' : 'var(--color-text-tertiary)';
        let bg = isDone ? '#22B07D20' : isActive ? '#7C5CFC20' : 'var(--color-bg-body)';
        let icon = isDone ? '✓' : idx + 1;
        let label = etape.label;

        if (isAccepted) {
          color = '#22B07D'; bg = '#22B07D20'; icon = '✓'; label = 'Accepté';
        } else if (isRejected) {
          color = '#F03E3E'; bg = '#F03E3E20'; icon = '✗'; label = 'Rejeté';
        }

        return (
          <React.Fragment key={etape.id}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: bg, color, border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 15, transition: 'all 0.3s',
              }}>
                {icon}
              </div>
              <span style={{
                fontSize: 11, fontWeight: (isActive || isAccepted || isRejected) ? 700 : 500,
                color, textAlign: 'center', whiteSpace: 'nowrap',
              }}>
                {isAccepted || isRejected ? (
                  <span style={{ padding: '4px 10px', borderRadius: 12, background: bg, color: color, display: 'inline-block' }}>
                    {label}
                  </span>
                ) : label}
              </span>

              {isRejected && (dossier?.commentaire_evaluation || dossier?.commentaire_conformite) && (
                <div style={{
                  marginTop: 8, padding: '8px 12px', background: '#F03E3E10',
                  border: '1px solid #F03E3E40', borderRadius: 8, color: '#F03E3E',
                  fontSize: 12, textAlign: 'center', maxWidth: '220px',
                  wordBreak: 'break-word', lineHeight: 1.4
                }}>
                  <strong>Motif :</strong><br/>{dossier.commentaire_evaluation || dossier.commentaire_conformite}
                </div>
              )}
            </div>
            {idx < ETAPES.length - 1 && (
              <div style={{
                flex: 2, height: 2, marginTop: 20, alignSelf: 'flex-start',
                background: isDone ? '#22B07D' : 'var(--color-border)',
                marginBottom: 24, transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// INFOFIELD
// ════════════════════════════════════════════════════════════
const InfoField = ({ label, value }) => {
  if (!value && value !== 0 && value !== false) return null;
  return (
    <div style={{ padding: '16px 20px', background: 'var(--color-bg-body)', borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 15, color: 'var(--color-text-primary)', fontWeight: 500, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
        {typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : String(value)}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════
export default function AdminDetailDossier() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState(null);
  const [evaluateur, setEvaluateur] = useState(null);
  const [documentsModeles, setDocumentsModeles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États évaluation conformité
  const [confCommentaire, setConfCommentaire] = useState('');
  const [confAction, setConfAction] = useState(null); // 'conforme' | 'non_conforme'
  const [confLoading, setConfLoading] = useState(false);

  // États évaluation contenu
  const [evalCommentaire, setEvalCommentaire] = useState('');
  const [evalAction, setEvalAction] = useState(null); // 'accepte' | 'rejete'
  const [evalLoading, setEvalLoading] = useState(false);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDossier();
  }, [id]);

  const fetchDossier = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDossierById(id);
      setDossier(data.dossier);
      setEvaluateur(data.evaluateur);
      setDocumentsModeles(data.documentsModeles || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger ce dossier.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleConformite = async (conforme) => {
    if (!conforme && (!confCommentaire || confCommentaire.trim() === '')) {
      showToast('Un commentaire est obligatoire pour justifier la non-conformité.', 'error');
      return;
    }
    setConfLoading(true);
    try {
      await adminService.evaluerConformite(id, { conforme, commentaire: confCommentaire });
      showToast(conforme ? 'Dossier déclaré conforme ✓' : 'Dossier déclaré non conforme. Candidat notifié.', conforme ? 'success' : 'warning');
      setConfAction(null);
      setConfCommentaire('');
      fetchDossier();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la mise à jour.', 'error');
    } finally {
      setConfLoading(false);
    }
  };

  const handleEvaluation = async (decision) => {
    if (decision === 'rejete' && (!evalCommentaire || evalCommentaire.trim() === '')) {
      showToast('Un commentaire est obligatoire pour justifier un rejet.', 'error');
      return;
    }
    setEvalLoading(true);
    try {
      await adminService.evaluerContenu(id, { decision, commentaire: evalCommentaire });
      showToast(decision === 'accepte' ? '🎉 Dossier accepté ! Candidat notifié.' : 'Dossier rejeté. Candidat notifié.', decision === 'accepte' ? 'success' : 'warning');
      setEvalAction(null);
      setEvalCommentaire('');
      fetchDossier();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la mise à jour.', 'error');
    } finally {
      setEvalLoading(false);
    }
  };

  // ─── LOADING ───────────────────────────────────────────────
  if (loading) return (
    <div className="content-grid">
      {[1, 2, 3].map(n => (
        <div key={n} className="skeleton" style={{ height: 80, borderRadius: 12, marginBottom: 16 }} />
      ))}
    </div>
  );

  if (error) return (
    <div className="content-grid">
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: 'var(--color-red)', fontWeight: 600, marginBottom: 16 }}>{error}</p>
        <button className="btn-secondary" onClick={() => navigate(-1)}>← Retour</button>
      </div>
    </div>
  );

  const statConf = STATUT_CONFIG[dossier.statut] || STATUT_CONFIG.soumis;
  const initiales = `${dossier.candidat?.prenom?.[0] || ''}${dossier.candidat?.nom?.[0] || ''}`.toUpperCase();
  const estStatutFinal = ['non_conforme', 'accepte', 'rejete'].includes(dossier.statut);
  const peutEvaluerConformite = ['soumis', 'en_examen_conformite'].includes(dossier.statut);
  const peutEvaluerContenu = dossier.statut === 'en_evaluation_contenu';

  const docs = [
    { label: 'NINEA / Récépissé', fichier: dossier.doc_ninea_recepisse },
    { label: 'CNI / Passeport', fichier: dossier.doc_cni_passeport },
    { label: 'Budget prévisionnel', fichier: dossier.doc_budget },
    { label: "Plan d'action", fichier: dossier.doc_plan_action },
    { label: 'Photo / Prototype', fichier: dossier.doc_photo_prototype },
    { label: 'Analyse financière', fichier: dossier.doc_analyse_financiere },
    { label: 'Business Model Canvas', fichier: dossier.doc_business_model },
  ].filter(d => d.fichier);

  return (
    <div className="content-grid animate-fade-in-up">

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? 'var(--color-red)' : toast.type === 'warning' ? '#F59F00' : '#22B07D',
          color: '#fff', borderRadius: 12, padding: '14px 20px', maxWidth: 380,
          fontSize: 14, fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          animation: 'fadeIn 0.3s ease',
        }}>
          {toast.message}
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--color-text-primary)', flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 2 }}>
              Détails du dossier
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              {dossier.appel?.titre || 'Appel à projets'} — Dossier #{dossier.id}
            </p>
          </div>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13,
          color: statConf.color, background: statConf.bg, border: `1px solid ${statConf.color}40`,
        }}>
          {statConf.icon} {statConf.label}
        </span>
      </div>

      {/* ── CARTE CANDIDAT ── */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, padding: '20px 28px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--color-primary-light)', color: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 800, flexShrink: 0,
        }}>
          {initiales || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            {dossier.candidat?.prenom} {dossier.candidat?.nom}
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            <span>📧 {dossier.candidat?.email}</span>
            {dossier.candidat?.telephone && <span>📞 {dossier.candidat.telephone}</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Soumis le</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 2 }}>
            {new Date(dossier.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* ── STEPPER ── */}
      <Stepper statut={dossier.statut} />

      {/* ── INFOS FORMULAIRE ── */}
      <div className="card" style={{ marginBottom: 24, padding: '24px 28px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--color-border-light)' }}>
          📋 Informations du dossier
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <InfoField label="Porteur de projet" value={dossier.prenom_nom_porteur} />
          <InfoField label="Structure" value={dossier.nom_structure} />
          <InfoField label="Type de projet" value={dossier.type_projet} />
          <InfoField label="Secteur d'activité" value={dossier.secteur_activite} />
          <InfoField label="Région" value={dossier.region} />
          <InfoField label="Localisation" value={dossier.localisation} />
          <InfoField label="Phase idéation" value={dossier.phase_ideation} />
          <InfoField label="Phase exécution" value={dossier.phase_execution} />
        </div>
        {(dossier.nature_projet || dossier.activite_entreprise) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 12 }}>
            <InfoField label="Activité de l'entreprise" value={dossier.activite_entreprise} />
            <InfoField label="Nature du projet" value={dossier.nature_projet} />
            <InfoField label="Objectifs globaux" value={dossier.objectifs_globaux} />
            <InfoField label="Importance territoriale" value={dossier.importance_territoire} />
            <InfoField label="Impacts économiques" value={dossier.impacts_economiques} />
            <InfoField label="Potentiel de réussite" value={dossier.potentiel_reussite} />
            <InfoField label="Bénéficiaires" value={dossier.beneficiaires} />
            <InfoField label="Plan de pérennisation" value={dossier.plan_perennisation} />
            <InfoField label="Description du produit/service" value={dossier.description_produit} />
          </div>
        )}
        {dossier.equipe && Array.isArray(dossier.equipe) && dossier.equipe.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Équipe</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {dossier.equipe.map((membre, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'var(--color-bg-body)', borderRadius: 10, border: '1px solid var(--color-border-light)', fontSize: 13 }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{membre.prenom} {membre.nom}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{membre.poste} — {membre.telephone}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── DOCUMENTS ── */}
      <div className="card" style={{ marginBottom: 24, padding: '24px 28px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--color-border-light)' }}>
          📂 Documents soumis
        </h3>
        {docs.length === 0 ? (
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: 14 }}>Aucun document joint à ce dossier.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {docs.map((doc, i) => (
              <a
                key={i}
                href={doc.fichier.startsWith('http') ? doc.fichier : `${getBaseUrl()}/uploads/${doc.fichier}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 10,
                  background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                  textDecoration: 'none', fontWeight: 600, fontSize: 13,
                  border: '1px solid var(--color-primary)30', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary)'}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--color-primary-light)';
                  e.currentTarget.style.color = 'var(--color-primary)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                {doc.label}
              </a>
            ))}
          </div>
        )}

        {/* Documents modèles attendus */}
        {documentsModeles.length > 0 && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--color-border-light)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              📌 Documents modèles attendus pour ce type de projet (référence pour l'évaluateur) :
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {documentsModeles.map((dm, i) => (
                <a
                  key={i}
                  href={dm.url_fichier || '#'}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px', borderRadius: 8,
                    background: 'var(--color-bg-body)', color: 'var(--color-text-secondary)',
                    textDecoration: 'none', fontSize: 12, fontWeight: 600,
                    border: '1px solid var(--color-border)',
                  }}
                >
                  📄 {dm.nom_document}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION ÉVALUATION ── */}
      <div className="card" style={{ padding: '24px 28px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid var(--color-border-light)' }}>
          ⚖️ Évaluation
        </h3>

        {/* STATUT FINAL — lecture seule */}
        {estStatutFinal && (
          <div style={{
            background: `${statConf.bg}`,
            border: `1px solid ${statConf.color}40`,
            borderRadius: 14, padding: '24px 28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 32 }}>{statConf.icon}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: statConf.color }}>Dossier {statConf.label}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Ce dossier a reçu sa décision finale. Aucune action supplémentaire possible.</div>
              </div>
            </div>
            {dossier.commentaire_conformite && (
              <div style={{ padding: '12px 16px', background: 'var(--color-bg-body)', borderRadius: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Motif de non-conformité</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{dossier.commentaire_conformite}</div>
              </div>
            )}
            {dossier.commentaire_evaluation && (
              <div style={{ padding: '12px 16px', background: 'var(--color-bg-body)', borderRadius: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Commentaire d'évaluation</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{dossier.commentaire_evaluation}</div>
              </div>
            )}
            {evaluateur && (
              <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginTop: 8 }}>
                Évalué par <strong>{evaluateur.prenom} {evaluateur.nom}</strong>
                {dossier.date_evaluation && <> le {new Date(dossier.date_evaluation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</>}
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 1 — Conformité */}
        {peutEvaluerConformite && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F59F0020', color: '#F59F00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>1</div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: 16 }}>Vérification de conformité administrative</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Vérifiez que tous les documents obligatoires sont présents et valides.</div>
              </div>
            </div>

            {/* Boutons de choix */}
            {!confAction && (
              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  onClick={() => setConfAction('conforme')}
                  style={{
                    flex: 1, padding: '16px', borderRadius: 12, border: '2px solid #22B07D',
                    background: '#22B07D15', color: '#22B07D', fontWeight: 700, fontSize: 15,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#22B07D'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#22B07D15'; e.currentTarget.style.color = '#22B07D'; }}
                >
                  ✓ Conforme
                </button>
                <button
                  onClick={() => setConfAction('non_conforme')}
                  style={{
                    flex: 1, padding: '16px', borderRadius: 12, border: '2px solid #F03E3E',
                    background: '#F03E3E15', color: '#F03E3E', fontWeight: 700, fontSize: 15,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F03E3E'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F03E3E15'; e.currentTarget.style.color = '#F03E3E'; }}
                >
                  ✗ Non conforme
                </button>
              </div>
            )}

            {/* Panel de confirmation */}
            {confAction && (
              <div style={{
                padding: 20, borderRadius: 12, marginTop: 8,
                background: confAction === 'conforme' ? '#22B07D10' : '#F03E3E10',
                border: `1px solid ${confAction === 'conforme' ? '#22B07D' : '#F03E3E'}40`,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 12, color: confAction === 'conforme' ? '#22B07D' : '#F03E3E' }}>
                  {confAction === 'conforme' ? '✓ Confirmer la conformité' : '✗ Motif de non-conformité (obligatoire)'}
                </div>
                <textarea
                  value={confCommentaire}
                  onChange={e => setConfCommentaire(e.target.value)}
                  rows={3}
                  placeholder={confAction === 'conforme'
                    ? 'Commentaire optionnel...'
                    : 'Décrivez précisément le/les motif(s) de non-conformité (document manquant, illisible, non valide...) *'
                  }
                  style={{
                    width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-body)', color: 'var(--color-text-primary)',
                    fontSize: 14, resize: 'vertical', fontFamily: 'var(--font-sans)', outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button
                    onClick={() => { setConfAction(null); setConfCommentaire(''); }}
                    style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-primary)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleConformite(confAction === 'conforme')}
                    disabled={confLoading || (confAction === 'non_conforme' && !confCommentaire.trim())}
                    style={{
                      padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer',
                      background: confAction === 'conforme' ? '#22B07D' : '#F03E3E',
                      color: '#fff', opacity: (confLoading || (confAction === 'non_conforme' && !confCommentaire.trim())) ? 0.5 : 1,
                    }}
                  >
                    {confLoading ? 'Enregistrement...' : 'Confirmer la décision'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 2 — Contenu */}
        {peutEvaluerContenu && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#7C5CFC20', color: '#7C5CFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>2</div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: 16 }}>Évaluation du contenu du projet</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Le dossier est administrativement conforme. Évaluez maintenant la qualité et la pertinence du projet.</div>
              </div>
            </div>

            {!evalAction && (
              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  onClick={() => setEvalAction('accepte')}
                  style={{
                    flex: 1, padding: '16px', borderRadius: 12, border: '2px solid #22B07D',
                    background: '#22B07D15', color: '#22B07D', fontWeight: 700, fontSize: 15,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#22B07D'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#22B07D15'; e.currentTarget.style.color = '#22B07D'; }}
                >
                  🎉 Valider le projet
                </button>
                <button
                  onClick={() => setEvalAction('rejete')}
                  style={{
                    flex: 1, padding: '16px', borderRadius: 12, border: '2px solid #F03E3E',
                    background: '#F03E3E15', color: '#F03E3E', fontWeight: 700, fontSize: 15,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F03E3E'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F03E3E15'; e.currentTarget.style.color = '#F03E3E'; }}
                >
                  🚫 Rejeter le projet
                </button>
              </div>
            )}

            {evalAction && (
              <div style={{
                padding: 20, borderRadius: 12, marginTop: 8,
                background: evalAction === 'accepte' ? '#22B07D10' : '#F03E3E10',
                border: `1px solid ${evalAction === 'accepte' ? '#22B07D' : '#F03E3E'}40`,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 12, color: evalAction === 'accepte' ? '#22B07D' : '#F03E3E' }}>
                  {evalAction === 'accepte' ? '🎉 Confirmer la validation du projet' : '🚫 Motif de rejet (obligatoire)'}
                </div>
                <textarea
                  value={evalCommentaire}
                  onChange={e => setEvalCommentaire(e.target.value)}
                  rows={3}
                  placeholder={evalAction === 'accepte'
                    ? 'Commentaire optionnel (points forts, recommandations...)' 
                    : 'Expliquez précisément les raisons du rejet pour que le candidat puisse améliorer son dossier lors des prochains appels. *'
                  }
                  style={{
                    width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-body)', color: 'var(--color-text-primary)',
                    fontSize: 14, resize: 'vertical', fontFamily: 'var(--font-sans)', outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button
                    onClick={() => { setEvalAction(null); setEvalCommentaire(''); }}
                    style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-primary)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleEvaluation(evalAction)}
                    disabled={evalLoading || (evalAction === 'rejete' && !evalCommentaire.trim())}
                    style={{
                      padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer',
                      background: evalAction === 'accepte' ? '#22B07D' : '#F03E3E',
                      color: '#fff', opacity: (evalLoading || (evalAction === 'rejete' && !evalCommentaire.trim())) ? 0.5 : 1,
                    }}
                  >
                    {evalLoading ? 'Enregistrement...' : 'Confirmer la décision'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
