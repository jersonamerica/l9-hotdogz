interface LeaderEntry {
  _id: string;
  name: string;
  image?: string;
  cp: number;
  mastery: string;
  gearProgress: number;
}

interface Props {
  leaderboard: LeaderEntry[];
}

export default function GearLeaderboard({ leaderboard }: Props) {
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="bg-game-card/80 backdrop-blur-sm border border-game-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-game-text flex items-center gap-2 mb-4">
        <span>🏆</span> Gear Leaderboard
      </h3>

      {leaderboard.length === 0 ? (
        <p className="text-sm text-game-text-muted text-center py-6 italic">
          No members yet.
        </p>
      ) : (
        <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
          {leaderboard.map((member, idx) => (
            <div
              key={member._id}
              className="flex items-center gap-3 py-2 px-2 rounded hover:bg-game-card-hover/50 transition-colors"
            >
              {/* Rank */}
              <span className="w-6 text-center flex-shrink-0">
                {idx < 3 ? (
                  <span className="text-base">{medals[idx]}</span>
                ) : (
                  <span className="text-xs text-game-text-muted font-mono">
                    #{idx + 1}
                  </span>
                )}
              </span>

              {/* Avatar */}
              <div className="flex-shrink-0">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-7 h-7 rounded-full border border-game-border"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-game-darker border border-game-border flex items-center justify-center text-xs text-game-text-muted">
                    {member.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>

              {/* Name + CP */}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-game-text truncate block">
                  {member.name}
                </span>
                <span className="text-xs text-game-text-muted">
                  CP {member.cp.toLocaleString()}
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-20 h-2 bg-game-darker rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      member.gearProgress === 100
                        ? "bg-emerald-500"
                        : member.gearProgress >= 75
                          ? "bg-green-500"
                          : member.gearProgress >= 50
                            ? "bg-yellow-500"
                            : "bg-game-accent"
                    }`}
                    style={{ width: `${member.gearProgress}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-mono w-8 text-right ${
                    member.gearProgress === 100
                      ? "text-emerald-400"
                      : "text-game-text-muted"
                  }`}
                >
                  {member.gearProgress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
