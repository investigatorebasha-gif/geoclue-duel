import type { Player } from '../game/matchEngine';

type MatchResultScreenProps = {
  title: string;
  winner: Player;
  summary: string;
  onContinue: () => void;
};

export const MatchResultScreen = ({ title, winner, summary, onContinue }: MatchResultScreenProps) => (
  <main className="screen match-result-screen">
    <section className="victory-panel compact">
      <p className="eyebrow">{title}</p>
      <h1>{winner.name} passa il turno</h1>
      <p>{summary}</p>
      <button className="primary-action wide" type="button" onClick={onContinue}>
        Torna al tabellone
      </button>
    </section>
  </main>
);
