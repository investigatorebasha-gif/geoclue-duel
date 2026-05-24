import type { Country } from '../data/countryTypes';
import type { Player } from './matchEngine';
import { simulateBotRound } from './bot';
import { getScoreByHintsUsed } from './scoring';
import { sample, shuffle } from '../utils/random';

export type TournamentSize = 4 | 8 | 16 | 32;
export type FinalTarget = 75 | 100 | 125;

export type TournamentFormat = {
  kind: 'single' | 'best-of-3';
  targets: number[];
  label: string;
};

export type TournamentGameResult = {
  target: number;
  scores: Record<string, number>;
  winnerId: string;
};

export type TournamentMatch = {
  id: string;
  roundIndex: number;
  matchIndex: number;
  participants: [Player | undefined, Player | undefined];
  winnerId?: string;
  status: 'ready' | 'waiting' | 'complete';
  summary?: string;
  gameWins?: Record<string, number>;
  finalScore?: Record<string, number>;
  gameResults?: TournamentGameResult[];
};

export type TournamentRound = {
  name: string;
  matches: TournamentMatch[];
};

export type TournamentState = {
  id: string;
  name: string;
  size: TournamentSize;
  finalTarget: FinalTarget;
  rounds: TournamentRound[];
  championId?: string;
};

const botNames = [
  'Bot Marco',
  'Bot Sofia',
  'Bot Atlas',
  'Bot Europa',
  'Bot Luna',
  'Bot Rio',
  'Bot Sakura',
  'Bot Nairobi',
  'Bot Aurora',
  'Bot Andes',
];

const roundNamesBySize: Record<TournamentSize, string[]> = {
  4: ['Semifinali', 'Finale'],
  8: ['Quarti', 'Semifinali', 'Finale'],
  16: ['Ottavi', 'Quarti', 'Semifinali', 'Finale'],
  32: ['Sedicesimi', 'Ottavi', 'Quarti', 'Semifinali', 'Finale'],
};

export const createBotPlayer = (index: number): Player => ({
  id: `bot-${index}-${Math.random().toString(36).slice(2, 7)}`,
  name: `${botNames[index % botNames.length]}${index >= botNames.length ? ` ${Math.floor(index / botNames.length) + 1}` : ''}`,
  kind: 'bot',
});

export const getTournamentFormat = (
  size: TournamentSize,
  roundIndex: number,
  finalTarget: FinalTarget,
): TournamentFormat => {
  const lastRoundIndex = roundNamesBySize[size].length - 1;

  if (roundIndex === lastRoundIndex) {
    return { kind: 'single', targets: [finalTarget], label: `Finale secca a ${finalTarget}` };
  }

  if (size === 32 && roundIndex === 0) {
    return { kind: 'single', targets: [15], label: 'Partita secca a 15' };
  }

  return { kind: 'best-of-3', targets: [10, 30, 50], label: 'Meglio delle 3: 10/30/50' };
};

export const createTournament = (
  players: Player[],
  size: TournamentSize,
  finalTarget: FinalTarget,
  name = 'GeoClue Cup',
): TournamentState => {
  const paddedPlayers = [...players];
  while (paddedPlayers.length < size) {
    paddedPlayers.push(createBotPlayer(paddedPlayers.length + 1));
  }

  const seededPlayers = shuffle(paddedPlayers).slice(0, size);
  const roundNames = roundNamesBySize[size];
  const rounds: TournamentRound[] = roundNames.map((roundName, roundIndex) => {
    const matchCount = size / 2 ** (roundIndex + 1);
    return {
      name: roundName,
      matches: Array.from({ length: matchCount }, (_, matchIndex) => ({
        id: `r${roundIndex}-m${matchIndex}-${Date.now()}`,
        roundIndex,
        matchIndex,
        participants:
          roundIndex === 0
            ? [seededPlayers[matchIndex * 2], seededPlayers[matchIndex * 2 + 1]]
            : [undefined, undefined],
        status: roundIndex === 0 ? 'ready' : 'waiting',
      })),
    };
  });

  return {
    id: `tournament-${Date.now()}`,
    name: name.trim() || 'GeoClue Cup',
    size,
    finalTarget,
    rounds,
  };
};

const simulateScoreTurn = (player: Player, countries: Country[]) => {
  const country = sample(countries);
  const round = simulateBotRound(country, countries, 'medium');
  const points = round.correct ? getScoreByHintsUsed(round.hintsUsed) : 0;

  return {
    player,
    points,
    guessedCountries: round.correct ? 1 : 0,
  };
};

