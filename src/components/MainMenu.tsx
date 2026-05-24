import { useState } from 'react';
import { targetByMode, type MatchMode } from '../game/matchEngine';
import type { TournamentState } from '../game/tournamentEngine';
import { createTournament } from '../game/tournamentEngine';
import type { ProgressSnapshot } from '../utils/storage';
import { BottomNav } from './BottomNav';
import { ModeCard } from './ModeCard';

type MainMenuProps = {
  progress: ProgressSnapshot;
  datasetCount: number;
  onStartMatch: (opponent: 'bot' | 'local', mode: Exclude<MatchMode, 'custom'>) => void;
  onStartTournament: (tournament: TournamentState) => void;
  onTournamentSetup: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
  onStats: () => void;
};

const durationLabels: Record<Exclude<MatchMode, 'custom'>, string> = {
  quick: 'Veloce',
  normal: 'Normale',
  long: 'Lunga',
};

export const MainMenu = ({
  progress,
  datasetCount,
  onStartMatch,
  onStartTournament,
  onTournamentSetup,
  onHowToPlay,
  onSettings,
  onStats,
}: MainMenuProps) => {
  const [mode, setMode] = useState<Exclude<MatchMode, 'custom'>>('normal');

  const startBotTournament = () => {
    onStartTournament(createTournament([], 8, 75, 'Torneo Bot'));
  };

  return (
    <main className="screen home-screen arcade-home">
      <section className="hero-panel" aria-labelledby="home-title">
        <div className="top-actions">
          <button className="ghost-action" type="button" onClick={onSettings}>
            ⚙ Impostazioni
          </button>
          <button className="ghost-action" type="button" onClick={onStats}>
            ▥ Statistiche
          </button>
        </div>

        <div className="brand-lockup">
          <div className="globe-logo" aria-hidden="true">
            🌍
            <span>📍</span>
          </div>
          <div>
            <h1 id="home-title">
              GeoClue
              <span>Duel</span>
            </h1>
            <p className="subtitle">Indovina il paese prima del tuo avversario</p>
          </div>
        </div>

        <div className="mode-grid" aria-label="Modalità di gioco">
          <ModeCard
            title="Contro Bot"
            subtitle="Sfida l'IA"
            meta="♟ 1"
            icon="🤖"
            tone="green"
            onClick={() => onStartMatch('bot', mode)}
          />
          <ModeCard
            title="1v1 Locale"
            subtitle="Due giocatori"
            meta="♟ 2"
            icon="👥"
            tone="blue"
            onClick={() => onStartMatch('local', mode)}
          />
          <ModeCard
            title="Torneo Bot"
            subtitle="Sfida a eliminazione"
            meta="♟ 1"
            icon="🏆"
            tone="purple"
            onClick={startBotTournament}
          />
          <ModeCard
            title="Torneo Misto"
            subtitle="Giocatori e bot"
            meta="♟ 2+"
            icon="🧑‍🤝‍🧑"
            tone="orange"
            onClick={onTournamentSetup}
          />
        </div>

        <section className="duration-picker" aria-label="Scegli la durata">
          <h2>
            <span /> Scegli la durata <span />
          </h2>
          <div>
            {(['quick', 'normal', 'long'] as const).map((choice) => (
              <button
                key={choice}
                className={mode === choice ? 'selected' : ''}
                type="button"
                onClick={() => setMode(choice)}
                aria-pressed={mode === choice}
              >
                <strong>{durationLabels[choice]}</strong>
                <small>{targetByMode[choice]} punti</small>
              </button>
            ))}
          </div>
        </section>

        <footer className="hero-footer">
          <span>👑 Miglior punteggio: {progress.bestRoundScore}</span>
          <span>{datasetCount} paesi e territori</span>
        </footer>
      </section>

      <BottomNav active="home" onHome={() => undefined} onStats={onStats} onSettings={onSettings} onGuide={onHowToPlay} />
    </main>
  );
};
