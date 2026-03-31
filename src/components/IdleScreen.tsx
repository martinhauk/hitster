interface Props {
  onPlay: () => void;
}

export function IdleScreen({ onPlay }: Props) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <p className="text-gray-300 text-xl font-medium">Can you guess the year?</p>
        <p className="text-gray-500">A random song will play — guess when it was released!</p>
      </div>
      <button
        onClick={onPlay}
        className="bg-purple-600 hover:bg-purple-500 text-white text-xl font-bold px-12 py-5 rounded-full shadow-lg shadow-purple-900/50 transition-all hover:scale-105 active:scale-95"
      >
        🎵 Play Random Song
      </button>
    </div>
  );
}
