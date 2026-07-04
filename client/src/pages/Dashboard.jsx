/* ════════════════════════════════════════════════════════════
   FDCUIC — Dashboard Premium
   Refonte complète — logique métier & navigation
   ════════════════════════════════════════════════════════════ */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';

import AppelModal from '../components/AppelModal';
import adminService from '../services/adminService';

import AdminMobilite from '../components/admin/AdminMobilite';

/* ── Constantes métier ───────────────────────────────────── */
const COLORS_STATUT = {
  brouillon: '#94A3B8',
  soumis: '#4F6AF6',
  en_examen: '#F59F00',
  accepte: '#22B07D',
  rejete: '#F03E3E',
  en_attente: '#94A3B8',
  approuve: '#22B07D',
  verse: '#22B07D',
  annule: '#F03E3E',
  ouvert: '#22B07D',
  fermé: '#F03E3E',
  actif: '#22B07D',
  inactif: '#94A3B8',
};

const LABEL_STATUT = {
  brouillon: 'Brouillon',
  soumis: 'Soumis',
  en_examen: 'En examen',
  accepte: 'Accepté',
  rejete: 'Rejeté',
  en_attente: 'En attente',
  approuve: 'Approuvé',
  verse: 'Versé',
  annule: 'Annulé',
  ouvert: 'Ouvert',
  fermé: 'Fermé',
  actif: 'Actif',
  inactif: 'Inactif',
};

const fmtNum = (n) => Number(n || 0).toLocaleString('fr-FR');

/* ── Tab metadata ────────────────────────────────────────── */
const TABS = [
  { id: 'apercu', label: 'Vue d\'ensemble' },
  { id: 'campagnes', label: 'Appels à projets' },
  { id: 'mobilite', label: 'Mobilité' },
  { id: 'finances', label: 'Finances' },
  { id: 'brouillons', label: 'Dossiers Brouillons' },
  { id: 'soumissionnaires', label: 'Soumissionnaires' },
  { id: 'personnel', label: 'Personnel FDCUIC' },
  { id: 'types-projet', label: 'Types de projet' },
  { id: 'secteurs', label: 'Secteurs d\'activité' },
];

