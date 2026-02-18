"use client";

import { useState, useEffect } from "react";

interface Stats {
  totalMembers: number;
  totalEquipment: number;
  avgCp: number;
  avgProgress: number;
}

export default function GuildStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-game-card/80 backdrop-blur-sm border border-game-border rounded-xl p-4 animate-pulse"
          >
            <div className="h-4 bg-game-darker rounded w-16 mb-2"></div>
            <div className="h-8 bg-game-darker rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Members",
      value: stats.totalMembers,
      icon: "👥",
      color: "text-emerald-400",
    },
    {
      label: "Equipment",
      value: stats.totalEquipment,
      icon: "🛡️",
      color: "text-blue-400",
    },
    {
      label: "Avg CP",
      value: stats.avgCp.toLocaleString(),
      icon: "⚡",
      color: "text-yellow-400",
    },
    {
      label: "Guild Progress",
      value: `${stats.avgProgress}%`,
      icon: "📊",
      color: "text-game-accent",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-game-card/80 backdrop-blur-sm border border-game-border rounded-xl p-4 hover:border-game-accent/30 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{card.icon}</span>
            <span className="text-xs text-game-text-muted uppercase tracking-wider font-medium">
              {card.label}
            </span>
          </div>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
