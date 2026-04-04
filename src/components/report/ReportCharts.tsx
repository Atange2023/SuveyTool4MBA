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
        <h4 className="text-sm font-semibold text-gray-700 mb-4">信度与效度指标对比</h4>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={reliabilityData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Cronbach Alpha" fill="#3b8ff3" radius={[4, 4, 0, 0]} />
            <Bar dataKey="组合信度" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="AVE" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">R² 解释方差</h4>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={r2Data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="R²" fill="#3b8ff3" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">构念质量雷达图</h4>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
              <Radar name="平均载荷" dataKey="平均载荷" stroke="#3b8ff3" fill="#3b8ff3" fillOpacity={0.15} />
              <Radar name="信度" dataKey="信度" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} />
              <Radar name="AVE" dataKey="AVE" stroke="#f97316" fill="#f97316" fillOpacity={0.15} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
