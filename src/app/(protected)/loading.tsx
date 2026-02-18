export default function ProtectedLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-game-border border-t-game-accent" />
        <span className="text-sm text-game-text-muted">Loading...</span>
      </div>
    </div>
  );
}
