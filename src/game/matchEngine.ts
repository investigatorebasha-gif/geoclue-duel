import type { Country, CountryHint } from '../data/countryTypes';
import { getNextHint } from './hints';
import { getScoreByHintsUsed } from './scoring';
import { sample } from '../utils/random';

export type PlayerKind = 'human' | 'bot';

export type Player = {
  id: string;
  name: string;
  kind: PlayerKind;
};

export type MatchMode = 'quick' | 'normal' | 'long' | 'custom';

export type MatchConfig = {
  mode: MatchMode;
  targetScore: number;
  opponentKind: 'bot' | 'local';
  players: [Player, Player];
};

export type GuessAttempt = {
  guess: string;
  isCorrect: boolean;
  hintsBeforeGuess: number;
};

export type PlayerStats = {
  countriesGuessed: number;
  bestRound: number;
  totalPoints: number;
  roundsPlayed: number;
};

export type RoundState = {
  country: Country;
  playerId: string;
  hintsRevealed: number;
  revealedHints: CountryHint[];
  attempts: GuessAttempt[];
  isComplete: boolean;
  wasCorrect: boolean;
  pointsEarned: number;
};

export type MatchState = {
  id: string;
  players: [Player, Player];
  targetScore: number;
  scores: Record<string, number>;
  stats: Record<string, PlayerStats>;
  currentPlayerIndex: number;
  roundNumber: number;
  usedCountryIds: string[];
  currentRound: RoundState;
  winnerId?: string;
};

export const targetByMode: Record<Exclude<MatchMode, 'custom'>, number> = {
  quick: 10,
  normal: 30,
  long: 50,
};

export const createPlayer = (name: string, kind: PlayerKind): Player => ({
  id: `${kind}-${name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(2, 7)}`,
  name: name.trim() || (kind === 'bot' ? 'Bot Atlas' : 'Giocatore'),
  kind,
});

const emptyStats = (): PlayerStats => ({
  countriesGuessed: 0,
  bestRound: 0,
  totalPoints: 0,
  roundsPlayed: 0,
});

export const selectNextCountry = (countries: Country[], usedCountryIds: string[]): Country => {
  const available = countries.filter((country) => !usedCountryIds.includes(country.id));
  return sample(available.length > 0 ? available : countries);
};

export const createRound = (
  countries: Country[],
  usedCountryIds: string[],
  playerId: string,
): RoundState => ({
  country: selectNextCountry(countries, usedCountryIds),
  playerId,
  hintsRevealed: 0,
  revealedHints: [],
  attempts: [],
  isComplete: false,
  wasCorrect: false,
  pointsEarned: 0,
});

export const createMatch = (players: [Player, Player], targetScore: number, countries: Country[]): MatchState => {
  const currentRound = createRound(countries, [], players[0].id);

  return {
    id: `match-${Date.now()}`,
    players,
    targetScore,
    scores: {
      [players[0].id]: 0,
      [players[1].id]: 0,
    },
    stats: {
      [players[0].id]: emptyStats(),
      [players[1].id]: emptyStats(),
    },
    currentPlayerIndex: 0,
    roundNumber: 1,
    usedCountryIds: [currentRound.country.id],
    currentRound,
  };
};

export const revealNextHint = (round: RoundState): RoundState => {
  if (round.hintsRevealed >= 6) {
    return round;
  }

  const nextHintIndex = round.hintsRevealed + 1;
  return {
    ...round,
    hintsRevealed: nextHintIndex,
    revealedHints: [...round.revealedHints, getNextHint(round.country, nextHintIndex)],
  };
};

const getWinnerAfterEqualTurns = (
  players: [Player, Player],
  scores: Record<string, number>,
  stats: Record<string, PlayerStats>,
  targetScore: number,
): string | undefined => {
  const [playerA, playerB] = players;
  const playerARounds = stats[playerA.id].roundsPlayed;
  const playerBRounds = stats[playerB.id].roundsPlayed;
  const playerAScore = scores[playerA.id];
  const playerBScore = scores[playerB.id];

  if (playerARounds !== playerBRounds || Math.max(playerAScore, playerBScore) < targetScore) {
    return undefined;
  }

  if (playerAScore === playerBScore) {
    return undefined;
  }

  return playerAScore > playerBScore ? playerA.id : playerB.id;
};

export const completeRound = (
  match: MatchState,
  isCorrect: boolean,
  attempts: GuessAttempt[],
): MatchState => {
  const playerId = match.currentRound.playerId;
  const pointsEarned = isCorrect ? getScoreByHintsUsed(match.currentRound.hintsRevealed) : 0;
  const nextScore = match.scores[playerId] + pointsEarned;
  const currentStats = match.stats[playerId];
  const updatedStats: PlayerStats = {
    countriesGuessed: currentStats.countriesGuessed + (isCorrect ? 1 : 0),
    bestRound: Math.max(currentStats.bestRound, pointsEarned),
    totalPoints: currentStats.totalPoints + pointsEarned,
    roundsPlayed: currentStats.roundsPlayed + 1,
  };
  const nextScores = {
    ...match.scores,
    [playerId]: nextScore,
  };
  const nextStats = {
    ...match.stats,
    [playerId]: updatedStats,
  };
  const winnerId = getWinnerAfterEqualTurns(match.players, nextScores, nextStats, match.targetScore);

  return {
    ...match,
    scores: nextScores,
    stats: nextStats,
    currentRound: {
      ...match.currentRound,
      attempts,
      isComplete: true,
      wasCorrect: isCorrect,
      pointsEarned,
    },
    winnerId,
  };
};

export const advanceTurn = (match: MatchState, countries: Country[]): MatchState => {
  const nextPlayerIndex = match.currentPlayerIndex === 0 ? 1 : 0;
  const playerId = match.players[nextPlayerIndex].id;
  const currentUsedIds =
    match.usedCountryIds.length >= countries.length ? [] : match.usedCountryIds;
  const nextRound = createRound(countries, currentUsedIds, playerId);

  return {
    ...match,
    currentPlayerIndex: nextPlayerIndex,
    roundNumber: match.roundNumber + 1,
    usedCountryIds: [...currentUsedIds, nextRound.country.id],
    currentRound: nextRound,
  };
};
