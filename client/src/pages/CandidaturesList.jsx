import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Topbar from '../components/Topbar';
import DataTable from '../components/DataTable';
import adminService from '../services/adminService';

const COLORS_STATUT = {
  brouillon: '#94A3B8',
  soumis: '#4F6AF6',
  en_examen: '#F59F00',
  accepte: '#22B07D',
  rejete: '#F03E3E',
};

const LABEL_STATUT = {
  brouillon: 'Brouillon',
  soumis: 'Soumis',
  en_examen: 'En examen',
  accepte: 'Accepté',
  rejete: 'Rejeté',
};

export default function CandidaturesList({ onLogout, type }) {
  const { id } = useParams(); // undefined si type === 'mobilite'
  const navigate = useNavigate();
  
  const [candidatures, setCandidatures] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCandidatures = async () => {
    setLoading(true);
    try {
      let res;
      if (type === 'appel') {
        res = await adminService.getCandidaturesAppel(id, page, search, statutFilter);
      } else {
        res = await adminService.getCandidaturesMobilite(page, search, statutFilter);
      }
      setCandidatures(res.candidatures || []);
      setTotal(res.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatures();
  }, [id, type, page, statutFilter]); // On ne recharge pas automatiquement à chaque frappe de search pour éviter les appels excessifs, l'utilisateur devra appuyer sur Entrée

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCandidatures();
  };

  const columns = [
    { 
      label: 'Candidat', 
      field: 'candidat', 
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
            {val?.prenom ? val.prenom.charAt(0) : '?'}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{val?.prenom} {val?.nom}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{val?.email}</div>
          </div>
        </div>
      )
    },
    { 
      label: 'Projet / Entité', 
      field: type === 'appel' ? 'nature_projet' : 'nom_structure', 
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{val || '-'}</div>
          {type === 'mobilite' && <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Destination: {row.pays_destination}</div>}
        </div>
      )
    },
    { 
      label: 'Date de soumission', 
      field: 'createdAt', 
      render: (val) => <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{new Date(val).toLocaleDateString('fr-FR')}</span> 
    },
    { 
      label: 'Statut', 
      field: 'statut', 
      render: (val) => (
        <span className="badge" style={{ background: `${COLORS_STATUT[val]}20`, color: COLORS_STATUT[val] }}>
          {LABEL_STATUT[val] || val}
        </span>
      )
    },
    { 
      label: 'Actions', 
      field: 'id', 
      align: 'right', 
      render: (val) => (
        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
          Examiner
        </button>
      )
    }
  ];

  return (
    <div className="dashboard-layout">
      <div className="dashboard-main" style={{ marginLeft: 0 }}>
        <Topbar 
          title={type === 'appel' ? "Candidatures à l'appel à projets" : "Demandes de mobilité"} 
          subtitle={
            <Link to={type === 'appel' ? `/admin/appels/${id}` : `/admin/mobilite`} style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> 
              Retour {type === 'appel' ? "aux détails de l'appel" : "au programme"}
            </Link>
          } 
        />

        <div className="dashboard-content">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            <div className="card animate-fade-in-up" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Liste des dossiers ({total})
                  </h2>
                </div>
                
                <div style={{ display: 'flex', gap: 12 }}>
                  <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8 }}>
                    <div style={{ position: 'relative' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: 10, color: 'var(--color-text-tertiary)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <input 
                        type="text" 
                        placeholder="Rechercher par nom..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 13, width: 250 }}
                      />
                    </div>
                    <button type="submit" className="btn-secondary" style={{ padding: '8px 16px' }}>Filtrer</button>
                  </form>
                  
                  <select 
                    value={statutFilter} 
                    onChange={(e) => { setStatutFilter(e.target.value); setPage(1); }}
                    style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 13, background: '#fff' }}
                  >
                    <option value="">Tous les statuts</option>
                    <option value="soumis">Soumis</option>
                    <option value="en_examen">En examen</option>
                    <option value="accepte">Accepté</option>
                    <option value="rejete">Rejeté</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="skeleton" style={{ width: '100%', height: 400, borderRadius: 'var(--radius-md)' }} />
              ) : (
                <>
                  <DataTable columns={columns} data={candidatures} />
                  
                  {/* Pagination simple */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, borderTop: '1px solid var(--color-border-light)', paddingTop: 16 }}>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      Affichage de {candidatures.length} sur {total} résultats
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        className="btn-secondary" 
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        style={{ padding: '6px 12px', fontSize: 13 }}
                      >
                        Précédent
                      </button>
                      <button 
                        className="btn-secondary" 
                        disabled={candidatures.length < 20} // Assuming limit=20
                        onClick={() => setPage(p => p + 1)}
                        style={{ padding: '6px 12px', fontSize: 13 }}
                      >
                        Suivant
                      </button>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
