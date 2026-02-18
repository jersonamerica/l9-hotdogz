"use client";

import { useState, useEffect } from "react";

interface BannerStats {
  totalMembers: number;
  avgProgress: number;
}

export default function WelcomeBanner({
  userName,
}: {
  userName?: string | null;
}) {
  const [stats, setStats] = useState<BannerStats | null>(null);
  const [ign, setIgn] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) =>
        setStats({
          totalMembers: data.totalMembers,
          avgProgress: data.avgProgress,
        }),
      )
      .catch(() => {});

    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => setIgn(data.name || null))
      .catch(() => {});
  }, []);

  return (
    <div className="relative bg-game-card/80 backdrop-blur-sm border border-game-border rounded-xl p-6 overflow-hidden">
      {/* Accent gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-game-accent via-yellow-500 to-game-accent" />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-game-text flex items-center gap-2">
            <span>⚔️</span>
            Welcome back
            {ign || userName ? (
              <span className="text-game-accent">{ign || userName}</span>
            ) : null}
          </h2>
          <p className="text-sm text-game-text-muted mt-1">
            {stats
              ? `${stats.totalMembers} guild member${stats.totalMembers !== 1 ? "s" : ""} strong · ${stats.avgProgress}% average gear completion`
              : "Loading guild status..."}
          </p>
        </div>

        {stats && (
          <div className="flex items-center gap-1.5">
            <div className="w-32 h-3 bg-game-darker rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  stats.avgProgress >= 75
                    ? "bg-emerald-500"
                    : stats.avgProgress >= 50
                      ? "bg-yellow-500"
                      : "bg-game-accent"
                }`}
                style={{ width: `${stats.avgProgress}%` }}
              />
            </div>
            <span className="text-xs text-game-text-muted font-mono">
              {stats.avgProgress}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
