interface Props {
  isPlaying: boolean;
}

const bars = Array.from({ length: 16 }, (_, i) => ({
  height: 20 + Math.floor(((i * 7 + 13) % 50)),
  delay: i * 0.07,
  duration: 0.4 + (i % 5) * 0.1,
}));

export function AudioVisualizer({ isPlaying }: Props) {

  return (
    <div className={`flex items-end gap-1 h-20 transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-20'}`}>
      {bars.map((bar, i) => (
        <div
          key={i}
          className="w-2.5 bg-gradient-to-t from-purple-600 to-purple-300 rounded-full"
          style={{
            height: isPlaying ? `${bar.height}px` : '8px',
            transition: `height ${bar.duration}s ease-in-out ${bar.delay}s`,
            animation: isPlaying ? `bounce-bar ${bar.duration}s ease-in-out ${bar.delay}s infinite alternate` : 'none',
          }}
        />
      ))}
    </div>
  );
}
