import type { CountryHint } from '../data/countryTypes';

type HintCardProps = {
  hints: CountryHint[];
  hintsRevealed: number;
};

export const HintCard = ({ hints, hintsRevealed }: HintCardProps) => (
  <section className="hint-card" aria-live="polite">
    <div className="hint-header">
      <h2>Indizi</h2>
      <strong>{hintsRevealed} / 6</strong>
    </div>

    <ol className="hint-list arcade-hints">
      {Array.from({ length: 6 }, (_, index) => {
        const hintNumber = index + 1;
        const hint = hints.find((item) => item.index === hintNumber);
        const lockedLabels = [
          'Regime politico / sistema di governo',
          'Continente o macro-area',
          'Fascia di popolazione',
          'Confini e territorio',
          'Famiglie linguistiche',
          'Bandiera',
        ];

        return (
          <li
            key={hintNumber}
            className={`${hint ? 'revealed' : 'locked'} ${hint?.type === 'flag' ? 'flag-hint' : ''}`}
          >
            <span className="hint-index">{hintNumber}</span>
            <div>
              <strong>{hint?.title ?? lockedLabels[index]}</strong>
              <p>{hint?.text ?? 'Indizio bloccato'}</p>
              {hint?.type === 'flag' && (
                <div className="flag-preview">
                  {hint.flagUrl ? <img src={hint.flagUrl} alt="Bandiera indizio finale" /> : null}
                  {!hint.flagUrl && hint.flagEmoji ? <span>{hint.flagEmoji}</span> : null}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  </section>
);
