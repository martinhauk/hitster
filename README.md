# 🎵 Hitster

A music year-guessing game. A random song snippet plays and you guess the year it was released!

## How to play

1. Click **Play Random Song** — a snippet will start playing
2. Listen carefully, then type your guess for the release year
3. Click **Submit Guess** to see how close you were
4. Scoring: Perfect (same year) = 5pts, ±1yr = 4pts, ±3yr = 3pts, ±5yr = 2pts, ±10yr = 1pt
5. Keep track of your own score — nothing is saved between sessions

## Music providers

- **YouTube** (default) — plays the official music video via the YouTube IFrame API (audio only, video hidden)
- **Spotify** — plays a 30-second preview via HTML5 audio (requires tracks with `previewUrl` set in `src/data/tracks.ts`)

## Project structure

```
src/
├── components/
│   ├── AudioVisualizer.tsx   # Animated equaliser bars
│   ├── GameBoard.tsx         # Game state machine (orchestrator)
│   ├── IdleScreen.tsx        # "Press play" landing view
│   ├── PlayingScreen.tsx     # Active playback + year input
│   ├── RevealScreen.tsx      # Result reveal after a guess
│   ├── SpotifyPlayer.tsx     # Hidden HTML5 audio player
│   └── YouTubePlayer.tsx     # Hidden YouTube IFrame player
├── data/
│   └── tracks.ts             # Curated list of 45 songs (1960–2024)
├── providers/
│   ├── types.ts              # Track, PlayerProps & MusicProvider interfaces
│   ├── SpotifyProvider.ts    # Implements MusicProvider (Spotify previews)
│   └── YouTubeProvider.ts    # Implements MusicProvider (YouTube IFrame API)
└── utils/
    └── scoring.ts            # getScore() helper + ScoreResult type
```

## Local development

```bash
npm install
npm run dev       # starts Vite dev server at http://localhost:5173/hitster/
npm run build     # type-check + production build → dist/
npm run lint      # ESLint
```

## Deployment

The app is a static site deployed to **GitHub Pages** automatically.

### Automatic (recommended)

Every push to `main` triggers the GitHub Actions workflow at
`.github/workflows/deploy.yml`, which:
1. Runs `npm ci && npm run build`
2. Uploads `dist/` as a Pages artifact
3. Deploys to `https://<your-username>.github.io/hitster/`

**One-time setup required in the repository settings:**

1. Go to **Settings → Pages**
2. Under *Source*, choose **GitHub Actions**
3. Make sure the `pages`, `id-token`, and `contents` permissions are enabled
   (already set in the workflow file)

### Manual

```bash
npm run build
# Copy the contents of dist/ to any static web host.
```

> **Note:** The Vite config sets `base: '/hitster/'` so all asset paths are
> relative to the `/hitster/` sub-path used by GitHub Pages.  If you host at
> a different path, update `base` in `vite.config.ts`.

