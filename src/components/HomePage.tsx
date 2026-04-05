import {
  ChartBar as BarChart3, Plus, ArrowRight, BookOpen, Sparkles,
  FileText, ClipboardList, TrendingUp, Share2,
} from 'lucide-react';

const WORKFLOW_STEPS = [
  { icon: FileText, label: '明确研究问题', desc: '定义构念、假设与理论框架' },
  { icon: ClipboardList, label: '设计问卷', desc: '编辑李克特量表测量题目' },
  { icon: Share2, label: '发布与收集', desc: '生成链接收集数据' },
  { icon: TrendingUp, label: '数据分析', desc: 'PLS-SEM 结构方程模型分析' },
];

export function HomePage({ onOpenExample, onCreateNew }: {
  onOpenExample: () => void;
  onCreateNew: () => void;
}) {
  return (
    <div className="min-h-screen bg-notion-bg">
      <header className="border-b border-notion-border-light">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-notion-text rounded flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-notion-text tracking-tight">量研通</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="max-w-2xl mb-16">
          <h1 className="text-3xl font-bold text-notion-text tracking-tight leading-tight">
            从零开始，完成你的原创量化研究
          </h1>
          <p className="text-[15px] text-notion-text-secondary mt-3 leading-relaxed">
            量研通是一个帮助你独立完成学术量化研究全流程的工具。从定义研究问题、设计问卷、收集数据，到 PLS-SEM 结构方程建模与报告生成，所有步骤都在一个工作流中完成。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-16">
          <button
            onClick={onCreateNew}
            className="group relative text-left p-6 rounded-lg border-2 border-notion-text bg-notion-bg hover:bg-notion-bg-tertiary transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-notion-text flex items-center justify-center mb-4">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-[17px] font-semibold text-notion-text mb-1.5">
              新建我的项目
            </h2>
            <p className="text-[13px] text-notion-text-secondary leading-relaxed">
              从空白开始，定义你自己的研究课题、构念和假设，完成完整的量化研究流程。
            </p>
            <ArrowRight className="absolute top-6 right-6 w-5 h-5 text-notion-text-tertiary group-hover:text-notion-text group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={onOpenExample}
            className="group relative text-left p-6 rounded-lg border border-notion-border hover:border-notion-text-tertiary bg-notion-bg hover:bg-notion-bg-tertiary transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-notion-bg-tertiary flex items-center justify-center mb-4 group-hover:bg-notion-bg-hover transition-colors">
              <BookOpen className="w-5 h-5 text-notion-text-secondary" />
            </div>
            <h2 className="text-[17px] font-semibold text-notion-text mb-1.5">
              查看示例项目
            </h2>
            <p className="text-[13px] text-notion-text-secondary leading-relaxed">
              浏览一个完整的 TAM 模型研究案例，了解从问卷设计到 PLS-SEM 分析的全过程。
            </p>
            <ArrowRight className="absolute top-6 right-6 w-5 h-5 text-notion-text-tertiary group-hover:text-notion-text group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-[15px] font-semibold text-notion-text mb-1">研究工作流</h2>
          <p className="text-[13px] text-notion-text-tertiary">每个项目都将经历以下步骤</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-16">
          {WORKFLOW_STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="p-4 rounded-lg border border-notion-border-light hover:border-notion-border transition-colors">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="w-5 h-5 rounded bg-notion-bg-tertiary text-notion-text-tertiary flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <Icon className="w-4 h-4 text-notion-text-secondary" />
                </div>
                <p className="text-[13px] font-medium text-notion-text">{s.label}</p>
                <p className="text-[12px] text-notion-text-tertiary mt-0.5">{s.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="p-5 bg-notion-bg-tertiary rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-notion-text-tertiary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-notion-text">这不只是一个示例展示</p>
              <p className="text-[12px] text-notion-text-secondary mt-0.5 leading-relaxed">
                量研通的目标是让你能够独立完成原创的学术量化研究。新建项目后，你可以定义自己的研究问题、设计问卷、收集真实数据，并运行完整的 PLS-SEM 分析。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
