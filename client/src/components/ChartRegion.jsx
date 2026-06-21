/* ── ChartRegion.jsx ─────────────────────────────────────── */
/* Premium bar chart for regional distribution               */

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
} from 'recharts';
import ChartCard from './ChartCard';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="custom-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="custom-tooltip-value" style={{ color: p.color }}>
          {Number(p.value).toLocaleString('fr-FR')} projets
        </p>
      ))}
    </div>
  );
};

const ChartRegion = ({ data }) => {
  const formatted = data
    .filter(d => d.region)
    .map(d => ({ name: d.region, total: parseInt(d.total) }))
    .sort((a, b) => b.total - a.total);

  if (formatted.length === 0) {
    return (
      <ChartCard title="Projets par région" subtitle="Distribution géographique">
        <div className="chart-empty">Aucune donnée disponible</div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Projets par région" subtitle="Distribution géographique">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={formatted} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="barGradientRegion" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F6AF6" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#3B5BDB" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F0F1F3"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 400 }}
            tickLine={false}
            axisLine={{ stroke: '#F0F1F3' }}
            angle={-25}
            textAnchor="end"
            height={55}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 400 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79, 106, 246, 0.04)' }} />
          <Bar
            dataKey="total"
            fill="url(#barGradientRegion)"
            radius={[6, 6, 0, 0]}
            maxBarSize={42}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default ChartRegion;
