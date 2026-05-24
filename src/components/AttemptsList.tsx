import type { GuessAttempt } from '../game/matchEngine';

type AttemptsListProps = {
  attempts: GuessAttempt[];
};

export const AttemptsList = ({ attempts }: AttemptsListProps) => (
  <section className="attempts-panel" aria-label="Tentativi gia fatti">
    <h2>Tentativi</h2>
    {attempts.length === 0 ? (
      <p>Nessun tentativo sbagliato per ora.</p>
    ) : (
      <ul>
        {attempts.map((attempt, index) => (
          <li key={`${attempt.guess}-${index}`}>
            <span>{attempt.guess}</span>
            <small>{attempt.hintsBeforeGuess} indizi</small>
          </li>
        ))}
      </ul>
    )}
  </section>
);
