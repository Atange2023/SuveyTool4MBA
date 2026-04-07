import { useState, useMemo, useCallback } from 'react';
import { ChartBar as BarChart3, FileText, ClipboardList, Lightbulb, Share2, TrendingUp, ChartBar as FileBarChart, ChevronRight, CircleCheck as CheckCircle2, Circle, Hop as Home, Wand as Wand2, Shield } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { OverviewPanel } from './components/panels/OverviewPanel';
import { ResearchPanel } from './components/panels/ResearchPanel';
import { SurveyDesignPanel } from './components/panels/SurveyDesignPanel';
import { SuggestionsPanel } from './components/panels/SuggestionsPanel';
import { PublishPanel } from './components/panels/PublishPanel';
import { AnalysisPanel } from './components/panels/AnalysisPanel';
import { StoryToModelPanel } from './components/panels/StoryToModelPanel';
import { TrafficLightPanel } from './components/panels/TrafficLightPanel';
import { BoardroomReportPanel } from './components/panels/BoardroomReportPanel';
import { runFullAnalysis } from './lib/pls-sem';
import type { FullAnalysisResult, ModelConfig } from './lib/pls-sem/types';
import type { WorkflowStep, Hypothesis } from './types';
import type { ExampleConstruct, ExampleIndicator } from './types/app';
import {
  EXAMPLE_PROJECT, EXAMPLE_CONSTRUCTS, EXAMPLE_INDICATORS,
  generateExampleData,
} from './data/example';

type AppView = 'home' | 'example' | 'new-project';

const STEPS: { key: WorkflowStep; label: string; icon: typeof BarChart3 }[] = [
  { key: 'story', label: 'AI 建模助手', icon: Wand2 },
  { key: 'overview', label: '项目总览', icon: BarChart3 },
  { key: 'research', label: '研究问题', icon: FileText },
  { key: 'survey-design', label: '问卷设计', icon: ClipboardList },
  { key: 'suggestions', label: '补充建议', icon: Lightbulb },
  { key: 'publish', label: '发布问卷', icon: Share2 },
  { key: 'traffic-light', label: '数据体检', icon: Shield },
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
  const [constructs, setConstructs] = useState<ExampleConstruct[]>(EXAMPLE_CONSTRUCTS);
  const [indicators, setIndicators] = useState<ExampleIndicator[]>(EXAMPLE_INDICATORS);
  const [surveyActive, setSurveyActive] = useState(false);
  const [surveyPreview, setSurveyPreview] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FullAnalysisResult | null>(null);
  const [analysisTab, setAnalysisTab] = useState<'desc' | 'reliability' | 'validity' | 'structural' | 'bootstrap'>('desc');
  const [analyzing, setAnalyzing] = useState(false);
  const [responseCount, setResponseCount] = useState(150);
  const [deadline, setDeadline] = useState('2026-05-01');
  const [copied, setCopied] = useState(false);
  const [uploadedData, setUploadedData] = useState<number[][] | null>(null);

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
    setUploadedData(null);
    setStep('story');
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
    setUploadedData(null);
    setStep('overview');
  }, []);

  const analysisData = uploadedData || exampleData;

  const runAnalysis = useCallback(() => {
    setAnalyzing(true);
    setTimeout(() => {
      try {
        const result = runFullAnalysis(analysisData, modelConfig, 500);
        setAnalysisResult(result);
        setAnalyzing(false);
        setStep('analysis');
      } catch {
        setAnalyzing(false);
      }
    }, 100);
  }, [analysisData, modelConfig]);

  const handleStoryApply = useCallback((data: {
    title: string;
    description: string;
    researchQuestion: string;
    constructs: ExampleConstruct[];
    hypotheses: Hypothesis[];
    indicators: ExampleIndicator[];
  }) => {
    setTitle(data.title);
    setDescription(data.description);
    setResearchQuestion(data.researchQuestion);
    setConstructs(data.constructs);
    setHypotheses(data.hypotheses);
    setIndicators(data.indicators);
    setStep('research');
  }, []);

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

        <nav className="flex-1 px-2 py-1 space-y-px overflow-y-auto">
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

      <main className="flex-1 min-w-0">
        <header className="h-11 flex items-center px-4 lg:px-8 border-b border-notion-border-light sticky top-0 z-10 bg-notion-bg/95 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="text-notion-text-secondary">{title || '未命名项目'}</span>
            <ChevronRight className="w-3 h-3 text-notion-text-tertiary" />
            <span className="text-notion-text font-medium">{STEPS.find(s => s.key === step)?.label}</span>
          </div>
        </header>

        <div className="px-4 lg:px-16 xl:px-24 py-8 max-w-5xl">
          {step === 'story' && <StoryToModelPanel onApply={handleStoryApply} />}
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
            responseCount={responseCount} onAnalyze={() => setStep('traffic-light')}
            copied={copied} setCopied={setCopied}
            canAnalyze={responseCount > 0 && constructs.length >= 2}
          />}
          {step === 'traffic-light' && <TrafficLightPanel
            data={analysisData}
            modelConfig={modelConfig}
            indicators={indicators}
            setIndicators={setIndicators}
            constructs={constructs}
            onUploadData={setUploadedData}
            onProceed={runAnalysis}
            analyzing={analyzing}
          />}
          {step === 'analysis' && <AnalysisPanel
            result={analysisResult} modelConfig={modelConfig}
            indicators={indicators}
            analysisTab={analysisTab} setAnalysisTab={setAnalysisTab}
            analyzing={analyzing} onRun={runAnalysis}
            onReport={() => setStep('report')}
          />}
          {step === 'report' && <BoardroomReportPanel
            result={analysisResult} modelConfig={modelConfig}
            title={title} researchQuestion={researchQuestion}
            hypotheses={hypotheses}
          />}
        </div>
      </main>
    </div>
  );
}