/* ── Custom Tooltip réutilisable ─────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="custom-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="custom-tooltip-value" style={{ color: p.color }}>
          {fmtNum(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard({ activeTab = 'apercu', onLogout }) {
  const navigate = useNavigate();

  /* ── State ── */
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [campagnes, setCampagnes] = useState([]);
  const [loadingCampagnes, setLoadingCampagnes] = useState(false);
  const [errorCampagnes, setErrorCampagnes] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [loadingMobilite, setLoadingMobilite] = useState(false);

  const [toast, setToast] = useState({ message: '', type: '' });
  const [overviewFilter, setOverviewFilter] = useState('tous');

  /* ── Fetch Dashboard Stats ── */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur détaillée:", err);
        const detail = err.response?.data?.message || err.message;
        setError(`Impossible de charger les données depuis le serveur. (${detail})`);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const fetchCampagnesData = () => {
    setLoadingCampagnes(true);
    setErrorCampagnes(null);
    adminService.getCampagnes().then(res => {
      setCampagnes(res.campagnes || []);
      setLoadingCampagnes(false);
    }).catch(err => {
      console.error(err);
      setErrorCampagnes(err.response?.data?.message || err.message);
      setLoadingCampagnes(false);
    });
  };

  /* ── Fetch Tab Data ── */
  useEffect(() => {
    if (activeTab === 'campagnes' && campagnes.length === 0 && !loadingCampagnes && !errorCampagnes) {
      fetchCampagnesData();
    }
  }, [activeTab]);

  /* ── Toast Handler ── */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  /* ── Callbacks de Succès (Optimistic UI) ── */
  const handleSaveCampagneSuccess = (nouvelleCampagne) => {
    showToast("Opération réussie !");
    setCampagnes(prev => {
      const index = prev.findIndex(c => c.id === nouvelleCampagne.id);
      if (index > -1) {
        // Mise à jour : on fusionne pour garder le candidatures_count s'il manque
        const newArray = [...prev];
        newArray[index] = { ...newArray[index], ...nouvelleCampagne };
        return newArray;
      }
      // Création : on l'ajoute au début (avec 0 candidatures par défaut)
      return [{ ...nouvelleCampagne, candidatures_count: 0 }, ...prev];
    });
  };

  if (loading) return (
    <div className="content-grid">
      <div className="stats-grid">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="stat-card skeleton" style={{ minHeight: '120px' }} />
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="error-screen">
      <div className="error-card">
        <div className="error-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p className="error-message">{error}</p>
        <button className="error-btn" onClick={onLogout}>Se déconnecter</button>
      </div>
    </div>
  );

  const roleData = (stats.utilisateurs?.par_role || []).map(d => ({
    name: d.role.charAt(0).toUpperCase() + d.role.slice(1),
    total: parseInt(d.total),
  }));

  const currentTab = TABS.find(t => t.id === activeTab);
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <>
          {/* ═══════════════════════════════════════════════════
             TAB : VUE D'ENSEMBLE
             ═══════════════════════════════════════════════════ */}
          {activeTab === 'apercu' && (() => {
            const totalCandidatures = (stats.appels_projets?.total || 0) + (stats.mobilite?.total || 0);
            const timeline = stats.timeline_mensuelle || [];
            const recentes = stats.recentes_globales || [];
            const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
            const chartData = timeline.map(t => ({
              name: MOIS_LABELS[parseInt(t.mois.split('-')[1]) - 1],
              appels: t.appels,
              mobilite: t.mobilite,
              total: t.appels + t.mobilite
            }));

            // Helper to extract count from par_statut arrays
            const getStatutCount = (arr, statut) => {
              const found = (arr || []).find(s => s.statut === statut);
              return found ? parseInt(found.total) : 0;
            };

            const FILTERS = [
              { id: 'tous', label: 'Toutes les candidatures', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
              { id: 'appel', label: 'Appels à projets', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg> },
              { id: 'mobilite', label: 'Mobilité', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg> },
              { id: 'en_attente', label: 'En attente', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
              { id: 'accepte', label: 'Acceptées', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
              { id: 'journal', label: "Journal d'activité" },
{ id: 'notifications-admin', label: 'Notifications' },
{ id: 'faqs', label: 'Gestion FAQs' },
{ id: 'legal', label: 'Paramètres légaux' },
            ];
            const filteredRecentes = recentes.filter(r => {
              if (overviewFilter === 'tous') return true;
              if (overviewFilter === 'appel') return r.type === 'appel';
              if (overviewFilter === 'mobilite') return r.type === 'mobilite';
              return r.statut === overviewFilter;
            });

            return (
            <div className="content-grid" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* ═══════════ RANGÉE 1 : HERO + 3 CARDS ═══════════ */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr', gap: 16 }}>

                {/* HERO CARD — Total Candidatures */}
                <div className="card animate-fade-in-up" style={{
                  background: 'linear-gradient(135deg, #4F6AF6 0%, #7C5CFC 50%, #3B5BDB 100%)',
                  color: '#fff', padding: '14px 18px', border: 'none', position: 'relative', overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(79, 106, 246, 0.3)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  {/* Decorative orbs */}
                  <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'rgba(255,255,255,0.08)', borderRadius: '50%', filter: 'blur(30px)' }} />
                  <div style={{ position: 'absolute', bottom: -30, left: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', filter: 'blur(25px)' }} />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85, marginBottom: 4 }}>Total Candidatures</div>
                        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>{fmtNum(totalCandidatures)}</div>
                      </div>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <div style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: 8, backdropFilter: 'blur(10px)' }}>
                        <div style={{ fontSize: 9, opacity: 0.8, fontWeight: 600, marginBottom: 1 }}>Appels</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtNum(stats.appels_projets?.total)}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: 8, backdropFilter: 'blur(10px)' }}>
                        <div style={{ fontSize: 9, opacity: 0.8, fontWeight: 600, marginBottom: 1 }}>Mobilité</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtNum(stats.mobilite?.total)}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: 8, backdropFilter: 'blur(10px)' }}>
                        <div style={{ fontSize: 9, opacity: 0.8, fontWeight: 600, marginBottom: 1 }}>Subventions</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{fmtNum(stats.subventions?.total)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SMALL CARD 1 — Campagnes */}
                <div className="card animate-fade-in-up" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, animationDelay: '0.05s', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 20, right: 20, width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 600 }}>Campagnes créées</div>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1, letterSpacing: '-1px' }}>{fmtNum(stats.campagnes?.total)}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-green)', fontWeight: 600, marginTop: 8, background: 'var(--color-green-light)', padding: '4px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {stats.campagnes?.ouvertes || 0} ouvert{(stats.campagnes?.ouvertes || 0) > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* SMALL CARD 2 — Mobilité */}
                <div className="card animate-fade-in-up" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, animationDelay: '0.1s', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 20, right: 20, width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 600 }}>Candidats mobilité</div>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1, letterSpacing: '-1px' }}>{fmtNum(stats.mobilite?.total)}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-orange)', fontWeight: 600, marginTop: 8, background: 'var(--color-orange-light)', padding: '4px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {getStatutCount(stats.mobilite?.par_statut, 'en_attente')} attente
                    </div>
                  </div>
                </div>

                {/* SMALL CARD 3 — Subventions */}
                <div className="card animate-fade-in-up" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, animationDelay: '0.15s', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 20, right: 20, width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 600 }}>Montant versé</div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1, letterSpacing: '-1px' }}>{fmtNum(stats.subventions?.montant_total)}<span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', marginLeft: 4 }}>FCFA</span></div>
                    <div style={{ fontSize: 11, color: 'var(--color-violet)', fontWeight: 600, marginTop: 8, background: 'var(--color-violet-light)', padding: '4px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      {fmtNum(stats.subventions?.total)} dossiers
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══════════ RANGÉE 2 : CHART + INFO CARDS ═══════════ */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>

                {/* CHART — Évolution mensuelle */}
                <div className="card animate-fade-in-up" style={{ padding: '12px 16px 6px', animationDelay: '0.08s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 0 }}>Évolution des candidatures</h3>
                      <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: 2, background: 'var(--color-primary)', display: 'inline-block' }} /> Appels
                        </span>
                        <span style={{ marginLeft: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: 2, background: 'var(--color-orange)', display: 'inline-block' }} /> Mobilité
                        </span>
                      </span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', background: 'var(--color-bg-body)', padding: '4px 10px', borderRadius: 8 }}>12 mois</span>
                  </div>

                  <div style={{ height: 100, marginTop: 4 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} barGap={3} barCategoryGap="25%">
                        <defs>
                          <linearGradient id="barAppels" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4F6AF6" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#4F6AF6" stopOpacity={0.5}/>
                          </linearGradient>
                          <linearGradient id="barMobilite" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7C5CFC" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#7C5CFC" stopOpacity={0.5}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} dy={4} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} width={25} />
                        <Tooltip
                          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
                          cursor={{ fill: 'var(--color-bg-hover)', radius: 6 }}
                        />
                        <Bar dataKey="appels" name="Appels" fill="url(#barAppels)" radius={[4, 4, 0, 0]} maxBarSize={14} />
                        <Bar dataKey="mobilite" name="Mobilité" fill="url(#barMobilite)" radius={[4, 4, 0, 0]} maxBarSize={14} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* RIGHT SIDE — Donut Chart (Progression) */}
                <div className="card animate-fade-in-up" style={{ padding: '24px', animationDelay: '0.12s', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 0 }}>Répartition des statuts</h3>
                      <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Tous les dossiers</span>
                    </div>
                  </div>
                  
                  {(() => {
                    const enAttenteAppels = getStatutCount(stats.appels_projets?.par_statut, 'en_attente') + getStatutCount(stats.appels_projets?.par_statut, 'soumis');
                    const enAttenteMob = getStatutCount(stats.mobilite?.par_statut, 'en_attente') + getStatutCount(stats.mobilite?.par_statut, 'soumis');
                    const acceptesAppels = getStatutCount(stats.appels_projets?.par_statut, 'accepte');
                    const acceptesMob = getStatutCount(stats.mobilite?.par_statut, 'accepte');
                    const rejetesAppels = getStatutCount(stats.appels_projets?.par_statut, 'rejete');
                    const rejetesMob = getStatutCount(stats.mobilite?.par_statut, 'rejete');

                    const totalAttente = enAttenteAppels + enAttenteMob;
                    const totalAcceptes = acceptesAppels + acceptesMob;
                    const totalRejetes = rejetesAppels + rejetesMob;
                    const sum = totalAttente + totalAcceptes + totalRejetes || 1;
                    
                    const data = [
                      { name: 'Acceptés', value: totalAcceptes, color: 'var(--color-green)' },
                      { name: 'En attente', value: totalAttente, color: 'var(--color-orange)' },
                      { name: 'Rejetés', value: totalRejetes, color: 'var(--color-red)' },
                    ].filter(d => d.value > 0);

                    const defaultData = [{ name: 'Aucun', value: 1, color: 'var(--color-border-light)' }];

                    return (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ height: 160, position: 'relative' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={data.length > 0 ? data : defaultData}
                                cx="50%" cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                stroke="none"
                                dataKey="value"
                                paddingAngle={5}
                                cornerRadius={4}
                              >
                                {(data.length > 0 ? data : defaultData).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 600 }}
                                itemStyle={{ color: 'var(--color-text-primary)' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{Math.round((totalAcceptes/sum)*100)}%</span>
                            <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Acceptés</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-green)' }} />
                            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Acceptés</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-orange)' }} />
                            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Attente</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ═══════════ RANGÉE 3 : FILTRES + TABLEAU ═══════════ */}
              <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>

                {/* LEFT — Filter Panel */}
                <div className="card animate-fade-in-up" style={{ padding: '24px', animationDelay: '0.2s' }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 20 }}>Filtrer par</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {FILTERS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setOverviewFilter(f.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                          borderRadius: 12, border: 'none', cursor: 'pointer',
                          background: overviewFilter === f.id ? 'var(--color-primary-light)' : 'transparent',
                          color: overviewFilter === f.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                          fontWeight: overviewFilter === f.id ? 700 : 500, fontSize: 14,
                          transition: 'all 0.2s ease',
                          fontFamily: 'var(--font-sans)',
                        }}
                        onMouseOver={(e) => { if (overviewFilter !== f.id) e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
                        onMouseOut={(e) => { if (overviewFilter !== f.id) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: overviewFilter === f.id ? 'var(--color-primary)' : 'var(--color-bg-body)', color: overviewFilter === f.id ? '#fff' : 'var(--color-text-tertiary)', transition: 'all 0.2s ease', flexShrink: 0 }}>
                          {f.icon}
                        </span>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* RIGHT — Premium Table */}
                <div className="card animate-fade-in-up" style={{ padding: '24px 28px', animationDelay: '0.22s', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>Candidatures récentes</h4>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', background: 'var(--color-bg-body)', padding: '5px 12px', borderRadius: 8 }}>
                      {filteredRecentes.length} résultat{filteredRecentes.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {filteredRecentes.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid var(--color-border-light)' }}>
                            {['Candidat', 'Type', 'Date', 'Statut'].map(h => (
                              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRecentes.map((r, i) => (
                            <tr
                              key={`${r.type}-${r.id}`}
                              style={{ borderBottom: i === filteredRecentes.length - 1 ? 'none' : '1px solid var(--color-border-light)', transition: 'background 0.15s' }}
                              onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <td style={{ padding: '14px 12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: r.type === 'appel' ? 'var(--color-primary-light)' : 'var(--color-orange-light)', color: r.type === 'appel' ? 'var(--color-primary)' : 'var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                                    {r.candidat ? `${r.candidat.prenom?.[0] || ''}${r.candidat.nom?.[0] || ''}` : '?'}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>{r.candidat ? `${r.candidat.prenom} ${r.candidat.nom}` : 'Inconnu'}</div>
                                    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{r.candidat?.email || ''}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '14px 12px' }}>
                                <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 8, background: r.type === 'appel' ? 'var(--color-primary-light)' : 'var(--color-orange-light)', color: r.type === 'appel' ? 'var(--color-primary)' : 'var(--color-orange)' }}>
                                  {r.type === 'appel' ? 'Appel' : 'Mobilité'}
                                </span>
                              </td>
                              <td style={{ padding: '14px 12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                                {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={{ padding: '14px 12px' }}>
                                <span style={{
                                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 8,
                                  background: r.statut === 'accepte' ? 'var(--color-green-light)' : r.statut === 'rejete' ? 'var(--color-red-light)' : 'var(--color-orange-light)',
                                  color: r.statut === 'accepte' ? 'var(--color-green)' : r.statut === 'rejete' ? 'var(--color-red)' : 'var(--color-orange)',
                                }}>
                                  {LABEL_STATUT[r.statut] || r.statut}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-tertiary)' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px auto', display: 'block', opacity: 0.5 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      Aucune candidature pour ce filtre.
                    </div>
                  )}
                </div>
              </div>

            </div>
            );
          })()}

          {/* ═══════════════════════════════════════════════════
             TAB : CAMPAGNES (Appels à projets)
             ═══════════════════════════════════════════════════ */}
          {activeTab === 'campagnes' && (
            <div className="content-grid">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>Appels à projets</h2>
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>Gérez les appels à candidatures temporaires</p>
                </div>
                <button 
                  className="btn-primary" 
                  style={{ padding: '12px 24px', fontSize: 15, borderRadius: 'var(--radius-md)' }}
                  onClick={() => setIsModalOpen(true)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Créer un appel à projets
                </button>
              </div>

              {errorCampagnes ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#FEE2E2', borderRadius: 'var(--radius-md)', color: '#991B1B' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px auto', display: 'block' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p style={{ fontWeight: 600, marginBottom: 8 }}>Impossible de charger les appels à projets.</p>
                  <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 24 }}>{errorCampagnes}</p>
                  <button className="btn-secondary" onClick={fetchCampagnesData} style={{ background: '#fff', margin: '0 auto' }}>Réessayer</button>
                </div>
              ) : loadingCampagnes ? (
                <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-md)' }} />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                  {campagnes.map(campagne => (
                    <div 
                      key={campagne.id} 
                      className="card animate-fade-in-up" 
                      style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                      onClick={() => navigate(`/admin/appels/${campagne.id}`)}
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                    >
                      <div style={{ height: 180, background: 'var(--color-bg-body)', position: 'relative', overflow: 'hidden' }}>
                        {campagne.image_couverture ? (
                          <>
                            <img src={`https://fdcuic-backend-production.up.railway.app/uploads/${campagne.image_couverture}`} alt={campagne.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                          </>
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          </div>
                        )}
                        <span className="badge" style={{ position: 'absolute', top: 16, right: 16, background: campagne.statut === 'ouvert' ? 'var(--color-green)' : 'var(--color-red)', color: '#fff', fontSize: 12, fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                          {LABEL_STATUT[campagne.statut]}
                        </span>
                      </div>
                      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8, lineHeight: 1.3 }}>{campagne.titre}</h3>
                        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>
                          {campagne.description}
                        </p>
                        
                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-body)', padding: '12px 16px', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--color-bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Candidatures</span>
                              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{campagne.candidatures_count}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Clôture</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                              {new Date(campagne.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
             TAB : MOBILITÉ
             ═══════════════════════════════════════════════════ */}
          {activeTab === 'mobilite' && (
            <AdminMobilite />
          )}

      <AppelModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSaveSuccess={handleSaveCampagneSuccess} 
        appel={null}
      />

      {/* Toast Notification */}
      {toast.message && (
        <div className={`toast-notification toast-${toast.type} animate-fade-in-up`}>
          {toast.type === 'success' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </>
  );
}
