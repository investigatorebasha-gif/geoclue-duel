import type { Country } from '../data/countryTypes';
import { compactNormalized, normalizeGuess } from '../utils/normalizeText';

export const getAcceptedAnswers = (country: Country): string[] => [
  country.name_it,
  country.name_en,
  ...country.aliases,
];

export const isCorrectGuess = (input: string, country: Country): boolean => {
  const normalizedInput = normalizeGuess(input);
  const compactInput = compactNormalized(input);

  return getAcceptedAnswers(country).some((answer) => {
    const normalizedAnswer = normalizeGuess(answer);
    return normalizedInput === normalizedAnswer || compactInput === compactNormalized(answer);
  });
};

export type GuessOption = {
  label: string;
  countryId: string;
  aliases: string[];
};

export const getGuessOptions = (countries: Country[]): GuessOption[] =>
  countries
    .map((country) => ({
      label: country.name_it,
      countryId: country.id,
      aliases: getAcceptedAnswers(country),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'it'));

export const findMatchingOptions = (input: string, countries: Country[], limit = 8): GuessOption[] => {
  const normalized = normalizeGuess(input);
  if (!normalized) {
    return getGuessOptions(countries).slice(0, limit);
  }

  return getGuessOptions(countries)
    .filter((option) =>
      option.aliases.some((alias) => normalizeGuess(alias).includes(normalized)),
    )
    .slice(0, limit);
};
