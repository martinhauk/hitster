import type { Track } from '../providers/types';
import type { ScoreResult } from '../utils/scoring';

interface Props {
  track: Track;
  guessYear: string;
  score: ScoreResult;
  onNext: () => void;
}

export function RevealScreen({ track, guessYear, score, onNext }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <div className={`text-4xl font-bold ${score.color}`}>{score.label}</div>

      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 w-full text-center space-y-4">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">The song was</p>
          <p className="text-white text-2xl font-bold">{track.title}</p>
          <p className="text-gray-300 text-lg">{track.artist}</p>
          {track.genre && (
            <span className="inline-block mt-1 text-xs text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded-full">
              {track.genre}
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
            <p className="text-green-400 text-3xl font-bold">{track.year}</p>
          </div>
        </div>

        <p className="text-purple-400 text-sm font-medium">
          +{score.points} point{score.points !== 1 ? 's' : ''}
        </p>
      </div>

      <button
        onClick={onNext}
        className="bg-purple-600 hover:bg-purple-500 text-white text-xl font-bold px-12 py-5 rounded-full shadow-lg shadow-purple-900/50 transition-all hover:scale-105 active:scale-95"
      >
        🎵 Next Song
      </button>
    </div>
  );
}
