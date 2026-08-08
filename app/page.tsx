'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { UserCard } from '@/components/ui/UserCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  TrendingUp,
  Award,
  Users,
  Wallet,
  LogOut,
  Coins,
  Clock,
  CheckCircle,
  ArrowUpRight,
  UserPlus,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Dummy Ethiopian users with withdrawal history
const dummyWithdrawals = [
  {
    id: 1,
    name: 'Eyob',
    username: '@abebe_k',
    amount: 12500,
    date: '2026-08-05',
    status: 'completed',
    avatar: 'https://ui-avatars.com/api/?name=Abebe+Kebede&background=10b981&color=fff&size=32',
  },
  // ... rest of dummy data
];

// Summary statistics
const withdrawalStats = {
  totalWithdrawn: dummyWithdrawals.reduce((sum, w) => sum + w.amount, 0),
  totalUsers: dummyWithdrawals.length,
  averageAmount: Math.round(dummyWithdrawals.reduce((sum, w) => sum + w.amount, 0) / dummyWithdrawals.length),
  highestWithdrawal: Math.max(...dummyWithdrawals.map(w => w.amount)),
};

export default function HomePage() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [referralCount, setReferralCount] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);

  useEffect(() => {
    if (user) {
      fetchReferralStats();
    }
  }, [user]);

  const fetchReferralStats = async () => {
    try {
      const response = await fetch(`/api/referral?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setReferralCount(data.referralCount || 0);
        setReferralEarnings(data.referralEarnings || 0);
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your profile..." />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome, {user.firstName} 👋
          </h1>
          <p className="text-white/60 text-sm">Let's earn some rewards!</p>
        </div>
        <div className="flex items-center gap-2">
          {user.photoUrl ? (
            <img 
              src={user.photoUrl} 
              alt={user.firstName}
              className="w-10 h-10 rounded-full border-2 border-green-500/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold">
              {user.firstName.charAt(0)}
            </div>
          )}
          <button
            onClick={logout}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <LogOut className="w-5 h-5 text-white/40 hover:text-white/80" />
          </button>
        </div>
      </div>

      {/* User Card */}
      <UserCard
        firstName={user.firstName}
        lastName={user.lastName}
        username={user.username}
        balance={user.balance}
        totalEarned={user.totalEarned}
        telegramId={user.telegramId}
        variant="detailed"
        showStats={true}
      />

      {/* Quick Stats - ADD REFERRAL STATS */}
      <div className="grid grid-cols-3 gap-2 mt-4 mb-6">
        <div className="bg-[#1a1a1a] rounded-2xl p-3 border border-white/5 text-center">
          <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <p className="text-white/40 text-[10px]">Referrals</p>
          <p className="text-white font-bold text-lg">{referralCount}</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-2xl p-3 border border-white/5 text-center">
          <Coins className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <p className="text-white/40 text-[10px]">From Referrals</p>
          <p className="text-emerald-400 font-bold text-lg">{referralEarnings} ETB</p>
        </div>
        <div className="bg-[#1a1a1a] rounded-2xl p-3 border border-white/5 text-center">
          <TrendingUp className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
          <p className="text-white/40 text-[10px]">Available Tasks</p>
          <p className="text-white font-bold text-lg">5</p>
        </div>
      </div>

      {/* Withdrawal Activity Section */}
      <div className="mt-2 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">💰 Recent Withdrawals</h2>
          <button 
            onClick={() => router.push('/withdraw')}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            View All <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Withdrawal Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-[#1a1a1a] rounded-xl p-3 border border-white/5 text-center">
            <p className="text-white/40 text-[10px]">Total Withdrawn</p>
            <p className="text-emerald-400 font-bold text-sm">
              {withdrawalStats.totalWithdrawn.toLocaleString()} ETB
            </p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-3 border border-white/5 text-center">
            <p className="text-white/40 text-[10px]">Avg Amount</p>
            <p className="text-yellow-400 font-bold text-sm">
              {withdrawalStats.averageAmount.toLocaleString()} ETB
            </p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-3 border border-white/5 text-center">
            <p className="text-white/40 text-[10px]">Highest</p>
            <p className="text-purple-400 font-bold text-sm">
              {withdrawalStats.highestWithdrawal.toLocaleString()} ETB
            </p>
          </div>
        </div>

        {/* Withdrawal List */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {dummyWithdrawals.slice(0, 5).map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="bg-[#1a1a1a] rounded-xl p-3 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={withdrawal.avatar}
                    alt={withdrawal.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-white text-sm font-medium">{withdrawal.name}</p>
                    <p className="text-white/30 text-[10px]">{withdrawal.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold text-sm">
                    {withdrawal.amount.toLocaleString()} ETB
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    {withdrawal.status === 'completed' ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 text-[9px]">Completed</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-400 text-[9px]">Processing</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-white/20 text-[9px]">
                  {new Date(withdrawal.date).toLocaleDateString('en-ET', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <span className="text-white/10">•</span>
                <span className="text-white/20 text-[9px]">Via Telebirr</span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl p-3 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-white text-xs font-semibold">Trusted by {withdrawalStats.totalUsers}+ users</p>
                <p className="text-white/30 text-[9px]">Over {withdrawalStats.totalWithdrawn.toLocaleString()} ETB withdrawn</p>
              </div>
            </div>
            <div className="flex -space-x-2">
              {dummyWithdrawals.slice(0, 5).map((w) => (
                <img
                  key={w.id}
                  src={w.avatar}
                  alt={w.name}
                  className="w-6 h-6 rounded-full border-2 border-black"
                />
              ))}
              <div className="w-6 h-6 rounded-full bg-[#1a1a1a] border-2 border-black flex items-center justify-center text-white/40 text-[8px] font-bold">
                +{withdrawalStats.totalUsers - 5}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <button
          onClick={() => router.push('/earn')}
          className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-green-500/20"
        >
          <TrendingUp className="w-5 h-5" />
          Start Earning Now
        </button>
        
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: TrendingUp, label: 'Earn', path: '/earn', color: 'text-green-500' },
            { icon: Award, label: 'Top', path: '/leaderboard', color: 'text-yellow-500' },
            { icon: Users, label: 'Invite', path: '/invite', color: 'text-blue-500' },
            { icon: Wallet, label: 'Withdraw', path: '/withdraw', color: 'text-purple-500' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center bg-[#1a1a1a] rounded-2xl p-3 hover:bg-[#222] transition-all border border-white/5 group"
            >
              <item.icon className={`w-6 h-6 ${item.color} mb-1 group-hover:scale-110 transition-transform`} />
              <span className="text-xs text-white/80">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}