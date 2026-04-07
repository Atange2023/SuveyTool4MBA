import { useState, useMemo, useCallback } from 'react';
import { Upload, Shield, Trash2, TrendingUp, TriangleAlert as AlertTriangle, Download } from 'lucide-react';
import { PageTitle } from '../shared/PageTitle';
import { NextBtn } from '../shared/NextBtn';
import { Badge } from '../shared/Badge';
import {
  assessConstructHealth,
  parseCSV,
  ALPHA_THRESHOLD,
  AVE_THRESHOLD,
} from '../../lib/data-quality-check';
import type { ConstructHealthResult } from '../../lib/data-quality-check';
import type { ModelConfig } from '../../lib/pls-sem/types';
import type { ExampleConstruct, ExampleIndicator } from '../../types/app';

interface TrafficLightPanelProps {
  data: number[][];
  modelConfig: ModelConfig;
  indicators: ExampleIndicator[];
  setIndicators: (v: ExampleIndicator[]) => void;
  constructs: ExampleConstruct[];
  onUploadData: (data: number[][] | null) => void;
  onProceed: () => void;
  analyzing: boolean;
}

export function TrafficLightPanel({
  data, modelConfig, indicators, setIndicators, constructs,
  onUploadData, onProceed, analyzing,
}: TrafficLightPanelProps) {
  const [uploadError, setUploadError] = useState('');
  const [hasUploaded, setHasUploaded] = useState(false);

  const indicatorCodes = useMemo(() => {
    const codes: string[] = [];
    for (const c of modelConfig.constructs) {
      const matching = indicators.filter(ind => ind.construct === c.name);
      for (const m of matching) {
        codes.push(m.code);
      }
    }
    return codes;
  }, [modelConfig, indicators]);

  const healthResults = useMemo<ConstructHealthResult[]>(() => {
    if (data.length === 0 || modelConfig.constructs.length === 0) return [];
    try {
      return assessConstructHealth(data, modelConfig, indicatorCodes);
    } catch {
      return [];
    }
  }, [data, modelConfig, indicatorCodes]);

  const allPass = healthResults.length > 0 && healthResults.every(r => r.alphaPass && r.avePass);
  const failedConstructs = healthResults.filter(r => !r.alphaPass || !r.avePass);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { headers, data: parsed } = parseCSV(text);

      if (parsed.length < 10) {
        setUploadError('数据行数不足，至少需要 10 行有效数据');
        return;
      }

      const expectedCols = indicators.length;
      if (headers.length < expectedCols) {
        setUploadError(`CSV 列数(${headers.length})少于问卷题目数(${expectedCols})，请检查数据格式`);
        return;
      }

      const validRows = parsed.filter(row => row.every(v => !isNaN(v)));
      if (validRows.length < 10) {
        setUploadError(`有效数据行仅 ${validRows.length} 行（需要至少 10 行），请检查数据中的非数值内容`);
        return;
      }

      onUploadData(validRows);
      setHasUploaded(true);
    };
    reader.readAsText(file);
  }, [indicators.length, onUploadData]);

  const handleRemoveItem = useCallback((constructName: string, itemCode: string) => {
    setIndicators(indicators.filter(i => !(i.construct === constructName && i.code === itemCode)));
  }, [indicators, setIndicators]);

  const exportCSVTemplate = useCallback(() => {
    const headers = indicators.map(i => i.code).join(',');
    const blob = new Blob([headers + '\n'], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'survey_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [indicators]);

  return (
    <div className="animate-fade-in">
      <PageTitle
        sub="上传问卷数据，自动检测数据质量"
        right={
          <NextBtn
            onClick={onProceed}
            label={analyzing ? '分析中...' : '进入数据分析'}
            disabled={analyzing || healthResults.length === 0}
          />
        }
      >
        数据体检
      </PageTitle>

      <div className="space-y-6">
        <div className="border border-notion-border rounded-lg p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-notion-bg-tertiary flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-notion-text-secondary" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-notion-text mb-1">上传问卷数据</p>
              <p className="text-[12px] text-notion-text-tertiary mb-3">
                支持 CSV 格式，每列对应一个题目编码，每行一个受访者。
              </p>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-notion-text text-white rounded text-[12px] font-medium hover:bg-notion-text/90 transition-colors cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> 选择文件
                  <input type="file" accept=".csv,.tsv,.txt" onChange={handleFileUpload} className="hidden" />
                </label>
                <button onClick={exportCSVTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-notion-border rounded text-[12px] text-notion-text-secondary hover:bg-notion-bg-tertiary transition-colors">
                  <Download className="w-3.5 h-3.5" /> 下载模板
                </button>
                {hasUploaded && (
                  <span className="text-[12px] text-success-600 font-medium">
                    已上传 {data.length} 行数据
                  </span>
                )}
              </div>
              {uploadError && (
                <div className="mt-2 p-2.5 bg-danger-50 border border-danger-200 rounded-md">
                  <p className="text-[12px] text-danger-700">{uploadError}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 p-3 bg-notion-bg-tertiary rounded-md">
            <p className="text-[11px] text-notion-text-secondary leading-relaxed">
              本系统采用纯本地运算，您的企业原始业务数据绝不会离开当前浏览器，仅结构化提纲会与 AI 交互，确保数据绝对安全。
            </p>
          </div>
        </div>

        {healthResults.length > 0 && (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <HealthCard
                title="数据可信度"
                metric="Cronbach's Alpha"
                threshold={ALPHA_THRESHOLD}
                pass={healthResults.every(r => r.alphaPass)}
                values={healthResults.map(r => ({ name: r.name, value: r.cronbachAlpha, pass: r.alphaPass }))}
              />
              <HealthCard
                title="概念精准度"
                metric="AVE"
                threshold={AVE_THRESHOLD}
                pass={healthResults.every(r => r.avePass)}
                values={healthResults.map(r => ({ name: r.name, value: r.ave, pass: r.avePass }))}
              />
            </div>

            {allPass ? (
              <div className="p-5 bg-[#dbeddb] border border-success-300 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-success-600" />
                  <div>
                    <p className="text-[14px] font-semibold text-[#2b593f]">数据健康，可用于战略验证</p>
                    <p className="text-[12px] text-[#3a7a4f] mt-0.5">所有构念的信度和效度均通过阈值，可以放心进入下一步分析。</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-[#fdecc8] border border-warning-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-warning-600" />
                    <p className="text-[13px] font-semibold text-[#7f5b1d]">
                      发现 {failedConstructs.length} 个构念的数据质量需要改善
                    </p>
                  </div>
                  <p className="text-[12px] text-[#9a7032]">
                    以下构念存在"拖后腿"的题项。您可以查看项总计相关系数，剔除相关性最低的题项后重新检测。
                  </p>
                </div>

                {failedConstructs.map(r => (
                  <div key={r.name} className="border border-danger-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-danger-50 border-b border-danger-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-danger-800">{r.name}</span>
                        {!r.alphaPass && <Badge variant="danger" size="sm">Alpha={r.cronbachAlpha.toFixed(3)}</Badge>}
                        {!r.avePass && <Badge variant="danger" size="sm">AVE={r.ave.toFixed(3)}</Badge>}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wider mb-2">
                        项总计相关系数（越低表示该题越"拖后腿"）
                      </p>
                      <div className="space-y-1.5">
                        {r.itemTotalCorrelations
                          .sort((a, b) => a.correlation - b.correlation)
                          .map(item => {
                            const isWeakest = r.weakestItem?.code === item.code;
                            return (
                              <div key={item.code} className={`flex items-center gap-3 px-3 py-2 rounded-md ${isWeakest ? 'bg-danger-50 border border-danger-200' : 'hover:bg-notion-bg-tertiary'} transition-colors`}>
                                <Badge variant={isWeakest ? 'danger' : 'neutral'} size="sm">{item.code}</Badge>
                                <div className="flex-1">
                                  <div className="h-1.5 bg-notion-bg-tertiary rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${item.correlation < 0.3 ? 'bg-danger-500' : item.correlation < 0.5 ? 'bg-warning-500' : 'bg-success-500'}`}
                                      style={{ width: `${Math.max(0, item.correlation) * 100}%` }}
                                    />
                                  </div>
                                </div>
                                <span className={`text-[12px] font-mono w-14 text-right ${item.correlation < 0.3 ? 'text-danger-600 font-medium' : 'text-notion-text-secondary'}`}>
                                  {item.correlation.toFixed(3)}
                                </span>
                                {isWeakest && (
                                  <button
                                    onClick={() => handleRemoveItem(r.name, item.code)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-danger-500 text-white rounded text-[11px] font-medium hover:bg-danger-600 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" /> 剔除
                                  </button>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!allPass && (
              <div className="p-3 bg-notion-bg-tertiary rounded-md">
                <p className="text-[12px] text-notion-text-secondary">
                  剔除干扰项后，系统会自动重新计算。您也可以直接进入分析，在报告中说明数据质量情况。
                </p>
              </div>
            )}
          </>
        )}

        {healthResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 bg-notion-bg-tertiary rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-7 h-7 text-notion-text-tertiary" />
            </div>
            <p className="text-[13px] text-notion-text-secondary text-center max-w-sm">
              {data.length > 0
                ? '使用当前示例数据进行数据体检，或上传您自己的问卷数据。'
                : '请先上传问卷数据（CSV格式），或返回示例项目查看演示。'
              }
            </p>
            {data.length > 0 && (
              <p className="text-[12px] text-notion-text-tertiary mt-2">
                当前数据：{data.length} 行 x {data[0]?.length || 0} 列
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function HealthCard({ title, metric, threshold, pass, values }: {
  title: string;
  metric: string;
  threshold: number;
  pass: boolean;
  values: { name: string; value: number; pass: boolean }[];
}) {
  return (
    <div className={`rounded-lg border-2 p-5 transition-colors ${
      pass
        ? 'border-success-300 bg-success-50'
        : 'border-danger-300 bg-danger-50'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[15px] font-semibold" style={{ color: pass ? '#2b593f' : '#942626' }}>
            {title}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: pass ? '#3a7a4f' : '#b32a2a' }}>
            {metric} {'>='} {threshold}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
          pass ? 'bg-success-200' : 'bg-danger-200'
        }`}>
          {pass ? '\u2705' : '\u274C'}
        </div>
      </div>
      <div className="space-y-2">
        {values.map(v => (
          <div key={v.name} className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: pass ? '#2b593f' : '#7b2525' }}>{v.name}</span>
            <span className={`text-[12px] font-mono font-medium ${v.pass ? 'text-success-700' : 'text-danger-700'}`}>
              {v.value.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
      <div className={`mt-3 pt-3 border-t ${pass ? 'border-success-200' : 'border-danger-200'}`}>
        <p className="text-[12px] font-medium" style={{ color: pass ? '#2b593f' : '#942626' }}>
          {pass ? '数据健康，可用于战略验证' : '部分指标未达标，建议优化'}
        </p>
      </div>
    </div>
  );
}
