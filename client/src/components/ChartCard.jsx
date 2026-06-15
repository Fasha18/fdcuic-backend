/* ── ChartCard.jsx ───────────────────────────────────────── */
/* Premium wrapper for all chart components                  */

const ChartCard = ({ title, subtitle, action, children, className = '' }) => {
  return (
    <div className={`chart-card animate-fade-in-up ${className}`}>
      <div className="chart-card-header">
        <div>
          <h3 className="chart-card-title">{title}</h3>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>
        {action ? (
          action
        ) : (
          <button className="card-action" title="Plus d'options">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

export default ChartCard;
