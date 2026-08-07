'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useTelegram } from '@/components/telegram/TelegramProvider'; // ADD THIS IMPORT

interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  balance: number;
  totalEarned: number;
  referralCode: string;
  referredBy?: string;
  referrals?: {
    userId: string;
    username: string;
    firstName: string;
    joinedAt: string;
  }[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  reauthenticate: () => Promise<void>; // ADD THIS
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  isAuthenticated: false,
  refreshUser: async () => {},
  reauthenticate: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { currentTelegramId, isReady } = useTelegram(); // ADD THIS

  // ADD: Function to check if stored user matches current Telegram user
  const validateUserMatchesTelegram = () => {
    if (!isReady || !currentTelegramId) {
      console.log('⚠️ Telegram not ready or no ID');
      return true; // Can't validate, assume ok
    }

    const storedUserData = localStorage.getItem('user_data');
    if (!storedUserData) {
      console.log('ℹ️ No stored user data');
      return true; // No stored user, proceed with login
    }

    try {
      const storedUser = JSON.parse(storedUserData);
      const storedTelegramId = storedUser.telegramId;
      
      if (storedTelegramId !== currentTelegramId) {
        console.log(`🔄 User mismatch! Stored: ${storedTelegramId}, Current: ${currentTelegramId}`);
        return false;
      }
      
      console.log('✅ User matches current Telegram account');
      return true;
    } catch (e) {
      console.error('Error parsing stored user:', e);
      return false;
    }
  };

  // ADD: Function to force re-authentication
  const reauthenticate = async () => {
    console.log('🔄 Re-authenticating...');
    
    // Clear all session data
    Cookies.remove('auth_token');
    Cookies.remove('user_data');
    localStorage.removeItem('user_data');
    setUser(null);
    
    // Redirect to login
    if (!window.location.pathname.includes('/login')) {
      router.push('/login');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // MODIFY: Check auth with validation
  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication...');

      // ADD: Validate user matches Telegram
      const userMatches = validateUserMatchesTelegram();
      if (!userMatches) {
        console.log('❌ User mismatch detected. Clearing session.');
        await reauthenticate();
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Existing session found');
        
        // ADD: Double-check server response matches Telegram
        if (isReady && currentTelegramId && data.user.telegramId !== currentTelegramId) {
          console.log('❌ Server user mismatch. Re-authenticating.');
          await reauthenticate();
          setLoading(false);
          return;
        }
        
        setUser(data.user);
        Cookies.set(
          'user_data',
          JSON.stringify(data.user),
          { expires: 7 }
        );
        setLoading(false);
        return;
      }

      console.log('⚠️ User not found or token expired');
      Cookies.remove('user_data');

      // Try automatic Telegram re-login
      const telegram = (window as any).Telegram?.WebApp;

      if (telegram?.initData) {
        console.log('🔄 Telegram re-authentication started');

        const authResponse = await fetch('/api/auth/telegram', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData: telegram.initData,
          }),
        });

        const authData = await authResponse.json();

        if (authResponse.ok) {
          console.log('✅ Telegram re-authentication successful');
          setUser(authData.user);
          Cookies.set(
            'user_data',
            JSON.stringify(authData.user),
            { expires: 7 }
          );
          setLoading(false);
          return;
        }

        console.log('❌ Telegram authentication failed');
      } else {
        console.log('⚠️ Telegram WebApp data not available');
      }

      router.push('/login');
    } catch (error) {
      console.error('❌ Authentication error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    // ADD: Verify user matches Telegram before login
    if (isReady && currentTelegramId && userData.telegramId !== currentTelegramId) {
      console.error('❌ Attempted to login with wrong user');
      return;
    }
    
    setUser(userData);
    Cookies.set(
      'user_data',
      JSON.stringify(userData),
      { expires: 7 }
    );
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
      Cookies.remove('auth_token');
      Cookies.remove('user_data');
      localStorage.removeItem('user_data');

      router.push('/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        Cookies.set(
          'user_data',
          JSON.stringify(data.user),
          { expires: 7 }
        );
        console.log('✅ User data refreshed');
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        refreshUser,
        reauthenticate, // ADD THIS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}