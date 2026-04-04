import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  children: ReactNode;
}

const variantClasses = {
  success: 'bg-success-50 text-success-700 border-success-200',
  danger: 'bg-danger-50 text-danger-700 border-danger-200',
  warning: 'bg-warning-50 text-warning-700 border-warning-200',
  info: 'bg-primary-50 text-primary-700 border-primary-200',
  neutral: 'bg-gray-50 text-gray-600 border-gray-200',
};

export function Badge({ variant = 'neutral', size = 'md', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center border rounded-full font-medium ${variantClasses[variant]} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs'}`}>
      {children}
    </span>
  );
}
