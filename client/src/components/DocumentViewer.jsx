import { useState } from 'react';
import { X, Download, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';

/**
 * Détecte si l'URL Cloudinary pointe vers une image.
 * Les URLs Cloudinary pour les images contiennent "/image/upload/"
 * Les URLs Cloudinary pour les fichiers bruts (PDF, etc.) contiennent "/raw/upload/"
 */
function isCloudinaryImage(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  // Cloudinary image URLs
  if (lower.includes('/image/upload/')) return true;
  // Extensions image explicites
  if (lower.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)(\?|$)/i)) return true;
  return false;
}

/**
 * DocumentViewerButton — Composant réutilisable
 * Cliquer dessus ouvre la visionneuse intégrée.
 */
export function DocumentViewerButton({ url, nom, children, style }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!url) return null;

  return (
    <>
      <span
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setIsOpen(true); }}
        style={{ cursor: 'pointer', ...style }}
      >
        {children}
      </span>
      {isOpen && (
        <DocumentViewerModal url={url} nom={nom} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}

export function DocumentViewerModal({ url, nom, onClose }) {
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const imageMode = isCloudinaryImage(url) && !imgError;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 99999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start',
      }}
      onClick={onClose}
    >
      {/* ── Barre de titre ── */}
      <div
        style={{
          width: '100%',
          height: '56px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          background: '#1a1a1a',
          borderBottom: '1px solid #333',
          flexShrink: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {imageMode ? <ImageIcon size={20} color="white" /> : <FileText size={20} color="white" />}
          <span style={{
            color: 'white', fontWeight: 600, fontSize: 15,
            maxWidth: '50vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {nom || 'Document'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href={url}
            download
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 6,
              background: 'rgba(255,255,255,0.1)', color: 'white',
              textDecoration: 'none', fontSize: 13, fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            <Download size={16} /> Télécharger
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 6,
              background: 'rgba(255,255,255,0.1)', color: 'white',
              textDecoration: 'none', fontSize: 13, fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            <ExternalLink size={16} /> Ouvrir
          </a>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 6,
              background: '#E03131',
              border: 'none',
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', marginLeft: 8
            }}
            title="Fermer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Zone de visualisation ── */}
      <div
        style={{
          width: '100%',
          height: 'calc(100vh - 56px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spinner de chargement */}
        {loading && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#111', gap: 12, zIndex: 1,
          }}>
            <svg style={{ animation: 'spin 1s linear infinite', width: 36, height: 36 }} viewBox="0 0 24 24" fill="none" stroke="#7C5CFC" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0110 10" />
            </svg>
            <p style={{ color: '#aaa', fontSize: 14 }}>Chargement du document...</p>
          </div>
        )}

        {imageMode ? (
          /* ═══ IMAGE : affichage direct avec <img> ═══ */
          <img
            src={url}
            alt={nom || 'Document'}
            style={{
              maxWidth: '95%',
              maxHeight: '95%',
              objectFit: 'contain',
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setImgError(true);
              setLoading(false);
            }}
          />
        ) : (
          /* ═══ NON-IMAGE : message clair + boutons d'action ═══ */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 24, padding: 40, maxWidth: 480,
            background: '#1e1e1e', borderRadius: 16,
            border: '1px solid #333',
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: '#7C5CFC20',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={36} color="#7C5CFC" />
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>
                {nom || 'Document'}
              </h3>
              <p style={{ color: '#999', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                Ce document ne peut pas être prévisualisé directement.<br/>
                Utilisez les boutons ci-dessous pour le consulter.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setLoading(false)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '14px 20px', borderRadius: 10,
                  background: '#7C5CFC', color: 'white',
                  textDecoration: 'none', fontSize: 15, fontWeight: 700,
                  transition: 'all 0.2s',
                }}
              >
                <ExternalLink size={18} /> Ouvrir dans un nouvel onglet
              </a>
            </div>

            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              <a
                href={url}
                download
                onClick={() => setLoading(false)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 20px', borderRadius: 10,
                  background: 'transparent', color: '#aaa',
                  textDecoration: 'none', fontSize: 14, fontWeight: 600,
                  border: '1px solid #444',
                  transition: 'all 0.2s',
                }}
              >
                <Download size={16} /> Télécharger sur mon ordinateur
              </a>
            </div>
            {/* Masquer le spinner après un court délai */}
            {loading && setTimeout(() => setLoading(false), 500) && null}
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentViewerButton;
