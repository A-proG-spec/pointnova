'use client';

import { Play, Coins, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  reward: number;
  url: string;
  onPlay?: (taskId: string) => void;
}

export function TaskCard({ id, title, description, reward, url, onPlay }: TaskCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    window.open(url, '_blank');
    if (onPlay) {
      onPlay(id);
    }
    setTimeout(() => setIsPlaying(false), 1000);
  };

  return (
    <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">
            {title}
          </h3>
          <p className="text-zinc-400 text-xs mb-2.5 line-clamp-2 leading-relaxed">
            {description}
          </p>
          <div className="flex items-center gap-1 bg-black border border-zinc-800 text-emerald-400 px-2.5 py-0.5 rounded-md inline-flex text-xs font-bold">
            <Coins className="w-3 h-3 text-purple-400" />
            <span>{reward} ETB</span>
          </div>
        </div>

        <button
          onClick={handlePlay}
          disabled={isPlaying}
          className={`
            bg-emerald-400 hover:bg-emerald-300 text-black font-bold 
            px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs
            transition-all flex-shrink-0 self-center
            ${isPlaying ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          `}
        >
          {isPlaying ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-black border-t-transparent" />
              <span>Opening</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-black" />
              <span>Play</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-2.5 pt-2 border-t border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-1 text-zinc-500 text-[10px] truncate">
          <ExternalLink className="w-2.5 h-2.5 text-purple-400" />
          <span className="truncate">{url}</span>
        </div>
      </div>
    </div>
  );
}