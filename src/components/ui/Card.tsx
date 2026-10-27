import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'section';
}

export function Card({ children, className, as: Tag = 'div' }: CardProps) {
  return <Tag className={cn('card', className)}>{children}</Tag>;
}

export default Card;
