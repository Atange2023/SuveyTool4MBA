import { useState, useMemo, useCallback } from 'react';
import { ChartBar as BarChart3, FileText, ClipboardList, Lightbulb, Share2, TrendingUp, ChartBar as FileBarChart, ChevronRight, CircleCheck as CheckCircle2, Circle, Plus, Trash2, Eye, Copy, ArrowRight, Hop as Home } from 'lucide-react';
import { Card } from './components/shared/Card';
import { Badge } from './components/shared/Badge';
import { MetricCard } from './components/shared/MetricCard';
import { PathDiagram } from './components/analysis/PathDiagram';
import { ReportCharts } from './components/report/ReportCharts';
import { HomePage } from './components/HomePage';
import { runFullAnalysis } from './lib/pls-sem';
import type { FullAnalysisResult, ModelConfig } from './lib/pls-sem/types';
import type { WorkflowStep, Hypothesis } from './types';
import {
  EXAMPLE_PROJECT, EXAMPLE_CONSTRUCTS, EXAMPLE_INDICATORS,
  getExampleModelConfig, generateExampleData,
} from './data/example';

type AppView = 'home' | 'example' | 'new-project';

const STEPS: { key: WorkflowStep; label: string; icon: typeof BarChart3 }[] = [
  { key: 'overview', label: '项目总览', icon: BarChart3 },
  { key: 'research', label: '研究问题', icon: FileText },
  { key: 'survey-design', label: '问卷设计', icon: ClipboardList },
  { key: 'suggestions', label: '补充建议', icon: Lightbulb },
  { key: 'publish', label: '发布问卷', icon: Share2 },
  { key: 'analysis', label: '数据分析', icon: TrendingUp },
  { key: 'report', label: '研究报告', icon: FileBarChart },
];

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [step, setStep] = useState<WorkflowStep>('overview');
  const [title, setTitle] = useState(EXAMPLE_PROJECT.title);
  const [description, setDescription] = useState(EXAMPLE_PROJECT.description);
  const [researchQuestion, setResearchQuestion] = useState(EXAMPLE_PROJECT.research_question);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>(EXAMPLE_PROJECT.hypotheses);
  const [constructs, setConstructs] = useState(EXAMPLE_CONSTRUCTS);
  const [indicators, setIndicators] = useState(EXAMPLE_INDICATORS);
  const [surveyActive, setSurveyActive] = useState(false);
  const [surveyPreview, setSurveyPreview] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FullAnalysisResult | null>(null);
  const [analysisTab, setAnalysisTab] = useState<'desc' | 'reliability' | 'validity' | 'structural' | 'bootstrap'>('desc');
  const [analyzing, setAnalyzing] = useState(false);
  const [responseCount, setResponseCount] = useState(150);
  const [deadline, setDeadline] = useState('2026-05-01');
  const [copied, setCopied] = useState(false);

  const isNewProject = view === 'new-project';

  const modelConfig = useMemo<ModelConfig>(() => {
    if (constructs.length === 0) return { constructs: [], paths: [] };
    let idx = 0;
    const configConstructs = constructs.map(c => {
      const matching = indicators.filter(ind => ind.construct === c.name);
      const indices = matching.map((_, i) => idx + i);
      idx += matching.length;
      return { name: c.name, type: c.type, indicatorIndices: indices };
    });
    const paths = hypotheses.map(h => ({ from: h.from, to: h.to }));
    return { constructs: configConstructs, paths };
  }, [constructs, indicators, hypotheses]);

  const exampleData = useMemo(() => generateExampleData(150), []);

  const resetToBlank = useCallback(() => {
    setTitle('');
    setDescription('');
    setResearchQuestion('');
    setHypotheses([]);
    setConstructs([]);
    setIndicators([]);
    setSurveyActive(false);
    setSurveyPreview(false);
    setAnalysisResult(null);
    setAnalysisTab('desc');
    setResponseCount(0);
    setStep('overview');
  }, []);

  const restoreExample = useCallback(() => {
    setTitle(EXAMPLE_PROJECT.title);
    setDescription(EXAMPLE_PROJECT.description);
    setResearchQuestion(EXAMPLE_PROJECT.research_question);
    setHypotheses(EXAMPLE_PROJECT.hypotheses);
    setConstructs(EXAMPLE_CONSTRUCTS);
    setIndicators(EXAMPLE_INDICATORS);
    setAnalysisResult(null);
    setSurveyActive(false);
    setResponseCount(150);
    setStep('overview');
  }, []);

  const runAnalysis = useCallback(() => {
    setAnalyzing(true);
    setTimeout(() => {
      const result = runFullAnalysis(exampleData, modelConfig, 500);
      setAnalysisResult(result);
      setAnalyzing(false);
      setStep('analysis');
    }, 100);
  }, [exampleData, modelConfig]);

  if (view === 'home') {
    return (
      <HomePage
        onOpenExample={() => { restoreExample(); setView('example'); }}
        onCreateNew={() => { resetToBlank(); setView('new-project'); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-notion-bg flex">
      {/* Sidebar */}
      <aside className="w-60 bg-notion-bg-secondary flex-shrink-0 hidden lg:flex flex-col border-r border-notion-border-light">
        <div className="h-12 flex items-center px-4 mt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-notion-text rounded flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-notion-text tracking-tight">量研通</span>
          </div>
        </div>

        <button onClick={() => setView('home')} className="mx-2 mt-2 flex items-center gap-2 px-2 py-1.5 rounded text-[12px] text-notion-text-secondary hover:bg-notion-bg-hover/60 transition-colors">
          <Home className="w-3.5 h-3.5" /> 返回首页
        </button>

        <div className="px-2 mt-2">
          <p className="px-2 py-1 text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wider">工作流</p>
        </div>

        <nav className="flex-1 px-2 py-1 space-y-px">
          {STEPS.map((s, idx) => {
            const active = step === s.key;
            const Icon = s.icon;
            const stepDone = idx < STEPS.findIndex(x => x.key === step);
            return (
              <button
                key={s.key}
                onClick={() => setStep(s.key)}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded text-[13px] transition-colors ${
                  active
                    ? 'bg-notion-bg-hover text-notion-text font-medium'
                    : 'text-notion-text-secondary hover:bg-notion-bg-hover/60'
                }`}
              >
                {stepDone ? (
                  <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0" />
                ) : active ? (
                  <Icon className="w-4 h-4 text-notion-text flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-notion-text-tertiary flex-shrink-0" />
                )}
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-notion-border-light">
          <div className="px-2 py-2 bg-notion-bg-tertiary rounded">
            <p className="text-[11px] font-medium text-notion-text-secondary">
              {isNewProject ? '我的项目' : '示例项目'}
            </p>
            <p className="text-[11px] text-notion-text-tertiary mt-0.5 leading-snug">
              {title || '未命名项目'}
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <header className="h-11 flex items-center px-4 lg:px-8 border-b border-notion-border-light sticky top-0 z-10 bg-notion-bg/95 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="text-notion-text-secondary">{title || '未命名项目'}</span>
            <ChevronRight className="w-3 h-3 text-notion-text-tertiary" />
            <span className="text-notion-text font-medium">{STEPS.find(s => s.key === step)?.label}</span>
          </div>
        </header>

        <div className="px-4 lg:px-16 xl:px-24 py-8 max-w-5xl">
          {step === 'overview' && <OverviewPanel
            title={title} description={description} constructs={constructs}
            indicators={indicators} hypotheses={hypotheses}
            responseCount={responseCount} onNavigate={setStep}
            editable={isNewProject} setTitle={setTitle} setDescription={setDescription}
          />}
          {step === 'research' && <ResearchPanel
            researchQuestion={researchQuestion} setResearchQuestion={setResearchQuestion}
            hypotheses={hypotheses} setHypotheses={setHypotheses}
            constructs={constructs} setConstructs={setConstructs}
            onNext={() => setStep('survey-design')}
          />}
          {step === 'survey-design' && <SurveyDesignPanel
            constructs={constructs} indicators={indicators} setIndicators={setIndicators}
            onNext={() => setStep('suggestions')} surveyPreview={surveyPreview}
            setSurveyPreview={setSurveyPreview}
          />}
          {step === 'suggestions' && <SuggestionsPanel
            researchQuestion={researchQuestion} constructs={constructs}
            hypotheses={hypotheses} indicatorCount={indicators.length}
            onNext={() => setStep('publish')}
          />}
          {step === 'publish' && <PublishPanel
            surveyActive={surveyActive} setSurveyActive={setSurveyActive}
            deadline={deadline} setDeadline={setDeadline}
            responseCount={responseCount} onAnalyze={runAnalysis}
            copied={copied} setCopied={setCopied}
            canAnalyze={responseCount > 0 && constructs.length >= 2}
          />}
          {step === 'analysis' && <AnalysisPanel
            result={analysisResult} modelConfig={modelConfig}
            indicators={indicators}
            analysisTab={analysisTab} setAnalysisTab={setAnalysisTab}
            analyzing={analyzing} onRun={runAnalysis}
            onReport={() => setStep('report')}
          />}
          {step === 'report' && <ReportPanel
            result={analysisResult} modelConfig={modelConfig}
            title={title} researchQuestion={researchQuestion}
            hypotheses={hypotheses}
          />}
        </div>
      </main>
    </div>
  );
}

/* ─────────── Page title helper ─────────── */
function PageTitle({ children, sub, right }: { children: React.ReactNode; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-notion-text tracking-tight leading-tight">{children}</h1>
        {sub && <p className="text-[13px] text-notion-text-secondary mt-1">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function NextBtn({ onClick, label = '下一步', disabled }: { onClick: () => void; label?: string; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-notion-text text-white rounded text-[13px] font-medium hover:bg-notion-text/90 disabled:opacity-30 transition-colors">
      {label} <ArrowRight className="w-3.5 h-3.5" />
    </button>
  );
}

/* ─────────── Overview ─────────── */
function OverviewPanel({ title, description, constructs, indicators, hypotheses, responseCount, onNavigate, editable, setTitle, setDescription }: {
  title: string; description: string; constructs: typeof EXAMPLE_CONSTRUCTS;
  indicators: typeof EXAMPLE_INDICATORS; hypotheses: Hypothesis[];
  responseCount: number; onNavigate: (s: WorkflowStep) => void;
  editable?: boolean; setTitle?: (v: string) => void; setDescription?: (v: string) => void;
}) {
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
        {[
          { step: 'research' as WorkflowStep, num: '1', label: '明确研究问题', desc: '定义构念、假设与理论框架' },
          { step: 'survey-design' as WorkflowStep, num: '2', label: '设计问卷', desc: '编辑李克特量表测量题目' },
          { step: 'suggestions' as WorkflowStep, num: '3', label: '补充建议', desc: '样本量、预测试与方法建议' },
          { step: 'publish' as WorkflowStep, num: '4', label: '发布问卷', desc: '生成分享链接收集数据' },
          { step: 'analysis' as WorkflowStep, num: '5', label: '数据分析', desc: 'PLS-SEM 结构方程模型' },
          { step: 'report' as WorkflowStep, num: '6', label: '研究报告', desc: '可视化结论与论文素材' },
        ].map(item => (
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

/* ─────────── Research ─────────── */
function ResearchPanel({ researchQuestion, setResearchQuestion, hypotheses, setHypotheses, constructs, setConstructs, onNext }: {
  researchQuestion: string; setResearchQuestion: (v: string) => void;
  hypotheses: Hypothesis[]; setHypotheses: (v: Hypothesis[]) => void;
  constructs: typeof EXAMPLE_CONSTRUCTS; setConstructs: (v: typeof EXAMPLE_CONSTRUCTS) => void;
  onNext: () => void;
}) {
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

/* ─────────── Survey Design ─────────── */
function SurveyDesignPanel({ constructs, indicators, setIndicators, onNext, surveyPreview, setSurveyPreview }: {
  constructs: typeof EXAMPLE_CONSTRUCTS; indicators: typeof EXAMPLE_INDICATORS;
  setIndicators: (v: typeof EXAMPLE_INDICATORS) => void;
  onNext: () => void; surveyPreview: boolean; setSurveyPreview: (v: boolean) => void;
}) {
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
            <h3 className="text-lg font-bold text-notion-text">OpenClaw 使用情况与 AI Agent 态度调研</h3>
            <p className="text-[13px] text-notion-text-secondary mt-2">请根据实际感受选择最符合的选项</p>
            <p className="text-[11px] text-notion-text-tertiary mt-1">1=完全不同意 ... 7=完全同意</p>
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
                const code = `NEW${cInds(c.name).length + 1}`;
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

/* ─────────── Suggestions ─────────── */
function SuggestionsPanel({ researchQuestion, constructs, hypotheses, indicatorCount, onNext }: {
  researchQuestion: string; constructs: typeof EXAMPLE_CONSTRUCTS;
  hypotheses: Hypothesis[]; indicatorCount: number; onNext: () => void;
}) {
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

/* ─────────── Publish ─────────── */
function PublishPanel({ surveyActive, setSurveyActive, deadline, setDeadline, responseCount, onAnalyze, copied, setCopied, canAnalyze = true }: {
  surveyActive: boolean; setSurveyActive: (v: boolean) => void;
  deadline: string; setDeadline: (v: string) => void;
  responseCount: number;
  onAnalyze: () => void; copied: boolean; setCopied: (v: boolean) => void;
  canAnalyze?: boolean;
}) {
  const shareUrl = `${window.location.origin}/survey/abc123`;

  return (
    <div className="animate-fade-in">
      <PageTitle sub="生成分享链接，收集调研对象的回复" right={<NextBtn onClick={onAnalyze} label="数据分析" disabled={!canAnalyze} />}>
        发布与收集
      </PageTitle>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="问卷设置">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-notion-text">问卷状态</p>
                <p className="text-[11px] text-notion-text-tertiary">开启后可接收回复</p>
              </div>
              <button onClick={() => setSurveyActive(!surveyActive)}
                className={`relative w-10 h-5 rounded-full transition-colors ${surveyActive ? 'bg-success-500' : 'bg-notion-bg-hover'}`}>
                <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform shadow-sm ${surveyActive ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-notion-text mb-1.5">截止日期</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                className="w-full border border-notion-border rounded-md px-3 py-2 text-[13px] text-notion-text bg-notion-bg focus:outline-none focus:ring-2 focus:ring-notion-accent/30 focus:border-notion-accent transition-colors" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-notion-text mb-1.5">分享链接</label>
              <div className="flex gap-2">
                <input readOnly value={shareUrl}
                  className="flex-1 border border-notion-border rounded-md px-3 py-2 text-[13px] bg-notion-bg-secondary text-notion-text-secondary" />
                <button onClick={() => { navigator.clipboard.writeText(shareUrl).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-1.5 px-3 py-2 border border-notion-border rounded-md text-[13px] text-notion-text-secondary hover:bg-notion-bg-tertiary transition-colors">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-success-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="收集进度">
          <div className="space-y-5">
            <div className="text-center py-3">
              <p className="text-4xl font-bold text-notion-text tracking-tight">{responseCount}</p>
              <p className="text-[12px] text-notion-text-tertiary mt-1">已收集有效回复</p>
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-notion-text-tertiary mb-1.5">
                <span>进度</span>
                <span>{responseCount} / 1000</span>
              </div>
              <div className="h-1.5 bg-notion-bg-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-notion-accent rounded-full transition-all" style={{ width: `${(responseCount / 1000) * 100}%` }} />
              </div>
            </div>
            <div className="p-3 bg-[#dbeddb] rounded-md">
              <p className="text-[12px] text-[#2b593f] font-medium">数据已达到最低样本量要求，可进入分析</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─────────── Analysis ─────────── */
function AnalysisPanel({ result, modelConfig, indicators, analysisTab, setAnalysisTab, analyzing, onRun, onReport }: {
  result: FullAnalysisResult | null; modelConfig: ModelConfig;
  indicators: typeof EXAMPLE_INDICATORS;
  analysisTab: string; setAnalysisTab: (v: 'desc' | 'reliability' | 'validity' | 'structural' | 'bootstrap') => void;
  analyzing: boolean; onRun: () => void; onReport: () => void;
}) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="w-14 h-14 bg-notion-bg-tertiary rounded-xl flex items-center justify-center mb-5">
          <TrendingUp className="w-7 h-7 text-notion-text-tertiary" />
        </div>
        <h3 className="text-lg font-bold text-notion-text mb-1.5">准备进行数据分析</h3>
        <p className="text-[13px] text-notion-text-secondary mb-6 text-center max-w-sm leading-relaxed">
          已收集 150 份有效问卷，将运行 PLS-SEM 分析，包含信度、效度、路径和 Bootstrap 检验。
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

      {analysisTab === 'desc' && (
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
      )}

      {analysisTab === 'reliability' && (
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
      )}

      {analysisTab === 'validity' && (
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
      )}

      {analysisTab === 'structural' && (
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
                      <td className="py-2 px-3 text-[12px] text-notion-text-secondary">{p.from} → {p.to}</td>
                      <td className="py-2 px-3 text-right font-mono text-[12px] font-medium">{(result.pls.pathCoefficients[p.to]?.[p.from] ?? 0).toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card title="R² 与 f²">
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-medium text-notion-text-tertiary mb-2 uppercase tracking-wider">R² (0.75 强 / 0.50 中 / 0.25 弱)</p>
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
                  <p className="text-[11px] font-medium text-notion-text-tertiary mb-2 uppercase tracking-wider">f² (0.35 大 / 0.15 中 / 0.02 小)</p>
                  {Object.entries(result.pls.fSquared).flatMap(([endo, preds]) =>
                    Object.entries(preds).map(([pred, f2]) => (
                      <div key={`${pred}-${endo}`} className="flex items-center justify-between py-1 text-[12px]">
                        <span className="text-notion-text-secondary">{pred} → {endo}</span>
                        <span className={`font-mono font-medium ${f2 >= 0.35 ? 'text-success-600' : f2 >= 0.15 ? 'text-notion-accent' : f2 >= 0.02 ? 'text-warning-600' : 'text-notion-text-tertiary'}`}>{f2.toFixed(3)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {analysisTab === 'bootstrap' && (
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
                      <td className="py-2.5 px-3 text-[12px] text-notion-text-secondary">{p.from} → {p.to}</td>
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
      )}
    </div>
  );
}

/* ─────────── Report ─────────── */
function ReportPanel({ result, modelConfig, title, researchQuestion, hypotheses }: {
  result: FullAnalysisResult | null; modelConfig: ModelConfig;
  title: string; researchQuestion: string; hypotheses: Hypothesis[];
}) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-[13px] text-notion-text-tertiary">请先完成数据分析</p>
      </div>
    );
  }

  const allPass = modelConfig.constructs.every(c =>
    (result.reliability.cronbachAlpha[c.name] ?? 0) >= 0.7 &&
    (result.reliability.compositeReliability[c.name] ?? 0) >= 0.7 &&
    (result.reliability.ave[c.name] ?? 0) >= 0.5
  );

  return (
    <div className="animate-fade-in">
      <PageTitle sub="可视化分析结果与研究结论">研究报告</PageTitle>

      <div className="space-y-6">
        <Card title="研究概览">
          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-notion-text-tertiary font-medium uppercase tracking-wider">课题</p>
              <p className="text-[14px] text-notion-text mt-0.5">{title}</p>
            </div>
            <div>
              <p className="text-[11px] text-notion-text-tertiary font-medium uppercase tracking-wider">研究问题</p>
              <p className="text-[14px] text-notion-text mt-0.5">{researchQuestion}</p>
            </div>
            <div className="grid grid-cols-4 gap-3 pt-2">
              {[
                { v: result.descriptive.n, l: '有效样本' },
                { v: modelConfig.constructs.length, l: '构念' },
                { v: modelConfig.paths.length, l: '路径' },
                { v: result.bootstrap.nSamples, l: 'Bootstrap' },
              ].map(s => (
                <div key={s.l} className="text-center p-3 bg-notion-bg-tertiary rounded-md">
                  <p className="text-xl font-bold text-notion-text tracking-tight">{s.v}</p>
                  <p className="text-[11px] text-notion-text-tertiary">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="测量模型评估">
          <div className="space-y-3">
            <div className={`p-3.5 rounded-md ${allPass ? 'bg-[#dbeddb]' : 'bg-[#fdecc8]'}`}>
              <p className={`text-[13px] font-medium ${allPass ? 'text-[#2b593f]' : 'text-[#7f5b1d]'}`}>
                {allPass ? '所有构念的信度和效度指标均通过阈值检验' : '部分构念的信度或效度指标未达标'}
              </p>
            </div>
            <p className="text-[13px] text-notion-text-secondary leading-relaxed">
              本研究使用 PLS-SEM 方法进行数据分析。信度方面，所有构念的 Cronbach's Alpha 值和组合信度 (CR)
              均{allPass ? '超过' : '部分接近'} 0.70 的推荐阈值，表明测量工具具有{allPass ? '良好' : '可接受'}的内部一致性。
              各构念的平均提取方差 (AVE) {allPass ? '均大于 0.50' : '基本满足 0.50'}，说明潜变量对其指标的解释力{allPass ? '充足' : '尚可'}。
            </p>
          </div>
        </Card>

        <Card title="分析图表">
          <ReportCharts result={result} modelConfig={modelConfig} />
        </Card>

        <Card title="结构模型与路径图">
          <PathDiagram result={result} modelConfig={modelConfig} />
        </Card>

        <Card title="假设检验结果">
          <div className="space-y-2">
            {hypotheses.map(h => {
              const s = result.bootstrap.pathCoefficients[h.to]?.[h.from];
              const ok = s?.significant ?? false;
              const coef = result.pls.pathCoefficients[h.to]?.[h.from] ?? 0;
              return (
                <div key={h.id} className={`p-3.5 rounded-md ${ok ? 'bg-[#dbeddb]' : 'bg-notion-bg-tertiary'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Badge variant={ok ? 'success' : 'neutral'} size="sm">{h.label}</Badge>
                      <span className="text-[13px] text-notion-text">{h.description}</span>
                    </div>
                    <Badge variant={ok ? 'success' : 'danger'} size="sm">{ok ? '支持' : '不支持'}</Badge>
                  </div>
                  <p className="text-[11px] text-notion-text-tertiary mt-1.5">
                    路径系数 = {coef.toFixed(3)}{s && `, T = ${s.tValue.toFixed(3)}, p = ${s.pValue.toFixed(3)}`}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="研究结论">
          <div className="text-[13px] text-notion-text-secondary leading-[1.8] space-y-3">
            <p>
              本研究基于技术接受模型 (TAM) 框架，以 {result.descriptive.n} 名受访者为样本，
              采用 PLS-SEM 分析了用户对 OpenClaw 平台 AI Agent 数字员工的采纳态度和使用意愿。
            </p>
            <p>
              在 {hypotheses.length} 个研究假设中，
              有 {hypotheses.filter(h => result.bootstrap.pathCoefficients[h.to]?.[h.from]?.significant).length} 个假设得到了实证支持。
              {(() => {
                const r2 = result.pls.rSquared['使用意愿'];
                return r2 !== undefined
                  ? `模型对"使用意愿"的 R² 为 ${(r2 * 100).toFixed(1)}%，具有${r2 > 0.5 ? '较强' : r2 > 0.25 ? '中等' : '较弱'}解释力。`
                  : '';
              })()}
            </p>
            <p>
              {(() => {
                const sig = hypotheses.filter(h => result.bootstrap.pathCoefficients[h.to]?.[h.from]?.significant);
                if (sig.length > 0) {
                  const top = sig.reduce((a, b) =>
                    Math.abs(result.pls.pathCoefficients[a.to]?.[a.from] ?? 0) > Math.abs(result.pls.pathCoefficients[b.to]?.[b.from] ?? 0) ? a : b
                  );
                  return `其中"${top.from}"对"${top.to}"的影响最为显著 (${top.label})，与既有文献的核心发现一致。`;
                }
                return '';
              })()}
              研究结果为理解 AI Agent 技术在组织中的采纳机制提供了实证依据。
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

