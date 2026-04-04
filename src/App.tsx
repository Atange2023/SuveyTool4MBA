import { useState, useMemo, useCallback } from 'react';
import { ChartBar as BarChart3, FileText, ClipboardList, Lightbulb, Share2, TrendingUp, ChartBar as FileBarChart, ChevronRight, CircleCheck as CheckCircle2, Circle, Plus, Trash2, Eye, ExternalLink, Copy, ArrowRight } from 'lucide-react';
import { Card } from './components/shared/Card';
import { Badge } from './components/shared/Badge';
import { MetricCard } from './components/shared/MetricCard';
import { PathDiagram } from './components/analysis/PathDiagram';
import { ReportCharts } from './components/report/ReportCharts';
import { runFullAnalysis } from './lib/pls-sem';
import type { FullAnalysisResult, ModelConfig } from './lib/pls-sem/types';
import type { WorkflowStep, Hypothesis } from './types';
import {
  EXAMPLE_PROJECT, EXAMPLE_CONSTRUCTS, EXAMPLE_INDICATORS,
  getExampleModelConfig, generateExampleData,
} from './data/example';

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
  const [responseCount] = useState(150);
  const [deadline, setDeadline] = useState('2026-05-01');
  const [copied, setCopied] = useState(false);

  const modelConfig = useMemo(() => getExampleModelConfig(), []);
  const exampleData = useMemo(() => generateExampleData(150), []);

  const runAnalysis = useCallback(() => {
    setAnalyzing(true);
    setTimeout(() => {
      const result = runFullAnalysis(exampleData, modelConfig, 500);
      setAnalysisResult(result);
      setAnalyzing(false);
      setStep('analysis');
    }, 100);
  }, [exampleData, modelConfig]);

  const constructIndicators = (constructName: string) =>
    indicators.filter(ind => ind.construct === constructName);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden lg:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900">量研通</span>
              <span className="text-xs text-gray-400 block leading-tight">PLS-SEM</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {STEPS.map((s, idx) => {
            const active = step === s.key;
            const Icon = s.icon;
            const stepDone = idx < STEPS.findIndex(x => x.key === step);
            return (
              <button
                key={s.key}
                onClick={() => setStep(s.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {stepDone ? (
                  <CheckCircle2 className="w-4 h-4 text-success-500" />
                ) : active ? (
                  <Icon className="w-4 h-4 text-primary-600" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300" />
                )}
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium">示例项目</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
              OpenClaw AI Agent调研
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-900">{title}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-600">{STEPS.find(s => s.key === step)?.label}</span>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto">
          {step === 'overview' && <OverviewPanel
            title={title} description={description} constructs={constructs}
            indicators={indicators} hypotheses={hypotheses}
            responseCount={responseCount} onNavigate={setStep}
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
            responseCount={responseCount} title={title}
            onAnalyze={runAnalysis} copied={copied} setCopied={setCopied}
          />}
          {step === 'analysis' && <AnalysisPanel
            result={analysisResult} modelConfig={modelConfig}
            indicators={indicators} constructs={constructs}
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

function OverviewPanel({ title, description, constructs, indicators, hypotheses, responseCount, onNavigate }: {
  title: string; description: string; constructs: typeof EXAMPLE_CONSTRUCTS;
  indicators: typeof EXAMPLE_INDICATORS; hypotheses: Hypothesis[];
  responseCount: number; onNavigate: (s: WorkflowStep) => void;
}) {
  const stats = [
    { label: '构念数', value: constructs.length, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: '测量题目', value: indicators.length, color: 'text-secondary-600', bg: 'bg-secondary-50' },
    { label: '研究假设', value: hypotheses.length, color: 'text-accent-600', bg: 'bg-accent-50' },
    { label: '已收回复', value: responseCount, color: 'text-success-600', bg: 'bg-success-50' },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-3xl">{description}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <Card title="快速开始" subtitle="按照以下工作流完成问卷调研与数据分析">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { step: 'research' as WorkflowStep, num: '1', label: '明确研究问题', desc: '定义构念和假设' },
            { step: 'survey-design' as WorkflowStep, num: '2', label: '设计问卷', desc: '编辑李克特量表题目' },
            { step: 'suggestions' as WorkflowStep, num: '3', label: '补充建议', desc: '样本量和预测试建议' },
            { step: 'publish' as WorkflowStep, num: '4', label: '发布问卷', desc: '生成分享链接收集数据' },
            { step: 'analysis' as WorkflowStep, num: '5', label: '数据分析', desc: 'PLS-SEM结构方程模型' },
            { step: 'report' as WorkflowStep, num: '6', label: '研究报告', desc: '可视化结论输出' },
          ].map(item => (
            <button
              key={item.num}
              onClick={() => onNavigate(item.step)}
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                {item.num}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ResearchPanel({ researchQuestion, setResearchQuestion, hypotheses, setHypotheses, constructs, setConstructs, onNext }: {
  researchQuestion: string; setResearchQuestion: (v: string) => void;
  hypotheses: Hypothesis[]; setHypotheses: (v: Hypothesis[]) => void;
  constructs: typeof EXAMPLE_CONSTRUCTS; setConstructs: (v: typeof EXAMPLE_CONSTRUCTS) => void;
  onNext: () => void;
}) {
  const [tab, setTab] = useState<'question' | 'constructs' | 'hypotheses'>('question');

  const isReady = researchQuestion.length > 10 && constructs.length >= 2 && hypotheses.length >= 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">第一步：明确研究问题</h2>
          <p className="text-sm text-gray-500 mt-1">定义研究问题、核心构念和研究假设</p>
        </div>
        <button onClick={onNext} disabled={!isReady}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-40 transition-colors">
          下一步 <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {([['question', '研究问题'], ['constructs', '核心构念'], ['hypotheses', '研究假设']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'question' && (
        <Card title="研究问题" subtitle="清晰的研究问题是高质量定量研究的基础">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">核心研究问题</label>
              <textarea value={researchQuestion} onChange={e => setResearchQuestion(e.target.value)}
                rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" />
            </div>
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
              <p className="text-xs font-medium text-primary-700 mb-2">学术规范提示</p>
              <ul className="text-xs text-primary-600 space-y-1">
                <li>- 研究问题应具有可检验性，能通过实证数据回答</li>
                <li>- 需要有明确的理论基础（如TAM、TPB、UTAUT等）</li>
                <li>- 自变量与因变量应清晰可辨</li>
                <li>- 建议先进行文献综述以确保研究的创新性和理论贡献</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {tab === 'constructs' && (
        <Card title="核心构念（潜变量）" subtitle="PLS-SEM中的潜变量，每个构念需3个以上测量指标"
          action={
            <button onClick={() => setConstructs([...constructs, { name: '新构念', description: '', type: 'reflective' }])}
              className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium">
              <Plus className="w-3.5 h-3.5" /> 添加构念
            </button>
          }>
          <div className="space-y-3">
            {constructs.map((c, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg group">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <input value={c.name}
                    onChange={e => {
                      const n = [...constructs]; n[idx] = { ...n[idx], name: e.target.value }; setConstructs(n);
                    }}
                    className="text-sm font-medium text-gray-900 bg-transparent border-b border-transparent focus:border-primary-300 focus:outline-none w-full" />
                  <input value={c.description}
                    onChange={e => {
                      const n = [...constructs]; n[idx] = { ...n[idx], description: e.target.value }; setConstructs(n);
                    }}
                    className="text-xs text-gray-500 bg-transparent border-b border-transparent focus:border-primary-300 focus:outline-none w-full"
                    placeholder="构念描述..." />
                  <div className="flex gap-2">
                    <Badge variant={c.type === 'reflective' ? 'info' : 'warning'} size="sm">
                      {c.type === 'reflective' ? '反映型' : '形成型'}
                    </Badge>
                  </div>
                </div>
                <button onClick={() => setConstructs(constructs.filter((_, i) => i !== idx))}
                  className="p-1 text-gray-300 hover:text-danger-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'hypotheses' && (
        <Card title="研究假设" subtitle="基于理论框架提出的可检验假设"
          action={
            <button onClick={() => setHypotheses([...hypotheses, {
              id: `H${hypotheses.length + 1}`, label: `H${hypotheses.length + 1}`,
              from: constructs[0]?.name || '', to: constructs[1]?.name || '', description: ''
            }])}
              className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium">
              <Plus className="w-3.5 h-3.5" /> 添加假设
            </button>
          }>
          <div className="space-y-3">
            {hypotheses.map((h, idx) => (
              <div key={idx} className="p-4 border border-gray-100 rounded-lg group hover:border-primary-200 transition-colors">
                <div className="flex items-center gap-3">
                  <Badge variant="info" size="sm">{h.label}</Badge>
                  <div className="flex items-center gap-2 text-sm text-gray-700 flex-1">
                    <select value={h.from}
                      onChange={e => { const n = [...hypotheses]; n[idx] = { ...n[idx], from: e.target.value }; setHypotheses(n); }}
                      className="border border-gray-200 rounded px-2 py-1 text-xs bg-white">
                      {constructs.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <select value={h.to}
                      onChange={e => { const n = [...hypotheses]; n[idx] = { ...n[idx], to: e.target.value }; setHypotheses(n); }}
                      className="border border-gray-200 rounded px-2 py-1 text-xs bg-white">
                      {constructs.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setHypotheses(hypotheses.filter((_, i) => i !== idx))}
                    className="p-1 text-gray-300 hover:text-danger-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input value={h.description}
                  onChange={e => { const n = [...hypotheses]; n[idx] = { ...n[idx], description: e.target.value }; setHypotheses(n); }}
                  className="mt-2 w-full text-xs text-gray-500 bg-transparent border-b border-transparent focus:border-primary-300 focus:outline-none"
                  placeholder="假设描述..." />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function SurveyDesignPanel({ constructs, indicators, setIndicators, onNext, surveyPreview, setSurveyPreview }: {
  constructs: typeof EXAMPLE_CONSTRUCTS; indicators: typeof EXAMPLE_INDICATORS;
  setIndicators: (v: typeof EXAMPLE_INDICATORS) => void;
  onNext: () => void; surveyPreview: boolean; setSurveyPreview: (v: boolean) => void;
}) {
  const constructIndicators = (name: string) => indicators.filter(i => i.construct === name);

  if (surveyPreview) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">问卷预览</h2>
          <button onClick={() => setSurveyPreview(false)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            返回编辑
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl mx-auto">
          <div className="text-center mb-6 pb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">OpenClaw使用情况与AI Agent数字员工态度调研</h3>
            <p className="text-sm text-gray-500 mt-2">感谢您参与本次调研！请根据您的实际感受选择最符合的选项。</p>
            <p className="text-xs text-gray-400 mt-1">1=完全不同意 ... 7=完全同意</p>
          </div>
          {constructs.map(c => (
            <div key={c.name} className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-50">{c.name}</h4>
              {constructIndicators(c.name).map((ind, idx) => (
                <div key={ind.code} className="mb-4">
                  <p className="text-sm text-gray-800 mb-2">{idx + 1}. {ind.question_text}</p>
                  <div className="flex justify-between px-2">
                    {Array.from({ length: ind.scale_points }, (_, i) => (
                      <div key={i} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">第二步：问卷设计</h2>
          <p className="text-sm text-gray-500 mt-1">为每个构念设计李克特量表测量题目（建议每构念3-5题）</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSurveyPreview(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Eye className="w-4 h-4" /> 预览
          </button>
          <button onClick={onNext}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            下一步 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {constructs.map(c => (
        <Card key={c.name} title={c.name}
          subtitle={`${c.description} | ${constructIndicators(c.name).length} 个题目`}
          action={
            <button onClick={() => {
              const code = `${c.name.substring(0, 2).toUpperCase()}${constructIndicators(c.name).length + 1}`;
              setIndicators([...indicators, { code, question_text: '', construct: c.name, scale_points: 7 }]);
            }} className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium">
              <Plus className="w-3.5 h-3.5" /> 添加题目
            </button>
          }>
          <div className="space-y-2">
            {constructIndicators(c.name).map((ind, idx) => (
              <div key={ind.code} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                <Badge variant="neutral" size="sm">{ind.code}</Badge>
                <input value={ind.question_text}
                  onChange={e => {
                    const n = indicators.map(i => i.code === ind.code ? { ...i, question_text: e.target.value } : i);
                    setIndicators(n);
                  }}
                  className="flex-1 text-sm bg-transparent border-b border-transparent focus:border-primary-300 focus:outline-none"
                  placeholder="请输入题目内容..." />
                <span className="text-xs text-gray-400">{ind.scale_points}点量表</span>
                <button onClick={() => setIndicators(indicators.filter(i => i.code !== ind.code))}
                  className="p-1 text-gray-300 hover:text-danger-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function SuggestionsPanel({ researchQuestion, constructs, hypotheses, indicatorCount, onNext }: {
  researchQuestion: string; constructs: typeof EXAMPLE_CONSTRUCTS;
  hypotheses: Hypothesis[]; indicatorCount: number; onNext: () => void;
}) {
  const sampleMin = Math.max(10 * indicatorCount, 5 * constructs.length ** 2, 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">第三步：研究方法补充建议</h2>
          <p className="text-sm text-gray-500 mt-1">基于研究设计提供的质量保证建议</p>
        </div>
        <button onClick={onNext}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          继续发布问卷 <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="样本量建议">
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 rounded-lg">
              <p className="text-sm font-medium text-primary-800">建议最小样本量: {sampleMin} 份</p>
              <p className="text-xs text-primary-600 mt-0.5">基于PLS-SEM"10倍规则"计算</p>
            </div>
            <ul className="text-xs text-gray-600 space-y-1.5">
              <li>- 最小样本 = max(指标数x10, 构念数²x5, 100)</li>
              <li>- 建议额外增加20%-30%以应对无效问卷</li>
              <li>- 若需分组比较（MGA），每组至少50个样本</li>
              <li>- 复杂模型或弱效应量需更大样本</li>
            </ul>
          </div>
        </Card>

        <Card title="研究设计检查">
          <div className="space-y-3">
            {[
              { label: '已明确研究问题和理论框架', done: researchQuestion.length > 10 },
              { label: `已定义 ${constructs.length} 个核心构念`, done: constructs.length >= 3 },
              { label: `已提出 ${hypotheses.length} 个研究假设`, done: hypotheses.length >= 2 },
              { label: `已设计 ${indicatorCount} 个测量指标`, done: indicatorCount >= constructs.length * 3 },
            ].map(c => (
              <div key={c.label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${c.done ? 'text-success-500' : 'text-gray-300'}`} />
                <span className="text-sm text-gray-700">{c.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="预测试建议">
          <div className="text-sm text-gray-600 space-y-3">
            <div className="p-3 bg-warning-50 rounded-lg">
              <p className="text-xs text-warning-700 font-medium">建议正式发放前进行10-30人的预测试</p>
            </div>
            <ol className="text-xs space-y-2">
              <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xs flex-shrink-0">1</span>邀请与目标受众相似的人填写</li>
              <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xs flex-shrink-0">2</span>收集题目清晰度和完成时间反馈</li>
              <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xs flex-shrink-0">3</span>{"初步信度分析，删除Alpha < 0.7的题项"}</li>
              <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xs flex-shrink-0">4</span>根据反馈调整措辞后正式发放</li>
            </ol>
          </div>
        </Card>

        <Card title="补充研究方法">
          <div className="space-y-3">
            {[
              { title: 'A/B测试', desc: '将受试者随机分组，测量不同条件下的用户体验差异' },
              { title: '共同方法偏差控制', desc: 'Harman单因子检验、程序分离法（不同时间点测量）' },
              { title: '混合研究方法', desc: '结合定性访谈深入解释关键发现，增强三角验证效果' },
            ].map(item => (
              <div key={item.title} className="p-3 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function PublishPanel({ surveyActive, setSurveyActive, deadline, setDeadline, responseCount, title, onAnalyze, copied, setCopied }: {
  surveyActive: boolean; setSurveyActive: (v: boolean) => void;
  deadline: string; setDeadline: (v: string) => void;
  responseCount: number; title: string;
  onAnalyze: () => void; copied: boolean; setCopied: (v: boolean) => void;
}) {
  const shareUrl = `${window.location.origin}/survey/abc123`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">第四步：发布与收集问卷</h2>
          <p className="text-sm text-gray-500 mt-1">生成分享链接，收集调研对象的回复</p>
        </div>
        <button onClick={onAnalyze}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          进入数据分析 <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="问卷设置">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">问卷状态</p>
                <p className="text-xs text-gray-500">开启后调研对象可填写问卷</p>
              </div>
              <button onClick={() => setSurveyActive(!surveyActive)}
                className={`relative w-12 h-6 rounded-full transition-colors ${surveyActive ? 'bg-success-500' : 'bg-gray-300'}`}>
                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform shadow-sm ${surveyActive ? 'translate-x-6.5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">截止日期</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">分享链接</label>
              <div className="flex gap-2">
                <input readOnly value={shareUrl}
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-600" />
                <button onClick={() => { navigator.clipboard.writeText(shareUrl).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-success-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="收集进度">
          <div className="space-y-5">
            <div className="text-center py-4">
              <p className="text-5xl font-bold text-primary-600">{responseCount}</p>
              <p className="text-sm text-gray-500 mt-1">已收集有效回复</p>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>收集进度</span>
                <span>{responseCount} / 1000</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(responseCount / 1000) * 100}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{responseCount}</p>
                <p className="text-xs text-gray-500">完成填写</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">100%</p>
                <p className="text-xs text-gray-500">完成率</p>
              </div>
            </div>
            <div className="p-3 bg-success-50 rounded-lg">
              <p className="text-xs text-success-700 font-medium">数据收集已达到最低样本量要求，可进入分析阶段</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function AnalysisPanel({ result, modelConfig, indicators, constructs, analysisTab, setAnalysisTab, analyzing, onRun, onReport }: {
  result: FullAnalysisResult | null; modelConfig: ModelConfig;
  indicators: typeof EXAMPLE_INDICATORS; constructs: typeof EXAMPLE_CONSTRUCTS;
  analysisTab: string; setAnalysisTab: (v: 'desc' | 'reliability' | 'validity' | 'structural' | 'bootstrap') => void;
  analyzing: boolean; onRun: () => void; onReport: () => void;
}) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
          <TrendingUp className="w-10 h-10 text-primary-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">准备进行数据分析</h3>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
          已收集150份有效问卷数据，将运行PLS-SEM结构方程模型分析。<br/>
          包含信度检验、效度检验、路径分析和Bootstrap显著性检验。
        </p>
        <button onClick={onRun} disabled={analyzing}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-lg shadow-primary-200">
          {analyzing ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 分析中...</>
          ) : (
            <><TrendingUp className="w-4 h-4" /> 开始PLS-SEM分析</>
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">第五步：数据分析</h2>
          <p className="text-sm text-gray-500 mt-1">PLS-SEM偏最小二乘结构方程模型分析结果</p>
        </div>
        <button onClick={onReport}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          生成报告 <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setAnalysisTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              analysisTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {analysisTab === 'desc' && (
        <Card title="描述性统计" subtitle={`样本量 N=${result.descriptive.n} | 原始数据 ${result.dataQuality.originalN} 条，有效 ${result.dataQuality.cleanedN} 条`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">编码</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">题目</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">均值</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">标准差</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">偏度</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">峰度</th>
                </tr>
              </thead>
              <tbody>
                {indicators.map((ind, idx) => (
                  <tr key={ind.code} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3"><Badge variant="neutral" size="sm">{ind.code}</Badge></td>
                    <td className="py-2 px-3 text-xs text-gray-700 max-w-xs truncate">{ind.question_text}</td>
                    <td className="py-2 px-3 text-right font-mono text-xs">{result.descriptive.means[idx]?.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono text-xs">{result.descriptive.stdDevs[idx]?.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono text-xs">{result.descriptive.skewness[idx]?.toFixed(3)}</td>
                    <td className="py-2 px-3 text-right font-mono text-xs">{result.descriptive.kurtosis[idx]?.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {analysisTab === 'reliability' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {modelConfig.constructs.map(c => (
              <MetricCard key={c.name} label={`${c.name} Alpha`}
                value={result.reliability.cronbachAlpha[c.name] ?? 0}
                threshold={0.7} description="Cronbach's Alpha" />
            ))}
          </div>
          <Card title="信度指标汇总" subtitle="Cronbach's Alpha >= 0.70, CR >= 0.70, AVE >= 0.50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">构念</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Cronbach's Alpha</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">组合信度 (CR)</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">rho_A</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">AVE</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {modelConfig.constructs.map(c => {
                    const alpha = result.reliability.cronbachAlpha[c.name] ?? 0;
                    const cr = result.reliability.compositeReliability[c.name] ?? 0;
                    const rhoA = result.reliability.rhoA[c.name] ?? 0;
                    const ave = result.reliability.ave[c.name] ?? 0;
                    const pass = alpha >= 0.7 && cr >= 0.7 && ave >= 0.5;
                    return (
                      <tr key={c.name} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-medium text-gray-800">{c.name}</td>
                        <td className={`py-2.5 px-3 text-right font-mono text-xs ${alpha >= 0.7 ? 'text-success-600' : 'text-danger-600'}`}>{alpha.toFixed(3)}</td>
                        <td className={`py-2.5 px-3 text-right font-mono text-xs ${cr >= 0.7 ? 'text-success-600' : 'text-danger-600'}`}>{cr.toFixed(3)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs">{rhoA.toFixed(3)}</td>
                        <td className={`py-2.5 px-3 text-right font-mono text-xs ${ave >= 0.5 ? 'text-success-600' : 'text-danger-600'}`}>{ave.toFixed(3)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant={pass ? 'success' : 'danger'} size="sm">{pass ? '通过' : '需关注'}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="外部载荷 (Outer Loadings)" subtitle="建议 >= 0.708; 可接受 >= 0.60">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">构念</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">指标</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">载荷</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {modelConfig.constructs.flatMap(c => {
                    const loadings = result.pls.outerLoadings[c.name] || [];
                    const consIndicators = indicators.filter(i => i.construct === c.name);
                    return consIndicators.map((ind, i) => {
                      const l = loadings[i] ?? 0;
                      return (
                        <tr key={ind.code} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 px-3 text-xs text-gray-600">{c.name}</td>
                          <td className="py-2 px-3"><Badge variant="neutral" size="sm">{ind.code}</Badge></td>
                          <td className={`py-2 px-3 text-right font-mono text-xs ${l >= 0.708 ? 'text-success-600' : l >= 0.6 ? 'text-warning-600' : 'text-danger-600'}`}>
                            {l.toFixed(3)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Badge variant={l >= 0.708 ? 'success' : l >= 0.6 ? 'warning' : 'danger'} size="sm">
                              {l >= 0.708 ? '良好' : l >= 0.6 ? '可接受' : '需删除'}
                            </Badge>
                          </td>
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
          <Card title="Fornell-Larcker准则" subtitle="对角线(sqrt AVE)应大于同行/列的其他值">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500"></th>
                    {modelConfig.constructs.map(c => (
                      <th key={c.name} className="text-right py-2 px-3 text-xs font-medium text-gray-500">{c.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modelConfig.constructs.map(ci => (
                    <tr key={ci.name} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-medium text-gray-800 text-xs">{ci.name}</td>
                      {modelConfig.constructs.map(cj => {
                        const val = result.validity.fornellLarcker[ci.name]?.[cj.name] ?? 0;
                        const isDiag = ci.name === cj.name;
                        return (
                          <td key={cj.name} className={`py-2.5 px-3 text-right font-mono text-xs ${isDiag ? 'font-bold text-primary-700 bg-primary-50' : 'text-gray-600'}`}>
                            {val.toFixed(3)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="HTMT矩阵" subtitle="Heterotrait-Monotrait Ratio, 建议 < 0.85 (保守) 或 < 0.90 (宽松)">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500"></th>
                    {modelConfig.constructs.map(c => (
                      <th key={c.name} className="text-right py-2 px-3 text-xs font-medium text-gray-500">{c.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modelConfig.constructs.map(ci => (
                    <tr key={ci.name} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-medium text-gray-800 text-xs">{ci.name}</td>
                      {modelConfig.constructs.map(cj => {
                        const val = result.validity.htmt[ci.name]?.[cj.name] ?? 0;
                        const isDiag = ci.name === cj.name;
                        const isOk = isDiag || val < 0.85;
                        return (
                          <td key={cj.name} className={`py-2.5 px-3 text-right font-mono text-xs ${isDiag ? 'text-gray-300' : isOk ? 'text-success-600' : 'text-danger-600'}`}>
                            {isDiag ? '-' : val.toFixed(3)}
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
          <Card title="路径模型图" subtitle="蓝色实线=显著路径，灰色虚线=不显著路径">
            <PathDiagram result={result} modelConfig={modelConfig} />
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="路径系数" subtitle="结构路径的标准化回归系数">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">路径</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">系数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelConfig.paths.map(p => {
                      const coef = result.pls.pathCoefficients[p.to]?.[p.from] ?? 0;
                      return (
                        <tr key={`${p.from}-${p.to}`} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 px-3 text-xs">{p.from} → {p.to}</td>
                          <td className="py-2 px-3 text-right font-mono text-xs font-medium">{coef.toFixed(3)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="R² 和 f²" subtitle="R²: 解释方差比例 | f²: 效应量">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">R² (0.75=强, 0.50=中, 0.25=弱)</p>
                  {Object.entries(result.pls.rSquared).map(([name, r2]) => (
                    <div key={name} className="flex items-center gap-3 py-1.5">
                      <span className="text-xs text-gray-700 w-20">{name}</span>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${r2 * 100}%` }} />
                      </div>
                      <span className="text-xs font-mono font-medium text-gray-700 w-14 text-right">{r2.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">f² (0.35=大, 0.15=中, 0.02=小)</p>
                  {Object.entries(result.pls.fSquared).flatMap(([endo, preds]) =>
                    Object.entries(preds).map(([pred, f2]) => (
                      <div key={`${pred}-${endo}`} className="flex items-center justify-between py-1 text-xs">
                        <span className="text-gray-600">{pred} → {endo}</span>
                        <span className={`font-mono font-medium ${f2 >= 0.35 ? 'text-success-600' : f2 >= 0.15 ? 'text-primary-600' : f2 >= 0.02 ? 'text-warning-600' : 'text-gray-400'}`}>
                          {f2.toFixed(3)}
                        </span>
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
        <Card title="Bootstrap显著性检验" subtitle={`${result.bootstrap.nSamples}次重采样 | 95%置信区间 | 双尾检验`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">路径</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">原始值</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Bootstrap均值</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">标准误</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">T值</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">P值</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">95% CI</th>
                  <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">显著性</th>
                </tr>
              </thead>
              <tbody>
                {modelConfig.paths.map(p => {
                  const stats = result.bootstrap.pathCoefficients[p.to]?.[p.from];
                  if (!stats) return null;
                  return (
                    <tr key={`${p.from}-${p.to}`} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 px-3 text-xs">{p.from} → {p.to}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-xs">{stats.original.toFixed(3)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-xs">{stats.mean.toFixed(3)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-xs">{stats.stdError.toFixed(3)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-xs font-medium">{stats.tValue.toFixed(3)}</td>
                      <td className={`py-2.5 px-3 text-right font-mono text-xs font-medium ${stats.pValue < 0.05 ? 'text-success-600' : 'text-gray-500'}`}>
                        {stats.pValue.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-xs">[{stats.ci95Low.toFixed(3)}, {stats.ci95High.toFixed(3)}]</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge variant={stats.significant ? 'success' : 'neutral'} size="sm">
                          {stats.significant ? (stats.pValue < 0.01 ? '***' : stats.pValue < 0.05 ? '**' : '*') : 'n.s.'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            注: *** p{'<'}0.01, ** p{'<'}0.05, * p{'<'}0.10, n.s. = 不显著. T值{'>'} 1.96 在5%水平下显著（双尾检验）。
          </div>
        </Card>
      )}
    </div>
  );
}

function ReportPanel({ result, modelConfig, title, researchQuestion, hypotheses }: {
  result: FullAnalysisResult | null; modelConfig: ModelConfig;
  title: string; researchQuestion: string; hypotheses: Hypothesis[];
}) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-gray-500">请先完成数据分析后再生成报告</p>
      </div>
    );
  }

  const allReliabilityPass = modelConfig.constructs.every(c =>
    (result.reliability.cronbachAlpha[c.name] ?? 0) >= 0.7 &&
    (result.reliability.compositeReliability[c.name] ?? 0) >= 0.7 &&
    (result.reliability.ave[c.name] ?? 0) >= 0.5
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">第六步：研究报告</h2>
          <p className="text-sm text-gray-500 mt-1">可视化分析结果与研究结论</p>
        </div>
      </div>

      <Card title="研究概览">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 font-medium">研究课题</p>
            <p className="text-sm text-gray-900 mt-0.5">{title}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">研究问题</p>
            <p className="text-sm text-gray-900 mt-0.5">{researchQuestion}</p>
          </div>
          <div className="grid grid-cols-4 gap-4 pt-2">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">{result.descriptive.n}</p>
              <p className="text-xs text-gray-500">有效样本</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">{modelConfig.constructs.length}</p>
              <p className="text-xs text-gray-500">构念数</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">{modelConfig.paths.length}</p>
              <p className="text-xs text-gray-500">路径数</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">{result.bootstrap.nSamples}</p>
              <p className="text-xs text-gray-500">Bootstrap</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="测量模型评估">
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${allReliabilityPass ? 'bg-success-50 border border-success-200' : 'bg-warning-50 border border-warning-200'}`}>
            <p className={`text-sm font-medium ${allReliabilityPass ? 'text-success-800' : 'text-warning-800'}`}>
              {allReliabilityPass ? '所有构念的信度和效度指标均通过阈值检验' : '部分构念的信度或效度指标未达标，需进一步检查'}
            </p>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            本研究使用PLS-SEM方法进行数据分析。信度方面，所有构念的Cronbach's Alpha值和组合信度(CR)均
            {allReliabilityPass ? '超过' : '部分接近'}0.70的推荐阈值，表明测量工具具有{allReliabilityPass ? '良好' : '可接受'}的内部一致性。
            收敛效度方面，各构念的平均提取方差(AVE)
            {allReliabilityPass ? '均大于0.50' : '基本满足0.50的标准'}，说明潜变量对其指标的解释力
            {allReliabilityPass ? '充足' : '尚可'}。
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
        <div className="space-y-3">
          {hypotheses.map(h => {
            const stats = result.bootstrap.pathCoefficients[h.to]?.[h.from];
            const supported = stats?.significant ?? false;
            const coef = result.pls.pathCoefficients[h.to]?.[h.from] ?? 0;
            return (
              <div key={h.id} className={`p-4 rounded-lg border ${supported ? 'border-success-200 bg-success-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={supported ? 'success' : 'danger'} size="sm">{h.label}</Badge>
                    <span className="text-sm text-gray-800">{h.description}</span>
                  </div>
                  <Badge variant={supported ? 'success' : 'neutral'} size="sm">
                    {supported ? '支持' : '不支持'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  路径系数 = {coef.toFixed(3)}
                  {stats && `, T值 = ${stats.tValue.toFixed(3)}, P值 = ${stats.pValue.toFixed(3)}`}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="研究结论">
        <div className="prose prose-sm max-w-none text-gray-700 text-sm leading-relaxed space-y-4">
          <p>
            本研究基于技术接受模型(TAM)框架，以{result.descriptive.n}名受访者为样本，
            采用PLS-SEM偏最小二乘结构方程模型分析了用户对OpenClaw平台AI Agent数字员工的采纳态度和使用意愿。
          </p>
          <p>
            研究结果表明，在{hypotheses.length}个研究假设中，
            有{hypotheses.filter(h => result.bootstrap.pathCoefficients[h.to]?.[h.from]?.significant).length}个假设得到了实证数据的支持。
            {(() => {
              const intR2 = result.pls.rSquared['使用意愿'];
              if (intR2 !== undefined) {
                return `模型对"使用意愿"的解释方差(R²)为${(intR2 * 100).toFixed(1)}%，表明模型具有${intR2 > 0.5 ? '较强' : intR2 > 0.25 ? '中等' : '较弱'}的解释力。`;
              }
              return '';
            })()}
          </p>
          <p>
            {(() => {
              const sigPaths = hypotheses.filter(h => result.bootstrap.pathCoefficients[h.to]?.[h.from]?.significant);
              if (sigPaths.length > 0) {
                const strongest = sigPaths.reduce((a, b) => {
                  const ca = Math.abs(result.pls.pathCoefficients[a.to]?.[a.from] ?? 0);
                  const cb = Math.abs(result.pls.pathCoefficients[b.to]?.[b.from] ?? 0);
                  return ca > cb ? a : b;
                });
                return `其中，"${strongest.from}"对"${strongest.to}"的影响最为显著(${strongest.label})，这与既有文献中关于技术接受的核心发现一致。`;
              }
              return '';
            })()}
            研究结果为理解AI Agent技术在组织中的采纳机制提供了实证依据，也为实践者推广AI工具提供了参考。
          </p>
        </div>
      </Card>
    </div>
  );
}
