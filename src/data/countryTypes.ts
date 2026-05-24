export type CoastType =
  | 'isola'
  | 'arcipelago'
  | 'senza sbocco sul mare'
  | 'con costa'
  | 'territorio antartico'
  | 'territorio artico'
  | 'territorio costiero'
  | 'microstato';

export type Country = {
  id: string;
  name_it: string;
  name_en: string;
  aliases: string[];
  continent: string;
  region: string;
  politicalSystem: string;
  governmentHint: string;
  population: number;
  populationRange: string;
  borders: string[];
  borderHint: string;
  coastOrLandlocked: CoastType | string;
  languageFamilies: string[];
  languageHint: string;
  flagUrl?: string;
  flagAsset?: string;
  flagEmoji?: string;
  difficultyTags?: string[];
};

export type HintType =
  | 'government'
  | 'continent'
  | 'population'
  | 'borders'
  | 'language'
  | 'flag';

export type CountryHint = {
  index: number;
  type: HintType;
  title: string;
  text: string;
  flagUrl?: string;
  flagAsset?: string;
  flagEmoji?: string;
};
