'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { TaskCard } from '@/components/ui/TaskCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/components/auth/AuthProvider';

interface Task {
  _id: string;
  title: string;
  description: string;
  reward: number;
  url: string;
}

export default function EarnPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskPlay = (taskId: string) => {
    console.log(`Task ${taskId} executed`);
  };

  if (loading) {
    return <LoadingSpinner text="Loading tasks..." />;
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
        <h1 className="text-xl font-bold tracking-tight">Earn Points</h1>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No Tasks Available"
          description="Check back later for new earning opportunities!"
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              id={task._id}
              title={task.title}
              description={task.description}
              reward={task.reward}
              url={task.url}
              onPlay={handleTaskPlay}
            />
          ))}
        </div>
      )}
    </div>
  );
}