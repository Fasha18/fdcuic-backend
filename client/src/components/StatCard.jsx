/* ── StatCard.jsx ────────────────────────────────────────── */
/* Premium stat card with icon, value, trend indicator       */

const ACCENT_MAP = {
  blue: {
    bg: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
    gradient: 'var(--color-primary)',
  },
  green: {
    bg: 'var(--color-green-light)',
    color: 'var(--color-green)',
    gradient: 'var(--color-green)',
  },
  orange: {
    bg: 'var(--color-orange-light)',
    color: 'var(--color-orange)',
    gradient: 'var(--color-orange)',
  },
  red: {
    bg: 'var(--color-red-light)',
    color: 'var(--color-red)',
    gradient: 'var(--color-red)',
  },
  violet: {
    bg: 'var(--color-violet-light)',
    color: 'var(--color-violet)',
    gradient: 'var(--color-violet)',
  },
  cyan: {
    bg: 'var(--color-cyan-light)',
    color: 'var(--color-cyan)',
    gradient: 'var(--color-cyan)',
  },
};

const ICONS = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  folder: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  bank: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M3 10h18" />
      <path d="M5 6l7-3 7 3" />
      <path d="M4 10v11" />
      <path d="M20 10v11" />
      <path d="M8 14v3" />
      <path d="M12 14v3" />
      <path d="M16 14v3" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
};

const StatCard = ({ label, value, sub, icon = 'chart', accent = 'blue', delay = 0 }) => {
  const colors = ACCENT_MAP[accent] || ACCENT_MAP.blue;
  const iconSvg = ICONS[icon] || ICONS.chart;

  return (
    <div
      className="stat-card animate-fade-in-up"
      style={{ animationDelay: `${delay * 0.06}s` }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3, background: colors.gradient,
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
      }} />

      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <div
          className="stat-card-icon"
          style={{ background: colors.bg, color: colors.color }}
        >
          {iconSvg}
        </div>
      </div>

      <div className="stat-card-value">{value}</div>

      {sub && (
        <div className="stat-card-sub">
          {sub}
        </div>
      )}
    </div>
  );
};

export { ICONS };
export default StatCard;