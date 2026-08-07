'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-3 left-3 right-3 z-50 max-w-md mx-auto">
      <div className="bg-zinc-900 border border-zinc-800 text-white rounded-xl p-3 flex items-center gap-2.5 shadow-lg">
        {type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
        {type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
        {type === 'info' && <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />}
        
        <p className="font-medium flex-1 text-xs">{message}</p>
        
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="text-zinc-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}