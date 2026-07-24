import React from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirmer", cancelText = "Annuler", type = "danger" }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in-up" style={{ maxWidth: 400, padding: 32, textAlign: 'center' }}>
        
        <div style={{ 
            width: 64, height: 64, borderRadius: '50%', 
            background: type === 'danger' ? 'var(--color-red-light)' : 'var(--color-primary-light)', 
            color: type === 'danger' ? 'var(--color-red)' : 'var(--color-primary)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 24px auto' 
        }}>
          {type === 'danger' ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          )}
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 12 }}>{title}</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>{message}</p>
        
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn-secondary" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>
            {cancelText}
          </button>
          <button 
            className="btn-primary" 
            onClick={onConfirm} 
            style={{ 
              flex: 1, justifyContent: 'center', 
              background: type === 'danger' ? 'var(--color-red)' : 'var(--color-primary)',
              borderColor: type === 'danger' ? 'var(--color-red)' : 'var(--color-primary)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
