interface Props {
  userName?: string | null;
  ign?: string | null;
  totalMembers: number;
  avgProgress: number;
}

export default function WelcomeBanner({
  userName,
  ign,
  totalMembers,
  avgProgress,
}: Props) {
  const displayName = ign || userName;

  return (
    <div className="relative bg-game-card/80 backdrop-blur-sm border border-game-border rounded-xl p-6 overflow-hidden">
      {/* Accent gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-game-accent via-yellow-500 to-game-accent" />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-game-text flex items-center gap-2">
            <span>⚔️</span>
            Welcome back
            {displayName ? (
              <span className="text-game-accent">{displayName}</span>
            ) : null}
          </h2>
          <p className="text-sm text-game-text-muted mt-1">
            {`${totalMembers} guild member${totalMembers !== 1 ? "s" : ""} strong · ${avgProgress}% average gear completion`}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-32 h-3 bg-game-darker rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                avgProgress >= 75
                  ? "bg-emerald-500"
                  : avgProgress >= 50
                    ? "bg-yellow-500"
                    : "bg-game-accent"
              }`}
              style={{ width: `${avgProgress}%` }}
            />
          </div>
          <span className="text-xs text-game-text-muted font-mono">
            {avgProgress}%
          </span>
        </div>
      </div>
    </div>
  );
}
