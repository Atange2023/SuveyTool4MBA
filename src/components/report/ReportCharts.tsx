import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend,
} from 'recharts';
import type { FullAnalysisResult, ModelConfig } from '../../lib/pls-sem/types';

interface ReportChartsProps {
  result: FullAnalysisResult;
  modelConfig: ModelConfig;
}

const COLORS = {
  primary: '#2eaadc',
  secondary: '#46a046',
  accent: '#f08c28',
  text: '#37352f',
  muted: '#9b9a97',
  grid: '#f0efed',
  bg: '#fbfbfa',
};

export function ReportCharts({ result, modelConfig }: ReportChartsProps) {
  const reliabilityData = Object.entries(result.reliability.cronbachAlpha).map(([name, alpha]) => ({
    name,
    'Cronbach Alpha': parseFloat(alpha.toFixed(3)),
    '组合信度': parseFloat((result.reliability.compositeReliability[name] ?? 0).toFixed(3)),
    'AVE': parseFloat((result.reliability.ave[name] ?? 0).toFixed(3)),
  }));

  const r2Data = Object.entries(result.pls.rSquared).map(([name, value]) => ({
    name,
    'R²': parseFloat((value * 100).toFixed(1)),
  }));

  const radarData = modelConfig.constructs.map(c => {
    const loadings = result.pls.outerLoadings[c.name] || [];
    return {
      name: c.name,
      '平均载荷': parseFloat((loadings.reduce((s, v) => s + v, 0) / (loadings.length || 1)).toFixed(2)),
      '信度': parseFloat((result.reliability.compositeReliability[c.name] ?? 0).toFixed(2)),
      'AVE': parseFloat((result.reliability.ave[c.name] ?? 0).toFixed(2)),
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-[13px] font-semibold text-notion-text mb-4">信度与效度指标对比</h4>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={reliabilityData} barGap={2} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={{ stroke: COLORS.grid }} tickLine={false} />
            <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${COLORS.grid}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Cronbach Alpha" fill={COLORS.primary} radius={[3, 3, 0, 0]} />
            <Bar dataKey="组合信度" fill={COLORS.secondary} radius={[3, 3, 0, 0]} />
            <Bar dataKey="AVE" fill={COLORS.accent} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-[13px] font-semibold text-notion-text mb-4">R² 解释方差</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={r2Data} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: COLORS.muted }} unit="%" axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: COLORS.text }} width={72} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${COLORS.grid}` }} />
              <Bar dataKey="R²" fill={COLORS.primary} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className="text-[13px] font-semibold text-notion-text mb-4">构念质量雷达图</h4>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={COLORS.grid} />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: COLORS.muted }} />
              <PolarRadiusAxis domain={[0, 1]} tick={{ fontSize: 9, fill: COLORS.muted }} />
              <Radar name="平均载荷" dataKey="平均载荷" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.1} strokeWidth={1.5} />
              <Radar name="信度" dataKey="信度" stroke={COLORS.secondary} fill={COLORS.secondary} fillOpacity={0.1} strokeWidth={1.5} />
              <Radar name="AVE" dataKey="AVE" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.1} strokeWidth={1.5} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
