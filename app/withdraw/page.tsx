'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, ArrowLeft, AlertCircle, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function WithdrawPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawalStatus, setWithdrawalStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const MIN_WITHDRAWAL = 2000;
  const REQUIRED_REFERRALS = 20;

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/user?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        
        // Check if there's an ongoing withdrawal
        if (data.withdrawalStatus === 'processing') {
          setWithdrawalStatus('processing');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    // Check balance
    if (!userData || userData.balance < MIN_WITHDRAWAL) {
      setToast({
        message: `Minimum withdrawal amount is ${MIN_WITHDRAWAL} ETB`,
        type: 'error'
      });
      return;
    }

    // Check referrals
    const referralCount = userData.referralCount || 0;
    if (referralCount < REQUIRED_REFERRALS) {
      setToast({
        message: `You need ${REQUIRED_REFERRALS} invited friends to withdraw. Current: ${referralCount}`,
        type: 'error'
      });
      return;
    }

    setWithdrawing(true);
    try {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?.id, 
          amount: userData.balance 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWithdrawalStatus('processing');
        setToast({
          message: '✅ Withdrawal request submitted! Processing will take 24-48 hours.',
          type: 'success'
        });
        
        // Refresh user data to update status
        await refreshUser();
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      setToast({ message: 'Failed to process withdrawal', type: 'error' });
    } finally {
      setWithdrawing(false);
    }
  };

  const getReferralStatus = () => {
    const referralCount = userData?.referralCount || 0;
    const isMet = referralCount >= REQUIRED_REFERRALS;
    return {
      count: referralCount,
      required: REQUIRED_REFERRALS,
      isMet,
      remaining: Math.max(0, REQUIRED_REFERRALS - referralCount),
    };
  };

  const getBalanceStatus = () => {
    const balance = userData?.balance || 0;
    const isMet = balance >= MIN_WITHDRAWAL;
    return {
      balance,
      required: MIN_WITHDRAWAL,
      isMet,
      remaining: Math.max(0, MIN_WITHDRAWAL - balance),
    };
  };

  const canWithdraw = () => {
    const balanceStatus = getBalanceStatus();
    const referralStatus = getReferralStatus();
    return balanceStatus.isMet && referralStatus.isMet && withdrawalStatus === 'idle';
  };

  const balanceStatus = getBalanceStatus();
  const referralStatus = getReferralStatus();

  if (loading) {
    return <LoadingSpinner text="Loading balance..." />;
  }

  // Show processing state
  if (withdrawalStatus === 'processing') {
    return (
      <div className="min-h-screen bg-black p-4 pb-20 text-white">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-zinc-900 rounded-lg transition-all border border-zinc-900"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-xl font-bold">Withdraw</h1>
          <Wallet className="w-4 h-4 text-purple-400 ml-auto" />
        </div>

        <div className="bg-zinc-950 rounded-xl p-8 border border-zinc-900 text-center">
          <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-purple-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Withdrawal Processing</h2>
          <p className="text-zinc-400 text-sm mb-4">
            Your withdrawal request is being processed.
            <br />
            This typically takes 24-48 hours.
          </p>
          <div className="bg-black/50 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Status</span>
              <span className="text-purple-400 font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                Processing
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-zinc-400">Amount</span>
              <span className="text-white font-bold">{userData?.balance || 0} ETB</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-zinc-400">Estimated Completion</span>
              <span className="text-white text-xs">
                {new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="mt-4 w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 rounded-xl transition-all text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 pb-20 text-white">
      {toast && (
        <div className={`fixed top-3 left-3 right-3 p-3 rounded-xl z-50 border text-white text-xs font-medium text-center ${
          toast.type === 'error' ? 'bg-red-500/20 border-red-500/30' :
          toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30' :
          'bg-blue-500/20 border-blue-500/30'
        }`}>
          <p>{toast.message}</p>
        </div>
      )}

      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-zinc-900 rounded-lg transition-all border border-zinc-900"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <h1 className="text-xl font-bold">Withdraw</h1>
        <Wallet className="w-4 h-4 text-purple-400 ml-auto" />
      </div>

      {/* Balance Display */}
      <div className="bg-zinc-950 rounded-xl p-5 mb-4 border border-zinc-900">
        <p className="text-zinc-400 text-xs mb-1">Available Balance</p>
        <p className={`text-3xl font-black mb-1 tracking-tight ${
          balanceStatus.isMet ? 'text-emerald-400' : 'text-white'
        }`}>
          {userData?.balance || 0} ETB
        </p>
        <p className="text-zinc-500 text-xs">
          Total Earned: {userData?.totalEarned || 0} ETB
        </p>
      </div>

      {/* Requirements Checklist */}
      <div className="bg-zinc-950 rounded-xl p-4 mb-4 border border-zinc-900">
        <p className="text-white text-xs font-bold mb-3">Withdrawal Requirements</p>
        
        {/* Balance Requirement */}
        <div className="flex items-center justify-between py-2 border-b border-zinc-900/50">
          <div className="flex items-center gap-2">
            {balanceStatus.isMet ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-zinc-600" />
            )}
            <div>
              <p className={`text-xs ${balanceStatus.isMet ? 'text-white' : 'text-zinc-400'}`}>
                Balance ≥ {MIN_WITHDRAWAL} ETB
              </p>
              <p className="text-zinc-500 text-[10px]">
                Current: {balanceStatus.balance} ETB
                {!balanceStatus.isMet && ` (Need ${balanceStatus.remaining} more)`}
              </p>
            </div>
          </div>
          {balanceStatus.isMet ? (
            <span className="text-emerald-400 text-[10px] font-semibold">✓ Met</span>
          ) : (
            <span className="text-zinc-500 text-[10px]">{balanceStatus.balance}/{MIN_WITHDRAWAL}</span>
          )}
        </div>

        {/* Referrals Requirement */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {referralStatus.isMet ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-zinc-600" />
            )}
            <div>
              <p className={`text-xs ${referralStatus.isMet ? 'text-white' : 'text-zinc-400'}`}>
                {REQUIRED_REFERRALS}+ Invited Friends
              </p>
              <p className="text-zinc-500 text-[10px]">
                Current: {referralStatus.count} friends
                {!referralStatus.isMet && ` (Need ${referralStatus.remaining} more)`}
              </p>
            </div>
          </div>
          {referralStatus.isMet ? (
            <span className="text-emerald-400 text-[10px] font-semibold">✓ Met</span>
          ) : (
            <span className="text-zinc-500 text-[10px]">{referralStatus.count}/{REQUIRED_REFERRALS}</span>
          )}
        </div>
      </div>

      {/* Withdrawal Rules */}
      <div className="bg-zinc-950 rounded-xl p-3.5 mb-5 border border-zinc-900">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-xs font-bold">Withdrawal Rules</p>
            <ul className="text-zinc-400 text-[11px] mt-1 space-y-1">
              <li className="flex items-center gap-2">
                <span className={balanceStatus.isMet ? 'text-emerald-400' : 'text-zinc-600'}>
                  {balanceStatus.isMet ? '✅' : '❌'}
                </span>
                Minimum balance: {MIN_WITHDRAWAL} ETB
                {balanceStatus.isMet && ' ✓'}
              </li>
              <li className="flex items-center gap-2">
                <span className={referralStatus.isMet ? 'text-emerald-400' : 'text-zinc-600'}>
                  {referralStatus.isMet ? '✅' : '❌'}
                </span>
                Invite {REQUIRED_REFERRALS} friends
                {referralStatus.isMet && ' ✓'}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">⏱️</span>
                Processing time: 24-48 hours
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">📱</span>
                Supported: Telebirr & CBE
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Withdraw Button */}
      <button
        onClick={handleWithdraw}
        disabled={!canWithdraw() || withdrawing}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
          !canWithdraw() || withdrawing
            ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
            : 'bg-emerald-400 hover:bg-emerald-300 text-black'
        }`}
      >
        {withdrawing ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : !canWithdraw() ? (
          'Requirements Not Met'
        ) : (
          'Withdraw Funds'
        )}
      </button>

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="bg-zinc-950 rounded-xl p-2.5 border border-zinc-900 text-center">
          <p className="text-zinc-400 text-[10px]">Balance Status</p>
          <p className={`text-xs font-bold ${balanceStatus.isMet ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {balanceStatus.isMet ? '✅ Met' : `${balanceStatus.balance}/${MIN_WITHDRAWAL}`}
          </p>
        </div>
        <div className="bg-zinc-950 rounded-xl p-2.5 border border-zinc-900 text-center">
          <p className="text-zinc-400 text-[10px]">Referrals</p>
          <p className={`text-xs font-bold ${referralStatus.isMet ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {referralStatus.isMet ? '✅ Met' : `${referralStatus.count}/${REQUIRED_REFERRALS}`}
          </p>
        </div>
      </div>
    </div>
  );
}