'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, TrendingUp, Award, Users, Wallet } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: TrendingUp, label: 'Earn', path: '/earn' },
    { icon: Award, label: 'Top', path: '/leaderboard' },
    { icon: Users, label: 'Invite', path: '/invite' },
    { icon: Wallet, label: 'Withdraw', path: '/withdraw' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 px-2 py-1.5 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-all relative ${
                active ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform ${active ? 'scale-110' : ''}`} />
              <span className={`text-[10px] mt-1 font-medium ${
                active ? 'text-emerald-400 font-bold' : 'text-zinc-500'
              }`}>
                {label}
              </span>
              {active && (
                <div className="absolute -top-1.5 w-5 h-0.5 bg-purple-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}