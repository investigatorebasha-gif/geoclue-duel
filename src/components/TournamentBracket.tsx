import type { TournamentMatch, TournamentState } from '../game/tournamentEngine';
import { getTournamentFormat } from '../game/tournamentEngine';

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

export const TournamentBracket = ({
  tournament,
  onBack,
  onPlayMatch,
  onSimulateBots,
  onNewTournament,
}: TournamentBracketProps) => (
  <main className="screen bracket-screen">
    <div className="top-row">
      <button className="ghost-action" type="button" onClick={onBack}>
        Menu
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
                <div className={match.winnerId === match.participants[0]?.id ? 'winner-line' : ''}>
                  <span>{participantName(match, 0)}</span>
                </div>
                <div className={match.winnerId === match.participants[1]?.id ? 'winner-line' : ''}>
                  <span>{participantName(match, 1)}</span>
                </div>

                {match.summary ? <p>{match.summary}</p> : null}

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
  </main>
);
