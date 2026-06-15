/* ── ChartStatut.jsx ─────────────────────────────────────── */
/* Premium donut chart for status distribution               */

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import ChartCard from './ChartCard';

const COLORS = {
  brouillon: '#94A3B8',
  soumis: '#4F6AF6',
  en_examen: '#F59F00',
  accepte: '#22B07D',
  rejete: '#F03E3E',
  en_attente: '#94A3B8',
  approuve: '#22B07D',
  verse: '#22B07D',
  annule: '#F03E3E',
};

const LABELS = {
  brouillon: 'Brouillon',
  soumis: 'Soumis',
  en_examen: 'En examen',
  accepte: 'Accepté',
  rejete: 'Rejeté',
  en_attente: 'En attente',
  approuve: 'Approuvé',
  verse: 'Versé',
  annule: 'Annulé',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="custom-tooltip-label">{payload[0].name}</p>
      <p className="custom-tooltip-value">
        {Number(payload[0].value).toLocaleString('fr-FR')}
      </p>
    </div>
  );
};

const ChartStatut = ({ data, titre = 'Répartition par statut' }) => {
  const formatted = data.map(d => ({
    name: LABELS[d.statut || d.statut_paiement] || d.statut || d.statut_paiement,
    value: parseInt(d.total),
    key: d.statut || d.statut_paiement,
  }));

  const total = formatted.reduce((sum, d) => sum + d.value, 0);

  if (formatted.length === 0) {
    return (
      <ChartCard title={titre}>
        <div className="chart-empty">Aucune donnée disponible</div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title={titre}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
        {/* Donut */}
        <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formatted}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={72}
                paddingAngle={2}
                strokeWidth={0}
              >
                {formatted.map((entry, i) => (
                  <Cell key={i} fill={COLORS[entry.key] || '#94A3B8'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 22, fontWeight: 700,
              color: 'var(--color-text-primary)',
              lineHeight: 1,
            }}>
              {total.toLocaleString('fr-FR')}
            </div>
            <div style={{
              fontSize: 10, color: 'var(--color-text-tertiary)',
              fontWeight: 500, marginTop: 2,
            }}>
              Total
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {formatted.map((d, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: COLORS[d.key] || '#94A3B8', flexShrink: 0,
              }} />
              <span style={{
                flex: 1, fontSize: 12.5,
                color: 'var(--color-text-secondary)', fontWeight: 400,
              }}>
                {d.name}
              </span>
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: 'var(--color-text-primary)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {d.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
};

export { COLORS, LABELS };
export default ChartStatut;