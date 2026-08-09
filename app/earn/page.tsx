'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { TaskCard } from '@/components/ui/TaskCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/components/auth/AuthProvider';

interface Task {
  id?: string;
  _id?: string;
  name: string;
  reward: number;
}

export default function EarnPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  // Fetch tasks from database
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      } else {
        console.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Update completed tasks state whenever user data updates
  useEffect(() => {
    if (user && Array.isArray(user.completedTasks)) {
      setCompletedTaskIds(user.completedTasks);
    }
  }, [user]);

  const handleTaskComplete = async (taskId: string) => {
    // Add locally to give immediate UI response
    setCompletedTaskIds((prev) => Array.from(new Set([...prev, taskId])));
    // Sync user state from MongoDB
    await refreshUser();
  };

  if (loading) {
    return <LoadingSpinner text="Loading tasks..." />;
  }

  const completedCount = completedTaskIds.length;
  const totalTasks = tasks.length;
  const allCompleted = totalTasks > 0 && completedCount === totalTasks;

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

      {/* User Stats Card */}
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
            <p className="text-blue-400 font-bold text-xl">
              {completedCount}/{totalTasks}
            </p>
          </div>
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-10 bg-zinc-950 rounded-xl border border-zinc-900">
          <p className="text-zinc-400 text-sm">No tasks available right now.</p>
          <p className="text-zinc-500 text-xs mt-1">Check back later for new tasks!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const taskId = (task.id || task._id)?.toString() || '';
            return (
              <TaskCard
                key={taskId}
                id={taskId}
                title={task.name}
                reward={task.reward}
                isCompleted={completedTaskIds.includes(taskId)}
                onComplete={handleTaskComplete}
              />
            );
          })}
        </div>
      )}

      {/* All Completed Banner */}
      {totalTasks > 0 && allCompleted && (
        <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-emerald-400 text-sm font-semibold">🎉 All tasks completed!</p>
          <p className="text-zinc-400 text-xs mt-1">Come back tomorrow for more opportunities</p>
        </div>
      )}
    </div>
  );
}