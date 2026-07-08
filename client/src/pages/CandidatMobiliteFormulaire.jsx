/* ── CandidatMobiliteFormulaire.jsx ──────────────────────────
   Formulaire multi-étapes Programme Mobilité
   Design premium identique à CandidatCandidature.jsx
   ──────────────────────────────────────────────────────────── */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import candidatService from '../services/candidatService';

/* ─── Données Étapes ──────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Infos',     icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )},
  { id: 2, label: 'Contexte',  icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  )},
  { id: 3, label: 'Programme', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 010 20"/></svg>
  )},
  { id: 4, label: 'Documents', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  )},
  { id: 5, label: 'Confirmer', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
  )},
];

/* ─── Données Pays & Régions ──────────────────────────────── */
const PAYS = [
  "Sénégal", "France", "Belgique", "Suisse", "Canada", "Maroc", "Côte d'Ivoire", "Mali", "Guinée", "Mauritanie",
  "Algérie", "Tunisie", "Cameroun", "Gabon", "Togo", "Bénin", "Burkina Faso", "Niger", "Tchad", "Congo",
  "RDC", "Madagascar", "États-Unis", "Royaume-Uni", "Allemagne", "Espagne", "Italie", "Portugal", "Pays-Bas",
  "Suède", "Norvège", "Danemark", "Finlande", "Japon", "Chine", "Corée du Sud", "Inde", "Brésil", "Argentine",
  "Mexique", "Colombie", "Chili", "Pérou", "Australie", "Nouvelle-Zélande", "Afrique du Sud", "Égypte", "Nigéria",
  "Kenya", "Ghana", "Somalie", "Éthiopie", "Rwanda", "Ouganda", "Zambie", "Zimbabwe", "Angola", "Mozambique"
];

const REGIONS_SENEGAL = [
  "Dakar", "Thiès", "Diourbel", "Fatick", "Kaolack", "Kaffrine", "Louga",
  "Saint-Louis", "Matam", "Tambacounda", "Kédougou", "Kolda", "Sédhiou", "Ziguinchor"
];

/* ─── Badge "Déjà fourni" ─────────────────────────────────── */
const AlreadyProvidedBadge = () => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: 'var(--color-green-light)', color: 'var(--color-green)',
    fontSize: 11, fontWeight: 600, padding: '2px 8px',
    borderRadius: 20, marginLeft: 8,
  }}>
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
    Déjà fourni
  </span>
);

