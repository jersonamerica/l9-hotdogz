import Image from "next/image";

interface Props {
  userName?: string | null;
  ign?: string | null;
  totalMembers: number;
  avgProgress: number;
}

export default function WelcomeBanner({ ign, avgProgress }: Props) {
  const displayName = ign || "";

  return (
    <div className="relative bg-game-card/80 backdrop-blur-sm border border-game-border rounded-xl p-6 overflow-hidden">
      {/* Accent gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-game-accent via-yellow-500 to-game-accent" />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-game-text flex items-center gap-2">
            <Image
              src="/logo/item_log_logo.png"
              alt="Item Log Logo"
              width={38}
              height={38}
              className="inline-block align-middle"
            />

            {displayName ? (
              <>
                Welcome back,
                <span className="text-game-accent">{displayName}!</span>
              </>
            ) : null}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <p className="text-sm text-game-text-muted mt-1">
            {`Guild has ${avgProgress}% average gear completion`}
          </p>
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
