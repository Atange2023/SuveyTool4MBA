import { Plus, Trash2, Eye } from 'lucide-react';
import { Badge } from '../shared/Badge';
import { PageTitle } from '../shared/PageTitle';
import { NextBtn } from '../shared/NextBtn';
import type { ExampleConstruct, ExampleIndicator } from '../../types/app';

interface SurveyDesignPanelProps {
  constructs: ExampleConstruct[];
  indicators: ExampleIndicator[];
  setIndicators: (v: ExampleIndicator[]) => void;
  onNext: () => void;
  surveyPreview: boolean;
  setSurveyPreview: (v: boolean) => void;
}

export function SurveyDesignPanel({
  constructs, indicators, setIndicators, onNext, surveyPreview, setSurveyPreview,
}: SurveyDesignPanelProps) {
  const cInds = (name: string) => indicators.filter(i => i.construct === name);

  if (surveyPreview) {
    return (
      <div className="animate-fade-in">
        <PageTitle right={
          <button onClick={() => setSurveyPreview(false)}
            className="px-3 py-1.5 border border-notion-border rounded text-[13px] text-notion-text-secondary hover:bg-notion-bg-tertiary transition-colors">
            返回编辑
          </button>
        }>问卷预览</PageTitle>
        <div className="border border-notion-border rounded-lg p-8 max-w-2xl">
          <div className="text-center mb-8 pb-4 border-b border-notion-border-light">
            <h3 className="text-lg font-bold text-notion-text">问卷调研</h3>
            <p className="text-[13px] text-notion-text-secondary mt-2">请根据实际感受选择最符合的选项</p>
            <p className="text-[11px] text-notion-text-tertiary mt-1">1=完全不同意 ... {indicators[0]?.scale_points || 7}=完全同意</p>
          </div>
          {constructs.map(c => (
            <div key={c.name} className="mb-8">
              <h4 className="text-[13px] font-semibold text-notion-text mb-3">{c.name}</h4>
              {cInds(c.name).map((ind, idx) => (
                <div key={ind.code} className="mb-5">
                  <p className="text-[13px] text-notion-text mb-2">{idx + 1}. {ind.question_text}</p>
                  <div className="flex justify-between px-1">
                    {Array.from({ length: ind.scale_points }, (_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border border-notion-border flex items-center justify-center text-[12px] text-notion-text-secondary hover:bg-notion-bg-tertiary transition-colors cursor-pointer">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageTitle sub="为每个构念设计李克特量表测量题目（建议每构念 3-5 题）" right={
        <div className="flex gap-2">
          <button onClick={() => setSurveyPreview(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-notion-border rounded text-[13px] text-notion-text-secondary hover:bg-notion-bg-tertiary transition-colors">
            <Eye className="w-3.5 h-3.5" /> 预览
          </button>
          <NextBtn onClick={onNext} />
        </div>
      }>问卷设计</PageTitle>

      <div className="space-y-8">
        {constructs.map(c => (
          <div key={c.name}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[15px] font-semibold text-notion-text">{c.name}</h3>
                <p className="text-[12px] text-notion-text-tertiary">{c.description} -- {cInds(c.name).length} 个题目</p>
              </div>
              <button onClick={() => {
                const code = `${c.name.slice(0, 2).toUpperCase()}_${Date.now().toString(36)}`;
                setIndicators([...indicators, { code, question_text: '', construct: c.name, scale_points: 7 }]);
              }} className="flex items-center gap-1 text-[12px] text-notion-text-secondary hover:text-notion-text transition-colors">
                <Plus className="w-3.5 h-3.5" /> 添加
              </button>
            </div>
            <div className="space-y-px">
              {cInds(c.name).map(ind => (
                <div key={ind.code} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-notion-bg-tertiary transition-colors group">
                  <Badge variant="neutral" size="sm">{ind.code}</Badge>
                  <input value={ind.question_text}
                    onChange={e => setIndicators(indicators.map(i => i.code === ind.code ? { ...i, question_text: e.target.value } : i))}
                    className="flex-1 text-[13px] bg-transparent focus:outline-none text-notion-text placeholder:text-notion-text-tertiary"
                    placeholder="请输入题目内容..." />
                  <span className="text-[11px] text-notion-text-tertiary">{ind.scale_points}点</span>
                  <button onClick={() => setIndicators(indicators.filter(i => i.code !== ind.code))}
                    className="p-1 text-notion-text-tertiary hover:text-danger-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
