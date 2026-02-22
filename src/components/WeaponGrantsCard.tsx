import { Card } from "./ui";

interface WeaponGrantEntry {
  _id: string;
  userId: string;
  userName: string;
  weapon: string;
  grantedByName: string;
  grantedAt: string;
}

interface Props {
  grants: WeaponGrantEntry[];
}

export default function WeaponGrantsCard({ grants }: Props) {
  return (
    <Card className="bg-game-card/80 backdrop-blur-sm border border-game-border">
      <div className="px-4 py-3 border-b border-game-border bg-game-darker/50">
        <h3 className="text-sm font-bold text-game-accent">Weapon Grants</h3>
        <p className="text-xs text-game-text-muted mt-1">
          Recently given weapons
        </p>
      </div>

      <div className="divide-y divide-game-border">
        {grants.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-game-text-muted">No weapon grants yet</p>
          </div>
        ) : (
          grants.map((grant) => (
            <div
              key={grant._id}
              className="px-4 py-3 hover:bg-game-card-hover/30 transition-colors"
            >
              <p className="text-xs font-medium text-game-text">
                {grant.userName}
              </p>
              <p className="text-xs text-game-text-muted">{grant.weapon}</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-[11px] text-game-text-muted truncate">
                  by {grant.grantedByName}
                </p>
                <p className="text-[11px] text-game-text-muted">
                  {new Date(grant.grantedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
