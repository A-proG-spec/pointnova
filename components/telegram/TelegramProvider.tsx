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
  currentTelegramId: string | null;
  startParam: string | null;
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  initData: '',
  isReady: false,
  sendData: () => {},
  close: () => {},
  expand: () => {},
  currentTelegramId: null,
  startParam: null,
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
  const [currentTelegramId, setCurrentTelegramId] = useState<string | null>(null);
  const [startParam, setStartParam] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initTelegram = () => {
      const telegram = (window as any).Telegram;
      const app = telegram?.WebApp;
      
      if (app) {
        console.log('📱 Telegram WebApp detected');
        const tgUser = app.initDataUnsafe?.user || null;
        const tgId = tgUser?.id?.toString() || null;
        const tgStartParam = app.initDataUnsafe?.start_param || null;
        
        // ========== TELEGRAM DEBUG ==========
        console.log("========== TELEGRAM DEBUG ==========");
        console.log("initData:", app.initData);
        console.log("initDataUnsafe:", app.initDataUnsafe);
        console.log("start_param:", app.initDataUnsafe?.start_param);
        console.log("====================================");
        
        setWebApp(app);
        setUser(tgUser);
        setInitData(app.initData || '');
        setCurrentTelegramId(tgId);
        setStartParam(tgStartParam);
        setIsReady(true);
        app.expand();
        app.enableClosingConfirmation();
      } else if (process.env.NODE_ENV === 'development') {
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

        const urlParams = new URLSearchParams(window.location.search);
        const mockStartParam = urlParams.get('startapp') || urlParams.get('ref') || null;

        // ========== TELEGRAM DEBUG (Dev) ==========
        console.log("========== TELEGRAM DEBUG ==========");
        console.log("Mock startParam from URL:", mockStartParam);
        console.log("====================================");

        setUser(mockUser);
        setInitData(mockInitData);
        setCurrentTelegramId(mockUser.id.toString());
        setStartParam(mockStartParam);
        setIsReady(true);
        console.log('🔧 Mock Telegram initialized with startParam:', mockStartParam);
      } else {
        console.log('⚠️ No Telegram WebApp found');
      }
    };

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
        currentTelegramId,
        startParam,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}