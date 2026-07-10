import { useState } from 'react';
import { X, Download, ExternalLink, FileText, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Transforme une URL Cloudinary de PDF en image (JPG) d'une page spécifique.
 * Cloudinary bloque l'accès direct aux PDF (.pdf → 401), mais accepte
 * de convertir chaque page en image (.jpg → 200).
 * 
 * Exemple :
 *   Entrée : https://res.cloudinary.com/.../fdcuic/appels/appel_xxx.pdf
 *   Sortie : https://res.cloudinary.com/.../pg_1/fdcuic/appels/appel_xxx.jpg
 */
function cloudinaryPdfPageUrl(originalUrl, pageNum = 1) {
  if (!originalUrl) return originalUrl;
  // Remplacer .pdf par .jpg
  let url = originalUrl.replace(/\.pdf$/i, '.jpg');
  // Injecter pg_X après /upload/
  url = url.replace('/upload/', `/upload/pg_${pageNum}/`);
  // Si la version est déjà là (v1234...), on la garde et on ajoute pg_X avant
  // En fait, le replace ci-dessus gère déjà ce cas
  return url;
}

/**
 * Vérifie si une URL Cloudinary est un PDF (uploadé comme image)
 */
function isCloudinaryPdf(url) {
  if (!url) return false;
  return url.toLowerCase().includes('/image/upload/') && url.toLowerCase().endsWith('.pdf');
}

/**
 * Vérifie si une URL Cloudinary est une image native
 */
function isCloudinaryImage(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (lower.includes('/image/upload/') && !lower.endsWith('.pdf')) return true;
  if (lower.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)(\?|$)/i)) return true;
  return false;
}

/**
 * DocumentViewerButton — Composant réutilisable
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
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [imgError, setImgError] = useState(false);

  const isPdf = isCloudinaryPdf(url);
  const isImage = isCloudinaryImage(url);
  const canPreview = isPdf || isImage;

  // URL de l'image à afficher
  const displayUrl = isPdf
    ? cloudinaryPdfPageUrl(url, currentPage)
    : url;

  const goToPage = (page) => {
    if (page < 1) return;
    setCurrentPage(page);
    setLoading(true);
    setImgError(false);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.95)',
        zIndex: 99999,
        display: 'flex', flexDirection: 'column',
      }}
      onClick={onClose}
    >
      {/* ── Barre de titre ── */}
      <div
        style={{
          width: '100%', height: '56px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          background: '#1a1a1a',
          borderBottom: '1px solid #333',
          flexShrink: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {canPreview ? <ImageIcon size={20} color="white" /> : <FileText size={20} color="white" />}
          <span style={{
            color: 'white', fontWeight: 600, fontSize: 15,
            maxWidth: '40vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {nom || 'Document'}
          </span>
          {isPdf && (
            <span style={{
              background: '#7C5CFC30', color: '#7C5CFC', padding: '2px 10px',
              borderRadius: 6, fontSize: 12, fontWeight: 700,
            }}>
              Page {currentPage}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Navigation pages pour PDF */}
          {isPdf && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                style={{
                  width: 32, height: 32, borderRadius: 6, border: 'none',
                  background: currentPage <= 1 ? '#333' : 'rgba(255,255,255,0.15)',
                  color: currentPage <= 1 ? '#666' : 'white',
                  cursor: currentPage <= 1 ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ color: '#aaa', fontSize: 13, minWidth: 60, textAlign: 'center' }}>
                Page {currentPage}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={!hasNextPage}
                style={{
                  width: 32, height: 32, borderRadius: 6, border: 'none',
                  background: !hasNextPage ? '#333' : 'rgba(255,255,255,0.15)',
                  color: !hasNextPage ? '#666' : 'white',
                  cursor: !hasNextPage ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          <a
            href={url} download
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 6,
              background: 'rgba(255,255,255,0.1)', color: 'white',
              textDecoration: 'none', fontSize: 13, fontWeight: 500,
            }}
          >
            <Download size={16} /> Télécharger
          </a>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 6,
              background: '#E03131', border: 'none',
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
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
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'auto', position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spinner */}
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
            <p style={{ color: '#aaa', fontSize: 14 }}>Chargement...</p>
          </div>
        )}

        {canPreview && !imgError ? (
          <img
            key={displayUrl}
            src={displayUrl}
            alt={nom || 'Document'}
            style={{
              maxWidth: '95%', maxHeight: '95%',
              objectFit: 'contain', borderRadius: 4,
              boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            }}
            onLoad={() => {
              setLoading(false);
              setHasNextPage(true); // Si l'image charge, il y a peut-être une page suivante
            }}
            onError={() => {
              if (isPdf && currentPage > 1) {
                // La page n'existe pas → on est à la dernière page
                setHasNextPage(false);
                setCurrentPage(currentPage - 1);
                setLoading(false);
              } else {
                setImgError(true);
                setLoading(false);
              }
            }}
          />
        ) : (
          /* Fallback : message + boutons */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 24, padding: 40, maxWidth: 480,
            background: '#1e1e1e', borderRadius: 16, border: '1px solid #333',
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: '#7C5CFC20',
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
                Utilisez le bouton ci-dessous pour le consulter.
              </p>
            </div>
            <a
              href={url} target="_blank" rel="noopener noreferrer"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 20px', borderRadius: 10,
                background: '#7C5CFC', color: 'white',
                textDecoration: 'none', fontSize: 15, fontWeight: 700,
              }}
            >
              <ExternalLink size={18} /> Ouvrir dans un nouvel onglet
            </a>
            <a
              href={url} download
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px 20px', borderRadius: 10,
                background: 'transparent', color: '#aaa',
                textDecoration: 'none', fontSize: 14, fontWeight: 600,
                border: '1px solid #444',
              }}
            >
              <Download size={16} /> Télécharger sur mon ordinateur
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentViewerButton;
