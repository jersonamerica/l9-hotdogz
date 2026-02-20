"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCrudMutation } from "@/hooks/useCrudMutation";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@/components/ui";

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
}: {
  member: Member | null;
  equipment?: { _id: string; name: string; type: "gear" | "special" };
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [gearLog, setGearLog] = useState<GearLogEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [removeConfirmIdx, setRemoveConfirmIdx] = useState<number | null>(null);

  const updateGearLogMutation = useCrudMutation<
    { userId: string; gearLog: { equipment: string; quantity: number }[] },
    unknown
  >({
    method: "PUT",
    url: "/api/user",
  });

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

      await updateGearLogMutation.mutateAsync({
        userId: member._id,
        gearLog: gearLogPayload,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["members"] }),
        queryClient.invalidateQueries({ queryKey: ["equipment"] }),
      ]);

      onClose();
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

      await updateGearLogMutation.mutateAsync({
        userId: member._id,
        gearLog: gearLogPayload,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["members"] }),
        queryClient.invalidateQueries({ queryKey: ["equipment"] }),
        queryClient.invalidateQueries({ queryKey: ["activity"] }),
      ]);

      onClose();
    } catch (error) {
      console.error("Failed to update gear log:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader onClose={onClose}>
        {equipment
          ? `${equipment.name} - ${member.name}`
          : `${member.name}'s Item Log`}
      </ModalHeader>

      <ModalBody className="space-y-3 max-h-[60vh] overflow-y-auto">
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
                    <Input
                      type="number"
                      min={1}
                      value={entry.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          idx,
                          Math.max(1, Number(e.target.value)),
                        )
                      }
                      className="w-16 text-center"
                    />
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setRemoveConfirmIdx(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })
          )}
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </ModalFooter>

      {/* Remove confirmation dialog */}
      {removeConfirmIdx !== null && (
        <Modal isOpen={true} onClose={() => setRemoveConfirmIdx(null)} size="sm">
          <ModalHeader>Remove Item</ModalHeader>
          <ModalBody>
            <p className="text-sm text-game-text-muted">
              Are you sure you want to remove{" "}
              <span className="text-game-accent font-medium">
                {gearLog[removeConfirmIdx]?.equipment.name}
              </span>{" "}
              from {member.name}&apos;s gear log?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setRemoveConfirmIdx(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRemoveItem} disabled={saving}>
              {saving ? "Removing..." : "Remove"}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Modal>
  );
}
