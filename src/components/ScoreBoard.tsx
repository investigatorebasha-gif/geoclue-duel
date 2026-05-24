import type { Player } from '../game/matchEngine';
import { PlayerBadge } from './PlayerBadge';

type ScoreBoardProps = {
  players: [Player, Player];
  scores: Record<string, number>;
  stats: Record<string, unknown>;
  targetScore: number;
  currentPlayerId: string;
};

export const ScoreBoard = ({
  players,
  scores,
  targetScore,
  currentPlayerId,
}: ScoreBoardProps) => (
  <section className="scoreboard duel-scoreboard" aria-label="Punteggio partita">
    <PlayerBadge
      player={players[0]}
      score={scores[players[0].id] ?? 0}
      isCurrent={players[0].id === currentPlayerId}
      side="left"
    />
    <div className="turn-center">
      <span>Turno di</span>
      <strong>{players.find((player) => player.id === currentPlayerId)?.name}</strong>
      <small>Obiettivo {targetScore}</small>
    </div>
    <PlayerBadge
      player={players[1]}
      score={scores[players[1].id] ?? 0}
      isCurrent={players[1].id === currentPlayerId}
      side="right"
    />
  </section>
);
