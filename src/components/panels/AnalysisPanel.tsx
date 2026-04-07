import { TrendingUp } from 'lucide-react';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { MetricCard } from '../shared/MetricCard';
import { PageTitle } from '../shared/PageTitle';
import { NextBtn } from '../shared/NextBtn';
import { PathDiagram } from '../analysis/PathDiagram';
import type { FullAnalysisResult, ModelConfig } from '../../lib/pls-sem/types';
import type { ExampleIndicator } from '../../types/app';

interface AnalysisPanelProps {
  result: FullAnalysisResult | null;
  modelConfig: ModelConfig;
  indicators: ExampleIndicator[];
  analysisTab: string;
  setAnalysisTab: (v: 'desc' | 'reliability' | 'validity' | 'structural' | 'bootstrap') => void;
  analyzing: boolean;
  onRun: () => void;
  onReport: () => void;
}

export function AnalysisPanel({
  result, modelConfig, indicators, analysisTab, setAnalysisTab,
  analyzing, onRun, onReport,
}: AnalysisPanelProps) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="w-14 h-14 bg-notion-bg-tertiary rounded-xl flex items-center justify-center mb-5">
          <TrendingUp className="w-7 h-7 text-notion-text-tertiary" />
        </div>
        <h3 className="text-lg font-bold text-notion-text mb-1.5">准备进行数据分析</h3>
        <p className="text-[13px] text-notion-text-secondary mb-6 text-center max-w-sm leading-relaxed">
          将运行 PLS-SEM 分析，包含信度、效度、路径和 Bootstrap 检验。
        </p>
        <button onClick={onRun} disabled={analyzing}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-notion-text text-white rounded-md text-[13px] font-medium hover:bg-notion-text/90 disabled:opacity-40 transition-colors">
          {analyzing ? (
            <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> 分析中...</>
          ) : (
            <><TrendingUp className="w-3.5 h-3.5" /> 开始 PLS-SEM 分析</>
          )}
        </button>
      </div>
    );
  }

  const TABS = [
    { key: 'desc', label: '描述统计' },
    { key: 'reliability', label: '信度分析' },
    { key: 'validity', label: '效度分析' },
    { key: 'structural', label: '结构模型' },
    { key: 'bootstrap', label: 'Bootstrap' },
  ] as const;

  return (
    <div className="animate-fade-in">
      <PageTitle sub="PLS-SEM 偏最小二乘结构方程模型分析结果" right={<NextBtn onClick={onReport} label="生成报告" />}>
        数据分析
      </PageTitle>

      <div className="flex gap-px mb-6 border-b border-notion-border-light overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setAnalysisTab(t.key)}
            className={`px-4 py-2 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              analysisTab === t.key
                ? 'border-notion-text text-notion-text'
                : 'border-transparent text-notion-text-tertiary hover:text-notion-text-secondary'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {analysisTab === 'desc' && <DescTab result={result} indicators={indicators} />}
      {analysisTab === 'reliability' && <ReliabilityTab result={result} modelConfig={modelConfig} indicators={indicators} />}
      {analysisTab === 'validity' && <ValidityTab result={result} modelConfig={modelConfig} />}
      {analysisTab === 'structural' && <StructuralTab result={result} modelConfig={modelConfig} />}
      {analysisTab === 'bootstrap' && <BootstrapTab result={result} modelConfig={modelConfig} />}
    </div>
  );
}

function DescTab({ result, indicators }: { result: FullAnalysisResult; indicators: ExampleIndicator[] }) {
  return (
    <Card title="描述性统计" subtitle={`N=${result.descriptive.n} | 有效 ${result.dataQuality.cleanedN} / ${result.dataQuality.originalN}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-notion-border">
              {['编码', '题目', '均值', '标准差', '偏度', '峰度'].map(h => (
                <th key={h} className={`py-2 px-3 text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wider ${h === '题目' ? 'text-left' : h === '编码' ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {indicators.map((ind, idx) => (
              <tr key={ind.code} className="border-b border-notion-border-light hover:bg-notion-bg-secondary transition-colors">
                <td className="py-2 px-3"><Badge variant="neutral" size="sm">{ind.code}</Badge></td>
                <td className="py-2 px-3 text-notion-text-secondary text-[12px] max-w-[240px] truncate">{ind.question_text}</td>
                <td className="py-2 px-3 text-right font-mono text-[12px]">{result.descriptive.means[idx]?.toFixed(2)}</td>
                <td className="py-2 px-3 text-right font-mono text-[12px]">{result.descriptive.stdDevs[idx]?.toFixed(2)}</td>
                <td className="py-2 px-3 text-right font-mono text-[12px]">{result.descriptive.skewness[idx]?.toFixed(3)}</td>
                <td className="py-2 px-3 text-right font-mono text-[12px]">{result.descriptive.kurtosis[idx]?.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ReliabilityTab({ result, modelConfig, indicators }: { result: FullAnalysisResult; modelConfig: ModelConfig; indicators: ExampleIndicator[] }) {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {modelConfig.constructs.map(c => (
          <MetricCard key={c.name} label={c.name}
            value={result.reliability.cronbachAlpha[c.name] ?? 0}
            threshold={0.7} description="Cronbach's Alpha" />
        ))}
      </div>
      <Card title="信度指标汇总" subtitle="Alpha >= 0.70, CR >= 0.70, AVE >= 0.50">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-notion-border">
                {['构念', "Cronbach's Alpha", '组合信度', 'rho_A', 'AVE', '状态'].map(h => (
                  <th key={h} className={`py-2 px-3 text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wider ${h === '构念' ? 'text-left' : h === '状态' ? 'text-center' : 'text-right'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modelConfig.constructs.map(c => {
                const a = result.reliability.cronbachAlpha[c.name] ?? 0;
                const cr = result.reliability.compositeReliability[c.name] ?? 0;
                const rA = result.reliability.rhoA[c.name] ?? 0;
                const ave = result.reliability.ave[c.name] ?? 0;
                const pass = a >= 0.7 && cr >= 0.7 && ave >= 0.5;
                return (
                  <tr key={c.name} className="border-b border-notion-border-light hover:bg-notion-bg-secondary transition-colors">
                    <td className="py-2.5 px-3 font-medium text-notion-text">{c.name}</td>
                    <td className={`py-2.5 px-3 text-right font-mono text-[12px] ${a >= 0.7 ? 'text-success-600' : 'text-danger-600'}`}>{a.toFixed(3)}</td>
                    <td className={`py-2.5 px-3 text-right font-mono text-[12px] ${cr >= 0.7 ? 'text-success-600' : 'text-danger-600'}`}>{cr.toFixed(3)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-[12px]">{rA.toFixed(3)}</td>
                    <td className={`py-2.5 px-3 text-right font-mono text-[12px] ${ave >= 0.5 ? 'text-success-600' : 'text-danger-600'}`}>{ave.toFixed(3)}</td>
                    <td className="py-2.5 px-3 text-center"><Badge variant={pass ? 'success' : 'danger'} size="sm">{pass ? '通过' : '需关注'}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="外部载荷" subtitle="建议 >= 0.708; 可接受 >= 0.60">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-notion-border">
                {['构念', '指标', '载荷', '状态'].map(h => (
                  <th key={h} className={`py-2 px-3 text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wider ${h === '状态' ? 'text-center' : h === '载荷' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modelConfig.constructs.flatMap(c => {
                const loadings = result.pls.outerLoadings[c.name] || [];
                return indicators.filter(i => i.construct === c.name).map((ind, i) => {
                  const l = loadings[i] ?? 0;
                  return (
                    <tr key={ind.code} className="border-b border-notion-border-light hover:bg-notion-bg-secondary transition-colors">
                      <td className="py-2 px-3 text-[12px] text-notion-text-secondary">{c.name}</td>
                      <td className="py-2 px-3"><Badge variant="neutral" size="sm">{ind.code}</Badge></td>
                      <td className={`py-2 px-3 text-right font-mono text-[12px] ${l >= 0.708 ? 'text-success-600' : l >= 0.6 ? 'text-warning-600' : 'text-danger-600'}`}>{l.toFixed(3)}</td>
                      <td className="py-2 px-3 text-center"><Badge variant={l >= 0.708 ? 'success' : l >= 0.6 ? 'warning' : 'danger'} size="sm">{l >= 0.708 ? '良好' : l >= 0.6 ? '可接受' : '需删除'}</Badge></td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ValidityTab({ result, modelConfig }: { result: FullAnalysisResult; modelConfig: ModelConfig }) {
  return (
    <div className="space-y-6">
      <Card title="Fornell-Larcker 准则" subtitle="对角线 (sqrt AVE) 应大于同行/列其他值">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-notion-border">
                <th className="text-left py-2 px-3 text-[11px] font-medium text-notion-text-tertiary"></th>
                {modelConfig.constructs.map(c => (
                  <th key={c.name} className="text-right py-2 px-3 text-[11px] font-medium text-notion-text-tertiary">{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modelConfig.constructs.map(ci => (
                <tr key={ci.name} className="border-b border-notion-border-light hover:bg-notion-bg-secondary transition-colors">
                  <td className="py-2.5 px-3 font-medium text-notion-text text-[12px]">{ci.name}</td>
                  {modelConfig.constructs.map(cj => {
                    const v = result.validity.fornellLarcker[ci.name]?.[cj.name] ?? 0;
                    const diag = ci.name === cj.name;
                    return (
                      <td key={cj.name} className={`py-2.5 px-3 text-right font-mono text-[12px] ${diag ? 'font-bold text-notion-text bg-notion-bg-tertiary' : 'text-notion-text-secondary'}`}>
                        {v.toFixed(3)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="HTMT 矩阵" subtitle="建议 < 0.85 (保守) 或 < 0.90 (宽松)">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-notion-border">
                <th className="text-left py-2 px-3 text-[11px] font-medium text-notion-text-tertiary"></th>
                {modelConfig.constructs.map(c => (
                  <th key={c.name} className="text-right py-2 px-3 text-[11px] font-medium text-notion-text-tertiary">{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modelConfig.constructs.map(ci => (
                <tr key={ci.name} className="border-b border-notion-border-light hover:bg-notion-bg-secondary transition-colors">
                  <td className="py-2.5 px-3 font-medium text-notion-text text-[12px]">{ci.name}</td>
                  {modelConfig.constructs.map(cj => {
                    const v = result.validity.htmt[ci.name]?.[cj.name] ?? 0;
                    const diag = ci.name === cj.name;
                    return (
                      <td key={cj.name} className={`py-2.5 px-3 text-right font-mono text-[12px] ${diag ? 'text-notion-text-tertiary' : v < 0.85 ? 'text-success-600' : 'text-danger-600'}`}>
                        {diag ? '-' : v.toFixed(3)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StructuralTab({ result, modelConfig }: { result: FullAnalysisResult; modelConfig: ModelConfig }) {
  return (
    <div className="space-y-6">
      <Card title="路径模型" subtitle="实线 = 显著路径，虚线 = 不显著">
        <PathDiagram result={result} modelConfig={modelConfig} />
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="路径系数">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-notion-border">
                <th className="text-left py-2 px-3 text-[11px] font-medium text-notion-text-tertiary">路径</th>
                <th className="text-right py-2 px-3 text-[11px] font-medium text-notion-text-tertiary">系数</th>
              </tr>
            </thead>
            <tbody>
              {modelConfig.paths.map(p => (
                <tr key={`${p.from}-${p.to}`} className="border-b border-notion-border-light">
                  <td className="py-2 px-3 text-[12px] text-notion-text-secondary">{p.from} {'\u2192'}{p.to}</td>
                  <td className="py-2 px-3 text-right font-mono text-[12px] font-medium">{(result.pls.pathCoefficients[p.to]?.[p.from] ?? 0).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="R-squared 与 f-squared">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-medium text-notion-text-tertiary mb-2 uppercase tracking-wider">R-squared (0.75 强 / 0.50 中 / 0.25 弱)</p>
              {Object.entries(result.pls.rSquared).map(([name, r2]) => (
                <div key={name} className="flex items-center gap-3 py-1.5">
                  <span className="text-[12px] text-notion-text-secondary w-16 flex-shrink-0">{name}</span>
                  <div className="flex-1 h-2 bg-notion-bg-tertiary rounded-full overflow-hidden">
                    <div className="h-full bg-notion-accent rounded-full" style={{ width: `${r2 * 100}%` }} />
                  </div>
                  <span className="text-[12px] font-mono font-medium text-notion-text w-12 text-right">{r2.toFixed(3)}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[11px] font-medium text-notion-text-tertiary mb-2 uppercase tracking-wider">f-squared (0.35 大 / 0.15 中 / 0.02 小)</p>
              {Object.entries(result.pls.fSquared).flatMap(([endo, preds]) =>
                Object.entries(preds).map(([pred, f2]) => (
                  <div key={`${pred}-${endo}`} className="flex items-center justify-between py-1 text-[12px]">
                    <span className="text-notion-text-secondary">{pred} {'\u2192'}{endo}</span>
                    <span className={`font-mono font-medium ${f2 >= 0.35 ? 'text-success-600' : f2 >= 0.15 ? 'text-notion-accent' : f2 >= 0.02 ? 'text-warning-600' : 'text-notion-text-tertiary'}`}>{f2.toFixed(3)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function BootstrapTab({ result, modelConfig }: { result: FullAnalysisResult; modelConfig: ModelConfig }) {
  return (
    <Card title="Bootstrap 显著性检验" subtitle={`${result.bootstrap.nSamples} 次重采样 | 95% 置信区间 | 双尾检验`}>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-notion-border">
              {['路径', '原始值', '均值', '标准误', 'T值', 'P值', '95% CI', ''].map((h, i) => (
                <th key={i} className={`py-2 px-3 text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wider ${i === 0 ? 'text-left' : i === 7 ? 'text-center' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modelConfig.paths.map(p => {
              const s = result.bootstrap.pathCoefficients[p.to]?.[p.from];
              if (!s) return null;
              return (
                <tr key={`${p.from}-${p.to}`} className="border-b border-notion-border-light hover:bg-notion-bg-secondary transition-colors">
                  <td className="py-2.5 px-3 text-[12px] text-notion-text-secondary">{p.from} {'\u2192'}{p.to}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[12px]">{s.original.toFixed(3)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[12px]">{s.mean.toFixed(3)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[12px]">{s.stdError.toFixed(3)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[12px] font-medium">{s.tValue.toFixed(3)}</td>
                  <td className={`py-2.5 px-3 text-right font-mono text-[12px] font-medium ${s.pValue < 0.05 ? 'text-success-600' : 'text-notion-text-secondary'}`}>{s.pValue.toFixed(3)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[12px]">[{s.ci95Low.toFixed(3)}, {s.ci95High.toFixed(3)}]</td>
                  <td className="py-2.5 px-3 text-center">
                    <Badge variant={s.significant ? 'success' : 'neutral'} size="sm">
                      {s.significant ? (s.pValue < 0.01 ? '***' : '**') : 'n.s.'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-notion-text-tertiary">
        *** p{'<'}0.01, ** p{'<'}0.05, n.s. = 不显著. T {'>'} 1.96 在 5% 水平显著（双尾）。
      </p>
    </Card>
  );
}
