export const normalizeGuess = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’'`´]/g, ' ')
    .replace(/[-_/.,;:!?()[\]{}]/g, ' ')
    .replace(/&/g, ' e ')
    .replace(/\s+/g, ' ')
    .trim();

export const compactNormalized = (text: string): string =>
  normalizeGuess(text).replace(/\s+/g, '');
