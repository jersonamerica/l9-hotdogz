export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-game-dark">
      <div className="min-h-screen bg-black/60">
        <main className="w-[90%] mx-auto py-12 animate-pulse">
          <div className="max-w-4xl mx-auto">
            {/* Profile card skeleton */}
            <div className="bg-game-card/60 border border-game-border rounded-lg p-8">
              {/* Avatar + name area */}
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-game-border/30 rounded-full" />
                <div>
                  <div className="h-6 bg-game-border/40 rounded w-48 mb-2" />
                  <div className="h-4 bg-game-border/30 rounded w-32" />
                </div>
              </div>

              {/* Mastery image area */}
              <div className="flex justify-center mb-8">
                <div className="w-40 h-40 bg-game-border/20 rounded-lg" />
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-game-border/30 rounded w-24 mb-2" />
                    <div className="h-10 bg-game-border/20 rounded w-full" />
                  </div>
                ))}
              </div>

              {/* Save button */}
              <div className="flex justify-end mt-6">
                <div className="h-9 bg-game-border/30 rounded w-20" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