const simulateTargetGame = (playerA: Player, playerB: Player, countries: Country[], target: number) => {
  const scores: Record<string, number> = { [playerA.id]: 0, [playerB.id]: 0 };
  const guessedCountries: Record<string, number> = { [playerA.id]: 0, [playerB.id]: 0 };
  const turnsPlayed: Record<string, number> = { [playerA.id]: 0, [playerB.id]: 0 };
  const players: [Player, Player] = Math.random() > 0.5 ? [playerA, playerB] : [playerB, playerA];
  let turnIndex = 0;

  while (turnIndex < 400) {
    const player = players[turnIndex % 2];
    const turn = simulateScoreTurn(player, countries);
    scores[player.id] += turn.points;
    guessedCountries[player.id] += turn.guessedCountries;
    turnsPlayed[player.id] += 1;

    const equalTurns = turnsPlayed[playerA.id] === turnsPlayed[playerB.id];
    const targetReached = Math.max(scores[playerA.id], scores[playerB.id]) >= target;
    const scoresAreDifferent = scores[playerA.id] !== scores[playerB.id];

    if (equalTurns && targetReached && scoresAreDifferent) {
      const winnerId = scores[playerA.id] > scores[playerB.id] ? playerA.id : playerB.id;
      return {
        winnerId,
        scores,
        guessedCountries,
      };
    }

    turnIndex += 1;
  }

  const winnerId =
    scores[playerA.id] >= scores[playerB.id] ? playerA.id : playerB.id;
  scores[winnerId] = Math.max(scores[winnerId], target);
  return { winnerId, scores, guessedCountries };
};

export const simulateBotMatch = (
  playerA: Player,
  playerB: Player,
  format: TournamentFormat,
  countries: Country[],
) => {
  const wins: Record<string, number> = { [playerA.id]: 0, [playerB.id]: 0 };
  const details: string[] = [];
  const gameResults: TournamentGameResult[] = [];
  let finalScore: Record<string, number> = { [playerA.id]: 0, [playerB.id]: 0 };

  for (const target of format.targets) {
    const result = simulateTargetGame(playerA, playerB, countries, target);
    wins[result.winnerId] += 1;
    finalScore = result.scores;
    gameResults.push({ target, scores: finalScore, winnerId: result.winnerId });
    const winner = result.winnerId === playerA.id ? playerA : playerB;
    details.push(`${winner.name} vince ${finalScore[playerA.id]}-${finalScore[playerB.id]}.`);

    if (format.kind === 'best-of-3' && wins[result.winnerId] === 2) {
      break;
    }
  }

  const winnerId = wins[playerA.id] >= wins[playerB.id] ? playerA.id : playerB.id;
  const winner = winnerId === playerA.id ? playerA : playerB;

  return {
    winnerId,
    gameWins: wins,
    finalScore,
    gameResults,
    summary: `${winner.name} passa il turno. ${details.join(' ')}`,
  };
};

export const completeTournamentMatch = (
  tournament: TournamentState,
  matchId: string,
  winnerId: string,
  summary: string,
  gameWins?: Record<string, number>,
  finalScore?: Record<string, number>,
  gameResults?: TournamentGameResult[],
): TournamentState => {
  const rounds = tournament.rounds.map((round) => ({
    ...round,
    matches: round.matches.map((match) =>
      match.id === matchId
        ? { ...match, winnerId, status: 'complete' as const, summary, gameWins, finalScore, gameResults }
        : match,
    ),
  }));

  const completedMatch = rounds.flatMap((round) => round.matches).find((match) => match.id === matchId);
  if (!completedMatch) {
    return tournament;
  }

  const nextRound = rounds[completedMatch.roundIndex + 1];
  if (!nextRound) {
    return { ...tournament, rounds, championId: winnerId };
  }

  const nextMatch = nextRound.matches[Math.floor(completedMatch.matchIndex / 2)];
  const slot = completedMatch.matchIndex % 2;
  const winner = completedMatch.participants.find((player) => player?.id === winnerId);

  if (nextMatch && winner) {
    const participants: [Player | undefined, Player | undefined] = [...nextMatch.participants];
    participants[slot] = winner;
    nextMatch.participants = participants;
    nextMatch.status = participants[0] && participants[1] ? 'ready' : 'waiting';
  }

  return { ...tournament, rounds };
};

export const getReadyBotMatches = (tournament: TournamentState): TournamentMatch[] =>
  tournament.rounds
    .flatMap((round) => round.matches)
    .filter(
      (match) =>
        match.status === 'ready' &&
        match.participants[0]?.kind === 'bot' &&
        match.participants[1]?.kind === 'bot',
    );

export const getParticipantById = (tournament: TournamentState, id: string): Player | undefined =>
  tournament.rounds
    .flatMap((round) => round.matches.flatMap((match) => match.participants))
    .find((participant) => participant?.id === id);
