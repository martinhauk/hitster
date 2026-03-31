import { useState, useCallback } from 'react';
import type { Track, MusicProvider } from '../providers/types';
import { getScore } from '../utils/scoring';
import { IdleScreen } from './IdleScreen';
import { PlayingScreen } from './PlayingScreen';
import { RevealScreen } from './RevealScreen';

type GamePhase = 'idle' | 'playing' | 'guessing' | 'revealed';

interface Props {
  provider: MusicProvider;
}

export function GameBoard({ provider }: Props) {
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guessYear, setGuessYear] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [roundCount, setRoundCount] = useState(0);

  const handleNewSong = useCallback(() => {
    const track = provider.getRandomTrack();
    setCurrentTrack(track);
    setPhase('playing');
    setIsPlaying(true);
    setGuessYear('');
    setSubmitted(false);
  }, [provider]);

  const handleTogglePlay = () => {
    const newPlaying = !isPlaying;
    setIsPlaying(newPlaying);
    if (phase === 'playing' && !newPlaying) setPhase('guessing');
    if (phase === 'guessing' && newPlaying) setPhase('playing');
  };

  const handleSubmitGuess = () => {
    if (!guessYear || !currentTrack) return;
    const year = parseInt(guessYear, 10);
    if (isNaN(year) || year < 1950 || year > 2024) return;
    setIsPlaying(false);
    setSubmitted(true);
    setPhase('revealed');
    const result = getScore(year, currentTrack.year);
    setTotalScore(s => s + result.points);
    setRoundCount(r => r + 1);
  };

  const score =
    submitted && currentTrack && guessYear
      ? getScore(parseInt(guessYear, 10), currentTrack.year)
      : null;

  // The provider carries its own Player component — no branching on provider.name needed.
  const { Player } = provider;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Session score */}
      {roundCount > 0 && (
        <div className="flex items-center gap-4 bg-gray-800/60 rounded-full px-6 py-2 text-sm">
          <span className="text-gray-400">
            Rounds: <span className="text-white font-bold">{roundCount}</span>
          </span>
          <span className="text-gray-400">
            Score: <span className="text-purple-400 font-bold">{totalScore}</span>
          </span>
        </div>
      )}

      {/* Hidden audio player — rendered by the provider itself */}
      {currentTrack && <Player track={currentTrack} isPlaying={isPlaying} />}

      {phase === 'idle' && <IdleScreen onPlay={handleNewSong} />}

      {(phase === 'playing' || phase === 'guessing') && (
        <PlayingScreen
          isPlaying={isPlaying}
          guessYear={guessYear}
          onTogglePlay={handleTogglePlay}
          onGuessChange={setGuessYear}
          onSubmit={handleSubmitGuess}
        />
      )}

      {phase === 'revealed' && currentTrack && score && (
        <RevealScreen
          track={currentTrack}
          guessYear={guessYear}
          score={score}
          onNext={handleNewSong}
        />
      )}
    </div>
  );
}

