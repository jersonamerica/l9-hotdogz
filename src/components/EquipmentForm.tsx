"use client";

import { useState } from "react";
import { useCrudMutation } from "@/hooks/useCrudMutation";

interface EquipmentItem {
  _id: string;
  name: string;
  type: "gear" | "special";
  createdAt: string;
}

interface EquipmentFormProps {
  equipment?: EquipmentItem | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function EquipmentForm({
  equipment,
  onSave,
  onCancel,
}: EquipmentFormProps) {
  const isEditing = !!equipment;
  const [name, setName] = useState(equipment?.name || "");
  const [type, setType] = useState<"gear" | "special">(
    equipment?.type || "gear",
  );
  const [error, setError] = useState("");

  const createMutation = useCrudMutation<
    { name: string; type: "gear" | "special" },
    EquipmentItem
  >({
    method: "POST",
    url: "/api/equipment",
    invalidateKeys: [["equipment"], ["members"], ["stats"], ["activity"]],
  });

  const updateMutation = useCrudMutation<
    { id: string; name: string; type: "gear" | "special" },
    EquipmentItem
  >({
    method: "PUT",
    url: (input) => `/api/equipment/${input.id}`,
    invalidateKeys: [["equipment"], ["members"], ["stats"], ["activity"]],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: equipment._id,
          name,
          type,
        });
      } else {
        await createMutation.mutateAsync({ name, type });
      }
      onSave();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-game-card border border-game-border rounded w-full max-w-md">
        <div className="px-6 py-4 border-b border-game-border">
          <h3 className="text-lg font-semibold text-game-accent">
            {isEditing ? "✏️ Edit Equipment" : "➕ Add Equipment"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-game-danger/10 border border-game-danger/30 text-game-danger p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-game-text-muted mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-game-darker border border-game-border rounded px-3 py-2 text-sm text-game-text focus:outline-none focus:border-game-accent placeholder-game-text-muted"
              placeholder="Equipment name"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-game-text-muted mb-1">
              Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "gear" | "special")}
              className="w-full bg-game-darker border border-game-border rounded px-3 py-2 pr-10 text-sm text-game-text focus:outline-none focus:border-game-accent appearance-none"
            >
              <option value="gear">⚙️ Gear</option>
              <option value="special">✨ Special</option>
            </select>
            {/* Custom dropdown arrow */}
            <span className="pointer-events-none absolute top-9 right-4 flex items-center">
              <svg
                className="w-5 h-5 text-game-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-game-border">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-game-text-muted bg-game-darker border border-game-border rounded hover:bg-game-card-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-game-accent rounded hover:bg-game-accent-hover disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : isEditing ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
