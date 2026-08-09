'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Award, Crown, Medal } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';

interface LeaderboardEntry {
  position: number;
  username: string;
  totalEarned: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setEntries(data);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading leaderboard..." />;
  }

  const top3 = entries.slice(0, 3);
  const remainingList = entries.slice(3);

  const getPodiumStyle = (index: number) => {
    switch (index) {
      case 0:
        return {
          border: 'border-amber-500/40 bg-amber-500/5',
          crownColor: 'text-amber-400',
          textColor: 'text-amber-400',
        };
      case 1:
        return {
          border: 'border-slate-400/40 bg-slate-400/5',
          crownColor: 'text-slate-300',
          textColor: 'text-slate-300',
        };
      case 2:
        return {
          border: 'border-amber-700/40 bg-amber-700/5',
          crownColor: 'text-amber-600',
          textColor: 'text-amber-600',
        };
      default:
        return {
          border: 'border-zinc-900 bg-zinc-950',
          crownColor: 'text-purple-400',
          textColor: 'text-emerald-400',
        };
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 pb-20 text-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-zinc-900 rounded-lg transition-all border border-zinc-900"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Leaderboard</h1>
        <Award className="w-5 h-5 text-purple-400 ml-auto" />
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Leaders Yet"
          description="Be the first to earn and claim the top spot!"
        />
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <div className={`grid gap-2 mb-4 ${
              top3.length === 1 ? 'grid-cols-1' :
              top3.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
            }`}>
              {top3.map((entry, index) => {
                const style = getPodiumStyle(index);
                return (
                  <div
                    key={entry.position}
                    className={`rounded-xl p-3 text-center border transition-all ${style.border}`}
                  >
                    <div className="flex justify-center mb-1">
                      {index === 0 ? (
                        <Crown className={`w-5 h-5 ${style.crownColor}`} />
                      ) : (
                        <Medal className={`w-5 h-5 ${style.crownColor}`} />
                      )}
                    </div>
                    <p className="text-white font-bold text-xs truncate">
                      {entry.username}
                    </p>
                    <p className={`font-bold text-xs mt-0.5 ${style.textColor}`}>
                      {entry.totalEarned} ETB
                    </p>
                    <p className="text-zinc-500 text-[10px] mt-0.5">#{index + 1}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ranks 4+ List */}
          {remainingList.length > 0 && (
            <div className="space-y-2">
              {remainingList.map((entry) => (
                <div
                  key={entry.position}
                  className="bg-zinc-950 rounded-xl p-3 border border-zinc-900 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400 font-bold w-6 text-center text-xs">
                      #{entry.position}
                    </span>
                    <p className="text-white font-medium text-xs truncate max-w-[160px]">
                      {entry.username}
                    </p>
                  </div>
                  <p className="text-emerald-400 font-bold text-xs">
                    {entry.totalEarned} ETB
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}