import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const PAGES_LEGALES = [
  { type: 'mentions_legales', label: 'Mentions légales', icon: '📄', description: "Informations légales sur l'éditeur de la plateforme." },
  { type: 'cgu', label: "Conditions Générales d'Utilisation", icon: '📋', description: "Règles d'utilisation de la plateforme FDCUIC." },
  { type: 'confidentialite', label: 'Politique de confidentialité', icon: '🔒', description: 'Gestion des données personnelles et RGPD.' },
];

const AdminLegal = () => {
  const [activePage, setActivePage] = useState('mentions_legales');
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: '' });

  useEffect(() => { fetchPage(activePage); }, [activePage]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const fetchPage = async (type) => {
    try {
      setLoading(true);
      setContenu('');
      const res = await api.get(`/legal/${type}`);
      setContenu(res.data.page?.contenu || '');
    } catch (err) {
      // 404 = page pas encore créée, c'est OK
      if (err.response?.status !== 404) {
        showToast('Erreur lors du chargement', 'error');
      }
      setContenu('');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/legal/${activePage}`, { contenu });
      showToast('Page légale sauvegardée avec succès.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentPage = PAGES_LEGALES.find(p => p.type === activePage);

  return (
    <div className="content-grid">
      {/* TOAST */}
      {toast.msg && (
        <div style={{
          position: 'fixed', top: 88, right: 24, zIndex: 2000,
          padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14,
          background: toast.type === 'error' ? 'var(--color-red)' : 'var(--color-green)',
          color: '#fff', boxShadow: 'var(--shadow-lg)',
          animation: 'fadeInDown 0.3s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
          Paramètres légaux
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
          Gérez les pages légales affichées aux candidats sur la plateforme.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>
        {/* SIDEBAR — choix de page */}
        <div className="card" style={{ padding: 8 }}>
          {PAGES_LEGALES.map(page => (
            <button
              key={page.type}
              onClick={() => setActivePage(page.type)}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 10,
                border: 'none', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'flex-start', gap: 12,
                background: activePage === page.type ? 'var(--color-primary-light)' : 'transparent',
                color: activePage === page.type ? 'var(--color-primary)' : 'var(--color-text-primary)',
                transition: 'all 0.2s', marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{page.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{page.label}</div>
                <div style={{ fontSize: 11, color: activePage === page.type ? 'var(--color-primary)' : 'var(--color-text-tertiary)', marginTop: 3, lineHeight: 1.4 }}>
                  {page.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* EDITEUR */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {currentPage?.icon} {currentPage?.label}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                {currentPage?.description}
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="btn-primary"
              style={{ padding: '10px 20px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, opacity: (saving || loading) ? 0.7 : 1 }}
            >
              {saving ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
              )}
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>

          <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--color-bg-body)', borderRadius: 10, border: '1px solid var(--color-border-light)', fontSize: 12, color: 'var(--color-text-tertiary)' }}>
            💡 <strong>Astuce :</strong> Vous pouvez utiliser du HTML simple pour formater le contenu (ex: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;).
          </div>

          {loading ? (
            <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
              Chargement du contenu...
            </div>
          ) : (
            <textarea
              value={contenu}
              onChange={e => setContenu(e.target.value)}
              placeholder={`Saisissez le contenu de la page "${currentPage?.label}" ici...\n\nVous pouvez utiliser du HTML : <h2>Titre</h2> <p>Paragraphe</p> <ul><li>Item</li></ul>`}
              style={{
                width: '100%', minHeight: 420, padding: '16px', borderRadius: 12,
                border: '1px solid var(--color-border)', background: 'var(--color-bg-input)',
                color: 'var(--color-text-primary)', fontSize: 13.5, lineHeight: 1.7,
                resize: 'vertical', fontFamily: "'Courier New', monospace",
              }}
            />
          )}

          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
              {contenu.length} caractère{contenu.length !== 1 ? 's' : ''}
            </span>
            {contenu.length === 0 && !loading && (
              <span style={{ fontSize: 12, color: 'var(--color-orange)', fontWeight: 600 }}>
                ⚠️ Cette page est vide — les candidats verront un contenu vide.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLegal;
