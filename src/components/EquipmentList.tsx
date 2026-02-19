"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import EquipmentForm from "./EquipmentForm";

interface EquipmentItem {
  _id: string;
  name: string;
  type: "gear" | "special";
  createdAt: string;
}

interface MemberNeed {
  _id: string;
  name: string;
  image?: string;
  cp: number;
  gearLog: { equipment: { _id: string } }[];
}

export default function EquipmentList({
  isAdmin = false,
}: {
  isAdmin?: boolean;
}) {
  const { data: equipment = [], isLoading: eqLoading } =
    useSWR<EquipmentItem[]>("/api/equipment");
  const { data: members = [], isLoading: memLoading } =
    useSWR<MemberNeed[]>("/api/members");
  const loading = eqLoading || memLoading;

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/equipment/${id}`, { method: "DELETE" });
      if (res.ok) {
        mutate("/api/equipment");
        mutate("/api/members");
        mutate("/api/stats");
        mutate("/api/activity");
      }
    } catch (error) {
      console.error("Failed to delete equipment:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingItem(null);
    mutate("/api/equipment");
    mutate("/api/members");
    mutate("/api/stats");
    mutate("/api/activity");
  };

  const handleEdit = (item: EquipmentItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([mutate("/api/equipment"), mutate("/api/members")]);
    setRefreshing(false);
  };

  const filteredEquipment = equipment.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)
    );
  });

  const typeColors: Record<string, string> = {
    gear: "bg-game-gear/20 text-game-gear border border-game-gear/30",
    special:
      "bg-game-special/20 text-game-special border border-game-special/30",
  };

  // Get members who still need a specific equipment (gear log = items needed)
  const getMembersNeedingItem = (equipmentId: string) => {
    return members
      .filter((m) => m.gearLog.some((g) => g.equipment?._id === equipmentId))
      .sort((a, b) => b.cp - a.cp);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-game-border border-t-game-accent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-game-text-muted">
          Equipment <span className="text-game-gold">({equipment.length})</span>
        </h3>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-game-accent rounded hover:bg-game-accent-hover transition-colors flex items-center gap-2 cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Equipment
            </button>
          </div>
        )}
      </div>

      {/* Search + Refresh */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-game-darker/50 border border-game-border rounded px-3 py-2 text-sm text-game-text focus:outline-none focus:border-game-accent placeholder-game-text-muted"
          placeholder="Search equipment by name or type..."
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

      {filteredEquipment.length === 0 ? (
        <div className="text-center py-12 bg-game-darker rounded border border-dashed border-game-border">
          <svg
            className="mx-auto h-12 w-12 text-game-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-game-text">
            No equipment yet
          </h3>
          <p className="mt-1 text-sm text-game-text-muted">
            Get started by adding your first equipment.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-game-border">
            <thead className="bg-game-darker/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-game-text-muted uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-game-text-muted uppercase tracking-wider">
                  Type
                </th>
                {isAdmin && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-game-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-game-border">
              {filteredEquipment.map((item) => {
                const needingMembers = getMembersNeedingItem(item._id);
                return (
                  <>
                    <tr
                      key={item._id}
                      onClick={() =>
                        setExpandedId(expandedId === item._id ? null : item._id)
                      }
                      className="hover:bg-game-card-hover/30 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-game-text">
                            {item.name}
                          </div>
                          {needingMembers.length > 0 && (
                            <span className="text-xs text-game-accent">
                              ({needingMembers.length} need)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md ${typeColors[item.type]}`}
                        >
                          {item.type}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                            className="text-game-accent hover:text-game-accent-hover mr-4 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item._id);
                            }}
                            disabled={deletingId === item._id}
                            className="text-game-danger hover:text-game-danger-hover disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            {deletingId === item._id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      )}
                    </tr>
                    {expandedId === item._id && (
                      <tr key={`${item._id}-details`}>
                        <td
                          colSpan={isAdmin ? 3 : 2}
                          className="px-4 py-3 bg-game-darker/30"
                        >
                          <div className="pl-2">
                            <p className="text-xs font-medium text-game-text-muted mb-2 uppercase tracking-wider">
                              Members who still need this (
                              {needingMembers.length})
                            </p>
                            {needingMembers.length === 0 ? (
                              <p className="text-xs text-green-400 italic">
                                All members have this item!
                              </p>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {needingMembers.map((m) => (
                                  <div
                                    key={m._id}
                                    className="flex items-center gap-2 bg-game-card/50 border border-game-border rounded px-2 py-1.5"
                                  >
                                    <span className="text-xs text-game-text truncate">
                                      {m.name || "Unknown"}
                                    </span>
                                    <span className="text-xs text-game-text-muted ml-auto">
                                      {m.cp.toLocaleString()} CP
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isAdmin && showForm && (
        <EquipmentForm
          equipment={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
