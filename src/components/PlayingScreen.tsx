import { AudioVisualizer } from './AudioVisualizer';

interface Props {
  isPlaying: boolean;
  guessYear: string;
  onTogglePlay: () => void;
  onGuessChange: (year: string) => void;
  onSubmit: () => void;
}

export function PlayingScreen({ isPlaying, guessYear, onTogglePlay, onGuessChange, onSubmit }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSubmit();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <AudioVisualizer isPlaying={isPlaying} />

      <p className="text-gray-400 text-sm">
        {isPlaying ? 'Now playing — listen carefully!' : 'Paused'}
      </p>

      <button
        onClick={onTogglePlay}
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
          onChange={e => onGuessChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 1985"
          className="w-full bg-gray-700 text-white text-center text-3xl font-bold px-4 py-4 rounded-xl border border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={!guessYear}
        className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-lg font-bold px-8 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:scale-100"
      >
        Submit Guess
      </button>
    </div>
  );
}
