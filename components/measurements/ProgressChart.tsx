'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Measurement } from '@/lib/types';
import { formatShortDate } from '@/lib/utils';

const METRICS = [
  { key: 'weight_kg', label: 'Weight (kg)', color: '#BFF549' },
  { key: 'waist_cm',  label: 'Waist (cm)',  color: '#f59e0b' },
  { key: 'hips_cm',   label: 'Hips (cm)',   color: '#ec4899' },
  { key: 'chest_cm',  label: 'Chest (cm)',  color: '#10b981' },
];

interface Props {
  data: Measurement[];
  activeMetrics?: string[];
}

export function ProgressChart({ data, activeMetrics }: Props) {
  const metrics = activeMetrics
    ? METRICS.filter((m) => activeMetrics.includes(m.key))
    : METRICS;

  const chartData = data.map((d) => ({
    ...d,
    date: formatShortDate(d.date),
  }));

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Log at least 2 entries to see your progress chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, backgroundColor: '#141414', border: '1px solid #2A2A2A', color: '#fff' }}
          formatter={(value: number, name: string) => [
            value !== null ? value.toFixed(1) : '—',
            name,
          ]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {metrics.map((m) => (
          <Line
            key={m.key}
            type="monotone"
            dataKey={m.key}
            name={m.label}
            stroke={m.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
