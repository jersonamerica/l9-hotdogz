export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-game-dark">
      <div className="min-h-screen bg-black/60">
        <main className="w-[90%] mx-auto py-8 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Welcome Banner skeleton */}
              <div className="bg-game-card/60 border border-game-border rounded-lg p-6">
                <div className="h-6 bg-game-border/40 rounded w-48 mb-3" />
                <div className="h-4 bg-game-border/30 rounded w-64 mb-2" />
                <div className="h-3 bg-game-border/20 rounded w-full mt-4" />
              </div>

              {/* Announcements skeleton */}
              <div className="bg-game-card/60 border border-game-border rounded-lg p-6">
                <div className="h-5 bg-game-border/40 rounded w-40 mb-4" />
                <div className="space-y-3">
                  <div className="h-16 bg-game-border/20 rounded" />
                  <div className="h-16 bg-game-border/20 rounded" />
                </div>
              </div>

              {/* Guild Stats skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-game-card/60 border border-game-border rounded-lg p-4"
                  >
                    <div className="h-4 bg-game-border/30 rounded w-20 mb-2" />
                    <div className="h-8 bg-game-border/40 rounded w-16" />
                  </div>
                ))}
              </div>

              {/* Leaderboard + Still Needed skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-game-card/60 border border-game-border rounded-lg p-6"
                  >
                    <div className="h-5 bg-game-border/40 rounded w-36 mb-4" />
                    <div className="space-y-3">
                      {[...Array(5)].map((_, j) => (
                        <div
                          key={j}
                          className="h-8 bg-game-border/20 rounded"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column: Activity Log skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-game-card/60 border border-game-border rounded-lg p-6">
                <div className="h-5 bg-game-border/40 rounded w-32 mb-4" />
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-game-border/20 rounded"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
