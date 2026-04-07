import { ArrowRight } from 'lucide-react';

export function NextBtn({ onClick, label = '下一步', disabled }: { onClick: () => void; label?: string; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-notion-text text-white rounded text-[13px] font-medium hover:bg-notion-text/90 disabled:opacity-30 transition-colors">
      {label} <ArrowRight className="w-3.5 h-3.5" />
    </button>
  );
}
