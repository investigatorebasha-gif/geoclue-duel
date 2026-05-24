import { useEffect, useMemo, useState } from 'react';
import type { Country } from '../data/countryTypes';
import { botGuess } from '../game/bot';
import { isCorrectGuess } from '../game/guessMatching';
import {
  advanceTurn,
  completeRound,
  createMatch,
  revealNextHint,
  type GuessAttempt,
  type MatchConfig,
  type MatchState,
} from '../game/matchEngine';
import { AttemptsList } from './AttemptsList';
import { GuessInput } from './GuessInput';
import { HintCard } from './HintCard';
import { RoundResultModal } from './RoundResultModal';
import { RoundTrack } from './RoundTrack';
import { ScoreBoard } from './ScoreBoard';
import { VictoryScreen } from './VictoryScreen';

type GameScreenProps = {
  config: MatchConfig;
  countries: Country[];
  onExit: () => void;
  onFinished?: (match: MatchState) => void;
  completionView?: 'victory' | 'return';
};

export const GameScreen = ({
  config,
  countries,
  onExit,
  onFinished,
  completionView = 'victory',
}: GameScreenProps) => {
  const [match, setMatch] = useState(() => createMatch(config.players, config.targetScore, countries));
  const [showResult, setShowResult] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong' | 'bot'>('idle');

  const currentPlayer = match.players[match.currentPlayerIndex];
  const currentRound = match.currentRound;
  const botThinking = currentPlayer.kind === 'bot' && !currentRound.isComplete && !showResult;
  const winner = match.winnerId ? match.players.find((player) => player.id === match.winnerId) : undefined;

  const resetMatch = () => {
    setMatch(createMatch(config.players, config.targetScore, countries));
    setShowResult(false);
    setShowVictory(false);
    setFeedback('idle');
  };

  const completeCurrentRound = (isCorrect: boolean, attempts: GuessAttempt[]) => {
    setMatch((current) => completeRound(current, isCorrect, attempts));
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setShowResult(true);
  };

  const submitGuess = (guess: string) => {
    if (currentRound.isComplete || currentPlayer.kind === 'bot') {
      return;
    }

    const isCorrect = isCorrectGuess(guess, currentRound.country);
    const attempts = [
      ...currentRound.attempts,
      { guess, isCorrect, hintsBeforeGuess: currentRound.hintsRevealed },
    ];

    if (isCorrect) {
      completeCurrentRound(true, attempts);
      return;
    }

    setFeedback('wrong');
    window.setTimeout(() => setFeedback('idle'), 650);

    if (currentRound.hintsRevealed >= 6) {
      completeCurrentRound(false, attempts);
      return;
    }

    setMatch((current) => ({
      ...current,
      currentRound: {
        ...revealNextHint(current.currentRound),
        attempts,
      },
    }));
  };

  useEffect(() => {
    if (currentPlayer.kind !== 'bot' || currentRound.isComplete || showResult) {
      return;
    }

    const timer = window.setTimeout(() => {
      setMatch((current) => {
        let simulatedMatch = current;
        const attempts: GuessAttempt[] = [];
        const guessedCountryIds: string[] = [];

        for (let step = 0; step <= 6; step += 1) {
          const round = simulatedMatch.currentRound;
          const result = botGuess(
            round.country,
            round.hintsRevealed,
            'medium',
            countries,
            guessedCountryIds,
          );
          attempts.push({
            guess: result.guess,
            isCorrect: result.isCorrect,
            hintsBeforeGuess: round.hintsRevealed,
          });

          if (result.isCorrect) {
            const completed = completeRound(simulatedMatch, true, attempts);
            window.setTimeout(() => {
              setFeedback('bot');
              setShowResult(true);
            }, 160);
            return completed;
          }

          guessedCountryIds.push(result.countryId);
          if (round.hintsRevealed >= 6) {
            const completed = completeRound(simulatedMatch, false, attempts);
            window.setTimeout(() => {
              setFeedback('bot');
              setShowResult(true);
            }, 160);
            return completed;
          }

          simulatedMatch = {
            ...simulatedMatch,
            currentRound: {
              ...revealNextHint(round),
              attempts,
            },
          };
        }

        return simulatedMatch;
      });
    }, 850);

    return () => window.clearTimeout(timer);
  }, [countries, currentPlayer.kind, currentRound.isComplete, showResult]);

  const goNext = () => {
    if (match.winnerId) {
      onFinished?.(match);
      setShowResult(false);
      if (completionView === 'victory') {
        setShowVictory(true);
      }
      return;
    }

    setFeedback('idle');
    setShowResult(false);
    setMatch((current) => advanceTurn(current, countries));
  };

  const targetLabel = useMemo(() => {
    if (config.targetScore === 10) {
      return 'Partita veloce';
    }
    if (config.targetScore === 30) {
      return 'Partita normale';
    }
    if (config.targetScore === 50) {
      return 'Partita lunga';
    }
    return `Obiettivo ${config.targetScore}`;
  }, [config.targetScore]);

  if (showVictory && winner) {
    return (
      <VictoryScreen
        winner={winner}
        players={match.players}
        scores={match.scores}
        stats={match.stats}
        onReplay={resetMatch}
        onMenu={onExit}
      />
    );
  }

  return (
    <main className={`screen game-screen feedback-${feedback}`}>
      <div className="game-topbar arcade-topbar">
        <button className="ghost-action" type="button" onClick={onExit}>
          Menu
        </button>
        <div>
          <p className="eyebrow">{targetLabel}</p>
          <h1>GeoClue Duel</h1>
        </div>
        <div className="target-pill">Obiettivo {match.targetScore}</div>
      </div>

      <ScoreBoard
        players={match.players}
        scores={match.scores}
        stats={match.stats}
        targetScore={match.targetScore}
        currentPlayerId={currentPlayer.id}
      />

      <section className="game-layout">
        <div className="play-area">
          <section className="mystery-card">
            <h2>Qual è il paese misterioso?</h2>
            <div className="question-orb" aria-hidden="true">
              ?
            </div>
            <p>
              {currentRound.hintsRevealed === 0
                ? 'Tentativo senza indizi disponibile: vale 10 punti.'
                : `${currentRound.hintsRevealed} indizi rivelati. Meno indizi usi, più punti fai.`}
            </p>
            {botThinking ? (
              <div className="bot-thinking" aria-live="polite">
                <strong>{currentPlayer.name} sta ragionando...</strong>
                <span>Il bot usa probabilità crescenti e prova paesi simili quando sbaglia.</span>
              </div>
            ) : (
              <GuessInput countries={countries} disabled={showResult || currentRound.isComplete} onSubmit={submitGuess} />
            )}
          </section>
          <AttemptsList attempts={currentRound.attempts.filter((attempt) => !attempt.isCorrect)} />
          <RoundTrack roundNumber={match.roundNumber} hintsRevealed={currentRound.hintsRevealed} />
        </div>

        <div className="side-panel">
          <HintCard hints={currentRound.revealedHints} hintsRevealed={currentRound.hintsRevealed} />
        </div>
      </section>

      {showResult ? (
        <RoundResultModal
          round={match.currentRound}
          playerName={currentPlayer.name}
          isMatchOver={Boolean(match.winnerId)}
          onNext={goNext}
        />
      ) : null}
    </main>
  );
};
