/* ════════════════════════════════════════════════════════════
   FDCUIC — Dashboard Premium
   Refonte complète — logique métier & navigation
   ════════════════════════════════════════════════════════════ */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
  AreaChart, Area,
} from 'recharts';

import AppelModal from '../components/AppelModal';
import adminService from '../services/adminService';
import AdminMobilite from '../components/admin/AdminMobilite';
import { getImageUrl } from '../utils/imageUrl';

/* ── Constantes métier ───────────────────────────────────── */
const LABEL_STATUT = {
  brouillon: 'Brouillon', soumis: 'Soumis', en_examen: 'En examen',
  accepte: 'Accepté', rejete: 'Rejeté', en_attente: 'En attente',
  approuve: 'Approuvé', verse: 'Versé', annule: 'Annulé',
  ouvert: 'Ouvert', fermé: 'Fermé', actif: 'Actif', inactif: 'Inactif',
};

const fmtNum = (n) => Number(n || 0).toLocaleString('fr-FR');

const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const TYPE_LABELS = { structuration: 'Structuration', formation: 'Formation', evenementiel: 'Événementiel', mobilite: 'Mobilité' };

/* ── Composant Activité Récente ──────────────────────────── */
function ActiviteRecente() {
  const [activites, setActivites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getActiviteRecente(12).then(d => {
      setActivites(d.activites || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getRelativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 60) return `Il y a ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `Il y a ${h}h`;
    const d = Math.floor(h / 24);
    if (d === 1) return 'Hier';
    return `Il y a ${d} jours`;
  };

  const getIcon = (action, type) => {
    if (action === 'accepte') return { icon: '✓', bg: 'rgba(27,175,122,0.12)', color: '#1baf7a' };
    if (action === 'rejete') return { icon: '✕', bg: 'rgba(240,62,62,0.1)', color: '#e03131' };
    if (action === 'en_examen') return { icon: '⊙', bg: 'rgba(124,92,252,0.1)', color: '#7C5CFC' };
    if (action === 'soumis') return { icon: '↑', bg: 'rgba(0,69,190,0.1)', color: '#0045BE' };
    return { icon: '◌', bg: 'rgba(148,163,184,0.1)', color: '#94A3B8' };
  };

  const getText = (a) => {
    const typeLabel = a.type === 'mobilite' ? 'mobilité' : 'appel à projets';
    if (a.action === 'soumis') return `${a.nom} a soumis un dossier ${typeLabel}`;
    if (a.action === 'accepte') return `Dossier de ${a.nom} accepté`;
    if (a.action === 'rejete') return `Dossier de ${a.nom} rejeté`;
    if (a.action === 'en_examen') return `Dossier de ${a.nom} en cours d'examen`;
    return `Dossier de ${a.nom} mis à jour`;
  };

  return (
    <div className="card animate-fade-in-up" style={{ padding: '20px 22px', animationDelay: '0.22s', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>Activité récente</h3>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Dernières actions sur la plateforme</span>
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(n => <div key={n} className="skeleton" style={{ height: 44, borderRadius: 8 }} />)}
        </div>
      ) : activites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-text-tertiary)', fontSize: 13 }}>Aucune activité récente</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', maxHeight: 300 }}>
          {activites.map((a) => {
            const { icon, bg, color } = getIcon(a.action, a.type);
            return (
              <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 8px', borderRadius: 8, transition: 'background 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getText(a)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{getRelativeTime(a.date)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Tab metadata ────────────────────────────────────────── */
const TABS = [
  { id: 'apercu', label: "Vue d'ensemble" },
  { id: 'campagnes', label: 'Appels à projets' },
  { id: 'mobilite', label: 'Mobilité' },
];

export default function Dashboard({ activeTab = 'apercu', onLogout }) {
  const navigate = useNavigate();
  const userRole = JSON.parse(localStorage.getItem('user'))?.role;
  const isEvaluateur = userRole === 'evaluateur';

  /* ── State ── */
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campagnes, setCampagnes] = useState([]);
  const [loadingCampagnes, setLoadingCampagnes] = useState(false);
  const [errorCampagnes, setErrorCampagnes] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  /* ── Fetch Dashboard Stats ── */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
        setLoading(false);
      } catch (err) {
        const detail = err.response?.data?.message || err.message;
        setError(`Impossible de charger les données. (${detail})`);
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
      setErrorCampagnes(err.response?.data?.message || err.message);
      setLoadingCampagnes(false);
    });
  };

  useEffect(() => {
    setError(null);
    if (activeTab === 'campagnes' && campagnes.length === 0 && !loadingCampagnes && !errorCampagnes) {
      fetchCampagnesData();
    }
  }, [activeTab]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const handleSaveCampagneSuccess = (nouvelleCampagne) => {
    showToast('Opération réussie !');
    setCampagnes(prev => {
      const index = prev.findIndex(c => c.id === nouvelleCampagne.id);
      if (index > -1) {
        const newArray = [...prev];
        newArray[index] = { ...newArray[index], ...nouvelleCampagne };
        return newArray;
      }
      return [{ ...nouvelleCampagne, candidatures_count: 0 }, ...prev];
    });
  };

  if (loading) return (
    <div className="content-grid">
      <div className="stats-grid">
        {[1, 2, 3, 4].map(n => <div key={n} className="stat-card skeleton" style={{ minHeight: '120px' }} />)}
      </div>
      <div style={{ textAlign: 'center', marginTop: 32, color: 'var(--color-text-secondary)', fontSize: 14, animation: 'fadeIn 1s ease-in-out' }}>
        <p>Chargement des données en cours...</p>
        <p style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>Le serveur (Render) sort de veille, cela peut prendre jusqu'à 50 secondes.</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="error-screen">
      <div className="error-card">
        <div className="error-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p className="error-message">{error}</p>
        <button className="error-btn" onClick={onLogout}>Se déconnecter</button>
      </div>
    </div>
  );

  /* ── Helper ── */
  const getStatutCount = (arr, statut) => {
    const found = (arr || []).find(s => s.statut === statut);
    return found ? parseInt(found.total) : 0;
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════
         TAB : VUE D'ENSEMBLE
         ═══════════════════════════════════════════════════ */}
      {activeTab === 'apercu' && (() => {
        const totalCandidatures = (stats.appels_projets?.total || 0) + (stats.mobilite?.total || 0);
        const chartData = (stats.timeline_mensuelle || []).map(t => ({
          name: MOIS_LABELS[parseInt(t.mois.split('-')[1]) - 1],
          appels: t.appels,
          mobilite: t.mobilite,
        }));

        const enAttenteTotal =
          getStatutCount(stats.appels_projets?.par_statut, 'en_attente') +
          getStatutCount(stats.appels_projets?.par_statut, 'soumis') +
          getStatutCount(stats.mobilite?.par_statut, 'en_attente') +
          getStatutCount(stats.mobilite?.par_statut, 'soumis');
        const acceptesTotal =
          getStatutCount(stats.appels_projets?.par_statut, 'accepte') +
          getStatutCount(stats.mobilite?.par_statut, 'accepte');
        const rejetesTotal =
          getStatutCount(stats.appels_projets?.par_statut, 'rejete') +
          getStatutCount(stats.mobilite?.par_statut, 'rejete');
        const donutSum = enAttenteTotal + acceptesTotal + rejetesTotal || 1;
        const acceptePct = Math.round((acceptesTotal / donutSum) * 100);

        const donutData = [
          { name: 'Acceptés', value: acceptesTotal, color: '#1baf7a' },
          { name: 'En attente', value: enAttenteTotal, color: '#FFB020' },
          { name: 'Rejetés', value: rejetesTotal, color: '#dbe3f2' },
        ].filter(d => d.value > 0);
        const donutDefault = [{ name: 'Aucun', value: 1, color: '#dbe3f2' }];

        const parType = stats.par_type_projet || [];
        const maxTypeVal = Math.max(...parType.map(t => t.total), 1);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* ═══ RANGÉE 1 : 4 STAT CARDS ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>

              {/* CARD 1 — Total candidatures (vedette bleue) */}
              <div className="animate-fade-in-up" style={{
                background: '#0045BE', color: '#fff', borderRadius: 12, padding: '20px 22px',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 12px 32px rgba(0,69,190,0.25)',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total candidatures</div>
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, letterSpacing: '-1px', position: 'relative' }}>{fmtNum(totalCandidatures)}</div>
                <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
                  <span style={{ fontSize: 12, opacity: 0.8 }}>Appels : <strong>{fmtNum(stats.appels_projets?.total)}</strong></span>
                  <span style={{ fontSize: 12, opacity: 0.8 }}>Mobilité : <strong>{fmtNum(stats.mobilite?.total)}</strong></span>
                </div>
              </div>

              {/* CARD 2 — Campagnes (accent vert) */}
              <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden', animationDelay: '0.05s', display: 'flex', borderRadius: 12 }}>
                <div style={{ width: 4, background: '#1baf7a', flexShrink: 0 }} />
                <div style={{ flex: 1, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(27,175,122,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1baf7a' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Campagnes créées</div>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1, letterSpacing: '-1px' }}>{fmtNum(stats.campagnes?.total)}</div>
                  <div style={{ fontSize: 12, color: '#1baf7a', fontWeight: 600 }}>{stats.campagnes?.ouvertes || 0} ouverte{(stats.campagnes?.ouvertes || 0) > 1 ? 's' : ''}</div>
                </div>
              </div>

              {/* CARD 3 — Candidats mobilité (accent ambre) */}
              <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden', animationDelay: '0.1s', display: 'flex', borderRadius: 12 }}>
                <div style={{ width: 4, background: '#FFB020', flexShrink: 0 }} />
                <div style={{ flex: 1, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,176,32,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFB020' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Candidats mobilité</div>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1, letterSpacing: '-1px' }}>{fmtNum(stats.mobilite?.total)}</div>
                  <div style={{ fontSize: 12, color: '#FFB020', fontWeight: 600 }}>
                    {getStatutCount(stats.mobilite?.par_statut, 'en_attente') + getStatutCount(stats.mobilite?.par_statut, 'soumis')} en attente
                  </div>
                </div>
              </div>

              {/* CARD 4 — Montant versé (accent violet) */}
              <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'hidden', animationDelay: '0.15s', display: 'flex', borderRadius: 12 }}>
                <div style={{ width: 4, background: '#7C5CFC', flexShrink: 0 }} />
                <div style={{ flex: 1, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,92,252,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C5CFC' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Montant versé</div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                    {fmtNum(stats.subventions?.montant_total)} <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)' }}>FCFA</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#7C5CFC', fontWeight: 600 }}>{fmtNum(stats.subventions?.total)} dossier{(stats.subventions?.total || 0) > 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>

            {/* ═══ RANGÉE 2 : CHART AIRE + DONUT ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>

              {/* AREA CHART — Évolution */}
              <div className="card animate-fade-in-up" style={{ padding: '20px 20px 12px', animationDelay: '0.08s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>Évolution des candidatures</h3>
                    <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>12 derniers mois</span>
                  </div>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 12, height: 4, borderRadius: 2, background: '#0045BE', display: 'inline-block' }} />
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Appels</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 12, height: 4, borderRadius: 2, background: '#FFB020', display: 'inline-block' }} />
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Mobilité</span>
                    </div>
                  </div>
                </div>
                <div style={{ height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="areaAppels" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0045BE" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#0045BE" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="areaMobilite" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FFB020" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#FFB020" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }} dy={6} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', fontSize: 12 }}
                        cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
                      />
                      <Area type="monotone" dataKey="appels" name="Appels" stroke="#0045BE" strokeWidth={2} fill="url(#areaAppels)" dot={false} activeDot={{ r: 4, fill: '#0045BE' }} />
                      <Area type="monotone" dataKey="mobilite" name="Mobilité" stroke="#FFB020" strokeWidth={2} fill="url(#areaMobilite)" dot={false} activeDot={{ r: 4, fill: '#FFB020' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* DONUT — Répartition statuts */}
              <div className="card animate-fade-in-up" style={{ padding: '20px', animationDelay: '0.12s', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>Répartition des statuts</h3>
                  <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Tous les dossiers</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ height: 155, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData.length > 0 ? donutData : donutDefault}
                          cx="50%" cy="50%"
                          innerRadius={52} outerRadius={70}
                          stroke="none" dataKey="value"
                          paddingAngle={donutData.length > 1 ? 4 : 0}
                          cornerRadius={4} startAngle={90} endAngle={-270}
                        >
                          {(donutData.length > 0 ? donutData : donutDefault).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 12, background: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{acceptePct}%</span>
                      <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 600, marginTop: 2 }}>Acceptés</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                    {[{ color: '#1baf7a', label: 'Acceptés', val: acceptesTotal }, { color: '#FFB020', label: 'Attente', val: enAttenteTotal }, { color: '#dbe3f2', label: 'Rejetés', val: rejetesTotal }].map(item => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{item.label} <strong>({item.val})</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ RANGÉE 3 : TYPES DE PROJET + ACTIVITÉ RÉCENTE ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16 }}>

              {/* Types de projet — barres */}
              <div className="card animate-fade-in-up" style={{ padding: '20px 22px', animationDelay: '0.18s' }}>
                <div style={{ marginBottom: 18 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>Répartition par type de projet</h3>
                  <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Dossiers par catégorie</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {parType.length > 0 ? parType.map(item => (
                    <div key={item.type}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{TYPE_LABELS[item.type] || item.type}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)' }}>{item.total}</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: 'var(--color-bg-body)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${(item.total / maxTypeVal) * 100}%`,
                          background: '#0045BE',
                          borderRadius: 4,
                          transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                        }} />
                      </div>
                    </div>
                  )) : (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13, padding: '20px 0' }}>Aucune donnée</div>
                  )}
                </div>
              </div>

              {/* Activité récente */}
              <ActiviteRecente />
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
            {!isEvaluateur && (
              <button className="btn-primary" style={{ padding: '12px 24px', fontSize: 15, borderRadius: 'var(--radius-md)' }} onClick={() => setIsModalOpen(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Créer un appel à projets
              </button>
            )}
          </div>

          {errorCampagnes ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#FEE2E2', borderRadius: 'var(--radius-md)', color: '#991B1B' }}>
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
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                >
                  <div style={{ height: 340, background: 'var(--color-bg-body)', position: 'relative', overflow: 'hidden' }}>
                    {campagne.image_couverture ? (
                      <>
                        <img src={getImageUrl(campagne.image_couverture)} alt={campagne.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                      </>
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
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
                      <div>
                        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Candidatures</span>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{campagne.candidatures_count}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Clôture</span>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                          {new Date(campagne.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </div>
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
      {activeTab === 'mobilite' && <AdminMobilite />}

      <AppelModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSaveSuccess={handleSaveCampagneSuccess} appel={null} />

      {/* Toast Notification */}
      {toast.message && (
        <div className={`toast-notification toast-${toast.type} animate-fade-in-up`}>
          {toast.type === 'success' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </>
  );
}
