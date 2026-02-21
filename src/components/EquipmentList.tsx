"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import EquipmentForm from "./EquipmentForm";
import EditMemberGearModal from "./EditMemberGearModal";
import { useCrudMutation } from "@/hooks/useCrudMutation";
import { Button, Input } from "@/components/ui";

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Request failed");
  }
  return res.json() as Promise<T>;
};

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
  gearLog: { equipment: { _id: string }; quantity: number }[];
}

export default function EquipmentList({
  isAdmin = false,
}: {
  isAdmin?: boolean;
}) {
  const queryClient = useQueryClient();
  const {
    data: equipment = [],
    isLoading: eqLoading,
    refetch: refetchEquipment,
  } = useQuery<EquipmentItem[]>({
    queryKey: ["equipment"],
    queryFn: () => fetcher<EquipmentItem[]>("/api/equipment"),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
  const {
    data: members = [],
    isLoading: memLoading,
    refetch: refetchMembers,
  } = useQuery<MemberNeed[]>({
    queryKey: ["members"],
    queryFn: () => fetcher<MemberNeed[]>("/api/members"),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
  const loading = eqLoading || memLoading;

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberNeed | null>(null);
  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentItem | null>(null);
  const [showGearModal, setShowGearModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EquipmentItem | null>(null);

  const deleteEquipmentMutation = useCrudMutation<{ id: string }, unknown>({
    method: "DELETE",
    url: (input) => `/api/equipment/${input.id}`,
    invalidateKeys: [["equipment"], ["members"], ["stats"], ["activity"]],
  });

  const handleDelete = (item: EquipmentItem) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setDeletingId(itemToDelete._id);
    try {
      await deleteEquipmentMutation.mutateAsync({ id: itemToDelete._id });
      setShowDeleteDialog(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete equipment:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  const doMutations = () => {
    queryClient.invalidateQueries({ queryKey: ["equipment"] });
    queryClient.invalidateQueries({ queryKey: ["members"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    queryClient.invalidateQueries({ queryKey: ["activity"] });
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingItem(null);
    doMutations();
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
    try {
      await Promise.all([refetchMembers(), refetchEquipment()]);
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredEquipment = equipment
    .filter((item) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

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
            <Button
              onClick={() => setShowForm(true)}
              className="cursor-pointer"
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
            </Button>
          </div>
        )}
      </div>

      {/* Search + Refresh */}
      <div className="flex items-center gap-2 mb-4">
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search equipment by name or type..."
          className="flex-1"
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh"
          className="p-2 cursor-pointer"
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
        </Button>
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
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                            className="mr-4 text-game-accent hover:text-game-accent-hover cursor-pointer"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item);
                            }}
                            disabled={deletingId === item._id}
                            className="text-game-danger hover:text-game-danger-hover cursor-pointer"
                          >
                            {deletingId === item._id ? "Deleting..." : "Delete"}
                          </Button>
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
                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {needingMembers.map((m) => (
                                  <Button
                                    key={m._id}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedMember(m);
                                      setSelectedEquipment(item);
                                      setShowGearModal(true);
                                    }}
                                    className="flex items-center gap-2 bg-game-card/50 border border-game-border hover:border-game-accent justify-between w-full cursor-pointer"
                                  >
                                    <span className="text-xs text-game-text truncate">
                                      {m.name || "Unknown"}
                                    </span>
                                    <span className="text-xs text-game-text-muted">
                                      {m.cp.toLocaleString()} CP
                                    </span>
                                  </Button>
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

      {isAdmin && (
        <EditMemberGearModal
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          member={selectedMember as any}
          equipment={selectedEquipment || undefined}
          isOpen={showGearModal}
          onClose={async () => {
            setShowGearModal(false);
            setSelectedMember(null);
            setSelectedEquipment(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && itemToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-game-card border border-game-border rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-game-danger/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-game-danger"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-game-text">
                    Delete Equipment
                  </h3>
                  <p className="text-sm text-game-text-muted mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-sm text-game-text mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-game-accent">
                  {itemToDelete.name}
                </span>
                ? This will remove it from all members&apos; gear logs.
              </p>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="ghost"
                  onClick={cancelDelete}
                  disabled={deletingId === itemToDelete._id}
                  className="border border-game-border hover:bg-game-card-hover cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={deletingId === itemToDelete._id}
                  className="bg-game-danger hover:bg-game-danger/90 text-white border-0 cursor-pointer"
                >
                  {deletingId === itemToDelete._id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
