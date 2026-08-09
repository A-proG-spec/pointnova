'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Share2, Users, ArrowLeft, Check, UserPlus, Coins, Link2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTelegram } from '@/components/telegram/TelegramProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ReferralData {
  referralCode: string;
  referralLink: string;
  referralCount: number;
  referralEarnings: number;
  referrals: {
    userId: string;
    username: string;
    firstName: string;
    joinedAt: string;
  }[];
}

export default function InvitePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { webApp } = useTelegram();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const REFERRAL_REWARD = 100;

  const fetchReferralData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/referral?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setReferralData(data);
        await refreshUser(); // Sync balance
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, refreshUser]);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const handleCopy = async () => {
    if (referralData?.referralLink) {
      try {
        await navigator.clipboard.writeText(referralData.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Error copying:', error);
      }
    }
  };

  const handleShare = async () => {
    if (webApp && referralData?.referralLink) {
      try {
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
          referralData.referralLink
        )}&text=${encodeURIComponent('🚀 Join PointNova and start earning rewards!')}`;
        webApp.openTelegramLink(shareUrl);
        return;
      } catch (error) {
        console.error('Telegram share error:', error);
      }
    }

    if (referralData?.referralLink) {
      try {
        await navigator.share({
          title: 'Join PointNova',
          text: `🚀 Join PointNova and start earning rewards! Use my referral link: ${referralData.referralLink}`,
          url: referralData.referralLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        handleCopy();
      }
    }
  };

  if (loading && !referralData) {
    return <LoadingSpinner text="Loading referral details..." />;
  }

  const totalReferralEarnings = referralData?.referralEarnings || 0;
  const referralCount = referralData?.referralCount || 0;

  return (
    <div className="min-h-screen bg-black p-4 pb-24 text-white">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/10 rounded-full transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-bold">Invite Friends</h1>
        <Users className="w-5 h-5 text-blue-500 ml-auto" />
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Invite & Earn</h2>
          <p className="text-white/60 text-sm">
            Share your link and earn <span className="text-emerald-500 font-bold">{REFERRAL_REWARD} ETB</span> for every friend who joins!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-black/50 rounded-xl p-3 text-center border border-white/5">
            <p className="text-white/40 text-xs">Total Referrals</p>
            <p className="text-emerald-500 font-bold text-xl">{referralCount}</p>
          </div>
          <div className="bg-black/50 rounded-xl p-3 text-center border border-white/5">
            <p className="text-white/40 text-xs">Total Earned</p>
            <p className="text-emerald-500 font-bold text-xl">{totalReferralEarnings} ETB</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl p-3 mb-4 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-white text-sm font-semibold">Your Balance</p>
                <p className="text-white/40 text-xs">Available to withdraw</p>
              </div>
            </div>
            <p className="text-emerald-500 font-bold text-lg">{user?.balance || 0} ETB</p>
          </div>
        </div>

        <div className="bg-black/50 rounded-xl p-3 mb-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-blue-400" />
            <p className="text-white/40 text-xs font-medium">Your Referral Link</p>
          </div>
          <div className="bg-black/30 rounded-lg p-2.5 mb-2">
            <p className="text-white/80 text-xs break-all font-mono">
              {referralData?.referralLink || 'Generating link...'}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-white/20 text-[10px]">Share this link with friends</p>
            <span className="text-white/20 text-[10px] bg-white/5 px-2 py-0.5 rounded-full">
              {referralData?.referralCode || '...'}
            </span>
          </div>
        </div>

        <div className="bg-black/50 rounded-xl p-3 mb-4 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/40 text-xs font-semibold">Invited Friends</p>
            <span className="text-white/20 text-[10px]">{referralCount} invited</span>
          </div>
          
          {referralCount === 0 ? (
            <div className="text-center py-4">
              <UserPlus className="w-6 h-6 text-white/20 mx-auto mb-2" />
              <p className="text-white/30 text-xs">No invited users yet</p>
              <p className="text-white/20 text-[10px]">Share your link to start earning!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {referralData?.referrals.map((person) => (
                <div
                  key={person.userId}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xs font-bold">
                      {person.firstName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{person.firstName}</p>
                      <p className="text-white/30 text-[10px]">
                        @{person.username || 'telegram user'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-500 text-xs font-bold">+{REFERRAL_REWARD} ETB</p>
                    <p className="text-white/20 text-[9px]">
                      {new Date(person.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          <button
            onClick={handleCopy}
            disabled={!referralData?.referralLink}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/10 disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleShare}
            disabled={!referralData?.referralLink}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Link</span>
          </button>
        </div>
      </div>

      <div className="mt-4 bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
        <h3 className="text-white font-semibold text-sm mb-2">How it works</h3>
        <div className="space-y-2 text-white/60 text-xs">
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold">1.</span>
            <span>Share your referral link with friends</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold">2.</span>
            <span>Friends join PointNova using your link</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold">3.</span>
            <span>You earn <span className="text-emerald-500 font-bold">{REFERRAL_REWARD} ETB</span> for each friend who joins</span>
          </div>
        </div>
      </div>
    </div>
  );
}