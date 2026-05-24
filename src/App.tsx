import { useEffect, useMemo, useState } from 'react';
import { GameScreen } from './components/GameScreen';
import { GameSetup } from './components/GameSetup';
import { MainMenu } from './components/MainMenu';
import { StatsScreen } from './components/StatsScreen';
import { TournamentBracket } from './components/TournamentBracket';
import { TournamentMatchScreen } from './components/TournamentMatchScreen';
import { TournamentSetup } from './components/TournamentSetup';
import { countries, countryCount } from './data/countries';
import { createPlayer, targetByMode, type MatchConfig, type MatchMode, type MatchState } from './game/matchEngine';
import {
  completeTournamentMatch,
  getReadyBotMatches,
  getTournamentFormat,
  simulateBotMatch,
  type TournamentGameResult,
  type TournamentMatch,
  type TournamentState,
} from './game/tournamentEngine';
import {
  defaultProgress,
  loadProgress,
  loadSettings,
  resetGeoClueStorage,
  saveProgress,
  saveSettings,
  type AppSettings,
  type ProgressSnapshot,
} from './utils/storage';

type View =
  | 'menu'
  | 'setup'
  | 'game'
  | 'how'
  | 'settings'
  | 'stats'
  | 'tournamentSetup'
  | 'bracket'
  | 'tournamentMatch';

