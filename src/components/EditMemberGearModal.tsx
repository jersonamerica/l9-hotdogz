"use client";

import { useState, useEffect } from "react";
import { mutate } from "swr";

interface GearLogEntry {
  _id?: string;
  equipment: {
    _id: string;
    name: string;
    type: "gear" | "special";
  };
  quantity: number;
}

interface Member {
  _id: string;
  name: string;
  cp: number;
  gearLog: GearLogEntry[];
}

export default function EditMemberGearModal({
  member,
  equipment,
  isOpen,
  onClose,
  onSave,
}: {
  member: Member | null;
  equipment?: { _id: string; name: string; type: "gear" | "special" };
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
}) {
  const [gearLog, setGearLog] = useState<GearLogEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [removeConfirmIdx, setRemoveConfirmIdx] = useState<number | null>(null);

  useEffect(() => {
    if (member) {
      setGearLog(member.gearLog || []);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleQuantityChange = (idx: number, newQty: number) => {
    const updated = [...gearLog];
    if (newQty <= 0) {
      setRemoveConfirmIdx(idx);
    } else {
      updated[idx].quantity = newQty;
      setGearLog(updated);
    }
  };

  const handleRemoveItem = async () => {
    if (removeConfirmIdx === null) return;

    setSaving(true);

    try {
      const updatedGearLog = gearLog.filter((_, i) => i !== removeConfirmIdx);
      const gearLogPayload = updatedGearLog.map((entry) => ({
        equipment: entry.equipment._id,
        quantity: entry.quantity,
      }));

      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: member._id,
          gearLog: gearLogPayload,
        }),
      });

      if (res.ok) {
        const [membersRes, equipmentRes] = await Promise.all([
          fetch("/api/members"),
          fetch("/api/equipment"),
        ]);

        if (membersRes.ok && equipmentRes.ok) {
          const freshMembers = await membersRes.json();
          const freshEquipment = await equipmentRes.json();

          // Update SWR cache with fresh data
          mutate("/api/members", freshMembers, false);
          mutate("/api/equipment", freshEquipment, false);
        }
        onClose();
        if (onSave) {
          await onSave();
        }
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setSaving(false);
      setRemoveConfirmIdx(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const gearLogPayload = gearLog.map((entry) => ({
        equipment: entry.equipment._id,
        quantity: entry.quantity,
      }));

      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: member._id,
          gearLog: gearLogPayload,
        }),
      });

      if (res.ok) {
        mutate("/api/members");
        mutate("/api/equipment");
        mutate("/api/activity");
        onClose();
      }
    } catch (error) {
      console.error("Failed to update gear log:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-game-card border border-game-border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-game-text">
            {equipment
              ? `${equipment.name} - ${member.name}`
              : `${member.name}'s Item Log`}
          </h3>
          <button
            onClick={onClose}
            className="text-game-text-muted hover:text-game-text transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {gearLog.length === 0 ? (
            <p className="text-sm text-game-text-muted italic">
              No items in gear log
            </p>
          ) : (
            gearLog.map((entry, idx) => {
              // If equipment is specified, only show that equipment
              if (equipment && entry.equipment._id !== equipment._id) {
                return null;
              }
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-game-darker/50 border border-game-border rounded p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-game-text truncate">
                      {entry.equipment.name}
                    </p>
                    <p className="text-xs text-game-text-muted">
                      {entry.equipment.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <input
                      type="number"
                      min={1}
                      value={entry.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          idx,
                          Math.max(1, Number(e.target.value)),
                        )
                      }
                      className="w-16 bg-game-darker border border-game-border rounded px-2 py-1 text-sm text-game-text focus:outline-none focus:border-game-accent text-center"
                    />
                    <button
                      onClick={() => setRemoveConfirmIdx(idx)}
                      className="px-2 py-1 text-xs font-medium text-white bg-game-danger rounded hover:bg-game-danger-hover transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-game-border pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-game-text-muted hover:text-game-text border border-game-border rounded transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-game-accent rounded hover:bg-game-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Remove confirmation dialog */}
        {removeConfirmIdx !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-game-card border border-game-border rounded p-6 max-w-sm w-full mx-4">
              <h4 className="text-game-text font-semibold mb-2">Remove Item</h4>
              <p className="text-sm text-game-text-muted mb-4">
                Are you sure you want to remove{" "}
                <span className="text-game-accent font-medium">
                  {gearLog[removeConfirmIdx]?.equipment.name}
                </span>{" "}
                from {member.name}&apos;s gear log?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRemoveConfirmIdx(null)}
                  className="px-4 py-2 text-sm text-game-text-muted hover:text-game-text border border-game-border rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveItem}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-game-danger rounded hover:bg-game-danger-hover disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {saving ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
