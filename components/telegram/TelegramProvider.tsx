'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface TelegramContextType {
  webApp: any;
  user: any;
  initData: string;
  isReady: boolean;
  sendData: (data: any) => void;
  close: () => void;
  expand: () => void;
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  initData: '',
  isReady: false,
  sendData: () => {},
  close: () => {},
  expand: () => {},
});

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [webApp, setWebApp] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [initData, setInitData] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if running in browser
    if (typeof window === 'undefined') return;

    const initTelegram = () => {
      // Check for Telegram WebApp
      const telegram = (window as any).Telegram;
      const app = telegram?.WebApp;
      
      if (app) {
        console.log('📱 Telegram WebApp detected');
        setWebApp(app);
        setUser(app.initDataUnsafe?.user || null);
        setInitData(app.initData || '');
        setIsReady(true);
        app.expand();
        app.enableClosingConfirmation();
      } else if (process.env.NODE_ENV === 'development') {
        // Mock for development
        console.log('🔧 Development mode: Using mock Telegram');
        const mockUser = {
          id: 123456789,
          first_name: 'Dev',
          last_name: 'User',
          username: 'devuser',
          photo_url: 'https://ui-avatars.com/api/?name=Dev+User&background=22c55e&color=fff',
        };
        
        const mockInitData = new URLSearchParams({
          user: JSON.stringify(mockUser),
          auth_date: Math.floor(Date.now() / 1000).toString(),
          hash: 'mock_hash'
        }).toString();

        setUser(mockUser);
        setInitData(mockInitData);
        setIsReady(true);
        console.log('🔧 Mock Telegram initialized');
      } else {
        console.log('⚠️ No Telegram WebApp found');
      }
    };

    // Try immediately and after a delay
    initTelegram();
    const timeout = setTimeout(initTelegram, 500);

    return () => clearTimeout(timeout);
  }, []);

  const sendData = (data: any) => {
    if (webApp) {
      webApp.sendData(typeof data === 'string' ? data : JSON.stringify(data));
    }
  };

  const close = () => {
    if (webApp) {
      webApp.close();
    }
  };

  const expand = () => {
    if (webApp) {
      webApp.expand();
    }
  };

  return (
    <TelegramContext.Provider 
      value={{ 
        webApp, 
        user, 
        initData, 
        isReady,
        sendData,
        close,
        expand,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}