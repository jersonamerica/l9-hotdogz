"use client";

import { useState } from "react";
import useSWR from "swr";
import { MASTERY_IMAGES } from "@/lib/constants";

interface GearLogEntry {
  equipment: {
    _id: string;
    name: string;
    type?: string;
  };
  quantity: number;
}

interface Member {
  _id: string;
  name: string;
  image?: string;
  cp: number;
  mastery: string;
  role: string;
  gearLog: GearLogEntry[];
  neededCount: number;
  ownedCount: number;
  totalEquipment: number;
  gearProgress: number;
  createdAt: string;
}

type SortKey = "name" | "cp" | "mastery" | "gearProgress";
type SortDir = "asc" | "desc";

export default function MemberDirectory() {
  const {
    data: members = [],
    isLoading: loading,
    mutate,
  } = useSWR<Member[]>("/api/members");

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("cp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "cp" || key === "gearProgress" ? "desc" : "asc");
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  const filtered = members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (m.name || "").toLowerCase().includes(q) ||
      (m.mastery || "").toLowerCase().includes(q) ||
      (m.role || "").toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name") {
      cmp = (a.name || "").localeCompare(b.name || "");
    } else if (sortKey === "cp") {
      cmp = a.cp - b.cp;
    } else if (sortKey === "mastery") {
      cmp = (a.mastery || "").localeCompare(b.mastery || "");
    } else if (sortKey === "gearProgress") {
      cmp = a.gearProgress - b.gearProgress;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    if (progress >= 25) return "bg-orange-500";
    return "bg-game-accent";
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-game-border border-t-game-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-game-darker/50 border border-game-border rounded p-3 text-center">
          <div className="text-2xl font-bold text-game-accent">
            {members.length}
          </div>
          <div className="text-xs text-game-text-muted">Members</div>
        </div>
        <div className="bg-game-darker/50 border border-game-border rounded p-3 text-center">
          <div className="text-2xl font-bold text-game-text">
            {members.length > 0
              ? Math.round(
                  members.reduce((sum, m) => sum + m.cp, 0) / members.length,
                )
              : 0}
          </div>
          <div className="text-xs text-game-text-muted">Avg CP</div>
        </div>
        <div className="bg-game-darker/50 border border-game-border rounded p-3 text-center">
          <div className="text-2xl font-bold text-game-text">
            {members.length > 0 ? Math.max(...members.map((m) => m.cp)) : 0}
          </div>
          <div className="text-xs text-game-text-muted">Highest CP</div>
        </div>
        <div className="bg-game-darker/50 border border-game-border rounded p-3 text-center">
          <div className="text-2xl font-bold text-game-text">
            {members.length > 0
              ? Math.round(
                  members.reduce((sum, m) => sum + m.gearProgress, 0) /
                    members.length,
                )
              : 0}
            %
          </div>
          <div className="text-xs text-game-text-muted">Avg Gear</div>
        </div>
      </div>

      {/* Search + Refresh */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-game-darker/50 border border-game-border rounded px-3 py-2 text-sm text-game-text focus:outline-none focus:border-game-accent placeholder-game-text-muted"
          placeholder="Search members by name or mastery..."
        />
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-game-text-muted hover:text-game-accent transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh"
        >
          <svg
            className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Members table */}
      {sorted.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-game-border rounded">
          <p className="text-sm text-game-text-muted">No members found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-game-border">
            <thead className="bg-game-darker/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-game-text-muted uppercase tracking-wider">
                  #
                </th>
                <th
                  onClick={() => handleSort("name")}
                  className="px-4 py-3 text-left text-xs font-medium text-game-text-muted uppercase tracking-wider cursor-pointer hover:text-game-accent select-none transition-colors"
                >
                  Member{sortIndicator("name")}
                </th>
                <th
                  onClick={() => handleSort("mastery")}
                  className="px-4 py-3 text-center text-xs font-medium text-game-text-muted uppercase tracking-wider cursor-pointer hover:text-game-accent select-none transition-colors"
                >
                  Mastery{sortIndicator("mastery")}
                </th>
                <th
                  onClick={() => handleSort("cp")}
                  className="px-4 py-3 text-center text-xs font-medium text-game-text-muted uppercase tracking-wider cursor-pointer hover:text-game-accent select-none transition-colors"
                >
                  CP{sortIndicator("cp")}
                </th>
                <th
                  onClick={() => handleSort("gearProgress")}
                  className="px-4 py-3 text-center text-xs font-medium text-game-text-muted uppercase tracking-wider cursor-pointer hover:text-game-accent select-none transition-colors"
                >
                  Gear Progress{sortIndicator("gearProgress")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-game-border">
              {sorted.map((member, idx) => (
                <>
                  <tr
                    key={member._id}
                    onClick={() =>
                      setExpandedId(
                        expandedId === member._id ? null : member._id,
                      )
                    }
                    className="hover:bg-game-card-hover/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-sm text-game-text-muted">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-game-text">
                        {member.name || "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {member.mastery ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <img
                            src={MASTERY_IMAGES[member.mastery]}
                            alt={member.mastery}
                            className="w-5 h-5 object-contain"
                          />
                          <span className="text-xs text-game-text-muted">
                            {member.mastery}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-game-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-game-text">
                      {member.cp.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-game-darker rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getProgressColor(member.gearProgress)}`}
                            style={{ width: `${member.gearProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-game-text-muted w-12 text-right">
                          {member.ownedCount}/{member.totalEquipment}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded gear details */}
                  {expandedId === member._id && (
                    <tr key={`${member._id}-details`}>
                      <td colSpan={5} className="px-4 py-3 bg-game-darker/30">
                        <div className="pl-8">
                          <p className="text-xs font-medium text-game-text-muted mb-2 uppercase tracking-wider">
                            Still Needed ({member.neededCount} items)
                          </p>
                          {member.gearLog.length === 0 ? (
                            <p className="text-xs text-game-text-muted italic">
                              All gear acquired!
                            </p>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                              {member.gearLog.map((g) => (
                                <div
                                  key={g.equipment._id}
                                  className="flex items-center justify-between bg-game-card/50 border border-game-border rounded px-2 py-1"
                                >
                                  <span className="text-xs text-game-text truncate">
                                    {g.equipment.name}
                                  </span>
                                  <span className="text-xs text-game-text-muted ml-1">
                                    ×{g.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
