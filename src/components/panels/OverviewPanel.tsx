import { PageTitle } from '../shared/PageTitle';
import type { WorkflowStep, Hypothesis } from '../../types';
import type { ExampleConstruct, ExampleIndicator } from '../../types/app';

interface OverviewPanelProps {
  title: string;
  description: string;
  constructs: ExampleConstruct[];
  indicators: ExampleIndicator[];
  hypotheses: Hypothesis[];
  responseCount: number;
  onNavigate: (s: WorkflowStep) => void;
  editable?: boolean;
  setTitle?: (v: string) => void;
  setDescription?: (v: string) => void;
}

export function OverviewPanel({
  title, description, constructs, indicators, hypotheses,
  responseCount, onNavigate, editable, setTitle, setDescription,
}: OverviewPanelProps) {
  const stats = [
    { label: '构念', value: constructs.length, accent: '#2eaadc' },
    { label: '测量题目', value: indicators.length, accent: '#46a046' },
    { label: '研究假设', value: hypotheses.length, accent: '#f08c28' },
    { label: '已收回复', value: responseCount, accent: '#9065b0' },
  ];

  return (
    <div className="animate-fade-in">
      {editable ? (
        <div className="mb-8">
          <input
            value={title}
            onChange={e => setTitle?.(e.target.value)}
            placeholder="输入项目标题..."
            className="text-2xl font-bold text-notion-text tracking-tight leading-tight bg-transparent focus:outline-none w-full placeholder:text-notion-text-tertiary border-b border-transparent focus:border-notion-border transition-colors pb-1"
          />
          <textarea
            value={description}
            onChange={e => setDescription?.(e.target.value)}
            placeholder="输入项目描述（研究背景、理论框架等）..."
            rows={2}
            className="text-[13px] text-notion-text-secondary mt-2 bg-transparent focus:outline-none w-full resize-none placeholder:text-notion-text-tertiary"
          />
        </div>
      ) : (
        <PageTitle sub={description}>{title}</PageTitle>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-notion-bg border border-notion-border rounded-lg p-4 group hover:border-notion-text-tertiary transition-colors">
            <p className="text-[11px] text-notion-text-tertiary font-medium uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: s.accent }}>{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-[15px] font-semibold text-notion-text mb-4">工作流程</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {([
          { step: 'research' as WorkflowStep, num: '1', label: '明确研究问题', desc: '定义构念、假设与理论框架' },
          { step: 'survey-design' as WorkflowStep, num: '2', label: '设计问卷', desc: '编辑李克特量表测量题目' },
          { step: 'suggestions' as WorkflowStep, num: '3', label: '补充建议', desc: '样本量、预测试与方法建议' },
          { step: 'publish' as WorkflowStep, num: '4', label: '发布问卷', desc: '生成分享链接收集数据' },
          { step: 'analysis' as WorkflowStep, num: '5', label: '数据分析', desc: 'PLS-SEM 结构方程模型' },
          { step: 'report' as WorkflowStep, num: '6', label: '研究报告', desc: '可视化结论与论文素材' },
        ]).map(item => (
          <button
            key={item.num}
            onClick={() => onNavigate(item.step)}
            className="flex items-start gap-3 p-3.5 rounded-lg text-left hover:bg-notion-bg-tertiary transition-colors group"
          >
            <span className="w-6 h-6 rounded bg-notion-bg-tertiary text-notion-text-secondary flex items-center justify-center text-[12px] font-semibold flex-shrink-0 group-hover:bg-notion-bg-hover">
              {item.num}
            </span>
            <div>
              <p className="text-[13px] font-medium text-notion-text">{item.label}</p>
              <p className="text-[12px] text-notion-text-tertiary mt-0.5">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
