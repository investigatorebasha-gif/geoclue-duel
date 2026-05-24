import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const outputPath = resolve(root, 'src/data/countries.full.ts');

const flagpediaUrl = 'https://flagpedia.net/index';
const restCoreUrl =
  'https://restcountries.com/v3.1/all?fields=cca2,cca3,name,translations,region,subregion,population,borders,flags,languages';
const restExtraUrl =
  'https://restcountries.com/v3.1/all?fields=cca2,landlocked,independent,continents,area,capital,altSpellings,unMember';

const populationRange = (population) => {
  if (population < 100_000) return 'meno di 100 mila';
  if (population < 1_000_000) return '100 mila - 1 milione';
  if (population < 5_000_000) return '1 - 5 milioni';
  if (population < 10_000_000) return '5 - 10 milioni';
  if (population < 25_000_000) return '10 - 25 milioni';
  if (population < 50_000_000) return '25 - 50 milioni';
  if (population < 100_000_000) return '50 - 100 milioni';
  return 'oltre 100 milioni';
};

const uniq = (items) =>
  [...new Set(items.map((item) => String(item ?? '').trim()).filter(Boolean))];

const continentFromRest = (region, subregion, continents = []) => {
  if (continents.includes('Antarctica') || region === 'Antarctic') return 'Antartide';
  if (region === 'Europe') return 'Europa';
  if (region === 'Asia') return 'Asia';
  if (region === 'Africa') return 'Africa';
  if (region === 'Oceania') return 'Oceania';
  if (region === 'Americas') {
    if (subregion === 'South America') return 'America del Sud';
    if (subregion === 'Central America') return 'America centrale';
    if (subregion === 'Caribbean') return 'Caraibi';
    return 'America del Nord';
  }
  return region ?? 'Macro-area da verificare';
};

const regionIt = (subregion, region) =>
  ({
    'Northern Europe': 'Europa settentrionale',
    'Southern Europe': 'Europa meridionale',
    'Western Europe': 'Europa occidentale',
    'Eastern Europe': 'Europa orientale',
    Caribbean: 'Caraibi',
    'Central America': 'America centrale',
    'North America': 'Nord America',
    'South America': 'Sud America',
    'Western Asia': 'Asia occidentale',
    'Southern Asia': 'Asia meridionale',
    'South-Eastern Asia': 'Sud-est asiatico',
    'Eastern Asia': 'Asia orientale',
    'Central Asia': 'Asia centrale',
    'Northern Africa': 'Africa settentrionale',
    'Western Africa': 'Africa occidentale',
    'Middle Africa': 'Africa centrale',
    'Eastern Africa': 'Africa orientale',
    'Southern Africa': 'Africa australe',
    Polynesia: 'Polinesia',
    Micronesia: 'Micronesia',
    Melanesia: 'Melanesia',
    'Australia and New Zealand': 'Australia e Nuova Zelanda',
  })[subregion] ??
  ({
    Europe: 'Europa',
    Americas: 'Americhe',
    Asia: 'Asia',
    Africa: 'Africa',
    Oceania: 'Oceania',
    Antarctic: 'Antartide',
  })[region] ??
  'Regione da verificare';

const languageFamilyGuess = (languages = {}) => {
  const values = Object.values(languages).join(' ').toLowerCase();
  const families = [];

  if (/spanish|french|italian|portuguese|romanian|catalan|latin/.test(values)) families.push('romanza');
  if (/english|german|dutch|swedish|norwegian|danish|icelandic|afrikaans|faroese/.test(values)) {
    families.push('germanica');
  }
  if (/arabic|hebrew|amharic|tigrinya|aramaic|maltese/.test(values)) families.push('semitica');
  if (/russian|ukrainian|polish|serbian|croatian|czech|slovak|slovene|slovenian|bulgarian|bosnian|belarusian|macedonian/.test(values)) {
    families.push('slava');
  }
  if (/turkish|azerbaijani|kazakh|uzbek|turkmen|kyrgyz/.test(values)) families.push('turcica');
  if (/hindi|urdu|bengali|nepali|persian|dari|pashto|sinhala|maldivian|tajik/.test(values)) families.push('indoaria');
  if (/chinese|mandarin|cantonese/.test(values)) families.push('sinitica');
  if (/malay|indonesian|tagalog|filipino|samoan|maori|tongan|fijian|marshallese|palauan|chamorro|gilbertese|tuvaluan|tokelauan|tahitian/.test(values)) {
    families.push('austronesiana');
  }
  if (/swahili|zulu|xhosa|kinyarwanda|kirundi|lingala|tswana|sotho|shona|ndebele|kongo/.test(values)) families.push('bantu');
  if (/finnish|estonian|hungarian|sami/.test(values)) families.push('uralica');
  if (/greek/.test(values)) families.push('ellenica');
  if (/japanese|korean|basque|georgian|armenian|thai|khmer|lao|vietnamese|burmese|dzongkha|tibetan/.test(values)) {
    families.push('isolata/altra');
  }

  return uniq(families).length > 0 ? uniq(families) : ['isolata/altra'];
};

