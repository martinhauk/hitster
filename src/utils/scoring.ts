export interface ScoreResult {
  label: string;
  color: string;
  points: number;
}

export function getScore(guessYear: number, actualYear: number): ScoreResult {
  const diff = Math.abs(guessYear - actualYear);
  if (diff === 0) return { label: 'Perfect! 🎯', color: 'text-green-400', points: 5 };
  if (diff <= 1) return { label: 'Excellent! 🌟', color: 'text-green-400', points: 4 };
  if (diff <= 3) return { label: 'Close! 👍', color: 'text-yellow-400', points: 3 };
  if (diff <= 5) return { label: 'Not bad 😊', color: 'text-orange-400', points: 2 };
  if (diff <= 10) return { label: 'Keep trying! 🎵', color: 'text-orange-500', points: 1 };
  return { label: 'Way off! 😅', color: 'text-red-400', points: 0 };
}
