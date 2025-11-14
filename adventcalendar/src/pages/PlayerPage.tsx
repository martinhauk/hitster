import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Page } from "../features";

const doorNumbers = Array.from({ length: 24 }, (_, index) => index + 1)
  .map((n) => ({ n, id: Math.random() * 100 }))
  .sort((a, b) => a.id - b.id);

export function PlayerPage() {
  const { fileName } = useParams();

  const activeDoor = useMemo(() => {
    if (!fileName) {
      return null;
    }
    const match = fileName.match(/\d+/);
    if (!match) {
      return null;
    }
    const parsed = Number(match[0]);
    return Number.isNaN(parsed) ? null : parsed;
  }, [fileName]);

  const audioSrc = fileName ? `/${fileName}` : undefined;
  const friendlyTitle = fileName
    ? decodeURIComponent(fileName)
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]/g, " ")
    : "Waiting for the next clue";

  return (
    <Page>
      <section className="rounded-3xl border border-emerald-100/10 bg-emerald-900/40 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
          {doorNumbers.map((door) => {
            const isActive = activeDoor === door.n;
            const isOpened = activeDoor && activeDoor >= door.n;
            return (
              <div
                key={door.id}
                className={[
                  "rounded-xl border-2 p-3 text-center",
                  isActive
                    ? "border-amber-200 bg-linear-to-b from-amber-200/30 via-amber-100/30 to-amber-200/30 shadow-lg shadow-amber-500/40"
                    : "border-emerald-200 bg-emerald-900 text-emerald-50",
                  isOpened ? "opacity-100" : "opacity-40",
                ].join(" ")}
              >
                <div className="flex h-full flex-col items-center justify-center gap-1">
                  <span className="text-2xl font-black sm:text-3xl">
                    {door.n}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-amber-100/20 bg-rose-900/30 p-8 shadow-inner">
        <p className="text-xs uppercase tracking-[0.5em] text-amber-100/80">
          Heutiger Song: {friendlyTitle}
        </p>
        <div className="mt-6 rounded-2xl border border-amber-100/30 bg-emerald-950/40 p-6">
          {audioSrc ? (
            <audio className="w-full" src={audioSrc} controls preload="none">
              Your browser does not support the audio element.
            </audio>
          ) : (
            <p className="text-sm text-amber-100/70">
              The player will appear once a door-specific URL is opened.
            </p>
          )}
        </div>
      </section>
      <p className="text-xs text-center tracking-[0.5em] text-amber-200/80">
        Christina ♥ Simon
      </p>
    </Page>
  );
}
