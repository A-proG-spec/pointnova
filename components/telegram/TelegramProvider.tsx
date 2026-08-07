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


      if (!app) {

        console.log('⚠️ Telegram WebApp not detected');

        return;
      }


      console.log('📱 Telegram WebApp detected');


      // IMPORTANT: tell Telegram the app is ready
      app.ready();


      const tgUser = app.initDataUnsafe?.user || null;

      const tgId = tgUser?.id
        ? tgUser.id.toString()
        : null;


      const tgStartParam =
        app.initDataUnsafe?.start_param ||
        null;



      console.log("========== TELEGRAM DEBUG ==========");
      console.log("initData:", app.initData);
      console.log("user:", tgUser);
      console.log("telegram id:", tgId);
      console.log("start_param:", tgStartParam);
      console.log("initDataUnsafe:", app.initDataUnsafe);
      console.log("====================================");



      setWebApp(app);
      setUser(tgUser);
      setInitData(app.initData || '');
      setCurrentTelegramId(tgId);
      setStartParam(tgStartParam);
      setIsReady(true);


      try {
        app.expand();
        app.enableClosingConfirmation();
      } catch(err){
        console.log("Telegram UI method error:", err);
      }

    };


    // Try immediately
    initTelegram();


    // Telegram sometimes loads late
    const interval = setInterval(() => {

      if (!isReady) {
        initTelegram();
      }

    }, 500);



    return () => {
      clearInterval(interval);
    };


  }, [isReady]);



  // Development mock
  useEffect(() => {

    if (
      process.env.NODE_ENV === 'development' &&
      !isReady
    ) {

      const mockUser = {
        id: 123456789,
        first_name: 'Dev',
        last_name: 'User',
        username: 'devuser',
      };


      const mockInitData =
        new URLSearchParams({
          user: JSON.stringify(mockUser),
          auth_date: Math.floor(Date.now()/1000).toString(),
          hash: 'mock_hash'
        }).toString();


      const params =
        new URLSearchParams(window.location.search);


      const mockStartParam =
        params.get('startapp') ||
        params.get('ref') ||
        null;



      console.log("========== DEV TELEGRAM DEBUG ==========");
      console.log("mock startParam:", mockStartParam);
      console.log("========================================");



      setUser(mockUser);
      setInitData(mockInitData);
      setCurrentTelegramId(
        mockUser.id.toString()
      );
      setStartParam(mockStartParam);
      setIsReady(true);

    }

  }, [isReady]);



  const sendData = (data:any)=>{

    if(webApp){

      webApp.sendData(
        typeof data === 'string'
        ? data
        : JSON.stringify(data)
      );

    }

  };



  const close = ()=>{

    if(webApp){
      webApp.close();
    }

  };



  const expand = ()=>{

    if(webApp){
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