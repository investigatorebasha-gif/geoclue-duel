import type { Player } from '../game/matchEngine';

type PlayerBadgeProps = {
  player: Player;
  score: number;
  isCurrent?: boolean;
  side: 'left' | 'right';
};

export const PlayerBadge = ({ player, score, isCurrent = false, side }: PlayerBadgeProps) => (
  <article className={`player-badge ${side} ${isCurrent ? 'current' : ''}`}>
    <span className="avatar" aria-hidden="true">
      {player.kind === 'bot' ? '🤖' : '🧑'}
    </span>
    <div>
      <strong>{player.name}</strong>
      <span>⭐ {score}</span>
    </div>
  </article>
);
