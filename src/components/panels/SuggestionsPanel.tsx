import { CircleCheck as CheckCircle2 } from 'lucide-react';
import { Card } from '../shared/Card';
import { PageTitle } from '../shared/PageTitle';
import { NextBtn } from '../shared/NextBtn';
import type { Hypothesis } from '../../types';
import type { ExampleConstruct } from '../../types/app';

interface SuggestionsPanelProps {
  researchQuestion: string;
  constructs: ExampleConstruct[];
  hypotheses: Hypothesis[];
  indicatorCount: number;
  onNext: () => void;
}

export function SuggestionsPanel({
  researchQuestion, constructs, hypotheses, indicatorCount, onNext,
}: SuggestionsPanelProps) {
  const sampleMin = Math.max(10 * indicatorCount, 5 * constructs.length ** 2, 100);

  return (
    <div className="animate-fade-in">
      <PageTitle sub="基于研究设计提供的方法论建议" right={<NextBtn onClick={onNext} label="发布问卷" />}>
        补充建议
      </PageTitle>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="样本量建议">
          <div className="space-y-4">
            <div className="p-3.5 bg-[#ddebf1] rounded-md">
              <p className="text-[13px] font-semibold text-[#183b56]">建议最小样本量: {sampleMin} 份</p>
              <p className="text-[11px] text-[#3a7ca5] mt-0.5">基于 PLS-SEM "10 倍规则" 计算</p>
            </div>
            <ul className="text-[12px] text-notion-text-secondary space-y-1.5 leading-relaxed">
              <li>- 最小样本 = max(指标数 x 10, 构念数² x 5, 100)</li>
              <li>- 建议额外增加 20%-30% 以应对无效问卷</li>
              <li>- 分组比较（MGA）需每组至少 50 个样本</li>
            </ul>
          </div>
        </Card>

        <Card title="研究设计检查">
          <div className="space-y-2">
            {[
              { label: '已明确研究问题和理论框架', done: researchQuestion.length > 10 },
              { label: `已定义 ${constructs.length} 个核心构念`, done: constructs.length >= 3 },
              { label: `已提出 ${hypotheses.length} 个研究假设`, done: hypotheses.length >= 2 },
              { label: `已设计 ${indicatorCount} 个测量指标`, done: indicatorCount >= constructs.length * 3 },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-2.5 py-1.5">
                <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${c.done ? 'text-success-500' : 'text-notion-text-tertiary'}`} />
                <span className="text-[13px] text-notion-text-secondary">{c.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="预测试建议">
          <div className="space-y-3">
            <div className="p-3 bg-[#fbf3db] rounded-md">
              <p className="text-[12px] text-[#7f5b1d] font-medium">建议正式发放前进行 10-30 人的预测试</p>
            </div>
            <ol className="text-[12px] text-notion-text-secondary space-y-2">
              {['邀请与目标受众相似的人填写', '收集题目清晰度和完成时间反馈', '初步信度分析，删除 Alpha < 0.7 的题项', '根据反馈调整措辞后正式发放'].map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="w-4 h-4 rounded bg-notion-bg-tertiary text-notion-text-tertiary flex items-center justify-center text-[10px] flex-shrink-0">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
        </Card>

        <Card title="补充研究方法">
          <div className="space-y-2.5">
            {[
              { t: 'A/B 测试', d: '将受试者随机分组，测量不同条件下的体验差异' },
              { t: '共同方法偏差控制', d: 'Harman 单因子检验、程序分离法' },
              { t: '混合研究方法', d: '结合定性访谈，增强三角验证效果' },
            ].map(item => (
              <div key={item.t} className="p-3 border border-notion-border-light rounded-md hover:bg-notion-bg-tertiary transition-colors">
                <p className="text-[13px] font-medium text-notion-text">{item.t}</p>
                <p className="text-[12px] text-notion-text-tertiary mt-0.5">{item.d}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
