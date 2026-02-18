interface NeededItem {
  _id: string;
  name: string;
  type: string;
  count: number;
}

interface Props {
  items: NeededItem[];
  totalMembers: number;
}

export default function StillNeeded({ items, totalMembers }: Props) {
  const typeColors: Record<string, string> = {
    gear: "bg-blue-500/20 text-blue-400",
    special: "bg-purple-500/20 text-purple-400",
  };

  return (
    <div className="bg-game-card/80 backdrop-blur-sm border border-game-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-game-text flex items-center gap-2 mb-4">
        <span>🔥</span> Most Needed Items
      </h3>

      {items.length === 0 ? (
        <p className="text-sm text-game-text-muted text-center py-6 italic">
          Everyone has all items!
        </p>
      ) : (
        <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
          {items.map((item, idx) => {
            const pct =
              totalMembers > 0
                ? Math.round((item.count / totalMembers) * 100)
                : 0;

            return (
              <div
                key={item._id}
                className="flex items-center gap-3 py-2 px-2 rounded hover:bg-game-card-hover/50 transition-colors"
              >
                {/* Hot rank indicator */}
                <div className="flex-shrink-0 w-5 text-center">
                  {idx === 0 ? (
                    <span className="text-sm">🔥</span>
                  ) : (
                    <span className="text-xs text-game-text-muted font-mono">
                      {idx + 1}
                    </span>
                  )}
                </div>

                {/* Item info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-game-text truncate">
                      {item.name}
                    </span>
                    <span
                      className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded ${typeColors[item.type] || "bg-gray-500/20 text-gray-400"}`}
                    >
                      {item.type}
                    </span>
                  </div>
                </div>

                {/* Need bar */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-16 h-2 bg-game-darker rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-game-accent/80"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-game-text-muted w-20 text-right">
                    {item.count}/{totalMembers} need
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
