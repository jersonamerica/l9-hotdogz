"use client";

import { useState } from "react";
import { useCrudMutation } from "@/hooks/useCrudMutation";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
} from "@/components/ui";

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
    <Modal isOpen={true} onClose={onCancel} size="md">
      <ModalHeader onClose={onCancel}>
        {isEditing ? "✏️ Edit Equipment" : "➕ Add Equipment"}
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {error && (
            <div className="bg-game-danger/10 border border-game-danger/30 text-game-danger p-3 rounded text-sm">
              {error}
            </div>
          )}

          <Input
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Equipment name"
          />

          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as "gear" | "special")}
            required
          >
            <option value="gear">⚙️ Gear</option>
            <option value="special">✨ Special</option>
          </Select>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update" : "Add"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
