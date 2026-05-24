import type { Player, PlayerStats } from '../game/matchEngine';

type VictoryScreenProps = {
  winner: Player;
  players: [Player, Player];
  scores: Record<string, number>;
  stats: Record<string, PlayerStats>;
  onReplay: () => void;
  onMenu: () => void;
};

const average = (stat: PlayerStats) =>
  stat.roundsPlayed === 0 ? '0.0' : (stat.totalPoints / stat.roundsPlayed).toFixed(1);

export const VictoryScreen = ({
  winner,
  players,
  scores,
  stats,
  onReplay,
  onMenu,
}: VictoryScreenProps) => (
  <main className="screen victory-screen">
    <section className="victory-panel">
      <p className="eyebrow">Partita conclusa</p>
      <h1>🏆 Classifica</h1>
      <p className="subtitle">{winner.name} vince il duello geografico.</p>

      <div className="victory-grid">
        {players.map((player) => (
          <article key={player.id} className={player.id === winner.id ? 'winner-card' : ''}>
            <h2>{player.name}</h2>
            <strong>{scores[player.id] ?? 0} punti</strong>
            <span>{stats[player.id].countriesGuessed} paesi indovinati</span>
            <span>Miglior round: {stats[player.id].bestRound}</span>
            <span>Media: {average(stats[player.id])} punti/round</span>
          </article>
        ))}
      </div>

      <div className="home-actions">
        <button className="primary-action" type="button" onClick={onReplay}>
          Rigioca
        </button>
        <button className="secondary-action" type="button" onClick={onMenu}>
          Torna al menu
        </button>
      </div>
    </section>
  </main>
);
