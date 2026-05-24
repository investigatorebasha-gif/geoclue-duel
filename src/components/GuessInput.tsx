import { useMemo, useState, type FormEvent } from 'react';
import type { Country } from '../data/countryTypes';
import { findMatchingOptions } from '../game/guessMatching';

type GuessInputProps = {
  countries: Country[];
  disabled?: boolean;
  onSubmit: (guess: string) => void;
};

export const GuessInput = ({ countries, disabled = false, onSubmit }: GuessInputProps) => {
  const [guess, setGuess] = useState('');
  const options = useMemo(() => findMatchingOptions(guess, countries, 10), [countries, guess]);

  const submitGuess = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = guess.trim();
    if (!value || disabled) {
      return;
    }

    onSubmit(value);
    setGuess('');
  };

  return (
    <form className="guess-form" onSubmit={submitGuess}>
      <label htmlFor="guess-input">Risposta</label>
      <div className="guess-row">
        <input
          id="guess-input"
          list="country-options"
          value={guess}
          disabled={disabled}
          autoComplete="off"
          placeholder="Scrivi qui la tua risposta..."
          onChange={(event) => setGuess(event.target.value)}
        />
        <datalist id="country-options">
          {options.map((option) => (
            <option key={option.countryId} value={option.label} />
          ))}
        </datalist>
        <button className="primary-action" type="submit" disabled={disabled || guess.trim().length === 0}>
          Invia
        </button>
      </div>
    </form>
  );
};
