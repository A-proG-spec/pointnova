'use client';

import { Coins, Trophy, Users } from 'lucide-react';

interface UserCardProps {
  firstName: string;
  lastName?: string;
  username?: string;
  balance: number;
  totalEarned: number;
  referralCount?: number;
  rank?: number;
  telegramId?: string;
  showStats?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export function UserCard({ 
  firstName,
  lastName,
  username,
  balance,
  totalEarned,
  referralCount = 0,
  rank,
  showStats = true,
  variant = 'default'
}: UserCardProps) {
  const displayName = username || `${firstName} ${lastName || ''}`.trim();
  const initials = firstName.charAt(0).toUpperCase();

  if (variant === 'detailed') {
    return (
      <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-900">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-emerald-400 text-black font-extrabold text-base flex items-center justify-center flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-base font-bold truncate">{displayName}</h2>
            {username && (
              <p className="text-zinc-400 text-xs">@{username}</p>
            )}
          </div>
          {rank && (
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md">
              <Trophy className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-bold text-xs text-white">#{rank}</span>
            </div>
          )}
        </div>

        {showStats && (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-black rounded-lg p-2.5 text-center border border-zinc-900">
              <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider mb-0.5">Balance</p>
              <p className="text-emerald-400 font-bold text-sm">{balance} ETB</p>
            </div>
            <div className="bg-black rounded-lg p-2.5 text-center border border-zinc-900">
              <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider mb-0.5">Total Earned</p>
              <p className="text-white font-bold text-sm">{totalEarned} ETB</p>
            </div>
            <div className="bg-black rounded-lg p-2.5 text-center border border-zinc-900">
              <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider mb-0.5">Referrals</p>
              <p className="text-purple-400 font-bold text-sm">{referralCount}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-900">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-400 text-black font-bold text-sm flex items-center justify-center flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{displayName}</p>
          {showStats && (
            <div className="flex items-center gap-3 mt-0.5 text-xs">
              <div className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-emerald-400" />
                <span className="text-white font-semibold">{balance} ETB</span>
              </div>
              <div className="text-zinc-400 text-[11px]">
                Total: {totalEarned} ETB
              </div>
              {referralCount > 0 && (
                <div className="flex items-center gap-1 text-purple-400 text-[11px]">
                  <Users className="w-3 h-3" />
                  <span>{referralCount}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}