import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { TelegramProvider } from '@/components/telegram/TelegramProvider';
import { BottomNav } from '@/components/ui/BottomNav';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'PointNova - Earn with Tasks',
  description: 'Complete tasks and earn rewards with PointNova',
  applicationName: 'PointNova',
  authors: [{ name: 'PointNova' }],
  keywords: ['earn', 'tasks', 'rewards', 'points'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} dark`}>
      <head>
        <script 
          src="https://telegram.org/js/telegram-web-app.js" 
          async
        />
      </head>
      <body className={`${outfit.className} min-h-screen bg-black antialiased`}>
        <TelegramProvider>
          <AuthProvider>
            <main className="min-h-screen bg-black pb-20">
              {children}
            </main>
            <BottomNav />
          </AuthProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}