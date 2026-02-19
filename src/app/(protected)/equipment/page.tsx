"use client";

import { useState } from "react";
import Image from "next/image";
import useSWR from "swr";

interface User {
  _id: string;
  name: string;
  cp: number;
  equipmentType: "Plate" | "Leather" | "Cloth";
  userEquipmentItems: string[];
}

const EQUIPMENT_ITEMS: Record<string, string[]> = {
  Plate: ["Helm", "Armor", "Gaiters", "Gauntlets", "Greaves"],
  Leather: ["Hood", "Vest", "Leather Pants", "Wristband", "Boots"],
  Cloth: ["Hat", "Robe", "Pants", "Gloves", "Loafers"],
};

export default function EquipmentPage() {
  const { data: membersData = [], mutate } = useSWR<User[]>(
    "/api/members",
    undefined,
    {
      revalidateOnMount: true,
    },
  );
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>(
    {},
  );

  const categories = [
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
      color: "bg-amber-500/20 border-amber-500/30",
      textColor: "text-purple-400",
    },
  ];

  const toggleUser = (key: string) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getUsersByType = (type: string) => {
    return membersData.filter((user) => user.equipmentType === type);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg/equipment_bg.jpg')" }}
    >
      <div className="min-h-screen bg-black/60">
        <main className="w-[90%] mx-auto py-8">
          <div className="flex items-center justify-end mb-6">
            <button
              onClick={() => mutate()}
              className="p-2 text-game-text-muted hover:text-game-accent transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh"
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
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => {
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
                        const completionPercentage =
                          equipmentItems.length > 0
                            ? Math.round(
                                (user.userEquipmentItems.length /
                                  equipmentItems.length) *
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
                                {equipmentItems.map((item) => (
                                  <div
                                    key={item}
                                    className="flex items-center gap-2 text-xs text-game-text"
                                  >
                                    <span className="w-4 h-4 flex items-center justify-center">
                                      {user.userEquipmentItems.includes(
                                        item,
                                      ) ? (
                                        <span className="text-green-400">
                                          ✓
                                        </span>
                                      ) : (
                                        <span className="text-game-text-muted">
                                          ✗
                                        </span>
                                      )}
                                    </span>
                                    <span>{item}</span>
                                  </div>
                                ))}
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
        </main>
      </div>
    </div>
  );
}
