# 🎵 Hitster

A music year-guessing game. A random song snippet plays and you guess the year it was released!

## How to play

1. Click **Play Random Song** — a snippet will start playing
2. Listen carefully, then type your guess for the release year
3. Click **Submit Guess** to see how close you were
4. Scoring: Perfect (same year) = 5pts, ±1yr = 4pts, ±3yr = 3pts, ±5yr = 2pts, ±10yr = 1pt
5. Keep track of your own score — nothing is saved between sessions

## Music providers

- **YouTube** (default) — plays the first few seconds of the official music video via the YouTube IFrame API (audio only, video hidden)
- **Spotify** — plays a 30-second preview via HTML5 audio (requires tracks with `previewUrl` set)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Deployed to GitHub Pages at `/hitster/` via the included GitHub Actions workflow.
