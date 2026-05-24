export const scoreByHintsUsed: Record<number, number> = {
  0: 10,
  1: 7,
  2: 5,
  3: 4,
  4: 3,
  5: 2,
  6: 1,
};

export const getScoreByHintsUsed = (hintsUsed: number): number =>
  scoreByHintsUsed[Math.max(0, Math.min(6, hintsUsed))] ?? 0;
