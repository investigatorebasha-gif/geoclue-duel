import { describe, expect, it } from 'vitest';
import { countries, countryCount } from '../data/countries';
import { isCorrectGuess } from './guessMatching';
import { getNextHint } from './hints';
import { getScoreByHintsUsed } from './scoring';
import { createTournament, getTournamentFormat, simulateBotMatch } from './tournamentEngine';
import { createPlayer } from './matchEngine';
import { normalizeGuess } from '../utils/normalizeText';

describe('normalizeGuess', () => {
  it('normalizes case, accents, punctuation and spacing', () => {
    expect(normalizeGuess("  Stati   Uniti d'America!! ")).toBe('stati uniti d america');
    expect(normalizeGuess('México')).toBe('mexico');
    expect(normalizeGuess('Regno-Unito')).toBe('regno unito');
  });
});

describe('isCorrectGuess', () => {
  it('matches Italian, English and aliases robustly', () => {
    const unitedStates = countries.find((country) => country.aliases.includes('USA'));
    expect(unitedStates).toBeDefined();
    expect(isCorrectGuess('USA', unitedStates!)).toBe(true);
    expect(isCorrectGuess('United States of America', unitedStates!)).toBe(true);
    expect(isCorrectGuess("stati uniti d america", unitedStates!)).toBe(true);
  });
});

describe('getScoreByHintsUsed', () => {
  it('returns the expected decreasing score table', () => {
    expect(getScoreByHintsUsed(0)).toBe(10);
    expect(getScoreByHintsUsed(1)).toBe(7);
    expect(getScoreByHintsUsed(3)).toBe(4);
    expect(getScoreByHintsUsed(6)).toBe(1);
    expect(getScoreByHintsUsed(99)).toBe(1);
  });
});

describe('getNextHint', () => {
  it('keeps the flag as the sixth hint', () => {
    const italy = countries.find((country) => country.name_it === 'Italia');
    expect(italy).toBeDefined();
    const hint = getNextHint(italy!, 6);
    expect(hint.type).toBe('flag');
    expect(Boolean(hint.flagUrl || hint.flagAsset || hint.flagEmoji)).toBe(true);
  });
});

describe('countries dataset', () => {
  it('contains the full Flagpedia-style 254 entities', () => {
    expect(countryCount).toBe(254);
    expect(countries.some((country) => country.name_it === 'Inghilterra')).toBe(true);
    expect(countries.some((country) => country.name_it === 'Scozia')).toBe(true);
    expect(countries.some((country) => country.name_it === 'Galles')).toBe(true);
    expect(countries.some((country) => country.name_it === 'Irlanda del Nord')).toBe(true);
  });
});

describe('createTournament', () => {
  it('creates an elimination bracket and fills missing participants with bots', () => {
    const tournament = createTournament([createPlayer('Ada', 'human')], 8, 75, 'Test Cup');
    expect(tournament.rounds).toHaveLength(3);
    expect(tournament.rounds[0].matches).toHaveLength(4);
    expect(tournament.rounds[0].matches.flatMap((match) => match.participants)).toHaveLength(8);
    expect(tournament.rounds[0].matches.flatMap((match) => match.participants).filter(Boolean)).toHaveLength(8);
  });
});

describe('simulateBotMatch', () => {
  it('ends each simulated game when only one player has reached the target', () => {
    const playerA = createPlayer('Bot A', 'bot');
    const playerB = createPlayer('Bot B', 'bot');
    const format = getTournamentFormat(8, 2, 75);
    const result = simulateBotMatch(playerA, playerB, format, countries);
    const game = result.gameResults[0];
    const winnerScore = game.scores[game.winnerId];
    const loserId = game.winnerId === playerA.id ? playerB.id : playerA.id;

    expect(game.target).toBe(75);
    expect(winnerScore).toBeGreaterThanOrEqual(75);
    expect(game.scores[loserId]).toBeLessThan(75);
  });
});
