/* ── CandidatCandidature.jsx ────────────────────────────────── */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import candidatService from '../services/candidatService';

const SECTEURS = [
  { id: 'claque', label: 'Claque' },
  { id: 'danse_urbaine', label: 'Danse Urbaine' },
  { id: 'conception', label: 'Conception' },
  { id: 'sport_de_rue', label: 'Sport de Rue' },
  { id: 'art_vivant', label: 'Art Vivant' },
  { id: 'mode', label: 'Mode' },
  { id: 'hiphop', label: 'Hip-Hop' },
  { id: 'graffiti', label: 'Graffiti' }
];

const REGIONS = [
  'Dakar', 'Thiès', 'Diourbel', 'Fatick', 'Kaolack', 'Kaffrine', 
  'Saint-Louis', 'Louga', 'Matam', 'Tambacounda', 'Kédougou', 
  'Kolda', 'Ziguinchor', 'Sédhiou'
];

export default function CandidatCandidature({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [appel, setAppel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [etape, setEtape] = useState(1);
  const [dossierId, setDossierId] = useState(null);
  const [typeProjet, setTypeProjet] = useState('structuration');
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const [etape1Data, setEtape1Data] = useState({
    prenom_nom_porteur: '', nom_structure: '', type_projet: 'structuration',
    secteur_activite: 'claque', region: 'Dakar', activite_entreprise: '', nature_projet: ''
  });

  const [etape2Data, setEtape2Data] = useState({
    phase: '', objectifs_globaux: '', importance_territoire: '',
    impacts_economiques: '', potentiel_reussite: '', localisation: '',
    beneficiaires: '', plan_perennisation: '', description_produit: '',
    equipe: [{ poste: '', prenom: '', nom: '', telephone: '' }]
  });

  const [etape3Files, setEtape3Files] = useState({
    doc_ninea_recepisse: null, doc_cni_passeport: null, doc_budget: null,
    doc_plan_action: null, doc_photo_prototype: null,
    doc_analyse_financiere: null, doc_business_model: null
  });
  
  const [existingDocs, setExistingDocs] = useState({});

  useEffect(() => {
    const fetchAppelAndDraft = async () => {
      try {
        const resAppel = await candidatService.getDetailAppel(id);
        setAppel(resAppel.appel);
        
        let typeProj = resAppel.appel.type_projet || 'structuration';
        setTypeProjet(typeProj);
        setEtape1Data(prev => ({ ...prev, type_projet: typeProj }));

        const resDossiers = await candidatService.getMesAppels();
        if (resDossiers && resDossiers.dossiers) {
          const draft = resDossiers.dossiers.find(d => String(d.appel_id) === String(id));
          if (draft) {
            setDossierId(draft.id);
            setEtape(draft.etape_courante > 0 ? draft.etape_courante : 1);
            
            setEtape1Data({
              prenom_nom_porteur: draft.prenom_nom_porteur || '',
              nom_structure: draft.nom_structure || '',
              type_projet: draft.type_projet || typeProj,
              secteur_activite: draft.secteur_activite || 'claque',
              region: draft.region || 'Dakar',
              activite_entreprise: draft.activite_entreprise || '',
              nature_projet: draft.nature_projet || ''
            });
            setTypeProjet(draft.type_projet || typeProj);

            let phase = '';
            if (draft.phase_ideation) phase = 'ideation';
            else if (draft.phase_execution) phase = 'execution';
            
            setEtape2Data({
              phase,
              objectifs_globaux: draft.objectifs_globaux || '',
              importance_territoire: draft.importance_territoire || '',
              impacts_economiques: draft.impacts_economiques || '',
              potentiel_reussite: draft.potentiel_reussite || '',
              localisation: draft.localisation || '',
              beneficiaires: draft.beneficiaires || '',
              plan_perennisation: draft.plan_perennisation || '',
              description_produit: draft.description_produit || '',
              equipe: (draft.equipe && draft.equipe.length > 0) ? draft.equipe : [{ poste: '', prenom: '', nom: '', telephone: '' }]
            });

            setExistingDocs({
              doc_ninea_recepisse: !!draft.doc_ninea_recepisse,
              doc_cni_passeport: !!draft.doc_cni_passeport,
              doc_plan_action: !!draft.doc_plan_action,
              doc_photo_prototype: !!draft.doc_photo_prototype,
              doc_budget: !!draft.doc_budget,
              doc_analyse_financiere: !!draft.doc_analyse_financiere,
              doc_business_model: !!draft.doc_business_model
            });
          }
        }
      } catch (err) {
        console.error('Erreur chargement:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppelAndDraft();
  }, [id]);

  // VALIDATIONS ──────────────────────────────────────────
  const validateText = (val, min = 2, max = 100) => {
    if (!val || val.trim().length === 0) return 'Ce champ est obligatoire';
    if (val.trim().length < min) return `Minimum ${min} caractères requis`;
    if (val.length > max) return `Maximum ${max} caractères`;
    return null;
  };
  const validateTextarea = (val) => validateText(val, 50, 2000);
  const validatePhone = (val) => {
    if (!val || val.trim().length === 0) return 'Ce champ est obligatoire';
    if (!/^(\+221|00221)?[7][0|5|6|7|8][0-9]{7}$/.test(val)) return 'Entrez un numéro sénégalais valide (ex: 771234567)';
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

  const validatePhoneKey = (e) => {
    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', '+'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const ErrorMsg = ({ msg }) => msg ? (
    <div style={{ color: 'var(--color-red)', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
      <svg width="12" height="12">⚠️</svg> {msg}
    </div>
  ) : null;

  // SOUMISSION ETAPE 1
  const handleEtape1Submit = async (e) => {
    e.preventDefault();
    let errs = {};
    const e1 = etape1Data;
    let err;
    err = validateText(e1.prenom_nom_porteur); if(err) errs.prenom_nom_porteur = err;
    err = validateText(e1.nom_structure); if(err) errs.nom_structure = err;
    if(!e1.secteur_activite) errs.secteur_activite = 'Ce champ est obligatoire';
    if(!e1.region) errs.region = 'Ce champ est obligatoire';
    if(!appel.type_projet && !e1.type_projet) errs.type_projet = 'Ce champ est obligatoire';
    err = validateTextarea(e1.activite_entreprise); if(err) errs.activite_entreprise = err;
    err = validateTextarea(e1.nature_projet); if(err) errs.nature_projet = err;

    // mark all as touched
    const touched = {}; Object.keys(e1).forEach(k => touched[k]=true); setTouchedFields(prev => ({...prev, ...touched}));
    setFieldErrors(errs);

    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return;
    }

    setError(''); setSubmitting(true);
    try {
      const res = await candidatService.soumettreEtape1({ ...etape1Data, appel_id: id });
      setDossierId(res.dossier_id);
      setTypeProjet(res.type_projet);
      setEtape(2);
      setTouchedFields({}); setFieldErrors({});
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission de l\'étape 1');
    } finally {
      setSubmitting(false);
    }
  };

  // SOUMISSION ETAPE 2
  const handleEtape2Submit = async (e) => {
    e.preventDefault();
    let errs = {};
    const e2 = etape2Data;
    let err;

    if(!e2.phase) errs.phase = 'Veuillez sélectionner une phase';
    err = validateTextarea(e2.objectifs_globaux); if(err) errs.objectifs_globaux = err;
    err = validateTextarea(e2.importance_territoire); if(err) errs.importance_territoire = err;
    err = validateTextarea(e2.impacts_economiques); if(err) errs.impacts_economiques = err;
    err = validateTextarea(e2.potentiel_reussite); if(err) errs.potentiel_reussite = err;
    err = validateText(e2.localisation); if(err) errs.localisation = err;
    err = validateText(e2.beneficiaires); if(err) errs.beneficiaires = err;
    err = validateTextarea(e2.plan_perennisation); if(err) errs.plan_perennisation = err;
    err = validateTextarea(e2.description_produit); if(err) errs.description_produit = err;

    if(e2.equipe.length < 1) errs.equipe = 'Au moins 1 membre est requis';
    e2.equipe.forEach((membre, idx) => {
      err = validateText(membre.prenom); if(err) errs[`equipe_${idx}_prenom`] = err;
      err = validateText(membre.nom); if(err) errs[`equipe_${idx}_nom`] = err;
      err = validateText(membre.poste); if(err) errs[`equipe_${idx}_poste`] = err;
      err = validatePhone(membre.telephone); if(err) errs[`equipe_${idx}_telephone`] = err;
    });

    const touched = { phase: true, objectifs_globaux: true, importance_territoire: true, impacts_economiques: true, potentiel_reussite: true, localisation: true, beneficiaires: true, plan_perennisation: true, description_produit: true };
    e2.equipe.forEach((_, idx) => { touched[`equipe_${idx}_prenom`]=true; touched[`equipe_${idx}_nom`]=true; touched[`equipe_${idx}_poste`]=true; touched[`equipe_${idx}_telephone`]=true; });
    setTouchedFields(prev => ({...prev, ...touched}));
    setFieldErrors(errs);

    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return;
    }

    setError(''); setSubmitting(true);
    try {
      await candidatService.soumettreEtape2(dossierId, {
        ...etape2Data, phase_ideation: e2.phase === 'ideation', phase_execution: e2.phase === 'execution'
      });
      setEtape(3);
      setTouchedFields({}); setFieldErrors({});
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission de l\'étape 2');
    } finally {
      setSubmitting(false);
    }
  };

  // SOUMISSION ETAPE 3
  const handleEtape3Submit = async (e) => {
    e.preventDefault();
    let errs = {};
    const validateDoc = (field) => {
      if (!existingDocs[field] && !etape3Files[field]) return 'Ce champ est obligatoire';
      if (etape3Files[field]) return validateFile(etape3Files[field]);
      return null;
    };
    let err;

    err = validateDoc('doc_ninea_recepisse'); if(err) errs.doc_ninea_recepisse = err;
    err = validateDoc('doc_cni_passeport'); if(err) errs.doc_cni_passeport = err;
    err = validateDoc('doc_plan_action'); if(err) errs.doc_plan_action = err;
    err = validateDoc('doc_photo_prototype'); if(err) errs.doc_photo_prototype = err;

    if (typeProjet === 'formation' || typeProjet === 'evenementiel') {
      err = validateDoc('doc_budget'); if(err) errs.doc_budget = err;
    }
    if (typeProjet === 'structuration') {
      err = validateDoc('doc_analyse_financiere'); if(err) errs.doc_analyse_financiere = err;
      err = validateDoc('doc_business_model'); if(err) errs.doc_business_model = err;
    }

    const touched = {}; Object.keys(etape3Files).forEach(k => touched[k]=true);
    setTouchedFields(prev => ({...prev, ...touched}));
    setFieldErrors(errs);

    if (Object.keys(errs).length > 0) {
      scrollToFirstError(errs);
      return;
    }

    setError(''); setSubmitting(true);
    const formData = new FormData();
    Object.keys(etape3Files).forEach(key => { if (etape3Files[key]) formData.append(key, etape3Files[key]); });

    try {
      await candidatService.soumettreEtape3(dossierId, formData);
      setEtape(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'upload des documents');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSoumettre = async () => {
    setError(''); setSubmitting(true);
    try {
      await candidatService.soumettreDossier(dossierId);
      navigate(`/candidat/confirmation/${dossierId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission finale');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setEtape3Files({ ...etape3Files, [field]: e.target.files[0] });
      setTouchedFields(prev => ({ ...prev, [field]: true }));
      // Validation temps réel
      const err = validateFile(e.target.files[0]);
      setFieldErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  // Render Helpers
  const getInputStyle = (field) => {
    if (fieldErrors[field]) return { borderColor: 'var(--color-red)' };
    if (touchedFields[field] && !fieldErrors[field]) return { borderColor: 'var(--color-green)' };
    return {};
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar activeTab="opportunites" onTabChange={() => {}} role="candidat" />
        <main className="dashboard-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></main>
      </div>
    );
  }

  if (!appel) {
    return (
      <div className="dashboard-layout">
        <Sidebar activeTab="opportunites" onTabChange={() => {}} role="candidat" />
        <main className="dashboard-main"><Topbar title="Erreur" subtitle="Appel introuvable" /></main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab="opportunites" onTabChange={(tab) => {
        if (tab === 'apercu') navigate('/candidat');
        if (tab === 'opportunites') navigate('/candidat/appels');
        if (tab === 'mes-candidatures') navigate('/candidat/mes-dossiers');
        if (tab === 'mobilite') navigate('/candidat/mobilite');
      }} onLogout={onLogout} role="candidat" />

      <main className="dashboard-main">
        <Topbar title="Soumission de dossier" subtitle={appel.titre} onBack={() => navigate(`/candidat/appels/${id}`)} />

        <div className="dashboard-content">
          <div className="content-grid" style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 60 }}>
            
            <div className="candidature-progress-container animate-fade-in-up" style={{ marginBottom: 32 }}>
              <div className="candidature-progress-steps">
                {[1, 2, 3, 4].map(step => (
                  <div key={step} className={`candidature-step ${etape >= step ? 'active' : ''}`}>
                    <div className="step-circle">{step}</div>
                    <div className="step-label">{['Infos', 'Détails', 'Documents', 'Récap'][step-1]}</div>
                    {step < 4 && <div className="step-line"></div>}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: 24 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            {etape === 1 && (
              <form onSubmit={handleEtape1Submit} className="card animate-fade-in-up" style={{ padding: 32 }}>
                <div className="section-header"><h2 className="section-title">Étape 1 : Informations générales</h2></div>
                
                <div className="form-grid-2">
                  <div className="form-group" id="field-prenom_nom_porteur">
                    <label>Prénom et nom du porteur de projet *</label>
                    <input type="text"
                      value={etape1Data.prenom_nom_porteur}
                      onChange={(e) => setEtape1Data({...etape1Data, prenom_nom_porteur: e.target.value})}
                      onBlur={() => handleBlur('prenom_nom_porteur')}
                      style={getInputStyle('prenom_nom_porteur')}
                    />
                    <ErrorMsg msg={fieldErrors.prenom_nom_porteur} />
                  </div>
                  
                  <div className="form-group" id="field-nom_structure">
                    <label>Nom de la structure *</label>
                    <input type="text"
                      value={etape1Data.nom_structure}
                      onChange={(e) => setEtape1Data({...etape1Data, nom_structure: e.target.value})}
                      onBlur={() => handleBlur('nom_structure')}
                      style={getInputStyle('nom_structure')}
                    />
                    <ErrorMsg msg={fieldErrors.nom_structure} />
                  </div>

                  <div className="form-group" id="field-secteur_activite">
                    <label>Secteur d'activité *</label>
                    <select
                      value={etape1Data.secteur_activite}
                      onChange={(e) => setEtape1Data({...etape1Data, secteur_activite: e.target.value})}
                      onBlur={() => handleBlur('secteur_activite')}
                      style={getInputStyle('secteur_activite')}
                    >
                      <option value="">Sélectionnez...</option>
                      {SECTEURS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                    <ErrorMsg msg={fieldErrors.secteur_activite} />
                  </div>
                  
                  <div className="form-group" id="field-region">
                    <label>Région *</label>
                    <select
                      value={etape1Data.region}
                      onChange={(e) => setEtape1Data({...etape1Data, region: e.target.value})}
                      onBlur={() => handleBlur('region')}
                      style={getInputStyle('region')}
                    >
                      <option value="">Sélectionnez...</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ErrorMsg msg={fieldErrors.region} />
                  </div>

                {!appel.type_projet && (
                  <div className="form-group form-col-full" id="field-type_projet">
                    <label>Type de projet *</label>
                    <select
                      value={etape1Data.type_projet}
                      onChange={(e) => setEtape1Data({...etape1Data, type_projet: e.target.value})}
                      onBlur={() => handleBlur('type_projet')}
                      style={getInputStyle('type_projet')}
                    >
                      <option value="">Sélectionnez...</option>
                      <option value="structuration">Structuration</option>
                      <option value="formation">Formation</option>
                      <option value="evenementiel">Événementiel</option>
                    </select>
                    <ErrorMsg msg={fieldErrors.type_projet} />
                  </div>
                )}

                <div className="form-group form-col-full" id="field-activite_entreprise">
                  <label>Activité de l'entreprise *</label>
                  <textarea rows="3" maxLength={2000}
                    value={etape1Data.activite_entreprise}
                    onChange={(e) => setEtape1Data({...etape1Data, activite_entreprise: e.target.value})}
                    onBlur={() => handleBlur('activite_entreprise')}
                    style={getInputStyle('activite_entreprise')}
                  />
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:4 }}>
                    <ErrorMsg msg={fieldErrors.activite_entreprise} />
                    <div style={{ fontSize: 12, color: etape1Data.activite_entreprise.length < 50 ? 'var(--color-red)' : 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
                      {etape1Data.activite_entreprise.length} / 2000
                    </div>
                  </div>
                </div>

                <div className="form-group form-col-full" id="field-nature_projet">
                  <label>Nature du projet *</label>
                  <textarea rows="3" maxLength={2000}
                    value={etape1Data.nature_projet}
                    onChange={(e) => setEtape1Data({...etape1Data, nature_projet: e.target.value})}
                    onBlur={() => handleBlur('nature_projet')}
                    style={getInputStyle('nature_projet')}
                  />
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:4 }}>
                    <ErrorMsg msg={fieldErrors.nature_projet} />
                    <div style={{ fontSize: 12, color: etape1Data.nature_projet.length < 50 ? 'var(--color-red)' : 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
                      {etape1Data.nature_projet.length} / 2000
                    </div>
                  </div>
                </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Enregistrement...' : 'Enregistrer et continuer'}
                  </button>
                </div>
              </form>
            )}

            {etape === 2 && (
              <form onSubmit={handleEtape2Submit} className="card animate-fade-in-up" style={{ padding: 32 }}>
                <div className="section-header"><h2 className="section-title">Étape 2 : Détails et impacts</h2></div>

                <div className="form-grid-2" style={{ marginBottom: 24 }} id="field-phase">
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, padding: 16, background: 'var(--color-bg-body)', borderRadius: 8, border: `1px solid ${fieldErrors.phase ? 'var(--color-red)' : 'var(--color-border-light)'}` }}>
                    <input type="radio" name="phase" id="phase_ideation" value="ideation" checked={etape2Data.phase === 'ideation'} onChange={(e) => {setEtape2Data({...etape2Data, phase: e.target.value}); setFieldErrors(p => ({...p, phase: null}));}} style={{ width: 18, height: 18 }} />
                    <label htmlFor="phase_ideation" style={{ margin: 0 }}>Projet en phase d'idéation</label>
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, padding: 16, background: 'var(--color-bg-body)', borderRadius: 8, border: `1px solid ${fieldErrors.phase ? 'var(--color-red)' : 'var(--color-border-light)'}` }}>
                    <input type="radio" name="phase" id="phase_execution" value="execution" checked={etape2Data.phase === 'execution'} onChange={(e) => {setEtape2Data({...etape2Data, phase: e.target.value}); setFieldErrors(p => ({...p, phase: null}));}} style={{ width: 18, height: 18 }} />
                    <label htmlFor="phase_execution" style={{ margin: 0 }}>Projet en phase d'exécution</label>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}><ErrorMsg msg={fieldErrors.phase} /></div>
                </div>

                <div className="form-grid-2">
                  {[
                    { id: 'objectifs_globaux', label: 'Objectifs globaux *', isTextarea: true },
                    { id: 'importance_territoire', label: 'Importance pour le territoire *', isTextarea: true },
                    { id: 'impacts_economiques', label: 'Impacts économiques *', isTextarea: true },
                    { id: 'potentiel_reussite', label: 'Potentiel de réussite *', isTextarea: true },
                    { id: 'localisation', label: 'Localisation exacte du projet *', isTextarea: false },
                    { id: 'beneficiaires', label: 'Bénéficiaires visés *', isTextarea: false },
                    { id: 'plan_perennisation', label: 'Plan de pérennisation *', isTextarea: true },
                    { id: 'description_produit', label: 'Description détaillée du produit/service *', isTextarea: true },
                  ].map(f => (
                    <div key={f.id} className={`form-group ${f.isTextarea ? 'form-col-full' : ''}`} id={`field-${f.id}`}>
                      <label>{f.label}</label>
                      {f.isTextarea ? (
                        <textarea rows="3" maxLength={2000}
                          value={etape2Data[f.id]}
                          onChange={(e) => setEtape2Data({...etape2Data, [f.id]: e.target.value})}
                          onBlur={() => handleBlur(f.id)}
                          style={getInputStyle(f.id)}
                        />
                      ) : (
                        <input type="text"
                          value={etape2Data[f.id]}
                          onChange={(e) => setEtape2Data({...etape2Data, [f.id]: e.target.value})}
                          onBlur={() => handleBlur(f.id)}
                          style={getInputStyle(f.id)}
                        />
                      )}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:4 }}>
                        <ErrorMsg msg={fieldErrors[f.id]} />
                        {f.isTextarea && (
                          <div style={{ fontSize: 12, color: etape2Data[f.id].length < 50 ? 'var(--color-red)' : 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
                            {etape2Data[f.id].length} / 2000
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="equipe-section" style={{ background: 'var(--color-bg-body)', padding: 24, borderRadius: 12, marginTop: 32, border: '1px solid var(--color-border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, margin: 0 }}>Membres de l'équipe (1 à 3 membres) *</h3>
                    {etape2Data.equipe.length < 3 && (
                      <button type="button" className="btn-secondary small" onClick={() => setEtape2Data({ ...etape2Data, equipe: [...etape2Data.equipe, { poste: '', prenom: '', nom: '', telephone: '' }] })}>
                        + Ajouter un membre
                      </button>
                    )}
                  </div>
                  <ErrorMsg msg={fieldErrors.equipe} />
                  
                  {etape2Data.equipe.map((membre, index) => (
                    <div key={index} style={{ background: 'var(--color-bg-card)', padding: 20, borderRadius: 8, marginBottom: 16, position: 'relative', border: '1px solid var(--color-border)' }}>
                      {etape2Data.equipe.length > 1 && (
                        <button type="button" onClick={() => { const n = [...etape2Data.equipe]; n.splice(index, 1); setEtape2Data({ ...etape2Data, equipe: n }); }} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--color-red)', cursor: 'pointer' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      )}
                      <h4 style={{ fontSize: 14, marginBottom: 16, marginTop: 0 }}>Membre {index + 1}</h4>
                      <div className="form-grid-2" style={{ gap: 16 }}>
                        <div className="form-group" id={`field-equipe_${index}_prenom`}>
                          <label>Prénom *</label>
                          <input type="text" value={membre.prenom} onChange={(e) => { const n = [...etape2Data.equipe]; n[index].prenom = e.target.value; setEtape2Data({...etape2Data, equipe: n}); }} onBlur={() => handleBlur(`equipe_${index}_prenom`)} style={getInputStyle(`equipe_${index}_prenom`)} />
                          <ErrorMsg msg={fieldErrors[`equipe_${index}_prenom`]} />
                        </div>
                        <div className="form-group" id={`field-equipe_${index}_nom`}>
                          <label>Nom *</label>
                          <input type="text" value={membre.nom} onChange={(e) => { const n = [...etape2Data.equipe]; n[index].nom = e.target.value; setEtape2Data({...etape2Data, equipe: n}); }} onBlur={() => handleBlur(`equipe_${index}_nom`)} style={getInputStyle(`equipe_${index}_nom`)} />
                          <ErrorMsg msg={fieldErrors[`equipe_${index}_nom`]} />
                        </div>
                        <div className="form-group" id={`field-equipe_${index}_poste`}>
                          <label>Poste occupé *</label>
                          <input type="text" value={membre.poste} onChange={(e) => { const n = [...etape2Data.equipe]; n[index].poste = e.target.value; setEtape2Data({...etape2Data, equipe: n}); }} onBlur={() => handleBlur(`equipe_${index}_poste`)} style={getInputStyle(`equipe_${index}_poste`)} />
                          <ErrorMsg msg={fieldErrors[`equipe_${index}_poste`]} />
                        </div>
                        <div className="form-group" id={`field-equipe_${index}_telephone`}>
                          <label>Téléphone *</label>
                          <input type="tel" value={membre.telephone} onChange={(e) => { const n = [...etape2Data.equipe]; n[index].telephone = e.target.value; setEtape2Data({...etape2Data, equipe: n}); }} onKeyDown={validatePhoneKey} onBlur={() => handleBlur(`equipe_${index}_telephone`)} style={getInputStyle(`equipe_${index}_telephone`)} placeholder="+221..." />
                          <ErrorMsg msg={fieldErrors[`equipe_${index}_telephone`]} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                  <button type="button" className="btn-secondary" onClick={() => setEtape(1)}>Retour</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Enregistrement...' : 'Enregistrer et continuer'}
                  </button>
                </div>
              </form>
            )}

            {etape === 3 && (
              <form onSubmit={handleEtape3Submit} className="card animate-fade-in-up" style={{ padding: 32 }}>
                <div className="section-header"><h2 className="section-title">Étape 3 : Documents à fournir</h2></div>
                
                {/* Info box */}
                <div style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>Téléchargez les templates, remplissez-les hors ligne puis uploadez-les ici.</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-secondary)' }}>Formats acceptés : PDF, JPG, PNG, Excel (.xlsx), Word (.docx). Taille max : 10 Mo par fichier.</p>
                  </div>
                </div>

                {/* Documents communs */}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Documents d'identité</h3>
                  <div className="form-grid-2">
                    {[
                      { id: 'doc_ninea_recepisse', label: 'NINEA ou Récépissé', desc: 'Justificatif d\'enregistrement de votre structure' },
                      { id: 'doc_cni_passeport', label: 'CNI ou Passeport', desc: 'Pièce d\'identité du porteur de projet' },
                      { id: 'doc_plan_action', label: "Plan d'action", desc: 'Téléchargez le template, remplissez-le, puis uploadez-le', templateLink: `/api/templates/download/plan_action_${typeProjet}` },
                      { id: 'doc_photo_prototype', label: 'Photo ou prototype', desc: 'Photo de votre équipe, prototype ou réalisation' },
                    ].map(f => (
                      <div key={f.id} id={`field-${f.id}`} style={{ background: 'var(--color-bg-body)', borderRadius: 10, padding: 16, border: `1px solid ${fieldErrors[f.id] ? 'var(--color-red)' : existingDocs[f.id] ? 'var(--color-green)' : 'var(--color-border-light)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: 2 }}>{f.label} *</label>
                            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>{f.desc}</p>
                          </div>
                          {existingDocs[f.id] && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 6px', borderRadius: 4, background: 'var(--color-green-light)', color: 'var(--color-green)', flexShrink: 0 }}>✓ Fourni</span>}
                        </div>
                        {f.templateLink && (
                          <a href={f.templateLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none', marginBottom: 8, padding: '4px 8px', background: 'var(--color-primary-light)', borderRadius: 6 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Télécharger template
                          </a>
                        )}
                        <input
                          key={etape3Files[f.id] ? etape3Files[f.id].name : 'empty'}
                          type="file" accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.docx,.doc"
                          onChange={(e) => handleFileChange(e, f.id)} className="file-input"
                          style={{ borderColor: fieldErrors[f.id] ? 'var(--color-red)' : undefined }}
                        />
                        {etape3Files[f.id] && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                            <div style={{ fontSize: 12, color: 'var(--color-primary)' }}>
                              Sélectionné : {etape3Files[f.id].name}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEtape3Files(prev => {
                                  const copy = { ...prev };
                                  delete copy[f.id];
                                  return copy;
                                });
                              }}
                              style={{ background: 'none', border: 'none', color: 'var(--color-red)', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                        <ErrorMsg msg={fieldErrors[f.id]} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents spécifiques au type */}
                {(typeProjet === 'formation' || typeProjet === 'evenementiel') && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Documents spécifiques — {typeProjet === 'formation' ? 'Formation' : 'Événementiel'}</h3>
                    <div id="field-doc_budget" style={{ background: 'var(--color-bg-body)', borderRadius: 10, padding: 16, border: `1px solid ${fieldErrors.doc_budget ? 'var(--color-red)' : existingDocs.doc_budget ? 'var(--color-green)' : 'var(--color-primary)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: 2 }}>Budget prévisionnel *</label>
                          <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>Détaillez votre budget par sections en FCFA. Téléchargez le template, remplissez-le et uploadez-le.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 6px', borderRadius: 4, background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>OBLIGATOIRE</span>
                          {existingDocs.doc_budget && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 6px', borderRadius: 4, background: 'var(--color-green-light)', color: 'var(--color-green)' }}>✓ Fourni</span>}
                        </div>
                      </div>
                      <a
                        href={`/api/templates/download/${typeProjet === 'formation' ? 'budget_previsionnel' : 'budget_previsionnel_evenementiel'}`}
                        target="_blank" rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none', marginBottom: 10, padding: '5px 10px', background: 'var(--color-primary-light)', borderRadius: 6 }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Télécharger template Budget {typeProjet === 'evenementiel' ? 'Événementiel' : 'Formation'}
                      </a>
                      <input
                        key={etape3Files['doc_budget'] ? etape3Files['doc_budget'].name : 'empty'}
                        type="file" accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.docx,.doc"
                        onChange={(e) => handleFileChange(e, 'doc_budget')} className="file-input"
                        style={{ borderColor: fieldErrors.doc_budget ? 'var(--color-red)' : undefined }}
                      />
                      {etape3Files['doc_budget'] && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                          <div style={{ fontSize: 12, color: 'var(--color-primary)' }}>
                            Sélectionné : {etape3Files['doc_budget'].name}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEtape3Files(prev => {
                                const copy = { ...prev };
                                delete copy['doc_budget'];
                                return copy;
                              });
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--color-red)', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                      <ErrorMsg msg={fieldErrors.doc_budget} />
                    </div>
                  </div>
                )}

                {typeProjet === 'structuration' && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Documents spécifiques — Structuration</h3>
                    <div className="form-grid-2">
                      {[
                        { id: 'doc_analyse_financiere', label: 'Analyse financière', desc: 'Bilan 2024, prévisions 2025-2026, et analyse SWOT.', templateNom: 'analyse_financiere' },
                        { id: 'doc_business_model', label: 'Business Model Canvas', desc: 'Présentez votre modèle économique en 9 blocs.', templateNom: 'business_model' },
                      ].map(f => (
                        <div key={f.id} id={`field-${f.id}`} style={{ background: 'var(--color-bg-body)', borderRadius: 10, padding: 16, border: `1px solid ${fieldErrors[f.id] ? 'var(--color-red)' : existingDocs[f.id] ? 'var(--color-green)' : 'var(--color-primary)'}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div>
                              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: 2 }}>{f.label} *</label>
                              <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>{f.desc}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 6px', borderRadius: 4, background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>OBLIGATOIRE</span>
                              {existingDocs[f.id] && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 6px', borderRadius: 4, background: 'var(--color-green-light)', color: 'var(--color-green)' }}>✓ Fourni</span>}
                            </div>
                          </div>
                          <a href={`/api/templates/download/${f.templateNom}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none', marginBottom: 10, padding: '5px 10px', background: 'var(--color-primary-light)', borderRadius: 6 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Télécharger template {f.label}
                          </a>
                          <input
                            key={etape3Files[f.id] ? etape3Files[f.id].name : 'empty'}
                            type="file" accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.docx,.doc"
                            onChange={(e) => handleFileChange(e, f.id)} className="file-input"
                            style={{ borderColor: fieldErrors[f.id] ? 'var(--color-red)' : undefined }}
                          />
                          {etape3Files[f.id] && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                              <div style={{ fontSize: 12, color: 'var(--color-primary)' }}>
                                Sélectionné : {etape3Files[f.id].name}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEtape3Files(prev => {
                                    const copy = { ...prev };
                                    delete copy[f.id];
                                    return copy;
                                  });
                                }}
                                style={{ background: 'none', border: 'none', color: 'var(--color-red)', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                              >
                                Supprimer
                              </button>
                            </div>
                          )}
                          <ErrorMsg msg={fieldErrors[f.id]} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
                  <button type="button" className="btn-secondary" onClick={() => setEtape(2)}>Retour</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Upload...' : 'Uploader les documents'}
                  </button>
                </div>
              </form>
            )}


            {etape === 4 && (
              <div className="card animate-fade-in-up" style={{ padding: 32 }}>
                <div className="section-header">
                  <div className="section-icon" style={{ color: 'var(--color-green)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <h2 className="section-title">Étape 4 : Récapitulatif et Soumission</h2>
                </div>

                <div className="recap-content" style={{ background: 'var(--color-bg-body)', padding: 24, borderRadius: 8, marginBottom: 24 }}>
                  <p><strong>Appel :</strong> {appel.titre}</p>
                  <p><strong>Porteur :</strong> {etape1Data.prenom_nom_porteur}</p>
                  <p><strong>Structure :</strong> {etape1Data.nom_structure}</p>
                  <p><strong>Type de projet :</strong> <span style={{textTransform:'capitalize'}}>{typeProjet}</span></p>
                  
                  <div className="alert alert-info" style={{ marginTop: 16 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    Toutes vos informations et documents ont été sauvegardés avec succès. Cliquez sur "Soumettre mon dossier" pour finaliser votre candidature. Une fois soumis, le dossier ne pourra plus être modifié.
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button type="button" className="btn-secondary" onClick={() => setEtape(3)}>Retour</button>
                  <button onClick={handleSoumettre} className="btn-primary" style={{ background: 'var(--color-green)' }} disabled={submitting}>
                    {submitting ? 'Soumission...' : 'Soumettre mon dossier définitivement'}
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
