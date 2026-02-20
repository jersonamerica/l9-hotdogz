"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useCrudMutation } from "@/hooks/useCrudMutation";
import { Button } from "@/components/ui";
import { MASTERY_OPTIONS, MASTERY_IMAGES } from "@/lib/constants";

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Request failed");
  }
  return res.json() as Promise<T>;
};

interface User {
  _id: string;
  name: string;
  cp: number;
  mastery: string;
  equipmentType: "Plate" | "Leather" | "Cloth";
  userEquipmentItems: string[];
}

const EQUIPMENT_ITEMS: Record<string, string[]> = {
  Plate: ["Helm", "Armor", "Gaiters", "Gauntlets", "Greaves", "Weapon"],
  Leather: ["Hood", "Vest", "Leather Pants", "Wristband", "Boots", "Weapon"],
  Cloth: ["Hat", "Robe", "Pants", "Gloves", "Loafers", "Weapon"],
};

export default function EquipmentPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const { data: membersData = [], refetch } = useQuery<User[]>({
    queryKey: ["members"],
    queryFn: () => fetcher<User[]>("/api/members"),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>(
    {},
  );
  const [editingUserKey, setEditingUserKey] = useState<string | null>(null);
  const [editingItems, setEditingItems] = useState<Record<string, string[]>>(
    {},
  );
  const [savingUserKey, setSavingUserKey] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<Record<string, string[]>>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const updateEquipmentMutation = useCrudMutation<
    { userId: string; userEquipmentItems: string[] },
    unknown
  >({
    method: "PUT",
    url: "/api/user",
    invalidateKeys: [["members"], ["stats"], ["activity"]],
  });

  const toggleUser = (key: string) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const startEditing = (
    userKey: string,
    userId: string,
    currentItems: string[],
  ) => {
    setEditingUserKey(userKey);
    const itemsToEdit =
      savedItems[userId] !== undefined ? savedItems[userId] : currentItems;
    setEditingItems({
      [userId]: [...itemsToEdit],
    });
  };

  const toggleItem = (userId: string, item: string) => {
    setEditingItems((prev) => {
      const items = prev[userId] || [];
      if (items.includes(item)) {
        return {
          ...prev,
          [userId]: items.filter((i) => i !== item),
        };
      } else {
        return {
          ...prev,
          [userId]: [...items, item],
        };
      }
    });
  };

  const cancelEditing = () => {
    setEditingUserKey(null);
    setEditingItems({});
  };

  const saveItems = async (userId: string, userName: string) => {
    setSavingUserKey(userId);
    try {
      const newItems = editingItems[userId] || [];

      await updateEquipmentMutation.mutateAsync({
        userId,
        userEquipmentItems: newItems,
      });

      // Update local state immediately
      setSavedItems((prev) => ({
        ...prev,
        [userId]: newItems,
      }));

      setEditingUserKey(null);
      setEditingItems({});

      // Show success dialog
      setSuccessMessage(`${userName}'s equipment updated successfully!`);
      setShowSuccessDialog(true);

      // Auto-close dialog after 2 seconds
      setTimeout(() => {
        setShowSuccessDialog(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to update equipment items:", error);
    } finally {
      setSavingUserKey(null);
    }
  };

  const getUsersByMastery = (mastery: string) => {
    return membersData
      .filter((user) => user.mastery === mastery)
      .sort((a, b) => b.cp - a.cp);
  };

  const getUsersByType = (type: string) => {
    return membersData
      .filter((user) => user.equipmentType === type)
      .sort((a, b) => b.cp - a.cp);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg/equipment_bg.jpg')" }}
    >
      <div className="min-h-screen bg-black/60 pb-24">
        <main className="w-[90%] mx-auto py-8">
          <div className="flex items-center justify-end mb-6">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => refetch()}
              title="Refresh"
              className="p-2"
            >
              <svg
                className={`w-5 h-5`}
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

          {/* Weapon Mastery Section */}
          <h2 className="text-2xl font-bold text-game-accent mb-8">
            Weapon Mastery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MASTERY_OPTIONS.map((mastery) => {
              const masteryUsers = getUsersByMastery(mastery);
              const weaponImage =
                MASTERY_IMAGES[mastery as keyof typeof MASTERY_IMAGES] || "";

              return (
                <div
                  key={mastery}
                  className={`bg-game-card/80 backdrop-blur-sm border border-game-border rounded-xl p-6`}
                >
                  {/* Weapon image at top center */}
                  {weaponImage && (
                    <div className="flex justify-center mb-4 h-32">
                      <Image
                        src={weaponImage}
                        alt={mastery}
                        width={120}
                        height={120}
                        className="object-contain"
                      />
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className={`text-lg font-bold text-game-accent`}>
                      {mastery}
                    </h3>
                    <p className="text-xs text-game-text-muted mt-1">
                      {masteryUsers.length} member
                      {masteryUsers.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* User Accordions */}
                  <div className="space-y-2">
                    {masteryUsers.length === 0 ? (
                      <p className="text-xs text-game-text-muted text-center py-4 italic">
                        No members with this weapon
                      </p>
                    ) : (
                      masteryUsers.map((user) => {
                        const userKey = `${mastery}-${user._id}`;
                        const isEditing = editingUserKey === userKey;

                        const currentItems =
                          savedItems[user._id] !== undefined
                            ? savedItems[user._id]
                            : user.userEquipmentItems;

                        const hasWeapon = isEditing
                          ? editingItems[user._id]?.includes("Weapon")
                          : currentItems.includes("Weapon");

                        return (
                          <div
                            key={userKey}
                            className="flex items-center justify-between gap-3 px-4 py-3 border border-game-border rounded hover:bg-game-card-hover/30 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-game-text truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-game-text-muted mt-1">
                                {user.cp.toLocaleString()} CP
                              </p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {isEditing ? (
                                <>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={hasWeapon || false}
                                      onChange={() =>
                                        toggleItem(user._id, "Weapon")
                                      }
                                      className="w-4 h-4 rounded border-game-border bg-game-darker accent-game-accent"
                                    />
                                    <span className="text-xs text-game-text">
                                      Have
                                    </span>
                                  </label>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={cancelEditing}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() =>
                                      saveItems(user._id, user.name)
                                    }
                                    disabled={savingUserKey === user._id}
                                  >
                                    {savingUserKey === user._id
                                      ? "Saving..."
                                      : "Save"}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <span
                                    className={`text-xs font-medium ${
                                      hasWeapon
                                        ? "text-green-400"
                                        : "text-red-400"
                                    }`}
                                  >
                                    {hasWeapon ? "✓ Have" : "✗ Not"}
                                  </span>
                                  {isAdmin && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        startEditing(
                                          userKey,
                                          user._id,
                                          user.userEquipmentItems,
                                        )
                                      }
                                      className="text-game-accent hover:text-game-accent-hover"
                                    >
                                      Edit
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Equipment Type Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-game-accent mb-8">
              Equipment Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Plate",
                  image: "/image/plate-armor.png",
                  color: "bg-blue-500/20 border-blue-500/30",
                  textColor: "text-blue-400",
                },
                {
                  name: "Leather",
                  image: "/image/leather-armor.png",
                  color: "bg-amber-500/20 border-amber-500/30",
                  textColor: "text-amber-400",
                },
                {
                  name: "Cloth",
                  image: "/image/cloth-armor.png",
                  color: "bg-black-500/20 border-black-500/30",
                  textColor: "text-purple-400",
                },
              ].map((category) => {
                const categoryUsers = getUsersByType(category.name);

                return (
                  <div
                    key={category.name}
                    className={`bg-game-card/80 backdrop-blur-sm border ${category.color} rounded-xl p-6`}
                  >
                    {/* Image at top center */}
                    <div className="flex justify-center mb-4 h-32">
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={120}
                        height={120}
                        className="object-contain"
                      />
                    </div>

                    <div className="text-center mb-6">
                      <h3 className={`text-xl font-bold ${category.textColor}`}>
                        {category.name}
                      </h3>
                      <p className="text-xs text-game-text-muted mt-1">
                        {categoryUsers.length} member
                        {categoryUsers.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* User Accordions */}
                    <div className="space-y-2">
                      {categoryUsers.length === 0 ? (
                        <p className="text-xs text-game-text-muted text-center py-4 italic">
                          No members with this equipment type
                        </p>
                      ) : (
                        categoryUsers.map((user) => {
                          const userKey = `${category.name}-${user._id}`;
                          const isExpanded = expandedUsers[userKey] || false;
                          const equipmentItems =
                            EQUIPMENT_ITEMS[category.name] || [];

                          const currentItems =
                            savedItems[user._id] !== undefined
                              ? savedItems[user._id]
                              : user.userEquipmentItems;

                          // Exclude Weapon from completion percentage calculation
                          const equipmentItemsWithoutWeapon =
                            equipmentItems.filter(
                              (item) => item !== "Weapon",
                            );
                          const currentItemsWithoutWeapon = currentItems.filter(
                            (item) => item !== "Weapon",
                          );

                          const completionPercentage =
                            equipmentItemsWithoutWeapon.length > 0
                              ? Math.round(
                                  (currentItemsWithoutWeapon.length /
                                    equipmentItemsWithoutWeapon.length) *
                                    100,
                                )
                              : 0;

                          return (
                            <div
                              key={userKey}
                              className="border border-game-border rounded overflow-hidden"
                            >
                              <button
                                onClick={() => toggleUser(userKey)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-game-card-hover/50 transition-colors"
                              >
                                <div className="text-left flex-1 min-w-0">
                                  <p className="text-sm font-medium text-game-text truncate">
                                    {user.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="w-16 h-1.5 bg-game-darker rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all bg-game-accent"
                                        style={{
                                          width: `${completionPercentage}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs text-game-text-muted">
                                      {completionPercentage}%
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                                  <span className="text-xs text-game-text-muted">
                                    {user.cp.toLocaleString()} CP
                                  </span>
                                  <svg
                                    className={`w-4 h-4 text-game-text-muted transition-transform ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
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
                                </div>
                              </button>

                              {isExpanded && (
                                <div className="px-4 py-3 bg-game-darker/30 border-t border-game-border space-y-2">
                                  <p className="text-xs font-medium text-game-text-muted uppercase tracking-wider mb-3">
                                    Equipment Items
                                  </p>
                                  {equipmentItems
                                    .filter((item) => item !== "Weapon")
                                    .map((item) => {
                                      const isEditing =
                                        editingUserKey === userKey;

                                      const hasItem = isEditing
                                        ? editingItems[user._id]?.includes(item)
                                        : savedItems[user._id] !== undefined
                                          ? savedItems[user._id].includes(item)
                                          : user.userEquipmentItems.includes(
                                              item,
                                            );
                                      return (
                                        <div
                                          key={item}
                                          onClick={() => {
                                            if (isEditing && isAdmin) {
                                              toggleItem(user._id, item);
                                            }
                                          }}
                                          className={`flex items-center gap-2 text-xs text-game-text p-2 rounded ${
                                            isEditing
                                              ? "cursor-pointer hover:bg-game-darker/50 transition-colors"
                                              : ""
                                          }`}
                                        >
                                          <span
                                            className={`w-4 h-4 flex items-center justify-center ${
                                              hasItem
                                                ? "text-green-400"
                                                : "text-game-text-muted"
                                            }`}
                                          >
                                            {hasItem ? "✓" : "✗"}
                                          </span>
                                          <span>{item}</span>
                                        </div>
                                      );
                                    })}

                                  {isAdmin && (
                                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-game-border">
                                      {editingUserKey === userKey ? (
                                        <>
                                          <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={cancelEditing}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() =>
                                              saveItems(user._id, user.name)
                                            }
                                            disabled={
                                              savingUserKey === user._id
                                            }
                                          >
                                            {savingUserKey === user._id
                                              ? "Saving..."
                                              : "Mark"}
                                          </Button>
                                        </>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() =>
                                            startEditing(
                                              userKey,
                                              user._id,
                                              user.userEquipmentItems,
                                            )
                                          }
                                          className="text-game-accent hover:text-game-accent-hover"
                                        >
                                          Edit
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Success Dialog */}
        {showSuccessDialog && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
            <div className="bg-game-card border border-game-border rounded-lg p-6 shadow-2xl max-w-sm mx-4 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-green-400/20">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-400">Success</p>
                  <p className="text-xs text-game-text mt-1">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
