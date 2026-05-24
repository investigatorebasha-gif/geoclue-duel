import { countriesFull } from './countries.full';
import { countriesSeed } from './countries.seed';
import type { Country } from './countryTypes';

const seedByFlagUrl = new Map(
  countriesSeed
    .map((country) => [country.flagUrl ?? country.flagAsset, country] as const)
    .filter(([flagUrl]) => Boolean(flagUrl)),
);

export const countries: Country[] = countriesFull.map((country) => {
  const seedCountry = seedByFlagUrl.get(country.flagUrl ?? country.flagAsset);

  if (!seedCountry) {
    return country;
  }

  return {
    ...country,
    ...seedCountry,
    id: country.id,
    aliases: [...new Set([...country.aliases, ...seedCountry.aliases])],
    flagUrl: country.flagUrl,
    flagAsset: country.flagAsset,
  };
});

export const countryCount = countries.length;