/* ─── Section Icon ────────────────────────────────────────── */
const SectionIcon = ({ children }) => (
  <div style={{
    width: 36, height: 36, borderRadius: 10,
    background: 'var(--color-primary-light)', color: 'var(--color-primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>
    {children}
  </div>
);

/* ─── Composant principal ─────────────────────────────────── */
export default function CandidatMobiliteFormulaire({ onLogout }) {
  const navigate = useNavigate();

  const [etape,      setEtape]      = useState(1);
  const [dossierId,  setDossierId]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  /* ── États du formulaire (jamais réinitialisés) ─────────── */
  const [e1, setE1] = useState({
    nom_structure: '', discipline: '',
    date_depart: '', date_arrivee: '',
    pays_destination: '', region_destination: '',
  });

  const [e2, setE2] = useState({
    Presentation_succincte: '', opportunite: '',
    pertinence: '', objectifs_generaux: '', objectifs_specifiques: '',
  });

  const [e3, setE3] = useState({
    programme_sejour_detaille_du_sejour: '',
    activites_prevues: '', resultats_attendus: '', impacts: '',
  });

  const [e4Files, setE4Files]         = useState({
    doc_ninea: null, doc_recepisse: null, doc_invitation: null,
    doc_note_structure: null, doc_cv_portfolio: null, image_couverture: null,
  });
  const [existingDocs, setExistingDocs] = useState({});

  /* ── Chargement brouillon existant ──────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await candidatService.getMesMobilites();
        const draft = res?.projets?.find(p => p.statut === 'brouillon');
        if (draft) {
          setDossierId(draft.id);
          setEtape(draft.etape_courante > 0 ? draft.etape_courante : 1);
          setE1({
            nom_structure:      draft.nom_structure      || '',
            discipline:         draft.discipline         || '',
            date_depart:        draft.date_depart        ? draft.date_depart.split('T')[0]  : '',
            date_arrivee:       draft.date_arrivee       ? draft.date_arrivee.split('T')[0] : '',
            pays_destination:   draft.pays_destination   || '',
            region_destination: draft.region_destination || '',
          });
          setE2({
            Presentation_succincte:  draft.Presentation_succincte  || '',
            opportunite:             draft.opportunite             || '',
            pertinence:              draft.pertinence              || '',
            objectifs_generaux:      draft.objectifs_generaux      || '',
            objectifs_specifiques:   draft.objectifs_specifiques   || '',
          });
          setE3({
            programme_sejour_detaille_du_sejour: draft.programme_sejour_detaille_du_sejour || '',
            activites_prevues: draft.activites_prevues || '',
            resultats_attendus: draft.resultats_attendus || '',
            impacts: draft.impacts || '',
          });
          setExistingDocs({
            doc_ninea:         !!draft.doc_ninea,
            doc_recepisse:     !!draft.doc_recepisse,
            doc_invitation:    !!draft.doc_invitation,
            doc_note_structure:!!draft.doc_note_structure,
            doc_cv_portfolio:  !!draft.doc_cv_portfolio,
            image_couverture:  !!draft.image_couverture,
          });
        }
      } catch (err) {
        console.error('Brouillon mobilité:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // VALIDATIONS ──────────────────────────────────────────
  const validateText = (val, min = 2, max = 100) => {
    if (!val || val.trim().length === 0) return 'Ce champ est obligatoire';
    if (val.trim().length < min) return `Minimum ${min} caractères requis`;
    if (val.length > max) return `Maximum ${max} caractères`;
    return null;
  };
  const validateTextarea = (val) => validateText(val, 50, 2000);
  const validateDate = (val) => {
    if (!val || val.trim().length === 0) return 'Ce champ est obligatoire';
    return null;
  };
  const validateFile = (file) => {
    if (!file) return 'Ce champ est obligatoire';
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) return 'Format non accepté. PDF, JPG, PNG uniquement';
    if (file.size > 10 * 1024 * 1024) return 'Fichier trop volumineux (max 10 Mo)';
    return null;
  };

  const handleBlur = (field) => setTouchedFields(prev => ({ ...prev, [field]: true }));
  const scrollToFirstError = (errors) => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const element = document.getElementById(`field-${firstErrorField}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const ErrorMsg = ({ msg }) => msg ? (
    <div style={{ color: 'var(--color-red)', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
      <svg width="12" height="12">⚠️</svg> {msg}
    </div>
  ) : null;

  const getInputStyle = (field) => {
    if (fieldErrors[field]) return { borderColor: 'var(--color-red)' };
    if (touchedFields[field] && !fieldErrors[field]) return { borderColor: 'var(--color-green)' };
    return {};
  };

  /* ── Handlers ───────────────────────────────────────────── */
  const go = (step) => { setError(''); setEtape(step); };

  const handleFileChange = (field, file) => {
    setE4Files(prev => ({ ...prev, [field]: file }));
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    if (file) {
      setFieldErrors(prev => ({ ...prev, [field]: validateFile(file) }));
    }
  };

  const submit1 = async (ev) => {
    ev.preventDefault();
    let errs = {};
    let err;

    err = validateText(e1.nom_structure); if(err) errs.nom_structure = err;
    err = validateText(e1.discipline); if(err) errs.discipline = err;
    err = validateDate(e1.date_depart); if(err) errs.date_depart = err;
    err = validateDate(e1.date_arrivee); if(err) errs.date_arrivee = err;
    if(e1.date_depart && e1.date_arrivee && new Date(e1.date_arrivee) <= new Date(e1.date_depart)) {
      errs.date_arrivee = 'La date d\'arrivée doit être postérieure à la date de départ';
    }
    err = validateText(e1.pays_destination); if(err) errs.pays_destination = err;
    err = validateText(e1.region_destination); if(err) errs.region_destination = err;

    const touched = {}; Object.keys(e1).forEach(k => touched[k]=true); setTouchedFields(prev => ({...prev, ...touched}));
    setFieldErrors(errs);

    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return;
    }

    setError(''); setSubmitting(true);
    try {
      const res = await candidatService.soumettreMobiliteEtape1(e1);
      if (res?.projet_id) setDossierId(res.projet_id);
      else if (res?.id)   setDossierId(res.id);
      setTouchedFields({}); setFieldErrors({});
      go(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur étape 1');
    } finally { setSubmitting(false); }
  };

  const submit2 = async (ev) => {
    ev.preventDefault();
    let errs = {};
    let err;

    err = validateTextarea(e2.Presentation_succincte); if(err) errs.Presentation_succincte = err;
    err = validateTextarea(e2.opportunite); if(err) errs.opportunite = err;
    err = validateTextarea(e2.pertinence); if(err) errs.pertinence = err;
    err = validateTextarea(e2.objectifs_generaux); if(err) errs.objectifs_generaux = err;
    err = validateTextarea(e2.objectifs_specifiques); if(err) errs.objectifs_specifiques = err;

    const touched = {}; Object.keys(e2).forEach(k => touched[k]=true); setTouchedFields(prev => ({...prev, ...touched}));
    setFieldErrors(errs);

    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return;
    }

    setError(''); setSubmitting(true);
    try {
      await candidatService.soumettreMobiliteEtape2(dossierId, e2);
      setTouchedFields({}); setFieldErrors({});
      go(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur étape 2');
    } finally { setSubmitting(false); }
  };

  const submit3 = async (ev) => {
    ev.preventDefault();
    let errs = {};
    let err;

    err = validateTextarea(e3.programme_sejour_detaille_du_sejour); if(err) errs.programme_sejour_detaille_du_sejour = err;
    err = validateTextarea(e3.activites_prevues); if(err) errs.activites_prevues = err;
    err = validateTextarea(e3.resultats_attendus); if(err) errs.resultats_attendus = err;
    err = validateTextarea(e3.impacts); if(err) errs.impacts = err;

    const touched = {}; Object.keys(e3).forEach(k => touched[k]=true); setTouchedFields(prev => ({...prev, ...touched}));
    setFieldErrors(errs);

    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return;
    }

    setError(''); setSubmitting(true);
    try {
      await candidatService.soumettreMobiliteEtape3(dossierId, e3);
      setTouchedFields({}); setFieldErrors({});
      go(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur étape 3');
    } finally { setSubmitting(false); }
  };

  const submit4 = async (ev) => {
    ev.preventDefault();
    let errs = {};
    const validateDoc = (field) => {
      if (!existingDocs[field] && !e4Files[field]) return 'Ce champ est obligatoire';
      if (e4Files[field]) return validateFile(e4Files[field]);
      return null;
    };
    
    let err = validateDoc('doc_invitation'); if(err) errs.doc_invitation = err;
    err = validateDoc('doc_cv_portfolio'); if(err) errs.doc_cv_portfolio = err;
    err = validateDoc('doc_ninea'); if(err) errs.doc_ninea = err;
    err = validateDoc('doc_recepisse'); if(err) errs.doc_recepisse = err;
    err = validateDoc('doc_note_structure'); if(err) errs.doc_note_structure = err;
    err = validateDoc('image_couverture'); if(err) errs.image_couverture = err;

    const touched = {}; Object.keys(e4Files).forEach(k => touched[k]=true);
    setTouchedFields(prev => ({...prev, ...touched}));
    setFieldErrors(errs);

    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return;
    }

    setError(''); setSubmitting(true);
    const fd = new FormData();
    Object.keys(e4Files).forEach(k => { if (e4Files[k]) fd.append(k, e4Files[k]); });
    try {
      await candidatService.soumettreMobiliteEtape4(dossierId, fd);
      setExistingDocs(prev => ({
        ...prev,
        doc_ninea: prev.doc_ninea || !!e4Files.doc_ninea,
        doc_recepisse: prev.doc_recepisse || !!e4Files.doc_recepisse,
        doc_invitation: prev.doc_invitation || !!e4Files.doc_invitation,
        doc_note_structure: prev.doc_note_structure || !!e4Files.doc_note_structure,
        doc_cv_portfolio: prev.doc_cv_portfolio || !!e4Files.doc_cv_portfolio,
        image_couverture: prev.image_couverture || !!e4Files.image_couverture,
      }));
      setE4Files({
        doc_ninea: null, doc_recepisse: null, doc_invitation: null,
        doc_note_structure: null, doc_cv_portfolio: null, image_couverture: null,
      });
      setTouchedFields({}); setFieldErrors({});
      go(5);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur upload documents');
    } finally { setSubmitting(false); }
  };

  const submitFinal = async () => {
    setError(''); setSubmitting(true);
    try {
      await candidatService.soumettreMobiliteDossier(dossierId);
      navigate('/candidat/confirmation', { state: { from: 'mobilite' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur soumission finale');
    } finally { setSubmitting(false); }
  };

  /* ── Barre de progression ───────────────────────────────── */
  const ProgressBar = () => (
    <div className="candidature-progress-container animate-fade-in-up" style={{ marginBottom: 24 }}>
      <div className="candidature-progress-steps" style={{ maxWidth: 700 }}>
        {STEPS.map((s, i) => {
          const done   = etape > s.id;
          const active = etape === s.id;
          return (
            <div
              key={s.id}
              className={`candidature-step ${active || done ? 'active' : ''}`}
            >
              <div className="step-circle" style={done ? {
                background: 'var(--color-primary)', borderColor: 'var(--color-primary)',
                color: 'white',
              } : {}}>
                {done
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  : s.icon
                }
              </div>
              <div className="step-label" style={{ fontSize: 12, textAlign: 'center' }}>
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <div className="step-line" style={done ? { background: 'var(--color-primary)' } : {}} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ── Boutons d'action ───────────────────────────────────── */
  const FormActions = ({ onBack, backLabel = 'Retour', submitLabel = 'Enregistrer et continuer', isSubmit = true }) => (
    <div style={{ display: 'flex', justifyContent: onBack ? 'space-between' : 'flex-end', alignItems: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--color-border-light)' }}>
      {onBack && (
        <button type="button" className="btn-secondary" onClick={onBack} disabled={submitting}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          {backLabel}
        </button>
      )}
      {isSubmit && (
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? (
            <>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Enregistrement...
            </>
          ) : (
            <>
              {submitLabel}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </>
          )}
        </button>
      )}
    </div>
  );

  /* ── States de chargement ───────────────────────────────── */
  if (loading) return (
    <div className="dashboard-layout">
      <Sidebar activeTab="mobilite" onTabChange={() => {}} role="candidat" />
      <main className="dashboard-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </main>
    </div>
  );

  /* ── Rendu principal ────────────────────────────────────── */
  return (
    <div className="dashboard-layout">
      <Sidebar activeTab="mobilite" onTabChange={(tab) => {
        if (tab === 'apercu')          navigate('/candidat');
        if (tab === 'opportunites')    navigate('/candidat/appels');
        if (tab === 'mes-candidatures')navigate('/candidat/mes-dossiers');
        if (tab === 'mobilite')        navigate('/candidat/mobilite');
      }} onLogout={onLogout} role="candidat" />

      <main className="dashboard-main">
        <Topbar
          title="Candidature Mobilité"
          subtitle="Programme de Mobilité Internationale"
          onBack={() => navigate('/candidat/mobilite')}
        />

        <div className="dashboard-content">
          <div className="content-grid" style={{ maxWidth: 820, margin: '0 auto', paddingBottom: 60 }}>

            {/* BARRE DE PROGRESSION */}
            <ProgressBar />

            {/* MESSAGE D'ERREUR */}
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 20 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            {etape === 1 && (
              <form onSubmit={submit1} className="card animate-fade-in-up" style={{ padding: 32 }}>
                <div className="section-header">
                  <SectionIcon>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </SectionIcon>
                  <div>
                    <h2 className="section-title" style={{ marginBottom: 2 }}>Informations générales</h2>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>Renseignez les informations de base sur votre projet de mobilité</p>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group" id="field-nom_structure">
                    <label>Nom de la structure ou de l'artiste *</label>
                    <input type="text" value={e1.nom_structure}
                      placeholder="Ex: Association Dakar Créatif"
                      onChange={ev => setE1({...e1, nom_structure: ev.target.value})}
                      onBlur={() => handleBlur('nom_structure')}
                      style={getInputStyle('nom_structure')} />
                    <ErrorMsg msg={fieldErrors.nom_structure} />
                  </div>
                  <div className="form-group" id="field-discipline">
                    <label>Discipline artistique ou culturelle *</label>
                    <input type="text" value={e1.discipline}
                      placeholder="Ex: Danse contemporaine, Musique..."
                      onChange={ev => setE1({...e1, discipline: ev.target.value})}
                      onBlur={() => handleBlur('discipline')}
                      style={getInputStyle('discipline')} />
                    <ErrorMsg msg={fieldErrors.discipline} />
                  </div>
                </div>
                
                <div className="form-grid-2" style={{ marginTop: 24, marginBottom: 24 }}>
                  <div className="form-group" id="field-date_depart">
                    <label>Date de départ prévue *</label>
                    <input type="date" value={e1.date_depart}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={ev => {
                        const newDepart = ev.target.value;
                        let newArrivee = e1.date_arrivee;
                        // Si la date de départ change et devient postérieure à la date d'arrivée, on réinitialise l'arrivée
                        if (newDepart && newArrivee && new Date(newDepart) >= new Date(newArrivee)) {
                          newArrivee = '';
                        }
                        setE1({...e1, date_depart: newDepart, date_arrivee: newArrivee});
                      }}
                      onBlur={() => handleBlur('date_depart')}
                      style={getInputStyle('date_depart')} />
                    <ErrorMsg msg={fieldErrors.date_depart} />
                  </div>
                  <div className="form-group" id="field-date_arrivee">
                    <label>Date d'arrivée prévue *</label>
                    <input type="date" value={e1.date_arrivee}
                      min={e1.date_depart ? (() => { const d = new Date(e1.date_depart); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })() : ''}
                      disabled={!e1.date_depart}
                      onChange={ev => setE1({...e1, date_arrivee: ev.target.value})}
                      onBlur={() => handleBlur('date_arrivee')}
                      style={getInputStyle('date_arrivee')} />
                    <ErrorMsg msg={fieldErrors.date_arrivee} />
                  </div>

                  <div className="form-group" id="field-pays_destination">
                    <label>Pays de destination *</label>
                    <input type="text" list="pays-list" value={e1.pays_destination}
                      placeholder="Rechercher un pays..."
                      onChange={ev => {
                        const newPays = ev.target.value;
                        setE1({...e1, pays_destination: newPays, region_destination: ''});
                      }}
                      onBlur={() => handleBlur('pays_destination')}
                      style={getInputStyle('pays_destination')} />
                    <datalist id="pays-list">
                      {PAYS.map(p => <option key={p} value={p} />)}
                    </datalist>
                    <ErrorMsg msg={fieldErrors.pays_destination} />
                  </div>
                  
                  <div className="form-group" id="field-region_destination">
                    <label>Région / Ville de destination *</label>
                    <input type="text" list={e1.pays_destination === 'Sénégal' ? 'regions-senegal-list' : undefined} 
                      value={e1.region_destination}
                      placeholder={e1.pays_destination === 'Sénégal' ? "Sélectionner une région..." : (e1.pays_destination ? "Saisir la ville ou région..." : "Sélectionnez d'abord un pays")}
                      disabled={!e1.pays_destination}
                      onChange={ev => setE1({...e1, region_destination: ev.target.value})}
                      onBlur={() => handleBlur('region_destination')}
                      style={{...getInputStyle('region_destination'), backgroundColor: !e1.pays_destination ? 'var(--color-bg-secondary)' : undefined }} />
                    <datalist id="regions-senegal-list">
                      {REGIONS_SENEGAL.map(r => <option key={r} value={r} />)}
                    </datalist>
                    <ErrorMsg msg={fieldErrors.region_destination} />
                  </div>
                </div>

                <FormActions />
              </form>
            )}

            {etape === 2 && (
              <form onSubmit={submit2} className="card animate-fade-in-up" style={{ padding: 32 }}>
                <div className="section-header">
                  <SectionIcon>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </SectionIcon>
                  <div>
                    <h2 className="section-title" style={{ marginBottom: 2 }}>Contexte et objectifs</h2>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>Présentez votre projet et expliquez ses ambitions</p>
                  </div>
                </div>

                <div className="form-grid-2">
                  {[
                    { id: 'Presentation_succincte', label: 'Présentation succincte — Qui êtes-vous ? *' },
                    { id: 'opportunite', label: 'Opportunité — Événement, invitation, partenariat... *' },
                    { id: 'pertinence', label: 'Pertinence — Pourquoi maintenant ? *' },
                    { id: 'objectifs_generaux', label: 'Objectifs généraux *' },
                    { id: 'objectifs_specifiques', label: 'Objectifs spécifiques *' },
                  ].map(f => (
                    <div key={f.id} className="form-group form-col-full" id={`field-${f.id}`}>
                      <label>{f.label}</label>
                      <textarea rows="3" maxLength={2000}
                        value={e2[f.id]}
                        onChange={ev => setE2({...e2, [f.id]: ev.target.value})}
                        onBlur={() => handleBlur(f.id)}
                        style={getInputStyle(f.id)}
                      />
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:4 }}>
                        <ErrorMsg msg={fieldErrors[f.id]} />
                        <div style={{ fontSize: 12, color: e2[f.id].length < 50 ? 'var(--color-red)' : 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
                          {e2[f.id].length} / 2000
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <FormActions onBack={() => go(1)} />
              </form>
            )}

            {etape === 3 && (
              <form onSubmit={submit3} className="card animate-fade-in-up" style={{ padding: 32 }}>
                <div className="section-header">
                  <SectionIcon>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 010 20"/></svg>
                  </SectionIcon>
                  <div>
                    <h2 className="section-title" style={{ marginBottom: 2 }}>Programme et impact</h2>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>Décrivez le déroulement de votre séjour et les retombées attendues</p>
                  </div>
                </div>

                <div className="form-grid-2">
                  {[
                    { id: 'programme_sejour_detaille_du_sejour', label: 'Programme détaillé du séjour *' },
                    { id: 'activites_prevues', label: 'Activités prévues *' },
                    { id: 'resultats_attendus', label: 'Résultats concrets attendus *' },
                    { id: 'impacts', label: 'Impacts attendus *' },
                  ].map(f => (
                    <div key={f.id} className="form-group form-col-full" id={`field-${f.id}`}>
                      <label>{f.label}</label>
                      <textarea rows="3" maxLength={2000}
                        value={e3[f.id]}
                        onChange={ev => setE3({...e3, [f.id]: ev.target.value})}
                        onBlur={() => handleBlur(f.id)}
                        style={getInputStyle(f.id)}
                      />
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:4 }}>
                        <ErrorMsg msg={fieldErrors[f.id]} />
                        <div style={{ fontSize: 12, color: e3[f.id].length < 50 ? 'var(--color-red)' : 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
                          {e3[f.id].length} / 2000
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <FormActions onBack={() => go(2)} />
              </form>
            )}

            {etape === 4 && (
              <form onSubmit={submit4} className="card animate-fade-in-up" style={{ padding: 32 }}>
                <div className="section-header">
                  <SectionIcon>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
                  </SectionIcon>
                  <div>
                    <h2 className="section-title" style={{ marginBottom: 2 }}>Documents et annexes</h2>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>Tous ces documents sont obligatoires. Formats acceptés : PDF, JPG, PNG — Max 10 Mo/fichier</p>
                  </div>
                </div>

                <div style={{ background: 'var(--color-bg-body)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: 24, border: '1px solid var(--color-border-light)' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 20 }}>
                    📎 Documents requis
                  </p>

                  <div className="form-grid-2">
                    {[
                      { id: 'doc_invitation', label: "Lettre d'invitation officielle *" },
                      { id: 'doc_cv_portfolio', label: 'CV ou Portfolio *' },
                      { id: 'doc_ninea', label: 'NINEA *' },
                      { id: 'doc_recepisse', label: 'Récépissé *' },
                      { id: 'doc_note_structure', label: "Note structure d'accueil *" },
                      { id: 'image_couverture', label: 'Image de couverture *' },
                    ].map(doc => (
                      <div key={doc.id} className="form-group" id={`field-${doc.id}`}>
                        <label>{doc.label} {existingDocs[doc.id] && <AlreadyProvidedBadge />}</label>
                        <input
                          key={e4Files[doc.id] ? e4Files[doc.id].name : 'empty'}
                          type="file" accept=".pdf,.jpg,.jpeg,.png" className="file-input"
                          onChange={ev => {
                            if (ev.target.files && ev.target.files[0]) {
                              handleFileChange(doc.id, ev.target.files[0]);
                            }
                          }}
                          style={getInputStyle(doc.id)}
                        />
                        {e4Files[doc.id] && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                            <div style={{ fontSize: 12, color: 'var(--color-primary)' }}>
                              Sélectionné : {e4Files[doc.id].name}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setE4Files(prev => {
                                  const copy = { ...prev };
                                  delete copy[doc.id];
                                  return copy;
                                });
                              }}
                              style={{ background: 'none', border: 'none', color: 'var(--color-red)', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                        <ErrorMsg msg={fieldErrors[doc.id]} />
                      </div>
                    ))}
                  </div>
                </div>

                <FormActions onBack={() => go(3)} submitLabel="Valider les documents" />
              </form>
            )}

            {etape === 5 && (
              <div className="card animate-fade-in-up" style={{ padding: 32 }}>
                <div className="section-header">
                  <SectionIcon>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  </SectionIcon>
                  <div>
                    <h2 className="section-title" style={{ marginBottom: 2 }}>Récapitulatif et soumission</h2>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>Vérifiez les informations avant de soumettre votre dossier</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div style={{ background: 'var(--color-bg-body)', borderRadius: 'var(--radius-md)', padding: '16px 20px', border: '1px solid var(--color-border-light)', minWidth: 0, wordBreak: 'break-word' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>Étape 1 — Infos générales</p>
                      <button type="button" onClick={() => go(1)} style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Modifier</button>
                    </div>
                    <dl style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                      <dt style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Structure</dt><dd style={{ margin: 0 }}>{e1.nom_structure || '—'}</dd>
                      <dt style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Discipline</dt><dd style={{ margin: 0 }}>{e1.discipline || '—'}</dd>
                      <dt style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Destination</dt><dd style={{ margin: 0 }}>{e1.pays_destination}{e1.region_destination ? ` (${e1.region_destination})` : ''}</dd>
                      <dt style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Période</dt><dd style={{ margin: 0 }}>{e1.date_depart} → {e1.date_arrivee}</dd>
                    </dl>
                  </div>

                  <div style={{ background: 'var(--color-bg-body)', borderRadius: 'var(--radius-md)', padding: '16px 20px', border: '1px solid var(--color-border-light)', minWidth: 0, wordBreak: 'break-word' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>Étape 2 — Contexte</p>
                      <button type="button" onClick={() => go(2)} style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Modifier</button>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      {e2.Presentation_succincte ? e2.Presentation_succincte.substring(0, 120) + (e2.Presentation_succincte.length > 120 ? '...' : '') : '—'}
                    </p>
                  </div>

                  <div style={{ background: 'var(--color-bg-body)', borderRadius: 'var(--radius-md)', padding: '16px 20px', border: '1px solid var(--color-border-light)', minWidth: 0, wordBreak: 'break-word' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>Étape 3 — Programme</p>
                      <button type="button" onClick={() => go(3)} style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Modifier</button>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      {e3.programme_sejour_detaille_du_sejour ? e3.programme_sejour_detaille_du_sejour.substring(0, 120) + '...' : '—'}
                    </p>
                  </div>

                  <div style={{ background: 'var(--color-bg-body)', borderRadius: 'var(--radius-md)', padding: '16px 20px', border: '1px solid var(--color-border-light)', minWidth: 0, wordBreak: 'break-word' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>Étape 4 — Documents</p>
                      <button type="button" onClick={() => go(4)} style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Modifier</button>
                    </div>
                    {[
                      { key: 'doc_invitation',    label: "Lettre d'invitation" },
                      { key: 'doc_cv_portfolio',  label: 'CV / Portfolio' },
                      { key: 'doc_ninea',         label: 'NINEA' },
                      { key: 'doc_recepisse',     label: 'Récépissé' },
                      { key: 'doc_note_structure',label: 'Note structure accueil' },
                      { key: 'image_couverture',  label: 'Image couverture' },
                    ].map(d => {
                      const ok = existingDocs[d.key] || !!e4Files[d.key];
                      return ok ? (
                        <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-green)', marginBottom: 4 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          {d.label}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                <div className="alert alert-info" style={{ marginBottom: 24 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Une fois soumis, votre dossier ne pourra plus être modifié. Assurez-vous que toutes les informations sont correctes avant de confirmer.
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button type="button" className="btn-secondary" onClick={() => go(4)} disabled={submitting}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                    Retour aux documents
                  </button>
                  <button type="button" className="btn-primary" onClick={submitFinal} disabled={submitting}
                    style={{ padding: '12px 28px', fontSize: 15 }}>
                    {submitting ? (
                      <>
                        <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        Soumettre mon dossier
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
