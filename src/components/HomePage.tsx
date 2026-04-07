import { ChartBar as BarChart3, Plus, ArrowRight, BookOpen, Sparkles, FileText, ClipboardList, TrendingUp, Share2, Wand as Wand2, Shield } from 'lucide-react';

const WORKFLOW_STEPS = [
  { icon: Wand2, label: 'AI 建模助手', desc: '用大白话描述痛点，AI 拆解研究模型' },
  { icon: FileText, label: '明确研究问题', desc: '定义构念、假设与理论框架' },
  { icon: ClipboardList, label: '设计问卷', desc: '编辑李克特量表测量题目' },
  { icon: Share2, label: '发布与收集', desc: '生成链接收集数据' },
  { icon: Shield, label: '数据体检', desc: '红绿灯质检与一键剔除干扰项' },
  { icon: TrendingUp, label: '数据分析', desc: 'PLS-SEM 结构方程模型分析' },
];

const ROADMAP = [
  { version: '当前', items: ['AI 提示词生成（故事转模型）', '红绿灯数据体检系统', '董事会级报告生成器', 'CSV 数据导入', 'PLS-SEM 全流程分析'] },
  { version: '规划中', items: ['接入 LLM API 实现端到端自动化', '智能算法路由（T检验/ANOVA/卡方自动匹配）', '数据类型自动嗅探', '多组分析 (MGA)', '中介/调节效应专项分析'] },
  { version: '远期', items: ['团队协作与项目共享', '在线问卷收集系统', '多语言支持', '更多统计方法（CB-SEM、fsQCA）'] },
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
            <span className="text-[10px] text-notion-text-tertiary ml-1">v2.0</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="max-w-2xl mb-16">
          <h1 className="text-3xl font-bold text-notion-text tracking-tight leading-tight">
            AI 驱动的商业决策验证工具
          </h1>
          <p className="text-[15px] text-notion-text-secondary mt-3 leading-relaxed">
            量研通帮助拥有丰富商业经验的管理者，用科学的量化方法验证商业直觉。
            从描述业务痛点开始，到生成董事会级决策报告，所有复杂的统计分析都由系统自动完成。
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
              从描述你的业务痛点开始，AI 帮你拆解研究模型、生成问卷、分析数据，直到产出决策报告。
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-16">
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

        <div className="p-5 bg-notion-bg-tertiary rounded-lg mb-16">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-notion-text-tertiary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-notion-text">零统计学基础也能完成专业研究</p>
              <p className="text-[12px] text-notion-text-secondary mt-0.5 leading-relaxed">
                量研通隐藏了所有复杂的统计参数，通过"红绿灯"体检、AI 提示词生成和商业语言报告，
                让 DBA/MBA 高管无需理解 T值、Alpha 等概念，就能完成从业务直觉到数据验证的闭环。
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-notion-border-light pt-10">
          <p className="text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wider mb-4">开发计划说明</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {ROADMAP.map(phase => (
              <div key={phase.version} className="p-4 bg-notion-bg-secondary rounded-lg">
                <p className="text-[12px] font-semibold text-notion-text-secondary mb-2">{phase.version}</p>
                <ul className="space-y-1.5">
                  {phase.items.map(item => (
                    <li key={item} className="text-[11px] text-notion-text-tertiary leading-relaxed flex items-start gap-1.5">
                      <span className="mt-1 w-1 h-1 rounded-full bg-notion-text-tertiary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-notion-text-tertiary mt-4">
            本系统采用纯本地运算架构，您的企业原始数据绝不会离开当前浏览器。
          </p>
        </div>
      </main>
    </div>
  );
}
