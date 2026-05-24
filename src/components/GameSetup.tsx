import { useState } from 'react';
import { createPlayer, targetByMode, type MatchConfig, type MatchMode } from '../game/matchEngine';

type GameSetupProps = {
  onStart: (config: MatchConfig) => void;
  onBack: () => void;
};

type OpponentChoice = 'bot' | 'local';

export const GameSetup = ({ onStart, onBack }: GameSetupProps) => {
  const [mode, setMode] = useState<Exclude<MatchMode, 'custom'>>('quick');
  const [opponent, setOpponent] = useState<OpponentChoice>('bot');
  const [playerOneName, setPlayerOneName] = useState('Giocatore 1');
  const [playerTwoName, setPlayerTwoName] = useState('Giocatore 2');

  const startMatch = () => {
    const players: [ReturnType<typeof createPlayer>, ReturnType<typeof createPlayer>] =
      opponent === 'bot'
        ? [createPlayer(playerOneName, 'human'), createPlayer('Bot Atlas', 'bot')]
        : [createPlayer(playerOneName, 'human'), createPlayer(playerTwoName, 'human')];

    onStart({
      mode,
      targetScore: targetByMode[mode],
      opponentKind: opponent,
      players,
    });
  };

  return (
    <main className="screen setup-screen">
      <div className="top-row">
        <button className="ghost-action" type="button" onClick={onBack}>
          Menu
        </button>
        <h1>Nuova partita</h1>
      </div>

      <section className="setup-grid">
        <div className="setup-section">
          <h2>Modalità</h2>
          <div className="choice-grid" role="radiogroup" aria-label="Scegli modalità partita">
            {(['quick', 'normal', 'long'] as const).map((choice) => (
              <button
                key={choice}
                className={mode === choice ? 'choice-card selected' : 'choice-card'}
                type="button"
                onClick={() => setMode(choice)}
                aria-pressed={mode === choice}
              >
                <strong>{choice === 'quick' ? 'Veloce' : choice === 'normal' ? 'Normale' : 'Lunga'}</strong>
                <span>{targetByMode[choice]} punti</span>
              </button>
            ))}
          </div>
        </div>

        <div className="setup-section">
          <h2>Avversario</h2>
          <div className="segmented">
            <button
              type="button"
              className={opponent === 'bot' ? 'active' : ''}
              onClick={() => setOpponent('bot')}
            >
              Bot medio
            </button>
            <button
              type="button"
              className={opponent === 'local' ? 'active' : ''}
              onClick={() => setOpponent('local')}
            >
              1v1 locale
            </button>
          </div>
        </div>

        <div className="setup-section">
          <h2>Giocatori</h2>
          <label className="field">
            <span>Nome giocatore 1</span>
            <input
              value={playerOneName}
              onChange={(event) => setPlayerOneName(event.target.value)}
              maxLength={24}
            />
          </label>
          {opponent === 'local' && (
            <label className="field">
              <span>Nome giocatore 2</span>
              <input
                value={playerTwoName}
                onChange={(event) => setPlayerTwoName(event.target.value)}
                maxLength={24}
              />
            </label>
          )}
        </div>
      </section>

      <button className="primary-action wide" type="button" onClick={startMatch}>
        Avvia duello
      </button>
    </main>
  );
};
