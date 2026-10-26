export type AccountUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type AccountStats = {
  roundsCompleted: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  bestStreak: number;
  totalXp: number;
};

export type AccountAchievementItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  unlocked: boolean;
  unlockedAt: string | null;
};

export type AccountAchievements = {
  unlocked: number;
  total: number;
  items: AccountAchievementItem[];
};

export type AccountProfile = {
  user: AccountUser;
  level: number;
  levelTitle: string;
  xp: number;
  xpIntoLevel: number;
  xpForNext: number;
  xpProgress: number;
  stats: AccountStats;
  achievements: AccountAchievements;
};
