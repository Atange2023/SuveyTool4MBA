import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  children: ReactNode;
}

const variantClasses = {
  success: 'bg-[#dbeddb] text-[#2b593f]',
  danger: 'bg-[#ffe2dd] text-[#93310e]',
  warning: 'bg-[#fdecc8] text-[#7f5b1d]',
  info: 'bg-[#d3e5ef] text-[#183b56]',
  neutral: 'bg-notion-bg-tertiary text-notion-text-secondary',
};

export function Badge({ variant = 'neutral', size = 'md', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-medium rounded ${variantClasses[variant]} ${
      size === 'sm' ? 'px-1.5 py-px text-[10px]' : 'px-2 py-0.5 text-[11px]'
    }`}>
      {children}
    </span>
  );
}
