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
        setEntries(data);
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

  return (
    <div className="min-h-screen bg-black p-4 pb-20 text-white">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-zinc-900 rounded-lg transition-all border border-zinc-900"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <h1 className="text-xl font-bold">Leaderboard</h1>
        <Award className="w-4 h-4 text-purple-400 ml-auto" />
      </div>

      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {entries.slice(0, 3).map((entry, index) => (
            <div
              key={index}
              className="bg-zinc-950 rounded-xl p-2.5 text-center border border-zinc-900"
            >
              <div className="flex justify-center mb-1">
                {index === 0 ? <Crown className="w-4 h-4 text-emerald-400" /> : <Medal className="w-4 h-4 text-purple-400" />}
              </div>
              <p className="text-white font-bold text-xs truncate">
                {entry.username}
              </p>
              <p className="text-emerald-400 font-bold text-xs mt-0.5">
                {entry.totalEarned} ETB
              </p>
              <p className="text-zinc-500 text-[10px] mt-0.5">#{index + 1}</p>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Leaders Yet"
          description="Be the first to earn and claim the top spot!"
        />
      ) : (
        <div className="space-y-2">
          {entries.slice(3).map((entry) => (
            <div
              key={entry.position}
              className="bg-zinc-950 rounded-xl p-3 border border-zinc-900 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-purple-400 font-bold w-5 text-center text-xs">
                  #{entry.position}
                </span>
                <p className="text-white font-medium text-xs">{entry.username}</p>
              </div>
              <p className="text-emerald-400 font-bold text-xs">{entry.totalEarned} ETB</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}