export interface User {
  _id?: string;
  telegramId: string;
  username?: string;
  firstName: string;
  lastName?: string;
  balance: number;
  totalEarned: number;
  referralCode: string;
  referredBy?: string;
  createdAt: Date;
  updatedAt: Date;
  completedTasks?: string[]; // Add this
}

export interface Task {
  _id?: string;
  title: string;
  description: string;
  reward: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  username: string;
  totalEarned: number;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    show_11526637?: (
      options?: string | { type?: string; ymid?: string; requestVar?: string }
    ) => Promise<void>;
  }
}

export {};