const politicalSystem = (rest) => {
  const official = rest?.name?.official?.toLowerCase() ?? '';
  const independent = rest?.independent;

  if (independent === false) return 'territorio dipendente';
  if (/holy see|vatican/.test(official)) return 'monarchia assoluta';
  if (/people's republic|socialist republic|democratic people's republic/.test(official)) {
    return 'stato socialista a partito unico';
  }
  if (/federal|federation|federated/.test(official)) return 'repubblica federale';
  if (/kingdom|sultanate|emirate|principality|state of qatar/.test(official)) {
    return 'monarchia costituzionale';
  }
  if (/republic/.test(official)) return 'repubblica';
  return 'sistema politico da verificare';
};

const governmentHint = (system) => {
  if (system === 'territorio dipendente') {
    return 'Ha autogoverno locale o amministrazione propria, ma dipende da un altro stato.';
  }
  if (system === 'monarchia assoluta') return 'Ha una monarchia con poteri molto concentrati.';
  if (system === 'monarchia costituzionale') return 'Ha una monarchia con istituzioni costituzionali.';
  if (system === 'repubblica federale') return 'Ha istituzioni repubblicane e una struttura federale.';
  if (system === 'stato socialista a partito unico') return 'Ha un sistema politico dominato da un solo partito.';
  if (system === 'repubblica') return 'Ha istituzioni repubblicane.';
  return 'Ha istituzioni proprie; questo dettaglio puo essere rifinito nel dataset.';
};

const coastType = (code, name, rest, borderNames) => {
  if (code === 'aq' || code === 'tf') return 'territorio antartico';
  if (code === 'gl' || code === 'sj') return 'territorio artico';
  if (rest?.landlocked) return 'senza sbocco sul mare';
  if (borderNames.length === 0 && /islands|island|samoa|tokelau|tuvalu|nauru|niue|maldives|seychelles|mauritius|barbados|dominica|grenada|jamaica|kiribati|tonga/i.test(name)) {
    return /islands/i.test(name) ? 'arcipelago' : 'isola';
  }
  return 'con costa';
};

const borderHint = (borderNames, coastOrLandlocked) => {
  if (borderNames.length > 0 && borderNames.length <= 5) {
    return `Confina con ${borderNames.join(', ')}.`;
  }
  if (borderNames.length > 5) return `Confina via terra con ${borderNames.length} stati o territori.`;
  if (coastOrLandlocked === 'senza sbocco sul mare') return 'Non ha coste marittime.';
  if (coastOrLandlocked === 'territorio antartico') return 'È un territorio antartico senza confini terrestri ordinari.';
  return 'Non ha confini terrestri.';
};

const manualCountries = {
  'gb-eng': {
    name_it: 'Inghilterra',
    aliases: ['England', 'Inghilterra'],
    continent: 'Europa',
    region: 'Regno Unito',
    politicalSystem: 'paese costitutivo',
    governmentHint: 'È un paese costitutivo dentro una monarchia costituzionale.',
    borders: ['Scozia', 'Galles'],
    coastOrLandlocked: 'con costa',
    languageFamilies: ['germanica'],
    difficultyTags: ['europa', 'regno unito'],
  },
  'gb-nir': {
    name_it: 'Irlanda del Nord',
    aliases: ['Northern Ireland', 'Ulster', 'Irlanda del Nord'],
    continent: 'Europa',
    region: 'Regno Unito',
    politicalSystem: 'paese costitutivo',
    governmentHint: 'È un paese costitutivo dentro una monarchia costituzionale.',
    borders: ['Irlanda'],
    coastOrLandlocked: 'con costa',
    languageFamilies: ['germanica', 'celtica'],
    difficultyTags: ['europa', 'regno unito', 'isola'],
  },
  'gb-sct': {
    name_it: 'Scozia',
    aliases: ['Scotland', 'Scozia', 'Alba'],
    continent: 'Europa',
    region: 'Regno Unito',
    politicalSystem: 'paese costitutivo',
    governmentHint: 'È un paese costitutivo dentro una monarchia costituzionale.',
    borders: ['Inghilterra'],
    coastOrLandlocked: 'con costa',
    languageFamilies: ['germanica', 'celtica'],
    difficultyTags: ['europa', 'regno unito', 'isola'],
  },
  'gb-wls': {
    name_it: 'Galles',
    aliases: ['Wales', 'Cymru', 'Galles'],
    continent: 'Europa',
    region: 'Regno Unito',
    politicalSystem: 'paese costitutivo',
    governmentHint: 'È un paese costitutivo dentro una monarchia costituzionale.',
    borders: ['Inghilterra'],
    coastOrLandlocked: 'con costa',
    languageFamilies: ['germanica', 'celtica'],
    difficultyTags: ['europa', 'regno unito', 'isola'],
  },
};

