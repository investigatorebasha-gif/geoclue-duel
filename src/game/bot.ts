import type { Country } from '../data/countryTypes';
import { chance, sample, type RandomSource } from '../utils/random';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export type BotGuessResult = {
  guess: string;
  countryId: string;
  isCorrect: boolean;
  confidence: number;
};

const probabilities: Record<BotDifficulty, number[]> = {
  easy: [0.01, 0.04, 0.09, 0.18, 0.28, 0.42, 0.68],
  medium: [0.03, 0.08, 0.17, 0.31, 0.47, 0.62, 0.82],
  hard: [0.06, 0.14, 0.28, 0.46, 0.64, 0.78, 0.91],
};

const populationBandDistance = (a: Country, b: Country): number =>
  a.populationRange === b.populationRange ? 0 : Math.abs(Math.log10(a.population) - Math.log10(b.population));

const similarityScore = (target: Country, candidate: Country): number => {
  let score = 0;

  if (target.continent === candidate.continent) {
    score += 5;
  }
  if (target.region === candidate.region) {
    score += 3;
  }
  if (target.populationRange === candidate.populationRange) {
    score += 2;
  }
  if (target.coastOrLandlocked === candidate.coastOrLandlocked) {
    score += 1;
  }
  if (target.languageFamilies.some((family) => candidate.languageFamilies.includes(family))) {
    score += 3;
  }
  if (target.borders.includes(candidate.name_it) || candidate.borders.includes(target.name_it)) {
    score += 3;
  }

  return score - populationBandDistance(target, candidate);
};

export const chooseSimilarCountry = (
  target: Country,
  countries: Country[],
  previousCountryIds: string[],
  rng: RandomSource = Math.random,
): Country => {
  const candidates = countries
    .filter((country) => country.id !== target.id && !previousCountryIds.includes(country.id))
    .map((country) => ({ country, score: similarityScore(target, country) }))
    .sort((a, b) => b.score - a.score);

  const topCandidates = candidates.slice(0, Math.max(4, Math.min(10, candidates.length)));
  return topCandidates.length > 0 ? sample(topCandidates, rng).country : sample(countries, rng);
};

export const botGuess = (
  country: Country,
  revealedHints: number,
  difficulty: BotDifficulty,
  countries: Country[],
  previousCountryIds: string[] = [],
  rng: RandomSource = Math.random,
): BotGuessResult => {
  const probability = probabilities[difficulty][Math.max(0, Math.min(6, revealedHints))];

  if (chance(probability, rng)) {
    return {
      guess: country.name_it,
      countryId: country.id,
      isCorrect: true,
      confidence: probability,
    };
  }

  const wrongCountry = chooseSimilarCountry(country, countries, previousCountryIds, rng);

  return {
    guess: wrongCountry.name_it,
    countryId: wrongCountry.id,
    isCorrect: false,
    confidence: probability,
  };
};

export const simulateBotRound = (
  country: Country,
  countries: Country[],
  difficulty: BotDifficulty = 'medium',
  rng: RandomSource = Math.random,
) => {
  const attempts: BotGuessResult[] = [];
  const previousCountryIds: string[] = [];

  for (let hintsUsed = 0; hintsUsed <= 6; hintsUsed += 1) {
    const result = botGuess(country, hintsUsed, difficulty, countries, previousCountryIds, rng);
    attempts.push(result);

    if (result.isCorrect) {
      return { correct: true, hintsUsed, attempts };
    }

    previousCountryIds.push(result.countryId);
  }

  return { correct: false, hintsUsed: 6, attempts };
};
