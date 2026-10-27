import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
}

export function Input({ label, hint, error, leftIcon, className, id, ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn('input', leftIcon ? 'pl-10' : '', error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : '', className)}
          {...rest}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-secondary">{hint}</p>
      ) : null}
    </div>
  );
}

export default Input;
