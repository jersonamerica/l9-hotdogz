"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Request failed");
  }
  return res.json() as Promise<T>;
};

interface ActivityEntry {
  _id: string;
  action: string;
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  details: string;
  createdAt: string;
}

const ACTION_CONFIG: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  equipment_added: {
    icon: "➕",
    label: "Equipment Added",
    color: "text-green-400",
  },
  equipment_updated: {
    icon: "✏️",
    label: "Equipment Updated",
    color: "text-yellow-400",
  },
  equipment_deleted: {
    icon: "🗑️",
    label: "Equipment Removed",
    color: "text-red-400",
  },
  announcement_created: {
    icon: "📢",
    label: "Announcement",
    color: "text-blue-400",
  },
  announcement_updated: {
    icon: "📝",
    label: "Announcement Updated",
    color: "text-yellow-400",
  },
  announcement_deleted: {
    icon: "🗑️",
    label: "Announcement Removed",
    color: "text-red-400",
  },
  member_joined: {
    icon: "👋",
    label: "Member Joined",
    color: "text-emerald-400",
  },
  profile_updated: {
    icon: "⚙️",
    label: "Profile Updated",
    color: "text-sky-400",
  },
  gear_marked_done: {
    icon: "✅",
    label: "Gear Completed",
    color: "text-green-400",
  },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function ActivityLog() {
  const {
    data: activities = [],
    isLoading: loading,
    refetch,
  } = useQuery<ActivityEntry[]>({
    queryKey: ["activity"],
    queryFn: () => fetcher<ActivityEntry[]>("/api/activity"),
  });
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="bg-game-card/80 backdrop-blur-sm border border-game-border rounded-xl p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-game-border border-t-game-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-game-card/80 backdrop-blur-sm border border-game-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-game-text flex items-center gap-2">
          <span>📜</span> Activity Log
        </h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1.5 text-game-text-muted hover:text-game-accent transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh"
        >
          <svg
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
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

      {activities.length === 0 ? (
        <p className="text-sm text-game-text-muted text-center py-6 italic">
          No activity yet — actions will appear here.
        </p>
      ) : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
          {activities.map((entry) => {
            const config = ACTION_CONFIG[entry.action] || {
              icon: "•",
              label: entry.action,
              color: "text-game-text-muted",
            };

            return (
              <div
                key={entry._id}
                className="flex items-start gap-3 py-2 px-2 rounded hover:bg-game-card-hover/50 transition-colors"
              >
                {/* Avatar removed */}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs">{config.icon}</span>
                    <span className="text-sm font-medium text-game-text truncate">
                      {entry.user?.name || "Unknown"}
                    </span>
                    <span className={`text-xs ${config.color}`}>
                      {config.label.toLowerCase()}
                    </span>
                  </div>
                  {entry.details && (
                    <p className="text-xs text-game-text-muted mt-0.5 truncate">
                      {entry.details}
                    </p>
                  )}
                </div>

                {/* Timestamp */}
                <span className="text-xs text-game-text-muted flex-shrink-0 mt-0.5">
                  {timeAgo(entry.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
