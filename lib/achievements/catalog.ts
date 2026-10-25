export type AchievementMetric =
  | "roundsCompleted"
  | "questionsAnswered"
  | "correctAnswers"
  | "bestStreak"
  | "perfectRounds"
  | "falseIdentified"
  | "trueMistakes"
  | "achievementCount"
  | "allOthers";

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "progress" | "skill" | "meta";
  order: number;
  xpReward: number;
  target: number;
  metric: AchievementMetric;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_step",
    title: "Первый шаг",
    description: "Заверши первый раунд.",
    icon: "🌱",
    category: "progress",
    order: 1,
    xpReward: 25,
    target: 1,
    metric: "roundsCompleted",
  },
  {
    id: "curious",
    title: "Любопытный",
    description: "Ответь на 10 вопросов.",
    icon: "🔍",
    category: "progress",
    order: 2,
    xpReward: 30,
    target: 10,
    metric: "questionsAnswered",
  },
  {
    id: "erudite",
    title: "Эрудит",
    description: "Дай 100 правильных ответов.",
    icon: "📚",
    category: "skill",
    order: 3,
    xpReward: 50,
    target: 100,
    metric: "correctAnswers",
  },
  {
    id: "connoisseur",
    title: "Знаток",
    description: "Дай 500 правильных ответов.",
    icon: "🎓",
    category: "skill",
    order: 4,
    xpReward: 120,
    target: 500,
    metric: "correctAnswers",
  },
  {
    id: "sharpshooter",
    title: "Меткий стрелок",
    description: "Ответь правильно на 10 вопросов подряд.",
    icon: "🎯",
    category: "skill",
    order: 5,
    xpReward: 60,
    target: 10,
    metric: "bestStreak",
  },
  {
    id: "unbreakable",
    title: "Несокрушимый",
    description: "Заверши раунд без ошибок 5 раз.",
    icon: "🛡️",
    category: "skill",
    order: 6,
    xpReward: 80,
    target: 5,
    metric: "perfectRounds",
  },
  {
    id: "perfectionist",
    title: "Перфекционист",
    description: "Пройди один раунд без ошибок.",
    icon: "✨",
    category: "skill",
    order: 7,
    xpReward: 40,
    target: 1,
    metric: "perfectRounds",
  },
  {
    id: "skeptic",
    title: "Скептик",
    description: "Правильно определи 10 ложных утверждений.",
    icon: "🧐",
    category: "skill",
    order: 8,
    xpReward: 45,
    target: 10,
    metric: "falseIdentified",
  },
  {
    id: "gullible",
    title: "Доверчивый",
    description: "Ошибись на 10 правдивых утверждениях.",
    icon: "🙈",
    category: "skill",
    order: 9,
    xpReward: 35,
    target: 10,
    metric: "trueMistakes",
  },
  {
    id: "veteran",
    title: "Ветеран",
    description: "Заверши 50 раундов.",
    icon: "🏅",
    category: "progress",
    order: 10,
    xpReward: 100,
    target: 50,
    metric: "roundsCompleted",
  },
  {
    id: "collector",
    title: "Коллекционер",
    description: "Получи 10 других достижений.",
    icon: "🧰",
    category: "meta",
    order: 11,
    xpReward: 75,
    target: 10,
    metric: "achievementCount",
  },
  {
    id: "legend",
    title: "Легенда",
    description: "Получи все остальные достижения.",
    icon: "👑",
    category: "meta",
    order: 12,
    xpReward: 200,
    target: 1,
    metric: "allOthers",
  },
];

export const ACHIEVEMENT_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a])) as Record<
  string,
  AchievementDef
>;

export const META_IDS = new Set(["collector", "legend"]);
