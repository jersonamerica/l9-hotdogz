interface Props {
  totalMembers: number;
  totalEquipment: number;
  avgCp: number;
  avgProgress: number;
}

export default function GuildStats({
  totalMembers,
  totalEquipment,
  avgCp,
  avgProgress,
}: Props) {
  const cards = [
    {
      label: "Members",
      value: totalMembers,
      icon: "👥",
      color: "text-emerald-400",
    },
    {
      label: "Equipment",
      value: totalEquipment,
      icon: "🛡️",
      color: "text-blue-400",
    },
    {
      label: "Avg CP",
      value: avgCp.toLocaleString(),
      icon: "⚡",
      color: "text-yellow-400",
    },
    {
      label: "Guild Progress",
      value: `${avgProgress}%`,
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
