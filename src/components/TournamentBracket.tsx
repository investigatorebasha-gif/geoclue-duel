import { useState } from 'react';
import type { TournamentGameResult, TournamentMatch, TournamentState } from '../game/tournamentEngine';
import { getTournamentFormat } from '../game/tournamentEngine';
import { ConfirmExitModal } from './ConfirmExitModal';

type TournamentBracketProps = {
  tournament: TournamentState;
  onBack: () => void;
  onPlayMatch: (match: TournamentMatch) => void;
  onSimulateBots: () => void;
  onNewTournament: () => void;
};

const participantName = (match: TournamentMatch, index: 0 | 1) =>
  match.participants[index]?.name ?? 'In attesa';

const hasHuman = (match: TournamentMatch) =>
  match.participants.some((participant) => participant?.kind === 'human');

const matchResults = (match: TournamentMatch): TournamentGameResult[] => {
  if (match.gameResults?.length) {
    return match.gameResults;
  }

  if (match.finalScore && match.winnerId) {
    return [{ target: 0, scores: match.finalScore, winnerId: match.winnerId }];
  }

  return [];
};

const MatchScoreTable = ({ match }: { match: TournamentMatch }) => {
  const playerA = match.participants[0];
  const playerB = match.participants[1];
  const results = matchResults(match);

  if (!playerA || !playerB || results.length === 0) {
    return null;
  }

  return (
    <div className="match-score-table" aria-label="Punteggi incontro">
      {match.gameWins ? (
        <strong>
          Serie {match.gameWins[playerA.id] ?? 0} - {match.gameWins[playerB.id] ?? 0}
        </strong>
      ) : null}
      {results.map((result, index) => (
        <div className="score-line" key={`${match.id}-score-${index}`}>
          <span>{result.target > 0 ? `Obiettivo ${result.target}` : 'Risultato'}</span>
          <b className={result.winnerId === playerA.id ? 'score-winner' : ''}>
            {result.scores[playerA.id] ?? 0}
          </b>
          <small>-</small>
          <b className={result.winnerId === playerB.id ? 'score-winner' : ''}>
            {result.scores[playerB.id] ?? 0}
          </b>
        </div>
      ))}
    </div>
  );
};

export const TournamentBracket = ({
  tournament,
  onBack,
  onPlayMatch,
  onSimulateBots,
  onNewTournament,
}: TournamentBracketProps) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  return (
    <main className="screen bracket-screen">
      <div className="top-row">
        <button className="danger-action" type="button" onClick={() => setShowExitConfirm(true)}>
          Abbandona torneo
        </button>
        <div>
          <p className="eyebrow">Torneo</p>
          <h1>{tournament.name}</h1>
        </div>
        <button className="secondary-action" type="button" onClick={onSimulateBots}>
          Simula bot
        </button>
      </div>

      {tournament.championId ? (
        <section className="champion-banner">
          <p className="eyebrow">Campione</p>
          <h2>
            {
              tournament.rounds
                .flatMap((round) => round.matches.flatMap((match) => match.participants))
                .find((participant) => participant?.id === tournament.championId)?.name
            }
          </h2>
          <button className="primary-action" type="button" onClick={onNewTournament}>
            Nuovo torneo
          </button>
        </section>
      ) : null}

      <section className="bracket" aria-label="Tabellone torneo">
        {tournament.rounds.map((round, roundIndex) => (
          <div className="bracket-round" key={round.name}>
            <h2>{round.name}</h2>
            <small>{getTournamentFormat(tournament.size, roundIndex, tournament.finalTarget).label}</small>

            <div className="bracket-matches">
              {round.matches.map((match) => (
                <article key={match.id} className={`bracket-match ${match.status}`}>
                  <div className={`participant-line ${match.winnerId === match.participants[0]?.id ? 'winner-line' : ''}`}>
                    <span>{participantName(match, 0)}</span>
                  </div>
                  <div className={`participant-line ${match.winnerId === match.participants[1]?.id ? 'winner-line' : ''}`}>
                    <span>{participantName(match, 1)}</span>
                  </div>

                  {match.status === 'complete' ? <MatchScoreTable match={match} /> : null}

                  {match.status === 'ready' && hasHuman(match) ? (
                    <button className="small-action" type="button" onClick={() => onPlayMatch(match)}>
                      Gioca incontro
                    </button>
                  ) : null}
                  {match.status === 'ready' && !hasHuman(match) ? <small>Pronto per simulazione</small> : null}
                  {match.status === 'waiting' ? <small>Attende vincitori</small> : null}
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      {showExitConfirm ? (
        <ConfirmExitModal
          title="Vuoi abbandonare il torneo?"
          message="Tornerai al menu principale. Il tabellone corrente non verra salvato."
          confirmLabel="Conferma uscita"
          onCancel={() => setShowExitConfirm(false)}
          onConfirm={onBack}
        />
      ) : null}
    </main>
  );
};