const App = () => {
  const [view, setView] = useState<View>('menu');
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [progress, setProgress] = useState<ProgressSnapshot>(() => loadProgress());
  const [matchConfig, setMatchConfig] = useState<MatchConfig | null>(null);
  const [tournament, setTournament] = useState<TournamentState | null>(null);
  const [activeTournamentMatch, setActiveTournamentMatch] = useState<TournamentMatch | null>(null);

  useEffect(() => {
    document.documentElement.dataset.animations = settings.animationsEnabled ? 'on' : 'off';
  }, [settings.animationsEnabled]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [activeTournamentMatch?.id, matchConfig, view]);

  const activeFormat = useMemo(() => {
    if (!tournament || !activeTournamentMatch) {
      return null;
    }
    return getTournamentFormat(tournament.size, activeTournamentMatch.roundIndex, tournament.finalTarget);
  }, [activeTournamentMatch, tournament]);

  const startGame = (config: MatchConfig) => {
    setMatchConfig(config);
    setView('game');
  };

  const startArcadeMatch = (opponent: 'bot' | 'local', mode: Exclude<MatchMode, 'custom'>) => {
    const players: MatchConfig['players'] =
      opponent === 'bot'
        ? [createPlayer('Giocatore 1', 'human'), createPlayer('Bot Medio', 'bot')]
        : [createPlayer('Giocatore 1', 'human'), createPlayer('Giocatore 2', 'human')];

    startGame({
      mode,
      targetScore: targetByMode[mode],
      opponentKind: opponent,
      players,
    });
  };

  const recordMatchProgress = (match: MatchState) => {
    const winner = match.winnerId;
    const firstPlayer = match.players[0];
    const resultLabel: 'Vittoria' | 'Sconfitta' = winner === firstPlayer.id ? 'Vittoria' : 'Sconfitta';
    const updated: ProgressSnapshot = {
      matchesPlayed: progress.matchesPlayed + 1,
      matchesWon: progress.matchesWon + (winner === firstPlayer.id ? 1 : 0),
      countriesGuessed:
        progress.countriesGuessed +
        match.players.reduce((total, player) => total + match.stats[player.id].countriesGuessed, 0),
      bestRoundScore: Math.max(
        progress.bestRoundScore,
        ...match.players.map((player) => match.stats[player.id].bestRound),
      ),
      totalAttempts:
        progress.totalAttempts +
        match.players.reduce((total, player) => total + match.stats[player.id].roundsPlayed, 0),
      correctAttempts:
        progress.correctAttempts +
        match.players.reduce((total, player) => total + match.stats[player.id].countriesGuessed, 0),
      lastMatches: [
        {
          date: new Date().toLocaleDateString('it-IT'),
          opponent: match.players[1].name,
          result: resultLabel,
          scoreDelta: Math.abs(match.scores[match.players[0].id] - match.scores[match.players[1].id]),
        },
        ...progress.lastMatches,
      ].slice(0, 8),
      modeStats: {
        ...progress.modeStats,
        [`Obiettivo ${match.targetScore}`]: (progress.modeStats[`Obiettivo ${match.targetScore}`] ?? 0) + 1,
      },
    };
    setProgress(updated);
    saveProgress(updated);
  };

  const updateSettings = (next: AppSettings) => {
    setSettings(next);
    saveSettings(next);
  };

  const resetStorage = () => {
    resetGeoClueStorage();
    setSettings(loadSettings());
    setProgress(defaultProgress);
  };

  const createTournamentState = (nextTournament: TournamentState) => {
    setTournament(nextTournament);
    setView('bracket');
  };

  const simulateReadyBotMatches = () => {
    if (!tournament) {
      return;
    }

    let nextTournament = tournament;
    let readyMatches = getReadyBotMatches(nextTournament);

    while (readyMatches.length > 0) {
      for (const match of readyMatches) {
        const playerA = match.participants[0];
        const playerB = match.participants[1];
        if (!playerA || !playerB) {
          continue;
        }

        const format = getTournamentFormat(nextTournament.size, match.roundIndex, nextTournament.finalTarget);
        const result = simulateBotMatch(playerA, playerB, format, countries);
        nextTournament = completeTournamentMatch(
          nextTournament,
          match.id,
          result.winnerId,
          result.summary,
          result.gameWins,
          result.finalScore,
          result.gameResults,
        );
      }

      readyMatches = getReadyBotMatches(nextTournament);
    }

    setTournament(nextTournament);
  };

  const completeManualTournamentMatch = (
    matchId: string,
    winnerId: string,
    summary: string,
    gameWins: Record<string, number>,
    finalScore: Record<string, number>,
    gameResults?: TournamentGameResult[],
  ) => {
    if (!tournament) {
      return;
    }

    setTournament(completeTournamentMatch(tournament, matchId, winnerId, summary, gameWins, finalScore, gameResults));
    setActiveTournamentMatch(null);
    setView('bracket');
  };

  if (view === 'setup') {
    return <GameSetup onStart={startGame} onBack={() => setView('menu')} />;
  }

  if (view === 'game' && matchConfig) {
    return (
      <GameScreen
        config={matchConfig}
        countries={countries}
        onExit={() => setView('menu')}
        onFinished={recordMatchProgress}
      />
    );
  }

  if (view === 'tournamentSetup') {
    return <TournamentSetup onCreate={createTournamentState} onBack={() => setView('menu')} />;
  }

  if (view === 'stats') {
    return (
      <StatsScreen
        progress={progress}
        onHome={() => setView('menu')}
        onSettings={() => setView('settings')}
        onGuide={() => setView('how')}
      />
    );
  }

  if (view === 'bracket' && tournament) {
    return (
      <TournamentBracket
        tournament={tournament}
        onBack={() => setView('menu')}
        onPlayMatch={(match) => {
          setActiveTournamentMatch(match);
          setView('tournamentMatch');
        }}
        onSimulateBots={simulateReadyBotMatches}
        onNewTournament={() => setView('tournamentSetup')}
      />
    );
  }

  if (view === 'tournamentMatch' && activeTournamentMatch && activeFormat) {
    return (
      <TournamentMatchScreen
        match={activeTournamentMatch}
        format={activeFormat}
        countries={countries}
        onCancel={() => setView('bracket')}
        onComplete={completeManualTournamentMatch}
      />
    );
  }

  if (view === 'how') {
    return (
      <main className="screen info-screen">
        <div className="top-row">
          <button className="ghost-action" type="button" onClick={() => setView('menu')}>
            Menu
          </button>
          <h1>Come si gioca</h1>
        </div>
        <section className="info-panel">
          <p>Ogni round nasconde un paese o territorio. Puoi tentare subito senza indizi: vale 10 punti.</p>
          <p>Ogni errore rivela un nuovo indizio: sistema politico, macro-area, popolazione, confini, famiglia linguistica e infine bandiera.</p>
          <p>Meno indizi usi, piu punti fai. Vince chi raggiunge per primo l'obiettivo della partita.</p>
          <p>Nel torneo passi il turno vincendo l'incontro. I bot giocano da soli quando non ci sono umani nel match.</p>
        </section>
      </main>
    );
  }

  if (view === 'settings') {
    return (
      <main className="screen info-screen">
        <div className="top-row">
          <button className="ghost-action" type="button" onClick={() => setView('menu')}>
            Menu
          </button>
          <h1>Impostazioni</h1>
        </div>
        <section className="info-panel settings-panel">
          <label className="toggle-row">
            <span>Effetti sonori placeholder</span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(event) => updateSettings({ ...settings, soundEnabled: event.target.checked })}
            />
          </label>
          <label className="toggle-row">
            <span>Animazioni leggere</span>
            <input
              type="checkbox"
              checked={settings.animationsEnabled}
              onChange={(event) => updateSettings({ ...settings, animationsEnabled: event.target.checked })}
            />
          </label>
          <label className="field">
            <span>Lingua interfaccia</span>
            <select
              value={settings.language}
              onChange={(event) => updateSettings({ ...settings, language: event.target.value as 'it' | 'en' })}
            >
              <option value="it">Italiano</option>
              <option value="en">English pronta per futura localizzazione</option>
            </select>
          </label>
          <button className="danger-action" type="button" onClick={resetStorage}>
            Reset dati locali
          </button>
        </section>
      </main>
    );
  }

  return (
    <MainMenu
      progress={progress}
      datasetCount={countryCount}
      onStartMatch={startArcadeMatch}
      onStartTournament={(nextTournament) => {
        setTournament(nextTournament);
        setView('bracket');
      }}
      onTournamentSetup={() => setView('tournamentSetup')}
      onHowToPlay={() => setView('how')}
      onSettings={() => setView('settings')}
      onStats={() => setView('stats')}
    />
  );
};

export default App;
