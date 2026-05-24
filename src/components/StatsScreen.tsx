import type { ProgressSnapshot } from '../utils/storage';
import { BottomNav } from './BottomNav';

type StatsScreenProps = {
  progress: ProgressSnapshot;
  onHome: () => void;
  onSettings: () => void;
  onGuide: () => void;
};

export const StatsScreen = ({ progress, onHome, onSettings, onGuide }: StatsScreenProps) => {
  const precision =
    progress.totalAttempts > 0
      ? Math.round((progress.correctAttempts / progress.totalAttempts) * 100)
      : 0;
  const modeEntries = Object.entries(progress.modeStats);
  const lastMatches = progress.lastMatches.slice(0, 5);

  return (
    <main className="screen stats-screen">
      <section className="stats-dashboard">
        <div className="section-heading-row">
          <h1>▥ Statistiche</h1>
          <button className="icon-action close-action" type="button" onClick={onHome} aria-label="Chiudi">
            ×
          </button>
        </div>

        <div className="stats-cards">
          <article>
            <span>Partite giocate</span>
            <strong>{progress.matchesPlayed}</strong>
          </article>
          <article>
            <span>Vittorie</span>
            <strong className="green-text">{progress.matchesWon}</strong>
          </article>
          <article>
            <span>Miglior punteggio</span>
            <strong className="gold-text">{progress.bestRoundScore}</strong>
          </article>
          <article>
            <span>Precisione</span>
            <strong>{precision}%</strong>
          </article>
        </div>

        <div className="stats-lower-grid">
          <article className="stats-panel">
            <h2>Punteggi per modalità</h2>
            {modeEntries.length === 0 ? (
              <p>Nessuna modalità giocata ancora.</p>
            ) : (
              <ul className="mode-stats-list">
                {modeEntries.map(([mode, count]) => (
                  <li key={mode}>
                    <span>{mode}</span>
                    <strong>{count}</strong>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="stats-panel">
            <h2>Ultime partite</h2>
            {lastMatches.length === 0 ? (
              <p>Gioca una partita per popolare lo storico.</p>
            ) : (
              <ul className="last-matches">
                {lastMatches.map((match, index) => (
                  <li key={`${match.date}-${match.opponent}-${index}`}>
                    <span>{match.date}</span>
                    <span>vs {match.opponent}</span>
                    <strong className={match.result === 'Vittoria' ? 'green-text' : 'red-text'}>
                      {match.result} +{match.scoreDelta}
                    </strong>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </section>
      <BottomNav active="stats" onHome={onHome} onStats={() => undefined} onSettings={onSettings} onGuide={onGuide} />
    </main>
  );
};
