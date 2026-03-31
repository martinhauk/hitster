import { useState, useCallback } from 'react';
import type { Track, MusicProvider } from '../providers/types';
import { SpotifyPlayer } from './SpotifyPlayer';
import { YouTubePlayer } from './YouTubePlayer';
import { AudioVisualizer } from './AudioVisualizer';

type GamePhase = 'idle' | 'playing' | 'guessing' | 'revealed';

interface Props {
  provider: MusicProvider;
}

function getScore(guessYear: number, actualYear: number): { label: string; color: string; points: number } {
  const diff = Math.abs(guessYear - actualYear);
  if (diff === 0) return { label: 'Perfect! 🎯', color: 'text-green-400', points: 5 };
  if (diff <= 1) return { label: 'Excellent! 🌟', color: 'text-green-400', points: 4 };
  if (diff <= 3) return { label: 'Close! 👍', color: 'text-yellow-400', points: 3 };
  if (diff <= 5) return { label: 'Not bad 😊', color: 'text-orange-400', points: 2 };
  if (diff <= 10) return { label: 'Keep trying! 🎵', color: 'text-orange-500', points: 1 };
  return { label: 'Way off! 😅', color: 'text-red-400', points: 0 };
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
    if (phase === 'playing' && newPlaying === false) setPhase('guessing');
    if (phase === 'guessing' && newPlaying === true) setPhase('playing');
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

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Score tracker */}
      {roundCount > 0 && (
        <div className="flex items-center gap-4 bg-gray-800/60 rounded-full px-6 py-2 text-sm">
          <span className="text-gray-400">Rounds: <span className="text-white font-bold">{roundCount}</span></span>
          <span className="text-gray-400">Score: <span className="text-purple-400 font-bold">{totalScore}</span></span>
        </div>
      )}

      {/* Provider indicator */}
      <div className="text-sm text-gray-500">
        Provider: <span className="text-purple-400 font-medium">{provider.name}</span>
      </div>

      {/* Hidden players */}
      {currentTrack && provider.name === 'Spotify' && (
        <SpotifyPlayer track={currentTrack} isPlaying={isPlaying} />
      )}
      {currentTrack && provider.name === 'YouTube' && (
        <YouTubePlayer track={currentTrack} isPlaying={isPlaying} />
      )}

      {/* Idle state */}
      {phase === 'idle' && (
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-gray-300 text-xl font-medium">Can you guess the year?</p>
            <p className="text-gray-500">A random song will play — guess when it was released!</p>
          </div>
          <button
            onClick={handleNewSong}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xl font-bold px-12 py-5 rounded-full shadow-lg shadow-purple-900/50 transition-all hover:scale-105 active:scale-95"
          >
            🎵 Play Random Song
          </button>
        </div>
      )}

      {/* Playing / Guessing state */}
      {(phase === 'playing' || phase === 'guessing') && (
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
          <AudioVisualizer isPlaying={isPlaying} />

          <p className="text-gray-400 text-sm">
            {isPlaying ? 'Now playing — listen carefully!' : 'Paused'}
          </p>

          <button
            onClick={handleTogglePlay}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-lg px-8 py-3 rounded-full transition-all hover:scale-105 active:scale-95"
          >
            {isPlaying ? '⏸ Pause' : '▶ Resume'}
          </button>

          <div className="w-full space-y-2">
            <label className="block text-gray-300 text-sm text-center">
              What year was this song released?
            </label>
            <input
              type="number"
              min="1950"
              max="2024"
              value={guessYear}
              onChange={e => setGuessYear(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmitGuess()}
              placeholder="e.g. 1985"
              className="w-full bg-gray-700 text-white text-center text-3xl font-bold px-4 py-4 rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>

          <button
            onClick={handleSubmitGuess}
            disabled={!guessYear}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-lg font-bold px-8 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:scale-100"
          >
            Submit Guess
          </button>
        </div>
      )}

      {/* Revealed state */}
      {phase === 'revealed' && currentTrack && score && (
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
          <div className={`text-4xl font-bold ${score.color}`}>{score.label}</div>

          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 w-full text-center space-y-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">The song was</p>
              <p className="text-white text-2xl font-bold">{currentTrack.title}</p>
              <p className="text-gray-300 text-lg">{currentTrack.artist}</p>
              {currentTrack.genre && (
                <span className="inline-block mt-1 text-xs text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded-full">
                  {currentTrack.genre}
                </span>
              )}
            </div>

            <div className="border-t border-gray-700 pt-4 flex justify-center gap-10">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Your guess</p>
                <p className="text-white text-3xl font-bold">{guessYear}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Actual year</p>
                <p className="text-green-400 text-3xl font-bold">{currentTrack.year}</p>
              </div>
            </div>

            <p className="text-purple-400 text-sm font-medium">+{score.points} point{score.points !== 1 ? 's' : ''}</p>
          </div>

          <button
            onClick={handleNewSong}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xl font-bold px-12 py-5 rounded-full shadow-lg shadow-purple-900/50 transition-all hover:scale-105 active:scale-95"
          >
            🎵 Next Song
          </button>
        </div>
      )}
    </div>
  );
}
