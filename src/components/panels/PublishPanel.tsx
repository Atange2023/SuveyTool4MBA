import { CircleCheck as CheckCircle2, Copy } from 'lucide-react';
import { Card } from '../shared/Card';
import { PageTitle } from '../shared/PageTitle';
import { NextBtn } from '../shared/NextBtn';

interface PublishPanelProps {
  surveyActive: boolean;
  setSurveyActive: (v: boolean) => void;
  deadline: string;
  setDeadline: (v: string) => void;
  responseCount: number;
  onAnalyze: () => void;
  copied: boolean;
  setCopied: (v: boolean) => void;
  canAnalyze?: boolean;
}

export function PublishPanel({
  surveyActive, setSurveyActive, deadline, setDeadline,
  responseCount, onAnalyze, copied, setCopied, canAnalyze = true,
}: PublishPanelProps) {
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
