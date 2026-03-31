import { useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { YouTubeProvider } from './providers/YouTubeProvider';

const provider = new YouTubeProvider();

// Pre-load the YouTube IFrame API as soon as the app mounts so that it is
// ready (or very close to ready) by the time the user hits Play.
// YouTubePlayer.tsx registers player-specific callbacks into the same
// _ytReadyCallbacks queue; the guard `if (!window._ytReadyCallbacks)` there
// ensures the handler is not overwritten when the API is pre-loaded here.
function preloadYouTubeAPI() {
  if (typeof window === 'undefined') return;
  if (document.getElementById('yt-script')) return;
  if (!window._ytReadyCallbacks) {
    window._ytReadyCallbacks = [];
    window.onYouTubeIframeAPIReady = () => {
      window._ytReadyCallbacks?.forEach(cb => cb());
      window._ytReadyCallbacks = [];
    };
  }
  const script = document.createElement('script');
  script.id = 'yt-script';
  script.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(script);
}

function App() {
  useEffect(() => {
    preloadYouTubeAPI();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-6xl font-extrabold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🎵 Hitster
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Guess the year of the song!</p>
        </div>

        {/* Game */}
        <GameBoard provider={provider} />

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-16">
          Keep track of your own score — no data is saved!
        </p>
      </div>
    </div>
  );
}

export default App;
