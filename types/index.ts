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
  completedTasks: string[]; // Array of task IDs (MongoDB ObjectIds)
  referralEarnings: number;
  referralCount: number;
  referralHistory: {
    userId: string;
    joinedAt: Date;
    reward: number;
  }[];
}

export interface Task {
  _id?: string;
  name: string;
  reward: number;
  isActive: boolean;
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

// Monetag SDK type declaration
declare global {
  interface Window {
    show_11526637: (options: { type: string; requestVar?: string }) => Promise<void>;
  }
}