const aliasPatches = {
  us: ['USA', 'U.S.A.', 'US', "Stati Uniti d'America", 'United States of America', 'America'],
  gb: ['UK', 'U.K.', 'Britain', 'Great Britain', 'Gran Bretagna'],
  va: ['Vaticano', 'Santa Sede', 'Holy See'],
  xk: ['Kosovo', 'Kosova'],
  cz: ['Cechia', 'Repubblica Ceca', 'Czech Republic'],
  cd: ['Congo Kinshasa', 'Repubblica Democratica del Congo'],
  cg: ['Congo Brazzaville', 'Repubblica del Congo'],
  ci: ["Costa d'Avorio", 'Cote d Ivoire', "Côte d'Ivoire"],
  mk: ['Macedonia del Nord'],
  kr: ['Corea del Sud', 'South Korea'],
  kp: ['Corea del Nord', 'North Korea'],
  ps: ['Palestina', 'Palestinian territories'],
  tw: ['Taiwan', 'Repubblica di Cina'],
};

const flagpediaHtml = await (await fetch(flagpediaUrl)).text();
const flagpediaItems = [
  ...flagpediaHtml.matchAll(
    /<a href="([^"]+)"[^>]*data-area="([^"]*)"[^>]*data-population="([^"]*)"[^>]*>[\s\S]*?<img src="\/data\/flags\/h80\/([^".?]+)\.png[^>]*alt="Flag of ([^"]+)"[\s\S]*?<span>([^<]+)<\/span>/g,
  ),
].map((match) => ({
  href: match[1],
  area: Number(match[2]) || 0,
  population: Number(match[3]) || 0,
  code: match[4],
  flagName: match[5],
  name: match[6],
}));

if (flagpediaItems.length !== 254) {
  throw new Error(`Expected 254 Flagpedia items, got ${flagpediaItems.length}`);
}

const [restCore, restExtra] = await Promise.all([
  fetch(restCoreUrl).then((response) => response.json()),
  fetch(restExtraUrl).then((response) => response.json()),
]);
const restByCode = new Map(restCore.map((country) => [country.cca2.toLowerCase(), country]));
for (const extra of restExtra) {
  const code = extra.cca2.toLowerCase();
  restByCode.set(code, { ...(restByCode.get(code) ?? {}), ...extra });
}

const nameByCca3 = new Map(
  restCore.map((country) => [
    country.cca3,
    country.translations?.ita?.common ?? country.name?.common ?? country.cca3,
  ]),
);

const countries = flagpediaItems.map((item) => {
  const rest = restByCode.get(item.code);
  const manual = manualCountries[item.code];
  const nameIt = manual?.name_it ?? rest?.translations?.ita?.common ?? item.name;
  const nameEn = rest?.name?.common ?? item.name;
  const borderNames = manual?.borders ?? (rest?.borders ?? []).map((code) => nameByCca3.get(code) ?? code);
  const languageFamilies = manual?.languageFamilies ?? languageFamilyGuess(rest?.languages);
  const system = manual?.politicalSystem ?? politicalSystem(rest);
  const coastal = manual?.coastOrLandlocked ?? coastType(item.code, item.name, rest, borderNames);
  const population = rest?.population ?? item.population;

  return {
    id: item.code,
    name_it: nameIt,
    name_en: nameEn,
    aliases: uniq([
      nameIt,
      nameEn,
      item.name,
      item.flagName,
      rest?.name?.official,
      rest?.translations?.ita?.official,
      ...(rest?.altSpellings ?? []),
      ...(manual?.aliases ?? []),
      ...(aliasPatches[item.code] ?? []),
      item.code.toUpperCase(),
      rest?.cca3,
    ]),
    continent: manual?.continent ?? continentFromRest(rest?.region, rest?.subregion, rest?.continents),
    region: manual?.region ?? regionIt(rest?.subregion, rest?.region),
    politicalSystem: system,
    governmentHint: manual?.governmentHint ?? governmentHint(system),
    population,
    populationRange: populationRange(population),
    borders: borderNames,
    borderHint: borderHint(borderNames, coastal),
    coastOrLandlocked: coastal,
    languageFamilies,
    languageHint: `La lingua principale appartiene o si collega alla famiglia: ${languageFamilies.join(', ')}.`,
    flagUrl: `./flags/${item.code}.png`,
    flagEmoji: '',
    difficultyTags: uniq([
      manual?.difficultyTags?.[0],
      continentFromRest(rest?.region, rest?.subregion, rest?.continents).toLowerCase(),
      rest?.independent === false ? 'territorio' : 'stato',
      coastal,
    ]),
  };
});

const content = `import type { Country } from './countryTypes';\n\nexport const countriesFull: Country[] = ${JSON.stringify(
  countries,
  null,
  2,
)};\n`;

await writeFile(outputPath, content, 'utf8');
console.log(`Generated ${countries.length} countries in src/data/countries.full.ts`);
