import { useState } from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { Badge } from '../shared/Badge';
import { PageTitle } from '../shared/PageTitle';
import { NextBtn } from '../shared/NextBtn';
import type { Hypothesis } from '../../types';
import type { ExampleConstruct } from '../../types/app';

interface ResearchPanelProps {
  researchQuestion: string;
  setResearchQuestion: (v: string) => void;
  hypotheses: Hypothesis[];
  setHypotheses: (v: Hypothesis[]) => void;
  constructs: ExampleConstruct[];
  setConstructs: (v: ExampleConstruct[]) => void;
  onNext: () => void;
}

export function ResearchPanel({
  researchQuestion, setResearchQuestion,
  hypotheses, setHypotheses,
  constructs, setConstructs,
  onNext,
}: ResearchPanelProps) {
  const [tab, setTab] = useState<'question' | 'constructs' | 'hypotheses'>('question');
  const isReady = researchQuestion.length > 10 && constructs.length >= 2 && hypotheses.length >= 1;

  return (
    <div className="animate-fade-in">
      <PageTitle sub="定义研究问题、核心构念和研究假设" right={<NextBtn onClick={onNext} disabled={!isReady} />}>
        明确研究问题
      </PageTitle>

      <div className="flex gap-px mb-6 border-b border-notion-border-light">
        {([['question', '研究问题'], ['constructs', '核心构念'], ['hypotheses', '研究假设']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-notion-text text-notion-text'
                : 'border-transparent text-notion-text-tertiary hover:text-notion-text-secondary'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'question' && (
        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-notion-text mb-2">核心研究问题</label>
            <textarea value={researchQuestion} onChange={e => setResearchQuestion(e.target.value)}
              rows={3}
              className="w-full border border-notion-border rounded-md px-3 py-2.5 text-[14px] text-notion-text bg-notion-bg placeholder:text-notion-text-tertiary focus:outline-none focus:ring-2 focus:ring-notion-accent/30 focus:border-notion-accent resize-none transition-colors" />
          </div>
          <div className="p-4 bg-[#fbf3db] rounded-md">
            <p className="text-[12px] font-semibold text-[#7f5b1d] mb-2">学术规范提示</p>
            <ul className="text-[12px] text-[#9a7032] space-y-1 leading-relaxed">
              <li>- 研究问题应具有可检验性，能通过实证数据回答</li>
              <li>- 需要有明确的理论基础（如TAM、TPB、UTAUT等）</li>
              <li>- 自变量与因变量应清晰可辨</li>
              <li>- 建议先进行文献综述以确保研究的创新性和理论贡献</li>
            </ul>
          </div>
        </div>
      )}

      {tab === 'constructs' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[12px] text-notion-text-secondary">PLS-SEM 中的潜变量，每个构念需 3 个以上测量指标</p>
            <button onClick={() => setConstructs([...constructs, { name: '新构念', description: '', type: 'reflective' }])}
              className="flex items-center gap-1 text-[12px] text-notion-text-secondary hover:text-notion-text font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" /> 添加
            </button>
          </div>
          <div className="space-y-2">
            {constructs.map((c, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-md hover:bg-notion-bg-tertiary transition-colors group">
                <span className="w-5 h-5 rounded bg-notion-bg-tertiary text-notion-text-tertiary flex items-center justify-center text-[11px] font-semibold mt-0.5 flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <input value={c.name}
                    onChange={e => { const n = [...constructs]; n[idx] = { ...n[idx], name: e.target.value }; setConstructs(n); }}
                    className="text-[14px] font-medium text-notion-text bg-transparent focus:outline-none w-full placeholder:text-notion-text-tertiary" />
                  <input value={c.description}
                    onChange={e => { const n = [...constructs]; n[idx] = { ...n[idx], description: e.target.value }; setConstructs(n); }}
                    className="text-[12px] text-notion-text-secondary bg-transparent focus:outline-none w-full mt-0.5 placeholder:text-notion-text-tertiary"
                    placeholder="描述..." />
                  <Badge variant="info" size="sm">{c.type === 'reflective' ? '反映型' : '形成型'}</Badge>
                </div>
                <button onClick={() => setConstructs(constructs.filter((_, i) => i !== idx))}
                  className="p-1 text-notion-text-tertiary hover:text-danger-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'hypotheses' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[12px] text-notion-text-secondary">基于理论框架提出的可检验假设</p>
            <button onClick={() => setHypotheses([...hypotheses, {
              id: `H${hypotheses.length + 1}`, label: `H${hypotheses.length + 1}`,
              from: constructs[0]?.name || '', to: constructs[1]?.name || '', description: ''
            }])}
              className="flex items-center gap-1 text-[12px] text-notion-text-secondary hover:text-notion-text font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" /> 添加
            </button>
          </div>
          <div className="space-y-2">
            {hypotheses.map((h, idx) => (
              <div key={idx} className="p-3 rounded-md hover:bg-notion-bg-tertiary transition-colors group">
                <div className="flex items-center gap-2.5">
                  <Badge variant="info" size="sm">{h.label}</Badge>
                  <select value={h.from}
                    onChange={e => { const n = [...hypotheses]; n[idx] = { ...n[idx], from: e.target.value }; setHypotheses(n); }}
                    className="border border-notion-border rounded px-2 py-1 text-[12px] bg-notion-bg text-notion-text">
                    {constructs.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  <ArrowRight className="w-3.5 h-3.5 text-notion-text-tertiary flex-shrink-0" />
                  <select value={h.to}
                    onChange={e => { const n = [...hypotheses]; n[idx] = { ...n[idx], to: e.target.value }; setHypotheses(n); }}
                    className="border border-notion-border rounded px-2 py-1 text-[12px] bg-notion-bg text-notion-text">
                    {constructs.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  <button onClick={() => setHypotheses(hypotheses.filter((_, i) => i !== idx))}
                    className="ml-auto p-1 text-notion-text-tertiary hover:text-danger-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input value={h.description}
                  onChange={e => { const n = [...hypotheses]; n[idx] = { ...n[idx], description: e.target.value }; setHypotheses(n); }}
                  className="mt-1.5 w-full text-[12px] text-notion-text-secondary bg-transparent focus:outline-none placeholder:text-notion-text-tertiary"
                  placeholder="假设描述..." />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
