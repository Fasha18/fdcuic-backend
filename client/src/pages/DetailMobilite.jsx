import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Topbar from '../components/Topbar';
import adminService from '../services/adminService';
import MobiliteModal from '../components/MobiliteModal';

export default function DetailMobilite({ onLogout }) {
  const navigate = useNavigate();
  const [programme, setProgramme] = useState(null);
  const [candidaturesCount, setCandidaturesCount] = useState(0);
  const [timeline, setTimeline] = useState([]);
  const [recentes, setRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const fetchProgramme = async () => {
    try {
      const res = await adminService.getProgrammeMobilite();
      setProgramme(res.programme);
      setCandidaturesCount(res.totalCandidatures || 0);
      setTimeline(res.timeline || []);
      setRecentes(res.recentes || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger le programme de mobilité.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramme();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const handleSaveProgrammeSuccess = (nouveauProgramme) => {
    setProgramme(nouveauProgramme);
    showToast("Programme de mobilité mis à jour avec succès.");
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="dashboard-main" style={{ marginLeft: 0 }}>
          <Topbar title="Programme de Mobilité" subtitle="Chargement..." />
          <div className="dashboard-content"><div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-md)' }} /></div>
        </div>
      </div>
    );
  }

  if (error || !programme) {
    return (
      <div className="dashboard-layout">
        <div className="dashboard-main" style={{ marginLeft: 0 }}>
          <Topbar title="Erreur" subtitle="Retour au tableau de bord" />
          <div className="dashboard-content">
            <div style={{ padding: '40px', textAlign: 'center', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ color: 'var(--color-red)', marginBottom: 20 }}>{error || 'Programme introuvable'}</p>
              <button className="btn-secondary" onClick={() => navigate('/admin')}>Retour au Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-main" style={{ marginLeft: 0 }}>
        <Topbar 
          title="Programme de Mobilité Internationale" 
          subtitle={<Link to="/admin" style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Retour au dashboard</Link>} 
        />

        <div className="dashboard-content">
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* Header / Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)' }}>{programme.titre}</h1>
                  <span className="badge" style={{ background: programme.statut === 'actif' ? '#22B07D20' : '#F03E3E20', color: programme.statut === 'actif' ? '#22B07D' : '#F03E3E', fontSize: 13, padding: '4px 10px' }}>
                    {programme.statut === 'actif' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--color-text-secondary)', fontSize: 14 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    Programme permanent
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-secondary" onClick={() => setIsModalOpen(true)}>
                  Modifier le programme
                </button>
                <button className="btn-primary" onClick={() => navigate(`/admin/mobilite/candidatures`)}>
                  Gérer les {candidaturesCount} candidatures
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
              {programme.image_couverture ? (
                <>
                  <img 
                    src={`http://localhost:3000/uploads/${programme.image_couverture}`} 
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
                  <div>Pas de bannière configurée</div>
                </div>
              )}
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, alignItems: 'start' }}>
              
              {/* Left Column : Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="card animate-fade-in-up" style={{ padding: '32px' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>Description du programme</h3>
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 32, fontSize: 15 }}>
                    {programme.description}
                  </p>

                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>Conditions d'éligibilité</h3>
                  <div style={{ background: 'var(--color-primary-light)', padding: '24px', borderRadius: '16px', color: 'var(--color-primary-dark)', fontSize: 15, lineHeight: 1.7, whiteSpace: 'pre-wrap', border: '1px solid rgba(79, 106, 246, 0.1)' }}>
                    {programme.criteres_eligibilite || 'Aucune condition spécifique renseignée.'}
                  </div>
                </div>

                {/* Section Analytics (Graphique) */}
                <div className="card animate-fade-in-up" style={{ padding: '32px', animationDelay: '0.1s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>Évolution des demandes</h3>
                  </div>
                  <div style={{ height: 300, width: '100%' }}>
                    {timeline.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCountMob" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--color-orange)" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="var(--color-orange)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} dy={10} tickFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                            labelFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          />
                          <Area type="monotone" dataKey="count" name="Demandes" stroke="var(--color-orange)" strokeWidth={3} fillOpacity={1} fill="url(#colorCountMob)" />
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
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>Dernières demandes</h3>
                    <button className="btn-secondary" style={{ fontSize: 13, padding: '6px 12px' }} onClick={() => navigate(`/admin/mobilite/candidatures`)}>Tout voir</button>
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
                      Aucune demande reçue pour le moment.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column : Stats & Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 20 }}>Candidatures soumises</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 20, borderBottom: '1px solid var(--color-border-light)', marginBottom: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', background: 'var(--color-orange-light)', color: 'var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>{candidaturesCount}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>Demandes de mobilité</div>
                    </div>
                  </div>
                  <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate(`/admin/mobilite/candidatures`)}>
                    Gérer les demandes
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <MobiliteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSaveSuccess={handleSaveProgrammeSuccess} 
        programme={programme} 
      />

      {/* Toast Notification */}
      {toast.message && (
        <div className={`toast-notification toast-${toast.type} animate-fade-in-up`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
