import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function Card({ title, subtitle, children, className = '', action }: CardProps) {
  return (
    <div className={`bg-notion-bg rounded-lg border border-notion-border ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-notion-border-light">
          <div>
            {title && (
              <h3 className="text-[13px] font-semibold text-notion-text tracking-tight">{title}</h3>
            )}
            {subtitle && (
              <p className="text-[11px] text-notion-text-tertiary mt-0.5">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
