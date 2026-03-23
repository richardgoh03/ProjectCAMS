import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={twMerge("bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function Button({ 
  children, onClick, variant = 'primary', className, type = 'button', disabled = false 
}: { 
  children: ReactNode; onClick?: () => void; variant?: 'primary'|'secondary'|'danger'|'outline'; className?: string; type?: 'button'|'submit'; disabled?: boolean;
}) {
  const baseStyled = "px-4 py-2 rounded-md font-medium transition-colors focus:ring-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-navy text-white hover:bg-teal focus:ring-navy border border-transparent",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300 border border-transparent",
    danger: "bg-fail text-white hover:bg-red-700 focus:ring-fail border border-transparent",
    outline: "bg-transparent text-navy hover:bg-gray-50 border border-navy focus:ring-navy"
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn(baseStyled, variants[variant], className)}>
      {children}
    </button>
  );
}
