import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ msg: '', type: '' });

  // MODAL STATE
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null); // null = création
  const [form, setForm] = useState({ question: '', reponse: '', ordre: 1, actif: true });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchFaqs(); }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/faqs/admin');
      setFaqs(res.data.faqs || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const openCreate = () => {
    setEditingFaq(null);
    setForm({ question: '', reponse: '', ordre: faqs.length + 1, actif: true });
    setShowModal(true);
  };

  const openEdit = (faq) => {
    setEditingFaq(faq);
    setForm({ question: faq.question, reponse: faq.reponse, ordre: faq.ordre, actif: faq.actif });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.reponse.trim()) {
      showToast('La question et la réponse sont obligatoires.', 'error');
      return;
    }
    try {
      setSaving(true);
      if (editingFaq) {
        await api.put(`/faqs/${editingFaq.id}`, form);
        showToast('FAQ mise à jour avec succès.');
      } else {
        await api.post('/faqs', form);
        showToast('FAQ créée avec succès.');
      }
      setShowModal(false);
      fetchFaqs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/faqs/${id}`);
      showToast('FAQ supprimée.');
      setConfirmDelete(null);
      fetchFaqs();
    } catch (err) {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleToggleActif = async (faq) => {
    try {
      await api.put(`/faqs/${faq.id}`, { ...faq, actif: !faq.actif });
      fetchFaqs();
    } catch (err) {
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--color-text-tertiary)' }}>
      Chargement des FAQs...
    </div>
  );

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
            Gestion des FAQs
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
            {faqs.length} question{faqs.length !== 1 ? 's' : ''} configurée{faqs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}
          style={{ padding: '10px 20px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nouvelle FAQ
        </button>
      </div>

      {error && (
        <div style={{ padding: 16, background: 'var(--color-red-light)', color: 'var(--color-red)', borderRadius: 10, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* LISTE FAQs */}
      {faqs.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❓</div>
          <p style={{ color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Aucune FAQ configurée</p>
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: 13, marginTop: 4 }}>
            Cliquez sur "Nouvelle FAQ" pour commencer.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((faq, idx) => (
            <div key={faq.id} className="card" style={{
              padding: '20px 24px',
              borderLeft: `4px solid ${faq.actif ? 'var(--color-primary)' : 'var(--color-border)'}`,
              opacity: faq.actif ? 1 : 0.6,
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      background: 'var(--color-bg-body)', color: 'var(--color-text-tertiary)'
                    }}>#{faq.ordre}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      background: faq.actif ? 'var(--color-green-light)' : 'var(--color-border-light)',
                      color: faq.actif ? 'var(--color-green)' : 'var(--color-text-tertiary)'
                    }}>{faq.actif ? 'ACTIVE' : 'INACTIVE'}</span>
                  </div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
                    {faq.question}
                  </h4>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    {faq.reponse.length > 200 ? faq.reponse.substring(0, 200) + '...' : faq.reponse}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggleActif(faq)}
                    title={faq.actif ? 'Désactiver' : 'Activer'}
                    style={{
                      width: 34, height: 34, borderRadius: 8, border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-card)', color: faq.actif ? 'var(--color-orange)' : 'var(--color-green)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    {faq.actif ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 12H7"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(faq)}
                    title="Modifier"
                    style={{
                      width: 34, height: 34, borderRadius: 8, border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-card)', color: 'var(--color-primary)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirmDelete(faq.id)}
                    title="Supprimer"
                    style={{
                      width: 34, height: 34, borderRadius: 8, border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-card)', color: 'var(--color-red)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREATE/EDIT */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}
          onClick={() => setShowModal(false)}>
          <div className="card animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ padding: 32, maxWidth: 600, width: '90%', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, color: 'var(--color-text-primary)' }}>
              {editingFaq ? '✏️ Modifier la FAQ' : '➕ Nouvelle FAQ'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Question *
                </label>
                <input
                  type="text"
                  value={form.question}
                  onChange={e => setForm({ ...form, question: e.target.value })}
                  placeholder="Comment soumettre un dossier ?"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1px solid var(--color-border)', background: 'var(--color-bg-input)',
                    color: 'var(--color-text-primary)', fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Réponse *
                </label>
                <textarea
                  value={form.reponse}
                  onChange={e => setForm({ ...form, reponse: e.target.value })}
                  placeholder="Détaillez la réponse ici..."
                  rows={5}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1px solid var(--color-border)', background: 'var(--color-bg-input)',
                    color: 'var(--color-text-primary)', fontSize: 14, resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                    Ordre d'affichage
                  </label>
                  <input
                    type="number" min="1"
                    value={form.ordre}
                    onChange={e => setForm({ ...form, ordre: parseInt(e.target.value) || 1 })}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      border: '1px solid var(--color-border)', background: 'var(--color-bg-input)',
                      color: 'var(--color-text-primary)', fontSize: 14,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    <input type="checkbox" checked={form.actif} onChange={e => setForm({ ...form, actif: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: 'var(--color-primary)' }} />
                    Active (visible sur le site)
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={() => setShowModal(false)} className="btn-secondary"
                style={{ padding: '10px 20px', borderRadius: 10 }}>Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary"
                style={{ padding: '10px 20px', borderRadius: 10, opacity: saving ? 0.7 : 1 }}>
                {saving ? '...' : (editingFaq ? '💾 Sauvegarder' : '✅ Créer la FAQ')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }}>
          <div className="card" style={{ padding: 32, maxWidth: 380, width: '90%', textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 8 }}>
              Supprimer cette FAQ ?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
              Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary"
                style={{ padding: '10px 20px', borderRadius: 10 }}>Annuler</button>
              <button onClick={() => handleDelete(confirmDelete)}
                style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--color-red)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFAQs;
