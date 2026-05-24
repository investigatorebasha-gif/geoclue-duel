import type { Country, CountryHint, HintType } from '../data/countryTypes';
import { sample } from '../utils/random';

const titleByIndex: Record<number, string> = {
  1: 'Sistema politico',
  2: 'Macro-area',
  3: 'Popolazione',
  4: 'Confini e territorio',
  5: 'Famiglia linguistica',
  6: 'Bandiera',
};

const typeByIndex: Record<number, HintType> = {
  1: 'government',
  2: 'continent',
  3: 'population',
  4: 'borders',
  5: 'language',
  6: 'flag',
};

const governmentTemplates = (country: Country) => [
  country.governmentHint,
  `Il sistema politico e classificato come ${country.politicalSystem}.`,
  `L'indizio istituzionale: ${country.governmentHint.toLowerCase()}`,
];

const continentTemplates = (country: Country) => [
  `Si trova in ${country.continent}.`,
  `La sua macro-area e ${country.continent}.`,
  `Guarda verso questa area geografica: ${country.continent}.`,
];

const populationTemplates = (country: Country) => [
  `Ha tra ${country.populationRange} di abitanti.`,
  `La fascia di popolazione e: ${country.populationRange}.`,
  `Come dimensione demografica rientra in: ${country.populationRange}.`,
];

const borderTemplates = (country: Country) => [
  country.borderHint,
  country.borders.length > 0
    ? `Confini noti: ${country.borders.join(', ')}.`
    : `${country.coastOrLandlocked === 'arcipelago' ? 'È un arcipelago' : 'È un territorio senza confini terrestri'}.`,
  `Tipo territoriale: ${country.coastOrLandlocked}. ${country.borderHint}`,
];

const languageTemplates = (country: Country) => [
  country.languageHint,
  `Famiglie linguistiche da considerare: ${country.languageFamilies.join(', ')}.`,
  `L'indizio linguistico resta sulla famiglia, non sulla lingua esatta: ${country.languageFamilies.join(', ')}.`,
];

const flagTemplates = () => [
  'Ultimo indizio: osserva la bandiera.',
  'La bandiera entra in gioco: ora hai il segnale visivo.',
  'Indizio finale, quello visivo: la bandiera.',
];

export const getNextHint = (country: Country, hintIndex: number): CountryHint => {
  const clampedIndex = Math.max(1, Math.min(6, hintIndex));
  const base = {
    index: clampedIndex,
    type: typeByIndex[clampedIndex],
    title: titleByIndex[clampedIndex],
  };

  if (clampedIndex === 1) {
    return { ...base, text: sample(governmentTemplates(country)) };
  }
  if (clampedIndex === 2) {
    return { ...base, text: sample(continentTemplates(country)) };
  }
  if (clampedIndex === 3) {
    return { ...base, text: sample(populationTemplates(country)) };
  }
  if (clampedIndex === 4) {
    return { ...base, text: sample(borderTemplates(country)) };
  }
  if (clampedIndex === 5) {
    return { ...base, text: sample(languageTemplates(country)) };
  }

  return {
    ...base,
    text: sample(flagTemplates()),
    flagUrl: country.flagAsset ?? country.flagUrl,
    flagAsset: country.flagAsset,
    flagEmoji: country.flagEmoji,
  };
};

export const getRevealedHints = (country: Country, count: number): CountryHint[] =>
  Array.from({ length: Math.max(0, Math.min(6, count)) }, (_, index) =>
    getNextHint(country, index + 1),
  );
