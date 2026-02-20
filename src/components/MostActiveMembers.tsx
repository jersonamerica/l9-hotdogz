"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "./ui";

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Request failed");
  }
  return res.json() as Promise<T>;
};

interface Member {
  _id: string;
  name: string;
  image?: string;
  cp: number;
  attendancePoints?: number;
}

export default function MostActiveMembers() {
  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: () => fetcher<Member[]>("/api/members"),
  });

  // Sort by attendance points and get top 10
  const topMembers = members
    .sort((a, b) => (b.attendancePoints || 0) - (a.attendancePoints || 0))
    .slice(0, 10);

  return (
    <Card className="bg-game-card/80 backdrop-blur-sm border border-game-border">
      <div className="px-4 py-3 border-b border-game-border bg-game-darker/50">
        <h3 className="text-sm font-bold text-game-accent">
          Most Active Members
        </h3>
        <p className="text-xs text-game-text-muted mt-1">Top 10 by attendance</p>
      </div>

      <div className="divide-y divide-game-border">
        {topMembers.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-game-text-muted">No members yet</p>
          </div>
        ) : (
          topMembers.map((member, rank) => (
            <div
              key={member._id}
              className="px-4 py-3 flex items-center justify-between hover:bg-game-card-hover/30 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xs font-bold text-game-text-muted w-6">
                  #{rank + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-game-text truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-game-text-muted">
                    {member.cp.toLocaleString()} CP
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-sm font-bold text-game-accent">
                  {member.attendancePoints || 0}
                </p>
                <p className="text-xs text-game-text-muted">points</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
