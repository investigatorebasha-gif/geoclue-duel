import { useState } from 'react';
import { createPlayer, type Player } from '../game/matchEngine';
import { createTournament, type FinalTarget, type TournamentSize, type TournamentState } from '../game/tournamentEngine';

type TournamentSetupProps = {
  onCreate: (tournament: TournamentState) => void;
  onBack: () => void;
};

export const TournamentSetup = ({ onCreate, onBack }: TournamentSetupProps) => {
  const [name, setName] = useState('GeoClue Cup');
  const [size, setSize] = useState<TournamentSize>(8);
  const [finalTarget, setFinalTarget] = useState<FinalTarget>(75);
  const [humanNames, setHumanNames] = useState<string[]>(['Giocatore 1']);

  const updateHuman = (index: number, value: string) => {
    setHumanNames((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const addHuman = () => {
    setHumanNames((current) =>
      current.length >= size ? current : [...current, `Giocatore ${current.length + 1}`],
    );
  };

  const removeHuman = (index: number) => {
    setHumanNames((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const create = () => {
    const humans: Player[] = humanNames
      .map((humanName) => humanName.trim())
      .filter(Boolean)
      .slice(0, size)
      .map((humanName) => createPlayer(humanName, 'human'));

    onCreate(createTournament(humans, size, finalTarget, name));
  };

  return (
    <main className="screen setup-screen">
      <div className="top-row">
        <button className="ghost-action" type="button" onClick={onBack}>
          Menu
        </button>
        <h1>Torneo</h1>
      </div>

      <section className="setup-grid tournament-setup">
        <div className="setup-section">
          <h2>Dettagli</h2>
          <label className="field">
            <span>Nome torneo</span>
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={32} />
          </label>

          <label className="field">
            <span>Dimensione</span>
            <select value={size} onChange={(event) => setSize(Number(event.target.value) as TournamentSize)}>
              <option value={4}>4 partecipanti</option>
              <option value={8}>8 partecipanti</option>
              <option value={16}>16 partecipanti</option>
              <option value={32}>32 partecipanti</option>
            </select>
          </label>

          <label className="field">
            <span>Obiettivo finale</span>
            <select
              value={finalTarget}
              onChange={(event) => setFinalTarget(Number(event.target.value) as FinalTarget)}
            >
              <option value={75}>75 punti</option>
              <option value={100}>100 punti</option>
              <option value={125}>125 punti</option>
            </select>
          </label>
        </div>

        <div className="setup-section">
          <div className="section-heading-row">
            <h2>Giocatori locali</h2>
            <button className="small-action" type="button" onClick={addHuman} disabled={humanNames.length >= size}>
              Aggiungi
            </button>
          </div>

          {humanNames.map((humanName, index) => (
            <div className="inline-field" key={`human-${index}`}>
              <label className="field">
                <span>Nome</span>
                <input value={humanName} onChange={(event) => updateHuman(index, event.target.value)} />
              </label>
              {humanNames.length > 1 && (
                <button className="icon-action" type="button" onClick={() => removeHuman(index)} aria-label="Rimuovi">
                  ×
                </button>
              )}
            </div>
          ))}
          <p className="helper-text">
            I posti liberi vengono riempiti automaticamente con bot. Minimo torneo: 4 partecipanti.
          </p>
        </div>
      </section>

      <button className="primary-action wide" type="button" onClick={create}>
        Crea bracket
      </button>
    </main>
  );
};
