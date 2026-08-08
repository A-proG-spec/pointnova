'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Coins } from 'lucide-react';
import { TaskCard } from '@/components/ui/TaskCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/components/auth/AuthProvider';

// Generate tasks dynamically using Array.from
const TASK_COUNT = 5;
const REWARD_AMOUNT = 25;

const TASKS = Array.from({ length: TASK_COUNT }, (_, index) => ({
  id: `ad_${index + 1}`,
  title: 'Watch Ad',
  reward: REWARD_AMOUNT,
}));

export default function EarnPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setCompletedTasks(user.completedTasks || []);
    }
    setLoading(false);
  }, [user]);

  const handleTaskComplete = async (taskId: string) => {
    await refreshUser();
    setCompletedTasks((prev) => [...prev, taskId]);
  };

  if (loading) {
    return <LoadingSpinner text="Loading..." />;
  }

  // Calculate progress
  const completedCount = completedTasks.length;
  const totalTasks = TASKS.length;
  const allCompleted = completedCount === totalTasks;

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
        <h1 className="text-xl font-bold tracking-tight">Earn Points</h1>
      </div>

      {/* User Stats */}
      <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-900 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-xs">Your Balance</p>
            <p className="text-emerald-400 font-bold text-xl">{user?.balance || 0} ETB</p>
          </div>
          <div className="text-right">
            <p className="text-zinc-400 text-xs">Total Earned</p>
            <p className="text-white font-bold text-xl">{user?.totalEarned || 0} ETB</p>
          </div>
          <div className="text-right">
            <p className="text-zinc-400 text-xs">Tasks Done</p>
            <p className="text-blue-400 font-bold text-xl">{completedCount}/{totalTasks}</p>
          </div>
        </div>
      </div>

      {/* Task List - Using map to render all tasks */}
      <div className="space-y-3">
        {TASKS.map((task) => (
          <TaskCard
            key={task.id}
            id={task.id}
            title={task.title}
            reward={task.reward}
            isCompleted={completedTasks.includes(task.id)}
            onComplete={handleTaskComplete}
          />
        ))}
      </div>

      {/* All tasks completed message */}
      {allCompleted && (
        <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-emerald-400 text-sm font-semibold">🎉 All tasks completed!</p>
          <p className="text-zinc-400 text-xs mt-1">Come back tomorrow for more opportunities</p>
        </div>
      )}
    </div>
  );
}