export default function MembersLoading() {
  return (
    <div className="min-h-screen bg-game-dark">
      <div className="min-h-screen bg-black/60">
        <main className="w-[90%] mx-auto py-8 animate-pulse">
          <div className="h-8 bg-game-border/40 rounded w-48 mb-6" />

          {/* Search bar skeleton */}
          <div className="h-10 bg-game-border/30 rounded w-full mb-6" />

          {/* Table skeleton */}
          <div className="bg-game-card/60 border border-game-border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-game-darker/50 px-4 py-3 flex gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-game-border/30 rounded flex-1"
                />
              ))}
            </div>
            {/* Rows */}
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="px-4 py-3 border-t border-game-border/30 flex gap-4"
              >
                {[...Array(4)].map((_, j) => (
                  <div
                    key={j}
                    className="h-4 bg-game-border/20 rounded flex-1"
                  />
                ))}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
