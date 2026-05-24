export type AppSettings = {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  language: 'it' | 'en';
};

export type ProgressSnapshot = {
  matchesPlayed: number;
  matchesWon: number;
  countriesGuessed: number;
  bestRoundScore: number;
  totalAttempts: number;
  correctAttempts: number;
  lastMatches: Array<{
    date: string;
    opponent: string;
    result: 'Vittoria' | 'Sconfitta';
    scoreDelta: number;
  }>;
  modeStats: Record<string, number>;
};

const settingsKey = 'geoclue-duel:settings';
const progressKey = 'geoclue-duel:progress';

export const defaultSettings: AppSettings = {
  soundEnabled: false,
  animationsEnabled: true,
  language: 'it',
};

export const defaultProgress: ProgressSnapshot = {
  matchesPlayed: 0,
  matchesWon: 0,
  countriesGuessed: 0,
  bestRoundScore: 0,
  totalAttempts: 0,
  correctAttempts: 0,
  lastMatches: [],
  modeStats: {},
};

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
};

export const loadSettings = (): AppSettings => readJson(settingsKey, defaultSettings);

export const saveSettings = (settings: AppSettings): void => {
  window.localStorage.setItem(settingsKey, JSON.stringify(settings));
};

export const loadProgress = (): ProgressSnapshot => readJson(progressKey, defaultProgress);

export const saveProgress = (progress: ProgressSnapshot): void => {
  window.localStorage.setItem(progressKey, JSON.stringify(progress));
};

export const resetGeoClueStorage = (): void => {
  window.localStorage.removeItem(settingsKey);
  window.localStorage.removeItem(progressKey);
};
