import { useState } from 'react';
import { Wand as Wand2, Copy, CircleCheck as CheckCircle2, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { PageTitle } from '../shared/PageTitle';
import { Badge } from '../shared/Badge';
import type { Hypothesis } from '../../types';
import type { ExampleConstruct, ExampleIndicator } from '../../types/app';

interface StoryToModelPanelProps {
  onApply: (data: {
    title: string;
    description: string;
    researchQuestion: string;
    constructs: ExampleConstruct[];
    hypotheses: Hypothesis[];
    indicators: ExampleIndicator[];
  }) => void;
}

const SYSTEM_PROMPT = `你是一个顶尖商学院教授，精通组织行为学、战略管理、营销学和信息系统领域的量化研究方法。

请从用户的业务描述中完成以下任务：

1. **提取研究变量**：识别出自变量(X)、因变量(Y)、中介变量(M，如有)、调节变量(W，如有)
2. **生成研究假设**：基于理论逻辑提出可检验的假设
3. **设计测量量表**：为每个变量生成3道李克特5分量表题目，使用中国企业通用业务语言

你必须严格返回以下JSON格式，不要包含任何其他文本：

\`\`\`json
{
  "title": "研究项目标题",
  "description": "研究背景描述（2-3句话）",
  "researchQuestion": "核心研究问题（一句话）",
  "constructs": [
    {
      "name": "变量名称",
      "description": "变量含义说明",
      "type": "reflective",
      "role": "X/Y/M/W"
    }
  ],
  "hypotheses": [
    {
      "id": "H1",
      "label": "H1",
      "from": "自变量名称",
      "to": "因变量名称",
      "description": "假设描述"
    }
  ],
  "indicators": [
    {
      "code": "变量缩写+序号（如PU1）",
      "question_text": "题目内容",
      "construct": "所属变量名称",
      "scale_points": 5
    }
  ]
}
\`\`\`

注意事项：
- 每个构念至少3个测量题目
- 题目语言要通俗易懂，避免学术术语
- 假设的from和to必须与constructs中的name完全一致
- code命名规则：取构念名首字母缩写+序号`;

export function StoryToModelPanel({ onApply }: StoryToModelPanelProps) {
  const [businessStory, setBusinessStory] = useState('');
  const [promptCopied, setPromptCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [parseError, setParseError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<{
    title: string;
    description: string;
    researchQuestion: string;
    constructs: (ExampleConstruct & { role?: string })[];
    hypotheses: Hypothesis[];
    indicators: ExampleIndicator[];
  } | null>(null);

  const generatePrompt = () => {
    return `${SYSTEM_PROMPT}

---

以下是用户的业务描述：

${businessStory}`;
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatePrompt()).catch(() => {});
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const parseJson = () => {
    setParseError('');
    setParsedPreview(null);

    let raw = jsonInput.trim();
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      raw = jsonMatch[1].trim();
    }

    try {
      const data = JSON.parse(raw);

      if (!data.constructs || !Array.isArray(data.constructs) || data.constructs.length < 2) {
        setParseError('JSON 中至少需要 2 个构念 (constructs)');
        return;
      }
      if (!data.hypotheses || !Array.isArray(data.hypotheses) || data.hypotheses.length < 1) {
        setParseError('JSON 中至少需要 1 个假设 (hypotheses)');
        return;
      }
      if (!data.indicators || !Array.isArray(data.indicators) || data.indicators.length < 6) {
        setParseError('JSON 中至少需要 6 个题目 (indicators)');
        return;
      }

      const constructs: ExampleConstruct[] = data.constructs.map((c: { name: string; description: string; type?: string }) => ({
        name: c.name,
        description: c.description || '',
        type: (c.type === 'formative' ? 'formative' : 'reflective') as 'reflective' | 'formative',
      }));

      const hypotheses: Hypothesis[] = data.hypotheses.map((h: { id?: string; label?: string; from: string; to: string; description?: string }, idx: number) => ({
        id: h.id || `H${idx + 1}`,
        label: h.label || `H${idx + 1}`,
        from: h.from,
        to: h.to,
        description: h.description || '',
      }));

      const indicators: ExampleIndicator[] = data.indicators.map((ind: { code: string; question_text: string; construct: string; scale_points?: number }) => ({
        code: ind.code,
        question_text: ind.question_text,
        construct: ind.construct,
        scale_points: ind.scale_points || 5,
      }));

      setParsedPreview({
        title: data.title || '未命名研究',
        description: data.description || '',
        researchQuestion: data.researchQuestion || '',
        constructs: data.constructs.map((c: { name: string; description: string; type?: string; role?: string }) => ({
          name: c.name,
          description: c.description || '',
          type: (c.type === 'formative' ? 'formative' : 'reflective') as 'reflective' | 'formative',
          role: c.role,
        })),
        hypotheses,
        indicators,
      });
    } catch {
      setParseError('JSON 格式解析失败，请检查 AI 返回的内容是否完整。常见问题：缺少逗号、引号不匹配等。');
    }
  };

  const applyToProject = () => {
    if (!parsedPreview) return;
    onApply({
      title: parsedPreview.title,
      description: parsedPreview.description,
      researchQuestion: parsedPreview.researchQuestion,
      constructs: parsedPreview.constructs.map(c => ({
        name: c.name,
        description: c.description,
        type: c.type,
      })),
      hypotheses: parsedPreview.hypotheses,
      indicators: parsedPreview.indicators,
    });
  };

  const roleColors: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    X: 'info',
    Y: 'danger',
    M: 'warning',
    W: 'success',
  };

  return (
    <div className="animate-fade-in">
      <PageTitle sub="用大白话描述你的业务痛点，AI 帮你拆解成研究模型">
        AI 建模助手
      </PageTitle>

      <div className="space-y-6">
        <div className="p-4 bg-[#ddebf1] rounded-lg">
          <p className="text-[13px] text-[#183b56] font-medium mb-1">使用流程</p>
          <div className="flex items-center gap-2 text-[12px] text-[#3a7ca5]">
            <span className="px-2 py-0.5 bg-white/60 rounded">1. 描述痛点</span>
            <ArrowRight className="w-3 h-3" />
            <span className="px-2 py-0.5 bg-white/60 rounded">2. 复制提示词</span>
            <ArrowRight className="w-3 h-3" />
            <span className="px-2 py-0.5 bg-white/60 rounded">3. 去 AI 对话</span>
            <ArrowRight className="w-3 h-3" />
            <span className="px-2 py-0.5 bg-white/60 rounded">4. 粘贴结果</span>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-notion-text mb-2">
            描述你的业务痛点或研究兴趣
          </label>
          <textarea
            value={businessStory}
            onChange={e => setBusinessStory(e.target.value)}
            rows={5}
            placeholder="例如：我们公司最近引入了一套新的CRM系统，但是销售团队的使用率很低。我想搞清楚是系统太难用，还是大家觉得没用，或者是领导不够支持？最终想知道什么因素能让大家真正用起来。"
            className="w-full border border-notion-border rounded-lg px-4 py-3 text-[14px] text-notion-text bg-notion-bg placeholder:text-notion-text-tertiary focus:outline-none focus:ring-2 focus:ring-notion-accent/30 focus:border-notion-accent resize-none transition-colors leading-relaxed"
          />
          <p className="text-[11px] text-notion-text-tertiary mt-1.5">
            尽量说清楚：涉及哪些角色、什么现象让你困惑、你希望验证什么
          </p>
        </div>

        {businessStory.length > 20 && (
          <div className="border border-notion-border rounded-lg overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 bg-notion-bg-secondary border-b border-notion-border-light">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-notion-text-secondary" />
                <span className="text-[13px] font-medium text-notion-text">生成的提示词</span>
              </div>
              <button
                onClick={copyPrompt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-notion-text text-white rounded text-[12px] font-medium hover:bg-notion-text/90 transition-colors"
              >
                {promptCopied ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> 已复制</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> 复制提示词</>
                )}
              </button>
            </div>
            <div className="p-4 max-h-48 overflow-y-auto">
              <pre className="text-[12px] text-notion-text-secondary whitespace-pre-wrap font-mono leading-relaxed">
                {generatePrompt()}
              </pre>
            </div>
            <div className="px-4 py-3 bg-[#fbf3db] border-t border-[#f0e4b8]">
              <p className="text-[12px] text-[#7f5b1d]">
                复制上面的提示词，粘贴到你的 AI 助手（ChatGPT / DeepSeek / 通义千问等），获取返回的 JSON 结果后粘贴到下方。
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-[13px] font-medium text-notion-text mb-2">
            粘贴 AI 返回的 JSON 结果
          </label>
          <textarea
            value={jsonInput}
            onChange={e => { setJsonInput(e.target.value); setParseError(''); setParsedPreview(null); }}
            rows={8}
            placeholder='将 AI 返回的完整 JSON 粘贴到此处（支持包含 ```json 代码块的格式）'
            className="w-full border border-notion-border rounded-lg px-4 py-3 text-[13px] text-notion-text bg-notion-bg placeholder:text-notion-text-tertiary focus:outline-none focus:ring-2 focus:ring-notion-accent/30 focus:border-notion-accent resize-none transition-colors font-mono"
          />
          {parseError && (
            <div className="mt-2 p-3 bg-danger-50 border border-danger-200 rounded-md">
              <p className="text-[12px] text-danger-700">{parseError}</p>
            </div>
          )}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={parseJson}
              disabled={jsonInput.trim().length < 10}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-notion-text text-white rounded-md text-[13px] font-medium hover:bg-notion-text/90 disabled:opacity-30 transition-colors"
            >
              解析 JSON
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1 text-[12px] text-notion-text-tertiary hover:text-notion-text-secondary transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              查看提示词模板
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div className="border border-notion-border-light rounded-lg p-4 bg-notion-bg-secondary animate-fade-in">
            <p className="text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wider mb-2">System Prompt 模板</p>
            <pre className="text-[11px] text-notion-text-secondary whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
              {SYSTEM_PROMPT}
            </pre>
          </div>
        )}

        {parsedPreview && (
          <div className="border border-success-300 rounded-lg overflow-hidden animate-slide-up">
            <div className="px-4 py-3 bg-success-50 border-b border-success-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success-600" />
                  <span className="text-[13px] font-medium text-success-800">解析成功</span>
                </div>
                <button
                  onClick={applyToProject}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-success-600 text-white rounded text-[13px] font-medium hover:bg-success-700 transition-colors"
                >
                  应用到项目 <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-5">
              <div>
                <p className="text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wider mb-1">研究标题</p>
                <p className="text-[14px] font-medium text-notion-text">{parsedPreview.title}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wider mb-1">研究问题</p>
                <p className="text-[13px] text-notion-text-secondary">{parsedPreview.researchQuestion}</p>
              </div>

              <div>
                <p className="text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wider mb-2">
                  研究变量 ({parsedPreview.constructs.length})
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {parsedPreview.constructs.map(c => (
                    <div key={c.name} className="p-3 border border-notion-border-light rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-medium text-notion-text">{c.name}</span>
                        {c.role && <Badge variant={roleColors[c.role] || 'neutral'} size="sm">{c.role}</Badge>}
                      </div>
                      <p className="text-[11px] text-notion-text-tertiary">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wider mb-2">
                  研究假设 ({parsedPreview.hypotheses.length})
                </p>
                <div className="space-y-1.5">
                  {parsedPreview.hypotheses.map(h => (
                    <div key={h.id} className="flex items-center gap-2 text-[12px]">
                      <Badge variant="info" size="sm">{h.label}</Badge>
                      <span className="text-notion-text-secondary">{h.from}</span>
                      <ArrowRight className="w-3 h-3 text-notion-text-tertiary" />
                      <span className="text-notion-text-secondary">{h.to}</span>
                      <span className="text-notion-text-tertiary ml-1">{h.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-medium text-notion-text-tertiary uppercase tracking-wider mb-2">
                  测量题目 ({parsedPreview.indicators.length})
                </p>
                <div className="space-y-1">
                  {parsedPreview.constructs.map(c => {
                    const items = parsedPreview.indicators.filter(i => i.construct === c.name);
                    if (items.length === 0) return null;
                    return (
                      <div key={c.name} className="mb-3">
                        <p className="text-[12px] font-medium text-notion-text mb-1">{c.name}</p>
                        {items.map(ind => (
                          <div key={ind.code} className="flex items-start gap-2 py-1 text-[12px]">
                            <Badge variant="neutral" size="sm">{ind.code}</Badge>
                            <span className="text-notion-text-secondary">{ind.question_text}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-notion-bg-tertiary rounded-lg">
          <p className="text-[12px] text-notion-text-secondary leading-relaxed">
            本系统采用纯本地运算，您的企业原始业务数据绝不会离开当前浏览器。仅业务描述文本会通过您自行操作粘贴到 AI 助手中进行结构化转换，确保数据绝对安全。
          </p>
        </div>
      </div>
    </div>
  );
}
