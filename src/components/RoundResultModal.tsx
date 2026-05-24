import type { RoundState } from '../game/matchEngine';

type RoundResultModalProps = {
  round: RoundState;
  playerName: string;
  isMatchOver: boolean;
  onNext: () => void;
};

export const RoundResultModal = ({
  round,
  playerName,
  isMatchOver,
  onNext,
}: RoundResultModalProps) => (
  <div className="modal-backdrop" role="presentation">
    <section className="result-modal" role="dialog" aria-modal="true" aria-labelledby="round-result-title">
      <p className="eyebrow">{playerName}</p>
      <h2 id="round-result-title">{round.wasCorrect ? 'Fine round' : 'Round mancato'}</h2>

      <div className="answer-block">
        <div className="answer-flag">
          {round.country.flagUrl ? <img src={round.country.flagUrl} alt={`Bandiera: ${round.country.name_it}`} /> : null}
          {!round.country.flagUrl && round.country.flagEmoji ? <span>{round.country.flagEmoji}</span> : null}
        </div>
        <div>
          <strong>{round.country.name_it}</strong>
          <span>{round.country.name_en}</span>
        </div>
      </div>

      <div className="result-stats">
        <div>
          <span>{round.pointsEarned}</span>
          <small>punti ottenuti</small>
        </div>
        <div>
          <span>{round.hintsRevealed}</span>
          <small>indizi usati</small>
        </div>
        <div>
          <span>{round.attempts.length}</span>
          <small>tentativi</small>
        </div>
      </div>

      <details className="used-hints">
        <summary>Riepilogo indizi</summary>
        {round.revealedHints.length === 0 ? (
          <p>Nessun indizio usato.</p>
        ) : (
          <ol>
            {round.revealedHints.map((hint) => (
              <li key={`${hint.type}-${hint.index}`}>{hint.text}</li>
            ))}
          </ol>
        )}
      </details>

      <button className="primary-action wide" type="button" onClick={onNext}>
        {isMatchOver ? 'Vedi vittoria' : 'Prossimo turno'}
      </button>
    </section>
  </div>
);
