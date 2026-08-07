'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[160px]">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-zinc-800 border-t-emerald-400`} />
      {text && <p className="mt-3 text-zinc-400 text-xs font-medium">{text}</p>}
    </div>
  );
}