import { useMemo, useState } from 'react';
import type { Country } from '../data/countryTypes';
import type { MatchConfig, MatchState, Player } from '../game/matchEngine';
import type { TournamentFormat, TournamentGameResult, TournamentMatch } from '../game/tournamentEngine';
import { GameScreen } from './GameScreen';
import { MatchResultScreen } from './MatchResultScreen';

type TournamentMatchScreenProps = {
  match: TournamentMatch;
  format: TournamentFormat;
  countries: Country[];
  onCancel: () => void;
  onComplete: (
    matchId: string,
    winnerId: string,
    summary: string,
    gameWins: Record<string, number>,
    finalScore: Record<string, number>,
    gameResults?: TournamentGameResult[],
  ) => void;
};

type SeriesResult = {
  winner: Player;
  summary: string;
  gameWins: Record<string, number>;
  finalScore: Record<string, number>;
  gameResults: TournamentGameResult[];
};

export const TournamentMatchScreen = ({
  match,
  format,
  countries,
  onCancel,
  onComplete,
}: TournamentMatchScreenProps) => {
  const players = match.participants as [Player, Player];
  const [gameIndex, setGameIndex] = useState(0);
  const [wins, setWins] = useState<Record<string, number>>({
    [players[0]?.id ?? 'a']: 0,
    [players[1]?.id ?? 'b']: 0,
  });
  const [betweenGames, setBetweenGames] = useState<string | null>(null);
  const [seriesResult, setSeriesResult] = useState<SeriesResult | null>(null);
  const [gameResults, setGameResults] = useState<TournamentGameResult[]>([]);

  const currentTarget = format.targets[Math.min(gameIndex, format.targets.length - 1)];
  const config = useMemo<MatchConfig>(
    () => ({
      mode: 'custom',
      targetScore: currentTarget,
      opponentKind: players[1]?.kind === 'bot' ? 'bot' : 'local',
      players,
    }),
    [currentTarget, players],
  );

  if (!players[0] || !players[1]) {
    return (
      <main className="screen setup-screen">
        <section className="setup-section">
          <h1>Incontro non pronto</h1>
          <p>Il bracket deve ancora assegnare entrambi i partecipanti.</p>
          <button className="secondary-action" type="button" onClick={onCancel}>
            Torna al tabellone
          </button>
        </section>
      </main>
    );
  }

  const finishGame = (result: MatchState) => {
    if (!result.winnerId) {
      return;
    }

    const nextWins = {
      ...wins,
      [result.winnerId]: (wins[result.winnerId] ?? 0) + 1,
    };
    const winner = players.find((player) => player.id === result.winnerId) ?? players[0];
    const currentGameResult: TournamentGameResult = {
      target: currentTarget,
      scores: result.scores,
      winnerId: result.winnerId,
    };
    const nextGameResults = [...gameResults, currentGameResult];
    const seriesIsComplete =
      format.kind === 'single' ||
      nextWins[result.winnerId] === 2 ||
      gameIndex >= format.targets.length - 1;

    setWins(nextWins);
    setGameResults(nextGameResults);

    if (seriesIsComplete) {
      const seriesWinner =
        nextWins[players[0].id] >= nextWins[players[1].id] ? players[0] : players[1];
      setSeriesResult({
        winner: seriesWinner,
        summary: `${seriesWinner.name} vince l'incontro ${nextWins[players[0].id] ?? 0}-${nextWins[players[1].id] ?? 0}. Ultima partita: ${result.scores[players[0].id]}-${result.scores[players[1].id]}.`,
        gameWins: nextWins,
        finalScore: result.scores,
        gameResults: nextGameResults,
      });
      return;
    }

    setBetweenGames(`${winner.name} vince la partita a ${currentTarget}. Si passa al prossimo obiettivo.`);
  };

  if (seriesResult) {
    return (
      <MatchResultScreen
        title={format.label}
        winner={seriesResult.winner}
        summary={seriesResult.summary}
        onContinue={() =>
          onComplete(
            match.id,
            seriesResult.winner.id,
            seriesResult.summary,
            seriesResult.gameWins,
            seriesResult.finalScore,
            seriesResult.gameResults,
          )
        }
      />
    );
  }

  if (betweenGames) {
    return (
      <main className="screen match-result-screen">
        <section className="victory-panel compact">
          <p className="eyebrow">{format.label}</p>
          <h1>{betweenGames}</h1>
          <button
            className="primary-action wide"
            type="button"
            onClick={() => {
              setBetweenGames(null);
              setGameIndex((current) => current + 1);
            }}
          >
            Prossima partita
          </button>
        </section>
      </main>
    );
  }

  return (
    <div className="tournament-match-shell">
      <div className="tournament-match-banner">
        <button className="ghost-action" type="button" onClick={onCancel}>
          Tabellone
        </button>
        <div>
          <p className="eyebrow">{format.label}</p>
          <h1>
            {players[0].name} vs {players[1].name}
          </h1>
          <span>
            Partita {gameIndex + 1} · obiettivo {currentTarget} · serie {wins[players[0].id] ?? 0}-
            {wins[players[1].id] ?? 0}
          </span>
        </div>
      </div>
      <GameScreen
        key={`${match.id}-${gameIndex}`}
        config={config}
        countries={countries}
        onExit={onCancel}
        onFinished={finishGame}
        completionView="return"
        exitLabel="Abbandona incontro"
        exitTitle="Vuoi abbandonare questo incontro?"
        exitMessage="Tornerai al tabellone. L'incontro manuale non verra completato."
      />
    </div>
  );
};
