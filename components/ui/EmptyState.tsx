'use client';

import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-10 px-4 bg-zinc-950 rounded-xl border border-zinc-900 my-4">
      <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-emerald-400" />
      </div>
      <h3 className="text-white text-base font-bold mb-1">{title}</h3>
      <p className="text-zinc-400 text-xs mb-4 max-w-xs mx-auto leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-emerald-400 hover:bg-emerald-300 text-black font-bold px-4 py-2 rounded-lg transition-all text-xs"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}