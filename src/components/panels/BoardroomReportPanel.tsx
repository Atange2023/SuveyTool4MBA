import { useState, useMemo } from 'react';
import { Copy, CircleCheck as CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { PageTitle } from '../shared/PageTitle';
import { PathDiagram } from '../analysis/PathDiagram';
import { ReportCharts } from '../report/ReportCharts';
import type { FullAnalysisResult, ModelConfig } from '../../lib/pls-sem/types';
import type { Hypothesis } from '../../types';

interface BoardroomReportPanelProps {
  result: FullAnalysisResult | null;
  modelConfig: ModelConfig;
  title: string;
  researchQuestion: string;
  hypotheses: Hypothesis[];
}

function getPValueVerdict(p: number): { text: string; variant: 'success' | 'warning' } {
  if (p < 0.05) {
    return { text: '假设成立，您的直觉有95%把握是客观规律。', variant: 'success' };
  }
  return { text: '发现反常识金矿！理论失效，请深挖背后的商业逻辑。', variant: 'warning' };
}

function getR2Rating(r2: number): { label: string; desc: string } {
  if (r2 > 0.6) return { label: '极其优秀', desc: '模型对业务问题的解释力非常强' };
  if (r2 > 0.5) return { label: '优秀', desc: '模型对业务问题有很好的解释力' };
  if (r2 > 0.3) return { label: '良好', desc: '模型对业务问题有一定解释力' };
  return { label: '待改善', desc: '模型解释力有限，建议补充变量或优化模型' };
}

export function BoardroomReportPanel({
  result, modelConfig, title, researchQuestion, hypotheses,
}: BoardroomReportPanelProps) {
  const [promptCopied, setPromptCopied] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-[13px] text-notion-text-tertiary">请先完成数据分析</p>
      </div>
    );
  }

  const significantHypotheses = hypotheses.filter(
    h => result.bootstrap.pathCoefficients[h.to]?.[h.from]?.significant
  );

  const betaRanking = useMemo(() => {
    return hypotheses
      .map(h => {
        const boot = result.bootstrap.pathCoefficients[h.to]?.[h.from];
        const beta = result.pls.pathCoefficients[h.to]?.[h.from] ?? 0;
        return { ...h, beta, significant: boot?.significant ?? false, pValue: boot?.pValue ?? 1 };
      })
      .filter(h => h.significant)
      .sort((a, b) => Math.abs(b.beta) - Math.abs(a.beta));
  }, [hypotheses, result]);

  const maxR2Entry = useMemo(() => {
    const entries = Object.entries(result.pls.rSquared);
    if (entries.length === 0) return null;
    return entries.reduce((max, curr) => curr[1] > max[1] ? curr : max);
  }, [result]);

  const generateLLMPrompt = () => {
    const pathSummary = betaRanking.map((h, i) =>
      `  ${i + 1}. ${h.from} -> ${h.to}: Beta=${h.beta.toFixed(3)}, P=${h.pValue.toFixed(3)}`
    ).join('\n');

    const r2Summary = Object.entries(result.pls.rSquared)
      .map(([name, r2]) => `  ${name}: R²=${(r2 * 100).toFixed(1)}%`)
      .join('\n');

    const unsupported = hypotheses
      .filter(h => !result.bootstrap.pathCoefficients[h.to]?.[h.from]?.significant)
      .map(h => `  ${h.label}: ${h.from} -> ${h.to} (${h.description})`)
      .join('\n');

    return `你是一位资深的商业战略顾问，请基于以下量化研究的统计结果，为CEO撰写一份精简的商业决策洞察报告。

研究背景：
  课题：${title}
  核心问题：${researchQuestion}
  样本量：${result.descriptive.n}
  变量数：${modelConfig.constructs.length}
  假设数：${hypotheses.length}

核心发现：
  假设通过率：${significantHypotheses.length}/${hypotheses.length}

显著路径（按影响力排序）：
${pathSummary || '  无显著路径'}

模型解释力：
${r2Summary}

未通过的假设：
${unsupported || '  全部通过'}

请按以下结构输出报告（使用商业语言，避免统计术语）：

1. **核心结论**（一句话总结最关键的发现）
2. **验证结果概述**（哪些预期被证实了，哪些没有）
3. **影响力排序**（按重要性排列需要关注的因素，用"优先将资源倾斜于此"的语言）
4. **反常识发现**（如果有假设未通过，分析可能的原因和商业价值）
5. **行动建议**（基于数据，给出3条具体可执行的建议）
6. **局限性说明**（用一段话简要说明研究的边界条件）`;
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generateLLMPrompt()).catch(() => {});
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      <PageTitle sub="面向决策者的商业洞察报告">
        决策洞察报告
      </PageTitle>

      <div className="space-y-6">
        <Card title="防碰瓷验证">
          <p className="text-[12px] text-notion-text-tertiary mb-3">P值检验 - 您的直觉是否被数据验证</p>
          <div className="space-y-2">
            {hypotheses.map(h => {
              const boot = result.bootstrap.pathCoefficients[h.to]?.[h.from];
              const pValue = boot?.pValue ?? 1;
              const verdict = getPValueVerdict(pValue);
              return (
                <div key={h.id} className={`p-3.5 rounded-md ${verdict.variant === 'success' ? 'bg-[#dbeddb]' : 'bg-[#fbf3db]'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={verdict.variant === 'success' ? 'success' : 'warning'} size="sm">{h.label}</Badge>
                      <span className="text-[13px] text-notion-text">{h.from} {'\u2192'}{h.to}</span>
                    </div>
                    <Badge variant={verdict.variant} size="sm">
                      {pValue < 0.01 ? 'P<0.01' : pValue < 0.05 ? 'P<0.05' : `P=${pValue.toFixed(2)}`}
                    </Badge>
                  </div>
                  <p className={`text-[12px] ${verdict.variant === 'success' ? 'text-[#2b593f]' : 'text-[#7f5b1d]'}`}>
                    {verdict.text}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {maxR2Entry && (
          <Card title="全局痛点解决率">
            <div className="flex items-start gap-5">
              <div className="flex-1">
                <p className="text-[12px] text-notion-text-tertiary mb-2">
                  R-squared 值 - 模型对核心因变量"{maxR2Entry[0]}"的解释力
                </p>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-notion-text tracking-tight">
                    {(maxR2Entry[1] * 100).toFixed(1)}%
                  </span>
                  <Badge variant={maxR2Entry[1] > 0.5 ? 'success' : maxR2Entry[1] > 0.3 ? 'warning' : 'danger'} size="sm">
                    {getR2Rating(maxR2Entry[1]).label}
                  </Badge>
                </div>
                <p className="text-[13px] text-notion-text-secondary">
                  本模型解决了业务痛点 {(maxR2Entry[1] * 100).toFixed(1)}% 的核心原因。
                  {getR2Rating(maxR2Entry[1]).desc}。
                </p>
              </div>
              <div className="w-28 h-28 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e9e9e7" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none"
                    stroke={maxR2Entry[1] > 0.5 ? '#46a046' : maxR2Entry[1] > 0.3 ? '#f0ae0e' : '#e95656'}
                    strokeWidth="8"
                    strokeDasharray={`${maxR2Entry[1] * 264} ${264 - maxR2Entry[1] * 264}`}
                    strokeDashoffset="66"
                    strokeLinecap="round"
                  />
                  <text x="50" y="54" textAnchor="middle" className="text-[16px] font-bold fill-notion-text">
                    {(maxR2Entry[1] * 100).toFixed(0)}%
                  </text>
                </svg>
              </div>
            </div>

            {Object.entries(result.pls.rSquared).length > 1 && (
              <div className="mt-4 pt-3 border-t border-notion-border-light space-y-2">
                {Object.entries(result.pls.rSquared).map(([name, r2]) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-[12px] text-notion-text-secondary w-20 flex-shrink-0">{name}</span>
                    <div className="flex-1 h-2 bg-notion-bg-tertiary rounded-full overflow-hidden">
                      <div className="h-full bg-notion-accent rounded-full" style={{ width: `${r2 * 100}%` }} />
                    </div>
                    <span className="text-[12px] font-mono text-notion-text w-14 text-right">{(r2 * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {betaRanking.length > 0 && (
          <Card title="战术排序">
            <p className="text-[12px] text-notion-text-tertiary mb-3">
              按影响力大小排列 - 优先将资源倾斜于排名靠前的因素
            </p>
            <div className="space-y-2">
              {betaRanking.map((h, i) => {
                const maxBeta = Math.abs(betaRanking[0].beta);
                const barWidth = maxBeta > 0 ? (Math.abs(h.beta) / maxBeta) * 100 : 0;
                return (
                  <div key={h.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-notion-bg-tertiary transition-colors">
                    <span className="w-6 h-6 rounded-full bg-notion-text text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-medium text-notion-text">{h.from} {'\u2192'}{h.to}</span>
                        <Badge variant="info" size="sm">{h.label}</Badge>
                      </div>
                      <div className="h-2 bg-notion-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all bg-notion-accent"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[14px] font-mono font-bold text-notion-text w-14 text-right">
                      {h.beta.toFixed(3)}
                    </span>
                  </div>
                );
              })}
            </div>
            {betaRanking.length > 0 && (
              <div className="mt-3 p-3 bg-[#ddebf1] rounded-md">
                <p className="text-[12px] text-[#183b56]">
                  "{betaRanking[0].from}" 对 "{betaRanking[0].to}" 的影响最大 (Beta={betaRanking[0].beta.toFixed(3)})，
                  建议优先将资源倾斜于此。
                </p>
              </div>
            )}
          </Card>
        )}

        <Card title="结构模型与路径图">
          <PathDiagram result={result} modelConfig={modelConfig} />
        </Card>

        <Card title="分析图表">
          <ReportCharts result={result} modelConfig={modelConfig} />
        </Card>

        <div className="border border-notion-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-notion-bg-secondary border-b border-notion-border-light">
            <div>
              <p className="text-[13px] font-medium text-notion-text">AI 增强报告</p>
              <p className="text-[11px] text-notion-text-tertiary mt-0.5">
                复制以下提示词到 AI 助手，生成董事会级商业洞察报告
              </p>
            </div>
            <button
              onClick={copyPrompt}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-notion-text text-white rounded text-[12px] font-medium hover:bg-notion-text/90 transition-colors"
            >
              {promptCopied ? (
                <><CheckCircle2 className="w-3.5 h-3.5" /> 已复制</>
              ) : (
                <><Copy className="w-3.5 h-3.5" /> 复制提示词</>
              )}
            </button>
          </div>
          <div className="p-4 max-h-64 overflow-y-auto">
            <pre className="text-[12px] text-notion-text-secondary whitespace-pre-wrap font-mono leading-relaxed">
              {generateLLMPrompt()}
            </pre>
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowTechDetails(!showTechDetails)}
            className="flex items-center gap-1.5 text-[12px] text-notion-text-tertiary hover:text-notion-text-secondary transition-colors"
          >
            {showTechDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showTechDetails ? '收起' : '展开'}技术细节
          </button>

          {showTechDetails && (
            <div className="mt-3 space-y-4 animate-fade-in">
              <Card title="假设检验详细结果">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-notion-border">
                        {['假设', '路径', 'Beta', 'T值', 'P值', '95% CI', '结果'].map(h => (
                          <th key={h} className={`py-2 px-3 text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wider ${h === '假设' || h === '路径' ? 'text-left' : h === '结果' ? 'text-center' : 'text-right'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hypotheses.map(h => {
                        const boot = result.bootstrap.pathCoefficients[h.to]?.[h.from];
                        const beta = result.pls.pathCoefficients[h.to]?.[h.from] ?? 0;
                        if (!boot) return null;
                        return (
                          <tr key={h.id} className="border-b border-notion-border-light">
                            <td className="py-2 px-3"><Badge variant="info" size="sm">{h.label}</Badge></td>
                            <td className="py-2 px-3 text-[12px] text-notion-text-secondary">{h.from} {'\u2192'}{h.to}</td>
                            <td className="py-2 px-3 text-right font-mono text-[12px]">{beta.toFixed(3)}</td>
                            <td className="py-2 px-3 text-right font-mono text-[12px]">{boot.tValue.toFixed(3)}</td>
                            <td className={`py-2 px-3 text-right font-mono text-[12px] ${boot.pValue < 0.05 ? 'text-success-600 font-medium' : ''}`}>{boot.pValue.toFixed(3)}</td>
                            <td className="py-2 px-3 text-right font-mono text-[12px]">[{boot.ci95Low.toFixed(3)}, {boot.ci95High.toFixed(3)}]</td>
                            <td className="py-2 px-3 text-center"><Badge variant={boot.significant ? 'success' : 'danger'} size="sm">{boot.significant ? '支持' : '不支持'}</Badge></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
