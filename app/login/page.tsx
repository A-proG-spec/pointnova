'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Coins, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTelegram } from '@/components/telegram/TelegramProvider';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, login, reauthenticate } = useAuth();
  const { user: telegramUser, initData, isReady, currentTelegramId } = useTelegram();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authAttempted = useRef(false);

  // FIX: Get referral code from both 'ref' and 'startapp' parameters
  let ref = searchParams.get('ref');
  if (!ref) {
    // Telegram passes referral as 'startapp' parameter
    const startapp = searchParams.get('startapp');
    if (startapp && startapp.startsWith('ref_')) {
      ref = startapp;
    }
  }

  // Check for stored user mismatch on page load
  useEffect(() => {
    if (isReady && currentTelegramId) {
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        try {
          const storedUser = JSON.parse(storedUserData);
          if (storedUser.telegramId !== currentTelegramId) {
            console.log('🔄 User mismatch detected on login page. Clearing old session.');
            localStorage.removeItem('user_data');
            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            reauthenticate();
          }
        } catch (e) {
          console.error('Error checking stored user:', e);
        }
      }
    }
  }, [isReady, currentTelegramId]);

  useEffect(() => {
    if (isAuthenticated) {
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData && currentTelegramId) {
        try {
          const storedUser = JSON.parse(storedUserData);
          if (storedUser.telegramId !== currentTelegramId) {
            console.log('❌ Auth mismatch. Re-authenticating.');
            reauthenticate();
            return;
          }
        } catch (e) {
          console.error('Error:', e);
        }
      }
      router.push('/');
    }
  }, [isAuthenticated, router, currentTelegramId]);

  useEffect(() => {
    if (isReady && initData && !isAuthenticated && !authAttempted.current) {
      authAttempted.current = true;
      handleTelegramLogin();
    }
  }, [isReady, initData, isAuthenticated]);

  const handleTelegramLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!initData) {
        setError('No Telegram data available. Please open the app from Telegram.');
        setIsLoading(false);
        return;
      }

      console.log('📝 Sending referral ref:', ref); // Debug log

      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, ref: ref || undefined }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed');

      login(data.user);
      router.push('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to login');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-zinc-950 rounded-full mb-3 border border-zinc-900">
            <Coins className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">PointNova</h1>
          <p className="text-zinc-400 text-xs mt-0.5">Monetize your actions effortlessly</p>
        </div>

        <div className="bg-zinc-950 rounded-xl p-5 border border-zinc-900">
          <h2 className="text-base font-bold mb-3">
            {isLoading ? 'Authenticating...' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="mb-3 p-2.5 bg-black border border-rose-500/30 rounded-lg flex items-center gap-2 text-zinc-300 text-xs">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={handleTelegramLogin}
            disabled={isLoading || !initData || !isReady}
            className="w-full bg-emerald-400 hover:bg-emerald-300 text-black font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all text-xs disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue with Telegram'}
          </button>
        </div>
      </div>
    </div>
  );
}