import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Topbar from '../components/Topbar';
import adminService from '../services/adminService';
import AppelModal from '../components/AppelModal';
import { getImageUrl } from '../utils/imageUrl';

const LABEL_STATUT = {
  ouvert: 'Ouvert',
  fermé: 'Clôturé',
};

export default function DetailAppel({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campagne, setCampagne] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [recentes, setRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const fetchCampagne = async () => {
    try {
      const res = await adminService.getCampagneById(id);
      setCampagne(res.campagne);
      setTimeline(res.timeline || []);
      setRecentes(res.recentes || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les détails de l'appel à projets.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampagne();
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const handleSaveCampagneSuccess = (nouvelleCampagne) => {
    setCampagne(nouvelleCampagne);
    showToast("Appel à projets mis à jour avec succès.");
  };

  const handleCloturer = async () => {
    if (window.confirm("Voulez-vous vraiment clôturer cet appel à projets ? Les candidats ne pourront plus postuler.")) {
      try {
        await adminService.modifierCampagne(id, { statut: 'fermé' });
        showToast("Appel à projets clôturé avec succès.");
        await fetchCampagne();
      } catch (err) {
        showToast(err.response?.data?.message || "Erreur lors de la clôture.", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-content"><div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-md)' }} /></div>
    );
  }

  if (error || !campagne) {
    return (
      <div className="dashboard-content">
        <div style={{ padding: '40px', textAlign: 'center', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ color: 'var(--color-red)', marginBottom: 20 }}>{error || 'Appel introuvable'}</p>
          <button className="btn-secondary" onClick={() => navigate('/admin')}>Retour au Dashboard</button>
        </div>
      </div>
    );
  }

  const isOuvert = campagne.statut === 'ouvert';

  return (
    <>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* BOUTON RETOUR INTELLIGENT */}
        <button 
          onClick={() => navigate('/admin')}
          className="animate-fade-in-up"
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 8, 
            background: 'var(--color-bg-card)',
            padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border-light)',
            color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            marginBottom: 24, transition: 'all 0.2s',
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-primary-light)'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--color-border-light)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Retour au dashboard
        </button>
            
            {/* Header / Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)' }}>{campagne.titre}</h1>
                  <span className="badge" style={{ background: isOuvert ? '#22B07D20' : '#F03E3E20', color: isOuvert ? '#22B07D' : '#F03E3E', fontSize: 13, padding: '4px 10px' }}>
                    {LABEL_STATUT[campagne.statut]}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--color-text-secondary)', fontSize: 14 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Du {new Date(campagne.date_debut).toLocaleDateString('fr-FR')} au {new Date(campagne.date_fin).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {!isOuvert && (
                  <button className="btn-secondary" onClick={() => setIsModalOpen(true)}>
                    Modifier l'appel
                  </button>
                )}
                {isOuvert && (
                  <button className="btn-secondary" style={{ color: 'var(--color-red)', borderColor: 'var(--color-red-light)' }} onClick={handleCloturer}>
                    Clôturer l'appel
                  </button>
                )}
                <button className="btn-primary" onClick={() => navigate(`/admin/appels/${campagne.id}/candidatures`)}>
                  Gérer les {campagne.candidatures_count} candidatures
                </button>
              </div>
            </div>

            {/* Hero Image Banner Premium */}
            <div style={{
              width: '100%',
              height: '360px',
              borderRadius: '24px',
              overflow: 'hidden',
              position: 'relative',
              marginBottom: '32px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.08)',
              background: 'var(--color-bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-tertiary)'
            }}>
              {campagne.image_couverture ? (
                <>
                  <img 
                    src={getImageUrl(campagne.image_couverture)} 
                    alt="Couverture" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} 
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.05) 100%)',
                    pointerEvents: 'none'
                  }} />
                </>
              ) : (
                <div style={{ textAlign: 'center', opacity: 0.6 }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px auto' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <div>Pas d'image de couverture configurée</div>
                </div>
              )}
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, alignItems: 'start' }}>
              
              {/* Left Column : Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="card animate-fade-in-up" style={{ padding: '32px' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>Description de l'appel</h3>
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 32, fontSize: 15 }}>
                    {campagne.description}
                  </p>

                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>Conditions d'éligibilité</h3>
                  <div style={{ background: 'var(--color-primary-light)', padding: '24px', borderRadius: '16px', color: 'var(--color-primary-dark)', fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-wrap', border: '1px solid rgba(79, 106, 246, 0.1)' }}>
                    {campagne.criteres || 'Aucune condition spécifique renseignée.'}
                  </div>
                </div>

                {/* Section Analytics (Graphique) */}
                <div className="card animate-fade-in-up" style={{ padding: '32px', animationDelay: '0.1s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>Évolution des soumissions</h3>
                  </div>
                  <div style={{ height: 300, width: '100%' }}>
                    {timeline.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} dy={10} tickFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                            labelFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          />
                          <Area type="monotone" dataKey="count" name="Dossiers" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', background: 'var(--color-bg-body)', borderRadius: '16px' }}>
                        Pas assez de données pour afficher le graphique
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Candidatures Récentes */}
                <div className="card animate-fade-in-up" style={{ padding: '32px', animationDelay: '0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>Dernières candidatures</h3>
                    <button className="btn-secondary" style={{ fontSize: 13, padding: '6px 12px' }} onClick={() => navigate(`/admin/appels/${campagne.id}/candidatures`)}>Tout voir</button>
                  </div>
                  {recentes.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-tertiary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Candidat</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Date</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentes.map((c, i) => (
                            <tr key={c.id} style={{ borderBottom: i === recentes.length - 1 ? 'none' : '1px solid var(--color-border-light)', transition: 'background 0.2s' }}>
                              <td style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-bg-body)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                                    {c.candidat.nom[0]}{c.candidat.prenom[0]}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{c.candidat.prenom} {c.candidat.nom}</div>
                                    <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{c.candidat.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '16px', fontSize: 14, color: 'var(--color-text-secondary)' }}>
                                {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                              </td>
                              <td style={{ padding: '16px' }}>
                                <span className="badge" style={{ background: c.statut === 'en_attente' ? 'var(--color-orange-light)' : c.statut === 'accepte' ? 'var(--color-green-light)' : 'var(--color-bg-body)', color: c.statut === 'en_attente' ? 'var(--color-orange)' : c.statut === 'accepte' ? 'var(--color-green)' : 'var(--color-text-secondary)', fontSize: 12 }}>
                                  {c.statut.replace('_', ' ')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-tertiary)' }}>
                      Aucune candidature reçue pour le moment.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column : Stats & Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 20 }}>Aperçu des candidatures</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 20, borderBottom: '1px solid var(--color-border-light)', marginBottom: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{campagne.candidatures_count}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>Dossiers soumis</div>
                    </div>
                  </div>
                  <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate(`/admin/appels/${campagne.id}/candidatures`)}>
                    Afficher la liste complète
                  </button>
                </div>
              </div>

            </div>
          </div>

      <AppelModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSaveSuccess={handleSaveCampagneSuccess} 
        appel={campagne} 
      />

      {/* Toast Notification */}
      {toast.message && (
        <div className={`toast-notification toast-${toast.type} animate-fade-in-up`}>
          <span>{toast.message}</span>
        </div>
      )}
    </>
  );
}
