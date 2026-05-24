import type { Player, PlayerStats } from '../game/matchEngine';

type DuelRadarProps = {
  currentPlayer: Player;
  roundNumber: number;
  hintsRevealed: number;
  scores: Record<string, number>;
  players: [Player, Player];
  stats: Record<string, PlayerStats>;
};

const missionByHints = (hintsRevealed: number) => {
  if (hintsRevealed === 0) {
    return 'Colpo secco disponibile: puoi ancora fare 10 punti.';
  }
  if (hintsRevealed <= 3) {
    return 'Zona bonus viva: resta aggressivo e punta al round pesante.';
  }
  return 'Modalita recupero: anche un punto puo cambiare il duello.';
};

export const DuelRadar = ({
  currentPlayer,
  roundNumber,
  hintsRevealed,
  scores,
  players,
  stats,
}: DuelRadarProps) => {
  const leader =
    scores[players[0].id] === scores[players[1].id]
      ? 'Parita perfetta'
      : scores[players[0].id] > scores[players[1].id]
        ? `${players[0].name} in vantaggio`
        : `${players[1].name} in vantaggio`;
  const currentStats = stats[currentPlayer.id];

  return (
    <section className="duel-radar" aria-label="Radar duello">
      <div>
        <p className="eyebrow">Radar duello</p>
        <h2>{leader}</h2>
      </div>
      <div className="radar-grid">
        <span>
          <strong>{roundNumber}</strong>
          Round
        </span>
        <span>
          <strong>{currentStats.bestRound}</strong>
          Miglior round
        </span>
        <span>
          <strong>{currentStats.countriesGuessed}</strong>
          Paesi presi
        </span>
      </div>
      <p className="radar-mission">{missionByHints(hintsRevealed)}</p>
    </section>
  );
};
