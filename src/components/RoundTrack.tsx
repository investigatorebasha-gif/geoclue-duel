type RoundTrackProps = {
  roundNumber: number;
  hintsRevealed: number;
};

export const RoundTrack = ({ roundNumber, hintsRevealed }: RoundTrackProps) => (
  <section className="round-track" aria-label={`Round ${roundNumber}`}>
    <strong>⚑ Round {roundNumber}</strong>
    <div>
      {Array.from({ length: 10 }, (_, index) => {
        const step = index + 1;
        const active = step <= Math.max(1, hintsRevealed + 1);
        return (
          <span key={step} className={active ? 'active' : ''}>
            {step}
          </span>
        );
      })}
    </div>
  </section>
);
