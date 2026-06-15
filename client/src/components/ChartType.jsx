/* ── ChartType.jsx ───────────────────────────────────────── */
/* Premium horizontal bar chart for project types            */

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell,
} from 'recharts';
import ChartCard from './ChartCard';

const TYPE_COLORS = ['#4F6AF6', '#22B07D', '#F59F00', '#7C5CFC', '#15AABF'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="custom-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="custom-tooltip-value" style={{ color: p.payload?.fill || p.color }}>
          {Number(p.value).toLocaleString('fr-FR')} projets
        </p>
      ))}
    </div>
  );
};

const ChartType = ({ data }) => {
  const formatted = (data || [])
    .filter(d => d.type_projet)
    .map((d, i) => ({
      name: d.type_projet.charAt(0).toUpperCase() + d.type_projet.slice(1),
      total: parseInt(d.total),
      fill: TYPE_COLORS[i % TYPE_COLORS.length],
    }));

  if (formatted.length === 0) {
    return (
      <ChartCard title="Types de projets" subtitle="Répartition par catégorie">
        <div className="chart-empty">Aucune donnée disponible</div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Types de projets" subtitle="Répartition par catégorie">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={formatted}
          layout="vertical"
          margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#F0F1F3"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 400 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12.5, fill: '#6B7280', fontWeight: 450 }}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79, 106, 246, 0.04)' }} />
          <Bar dataKey="total" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {formatted.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default ChartType;
