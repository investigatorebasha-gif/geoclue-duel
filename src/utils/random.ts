export type RandomSource = () => number;

export const randomInt = (min: number, max: number, rng: RandomSource = Math.random): number =>
  Math.floor(rng() * (max - min + 1)) + min;

export const sample = <T>(items: T[], rng: RandomSource = Math.random): T => {
  if (items.length === 0) {
    throw new Error('Cannot sample from an empty list.');
  }

  return items[randomInt(0, items.length - 1, rng)];
};

export const shuffle = <T>(items: T[], rng: RandomSource = Math.random): T[] => {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index, rng);
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
};

export const chance = (probability: number, rng: RandomSource = Math.random): boolean =>
  rng() < Math.max(0, Math.min(1, probability));

export const createId = (prefix: string): string =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
