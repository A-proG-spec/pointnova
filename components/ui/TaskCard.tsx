'use client';

import { Play, Coins, Check, Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

const TIMER_DURATION = 30; // 30 seconds

interface TaskCardProps {
  id: string;
  title: string;
  reward: number;
  isCompleted?: boolean;
  onComplete?: (taskId: string) => void;
}

type TaskStatus = 'idle' | 'loading' | 'waiting' | 'ready' | 'completed' | 'error';

export function TaskCard({ id, title, reward, isCompleted = false, onComplete }: TaskCardProps) {
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<TaskStatus>(isCompleted ? 'completed' : 'idle');
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [isClaiming, setIsClaiming] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Check if task is already completed
  useEffect(() => {
    if (isCompleted) {
      setStatus('completed');
    }
  }, [isCompleted]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const startTimer = () => {
    setTimer(TIMER_DURATION);
    setStatus('waiting');
    
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setStatus('ready');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePlay = async () => {
    if (status === 'completed' || status === 'loading' || status === 'waiting') return;

    try {
      setStatus('loading');

      // Check if Monetag SDK is available
      if (typeof window === 'undefined' || !window.show_11526637) {
        throw new Error('Ad SDK not loaded. Please try again.');
      }

      // Call Monetag SDK with popup type
      await window.show_11526637({ 
        type: 'pop',
        requestVar: id // Track which task was clicked
      });

      // If we reach here, popup opened successfully
      // Start the timer for user to view the ad
      startTimer();

    } catch (error) {
      console.error('❌ Ad error:', error);
      setStatus('idle');
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to open ad. Please allow popups and try again.';
      showToast(errorMessage, 'error');
    }
  };

  const handleClaim = async () => {
    if (status !== 'ready' || isClaiming) return;

    try {
      setIsClaiming(true);
      setStatus('loading');

      // Call reward API
      const response = await fetch('/api/user/reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: reward,
          taskId: id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim reward');
      }

      // Success!
      setStatus('completed');
      showToast(`🎉 +${reward} ETB earned!`, 'success');
      
      // Refresh user data
      await refreshUser();
      
      // Notify parent
      if (onComplete) {
        onComplete(id);
      }

    } catch (error) {
      console.error('❌ Claim error:', error);
      setStatus('ready');
      showToast(error instanceof Error ? error.message : 'Failed to claim reward', 'error');
    } finally {
      setIsClaiming(false);
    }
  };

  // Reset task (if error occurs)
  const handleRetry = () => {
    setStatus('idle');
    setTimer(TIMER_DURATION);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Get button state
  const getButtonConfig = () => {
    switch (status) {
      case 'idle':
        return {
          text: '▶ Play',
          color: 'bg-emerald-400 hover:bg-emerald-300 text-black',
          disabled: false,
          onClick: handlePlay,
        };
      case 'loading':
        return {
          text: 'Opening...',
          color: 'bg-zinc-700 text-white/50',
          disabled: true,
          onClick: () => {},
        };
      case 'waiting':
        return {
          text: `⏳ ${timer}s`,
          color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
          disabled: true,
          onClick: () => {},
        };
      case 'ready':
        return {
          text: '✅ Claim Reward',
          color: 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:scale-105 font-bold',
          disabled: false,
          onClick: handleClaim,
        };
      case 'completed':
        return {
          text: '✓ Completed',
          color: 'bg-zinc-800 text-zinc-400',
          disabled: true,
          onClick: () => {},
        };
      case 'error':
        return {
          text: '↻ Retry',
          color: 'bg-red-500/20 text-red-400 border border-red-500/30',
          disabled: false,
          onClick: handleRetry,
        };
      default:
        return {
          text: '▶ Play',
          color: 'bg-emerald-400 hover:bg-emerald-300 text-black',
          disabled: false,
          onClick: handlePlay,
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 p-3 rounded-xl animate-slide-down ${
          toast.type === 'error' ? 'bg-red-500/90' :
          toast.type === 'success' ? 'bg-emerald-500/90' :
          'bg-blue-500/90'
        }`}>
          <p className="text-white text-center text-sm font-semibold">{toast.message}</p>
        </div>
      )}

      <div className={`bg-zinc-950 rounded-xl p-4 border transition-all ${
        status === 'completed' ? 'border-emerald-500/30 bg-emerald-500/5' :
        status === 'ready' ? 'border-amber-500/30 bg-amber-500/5' :
        'border-zinc-900'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coins className={`w-5 h-5 ${
              status === 'completed' ? 'text-emerald-400' : 'text-purple-400'
            }`} />
            <div>
              <h3 className={`font-bold text-sm ${
                status === 'completed' ? 'text-emerald-400' : 'text-white'
              }`}>
                {title}
                {status === 'completed' && ' ✅'}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-zinc-400 text-xs">+{reward} ETB</span>
                {status === 'waiting' && (
                  <span className="text-yellow-400 text-[10px] bg-yellow-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Watch ad
                  </span>
                )}
                {status === 'error' && (
                  <span className="text-red-400 text-[10px] bg-red-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Failed
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={buttonConfig.onClick}
            disabled={buttonConfig.disabled || isClaiming}
            className={`
              px-4 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold
              transition-all flex-shrink-0
              ${buttonConfig.color}
              ${!buttonConfig.disabled ? 'hover:scale-105' : 'cursor-not-allowed'}
            `}
          >
            {isClaiming ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-black border-t-transparent" />
                <span>Claiming...</span>
              </>
            ) : (
              buttonConfig.text
            )}
          </button>
        </div>
      </div>
    </>
  );
}