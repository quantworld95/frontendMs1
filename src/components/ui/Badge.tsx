import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'positive' | 'brand' | 'warning';
  className?: string;
}

const toneClasses = {
  neutral: 'bg-surface-secondary text-ink-secondary border-line',
  positive: 'bg-green-50 text-positive border-green-200',
  brand: 'bg-brand-light text-brand-primary border-brand-primary/20',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
};

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
