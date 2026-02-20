"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { MASTERY_OPTIONS, MASTERY_IMAGES } from "@/lib/constants";
import { ABILITIES } from "@/lib/abilities";
import { MOUNTS } from "@/lib/mounts";
import Image from "next/image";
import { useCrudMutation } from "@/hooks/useCrudMutation";

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Request failed");
  }
  return res.json() as Promise<T>;
};

interface PopulatedEquipment {
  _id: string;
  name: string;
  type?: "gear" | "special";
}

interface GearLogEntry {
  _id?: string;
  equipment: PopulatedEquipment;
  quantity: number;
}

interface GearLogPayload {
  equipment: string;
  quantity: number;
}

interface EquipmentItem {
  _id: string;
  name: string;
  type: "gear" | "special";
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  cp: number;
  mastery: string;
  equipmentType: string;
  userEquipmentItems: string[];
  userAbilities: string[];
  userMounts: string[];
  gearLog: GearLogEntry[];
  role: string;
}

interface UpdateProfilePayload {
  name?: string;
  cp?: number;
  mastery?: string;
  equipmentType?: string;
  userEquipmentItems?: string[];
  userAbilities?: string[];
  userMounts?: string[];
  gearLog?: GearLogPayload[];
}

const EQUIPMENT_ITEMS: Record<string, string[]> = {
  Plate: ["Helm", "Armor", "Gaiters", "Gauntlets", "Greaves"],
  Leather: ["Hood", "Vest", "Leather Pants", "Wristband", "Boots"],
  Cloth: ["Hat", "Robe", "Pants", "Gloves", "Loafers"],
};

export default function ProfileEditor() {
  const { data: profileData, isLoading: profileLoading } =
    useQuery<UserProfile>({
      queryKey: ["user"],
      queryFn: () => fetcher<UserProfile>("/api/user"),
    });
  const { data: equipmentData, isLoading: eqLoading } = useQuery<
    EquipmentItem[]
  >({
    queryKey: ["equipment"],
    queryFn: () => fetcher<EquipmentItem[]>("/api/equipment"),
  });
  const loading = profileLoading || eqLoading;
  const equipment = equipmentData || [];

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Editable fields
  const [name, setName] = useState("");
  const [cp, setCp] = useState("");
  const [mastery, setMastery] = useState("");
  const [equipmentType, setEquipmentType] = useState("Plate");
  const [userEquipmentItems, setUserEquipmentItems] = useState<string[]>([]);
  const [userAbilities, setUserAbilities] = useState<string[]>([]);
  const [userMounts, setUserMounts] = useState<string[]>([]);
  const [gearLog, setGearLog] = useState<GearLogEntry[]>([]);

  // Equipment suggestions
  const [newGearSearch, setNewGearSearch] = useState("");
  const [selectedEquipment, setSelectedEquipment] =
    useState<EquipmentItem | null>(null);
  const [newGearQty, setNewGearQty] = useState(1);
  const [suggestions, setSuggestions] = useState<EquipmentItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingGearIdx, setEditingGearIdx] = useState<number | null>(null);
  const [editGearQty, setEditGearQty] = useState(1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const masteryRef = useRef<HTMLDivElement>(null);

  // Mastery search
  const [masterySearch, setMasterySearch] = useState("");
  const [masterySuggestions, setMasterySuggestions] = useState<string[]>([]);
  const [showMasterySuggestions, setShowMasterySuggestions] = useState(false);

  // Remove confirmation
  const [removeConfirmIdx, setRemoveConfirmIdx] = useState<number | null>(null);

  // Table search
  const [tableSearch, setTableSearch] = useState("");

  // Sorting
  type SortKey = "name" | "type" | "quantity";
  type SortDir = "asc" | "desc";
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const updateProfileMutation = useCrudMutation<
    UpdateProfilePayload,
    UserProfile
  >({
    method: "PUT",
    url: "/api/user",
    invalidateKeys: [["user"], ["members"], ["stats"], ["activity"]],
    onSuccess: (data) => {
      setProfile(data);
      setGearLog(data.gearLog || []);
    },
  });

  // Sync query data into local state when it arrives
  useEffect(() => {
    if (profileData && !profile) {
      setProfile(profileData);
      setName(profileData.name || "");
      setCp(String(profileData.cp || 0));
      setMastery(profileData.mastery || "");
      setMasterySearch(profileData.mastery || "");
      setEquipmentType(profileData.equipmentType || "Plate");
      setUserEquipmentItems(profileData.userEquipmentItems || []);
      setUserAbilities(profileData.userAbilities || []);
      setUserMounts(profileData.userMounts || []);
      setGearLog(profileData.gearLog || []);
    }
  }, [profileData, profile]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
      if (
        masteryRef.current &&
        !masteryRef.current.contains(e.target as Node)
      ) {
        setShowMasterySuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const gearLogPayload: GearLogPayload[] = gearLog.map((entry) => ({
        equipment: entry.equipment._id,
        quantity: entry.quantity,
      }));

      await updateProfileMutation.mutateAsync({
        name,
        cp: Number(cp) || 0,
        mastery,
        equipmentType,
        userEquipmentItems,
        userAbilities,
        userMounts,
        gearLog: gearLogPayload,
      });

      setMessage({ type: "success", text: "Profile saved successfully!" });
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const filterSuggestions = (query: string) => {
    if (!query.trim()) return [];
    const gearLogIds = new Set(gearLog.map((g) => g.equipment._id));
    return equipment.filter(
      (e) =>
        e.name.toLowerCase().includes(query.toLowerCase()) &&
        !gearLogIds.has(e._id),
    );
  };

  const handleNewGearInput = (value: string) => {
    setNewGearSearch(value);
    setSelectedEquipment(null);
    const filtered = filterSuggestions(value);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0 && value.trim().length > 0);
  };

  const handleSelectSuggestion = (item: EquipmentItem) => {
    setSelectedEquipment(item);
    setNewGearSearch(item.name);
    setShowSuggestions(false);
  };

  const toggleEquipmentItem = (item: string) => {
    setUserEquipmentItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const toggleAbility = (ability: string) => {
    setUserAbilities((prev) =>
      prev.includes(ability)
        ? prev.filter((item) => item !== ability)
        : [...prev, ability],
    );
  };

  const toggleMount = (mount: string) => {
    setUserMounts((prev) =>
      prev.includes(mount)
        ? prev.filter((item) => item !== mount)
        : [...prev, mount],
    );
  };

  const toGearLogPayload = (entries: GearLogEntry[]): GearLogPayload[] =>
    entries.map((entry) => ({
      equipment: entry.equipment._id,
      quantity: entry.quantity,
    }));

  const saveGearLog = async (updatedGearLog: GearLogEntry[]) => {
    setGearLog(updatedGearLog);
    try {
      await updateProfileMutation.mutateAsync({
        name,
        cp: Number(cp) || 0,
        mastery,
        gearLog: toGearLogPayload(updatedGearLog),
      });
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    }
  };

  const handleAddGear = () => {
    if (!selectedEquipment) return;
    const newEntry: GearLogEntry = {
      equipment: selectedEquipment,
      quantity: newGearQty,
    };
    const updatedGearLog = [...gearLog, newEntry];
    setNewGearSearch("");
    setSelectedEquipment(null);
    setNewGearQty(1);
    setSuggestions([]);
    saveGearLog(updatedGearLog);
  };

  const handleRemoveGear = (idx: number) => {
    setRemoveConfirmIdx(idx);
  };

  const confirmRemoveGear = () => {
    if (removeConfirmIdx === null) return;
    saveGearLog(gearLog.filter((_, i) => i !== removeConfirmIdx));
    setRemoveConfirmIdx(null);
  };

  const handleStartEditGear = (idx: number) => {
    setEditingGearIdx(idx);
    setEditGearQty(gearLog[idx].quantity);
  };

  const handleSaveEditGear = () => {
    if (editingGearIdx === null) return;
    const updated = [...gearLog];
    updated[editingGearIdx] = {
      ...updated[editingGearIdx],
      quantity: editGearQty,
    };
    setEditingGearIdx(null);
    saveGearLog(updated);
  };

  const handleCancelEditGear = () => {
    setEditingGearIdx(null);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedGearLog = [...gearLog].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name") {
      cmp = a.equipment.name.localeCompare(b.equipment.name);
    } else if (sortKey === "type") {
      cmp = (a.equipment.type || "").localeCompare(b.equipment.type || "");
    } else if (sortKey === "quantity") {
      cmp = a.quantity - b.quantity;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const filteredGearLog = sortedGearLog.filter((entry) => {
    if (!tableSearch.trim()) return true;
    const q = tableSearch.toLowerCase();
    return (
      entry.equipment.name.toLowerCase().includes(q) ||
      (entry.equipment.type || "").toLowerCase().includes(q)
    );
  });

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-game-border border-t-game-accent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="text-game-text-muted text-center py-12">
        Failed to load profile.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Status message */}
      {message && (
        <div
          className={`p-3 rounded text-sm border ${
            message.type === "success"
              ? "bg-game-success/10 border-game-success/30 text-game-success"
              : "bg-game-danger/10 border-game-danger/30 text-game-danger"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Info */}
      <div className="space-y-6">
        {/* Image and Mastery Name - Top */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src={
              mastery
                ? MASTERY_IMAGES[mastery] || "/weapon/battle_shield.png"
                : "/weapon/battle_shield.png"
            }
            alt={mastery || "Weapon"}
            width={400}
            height={400}
            className="w-full max-w-xs object-contain drop-shadow-lg"
          />
          {mastery && (
            <span
              className="text-2xl font-black uppercase tracking-widest text-game-accent drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{
                fontFamily: "'Segoe UI', Impact, sans-serif",
                letterSpacing: "0.15em",
              }}
            >
              {mastery}
            </span>
          )}
        </div>

        {/* User Info Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-game-text-muted mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-game-darker/50 border border-game-border rounded px-3 py-2 text-sm text-game-text focus:outline-none focus:border-game-accent placeholder-game-text-muted"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-game-text-muted mb-1">
                CP (Combat Power)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={cp}
                onChange={(e) => setCp(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full bg-game-darker/50 border border-game-border rounded px-3 py-2 text-sm text-game-text focus:outline-none focus:border-game-accent placeholder-game-text-muted"
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-game-text-muted mb-1">
                Mastery
              </label>
              <div className="relative" ref={masteryRef}>
                <input
                  type="text"
                  value={masterySearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMasterySearch(val);
                    const filtered = val.trim()
                      ? MASTERY_OPTIONS.filter((o) =>
                          o.toLowerCase().includes(val.toLowerCase()),
                        )
                      : [...MASTERY_OPTIONS];
                    setMasterySuggestions(filtered);
                    setShowMasterySuggestions(filtered.length > 0);
                  }}
                  onFocus={() => {
                    const filtered = masterySearch.trim()
                      ? MASTERY_OPTIONS.filter((o) =>
                          o.toLowerCase().includes(masterySearch.toLowerCase()),
                        )
                      : [...MASTERY_OPTIONS];
                    setMasterySuggestions(filtered);
                    setShowMasterySuggestions(filtered.length > 0);
                  }}
                  onBlur={() => {
                    // Revert to current mastery if nothing was selected
                    // Use a small delay so mousedown on option can fire first
                    setTimeout(() => {
                      setMasterySearch((prev) => {
                        // If it was already updated by a selection, keep it
                        //   If it's a valid mastery option, keep it
                        if (
                          MASTERY_OPTIONS.includes(
                            prev as (typeof MASTERY_OPTIONS)[number],
                          )
                        )
                          return prev;
                        return mastery;
                      });
                      setShowMasterySuggestions(false);
                    }, 200);
                  }}
                  className="w-full bg-game-darker/50 border border-game-border rounded px-3 py-2 text-sm text-game-text focus:outline-none focus:border-game-accent placeholder-game-text-muted"
                  placeholder="Search mastery..."
                />
                {showMasterySuggestions && masterySuggestions.length > 0 && (
                  <div className="absolute z-10 top-full left-0 w-full mt-1 bg-game-card border border-game-border rounded max-h-48 overflow-y-auto">
                    {masterySuggestions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent blur from firing
                          setMastery(option);
                          setMasterySearch(option);
                          setShowMasterySuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-game-text hover:bg-game-card-hover transition-colors flex items-center gap-2"
                      >
                        <Image
                          src={MASTERY_IMAGES[option]}
                          alt={option}
                          width={24}
                          height={24}
                          className="w-6 h-6 object-contain"
                        />
                        <span>{option}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-game-text-muted mb-1">
                Equipment Type
              </label>
              <div className="relative">
                <select
                  value={equipmentType}
                  onChange={(e) => setEquipmentType(e.target.value)}
                  className="w-full bg-game-darker/50 border border-game-border rounded px-3 py-2 pr-10 text-sm text-game-text focus:outline-none focus:border-game-accent appearance-none"
                >
                  <option value="Plate">Plate</option>
                  <option value="Leather">Leather</option>
                  <option value="Cloth">Cloth</option>
                </select>
                <span className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-3 flex items-center">
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
            </div>
          </div>
        </div>

        {/* Owned Legendary Equipment Section */}
        <div>
          <label className="block text-sm font-medium text-game-text-muted mb-2">
            Owned Legendary Equipment ({equipmentType})
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EQUIPMENT_ITEMS[equipmentType]?.map((item) => (
              <label
                key={item}
                className="flex items-center gap-2 p-2 rounded border border-game-border hover:bg-game-card-hover/30 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={userEquipmentItems.includes(item)}
                  onChange={() => toggleEquipmentItem(item)}
                  className="w-4 h-4 rounded border-game-border bg-game-darker accent-game-accent"
                />
                <span className="text-sm text-game-text">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Weapon Section */}
        <div>
          <label className="block text-sm font-medium text-game-text-muted mb-2">
            Weapon
          </label>
          <label className="flex items-center gap-2 p-2 rounded border border-game-border hover:bg-game-card-hover/30 cursor-pointer transition-colors w-fit">
            <input
              type="checkbox"
              checked={userEquipmentItems.includes("Weapon")}
              onChange={() => toggleEquipmentItem("Weapon")}
              className="w-4 h-4 rounded border-game-border bg-game-darker accent-game-accent"
            />
            <span className="text-sm text-game-text">Weapon</span>
          </label>
        </div>

        {/* Abilities Section */}
        <div>
          <label className="block text-sm font-medium text-game-text-muted mb-2">
            Abilities
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ABILITIES.map((ability) => (
              <label
                key={ability}
                className="flex items-center gap-2 p-2 rounded border border-game-border hover:bg-game-card-hover/30 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={userAbilities.includes(ability)}
                  onChange={() => toggleAbility(ability)}
                  className="w-4 h-4 rounded border-game-border bg-game-darker accent-game-accent"
                />
                <span className="text-sm text-game-text">{ability}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Mounts Section */}
        <div>
          <label className="block text-sm font-medium text-game-text-muted mb-2">
            Mounts
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MOUNTS.map((mount) => (
              <label
                key={mount}
                className="flex items-center gap-2 p-2 rounded border border-game-border hover:bg-game-card-hover/30 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={userMounts.includes(mount)}
                  onChange={() => toggleMount(mount)}
                  className="w-4 h-4 rounded border-game-border bg-game-darker accent-game-accent"
                />
                <span className="text-sm text-game-text">{mount}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-game-accent rounded hover:bg-game-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      {/* Gear Log */}
      <div>
        <h3 className="text-lg font-semibold text-game-text mb-4 flex items-center gap-2">
          <Image
            src="/logo/intro_logo.png"
            alt="Item Log Logo"
            width={38}
            height={38}
            className="inline-block align-middle"
          />{" "}
          Item Log
          <span className="text-sm font-normal text-game-text-muted">
            ({gearLog.length} items)
          </span>
        </h3>

        {/* Search & Add gear - 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Left: Table search */}
          <div>
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full bg-game-darker/50 border border-game-border rounded px-3 py-2 text-sm text-game-text focus:outline-none focus:border-game-accent placeholder-game-text-muted"
              placeholder="Search gear log..."
            />
          </div>

          {/* Right: Add new gear */}
          <div className="flex gap-2">
            <div className="relative flex-1" ref={suggestionsRef}>
              <input
                type="text"
                value={newGearSearch}
                onChange={(e) => handleNewGearInput(e.target.value)}
                onFocus={() => {
                  if (newGearSearch.trim()) {
                    const filtered = filterSuggestions(newGearSearch);
                    setSuggestions(filtered);
                    setShowSuggestions(filtered.length > 0);
                  }
                }}
                className="w-full bg-game-darker/50 border border-game-border rounded px-3 py-2 text-sm text-game-text focus:outline-none focus:border-game-accent placeholder-game-text-muted"
                placeholder="Search equipment to add..."
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 top-full left-0 w-full mt-1 bg-game-card border border-game-border rounded max-h-40 overflow-y-auto">
                  {suggestions.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-3 py-2 text-sm text-game-text hover:bg-game-card-hover transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>{item.name}</span>
                      <span
                        className={`text-xs ${item.type === "gear" ? "text-game-gear" : "text-game-special"}`}
                      >
                        {item.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="number"
              value={newGearQty}
              onChange={(e) =>
                setNewGearQty(Math.max(1, Number(e.target.value)))
              }
              className="w-20 bg-game-darker/50 border border-game-border rounded px-3 py-2 text-sm text-game-text focus:outline-none focus:border-game-accent text-center"
              min={1}
              placeholder="Qty"
            />
            <button
              onClick={handleAddGear}
              disabled={!selectedEquipment}
              className="px-4 py-2 text-sm font-medium text-white bg-game-accent rounded hover:bg-game-accent-hover disabled:opacity-50 transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        {/* Gear list */}
        {gearLog.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-game-border rounded">
            <p className="text-sm text-game-text-muted">
              No gear logged yet. Add equipment above.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-game-border">
                <thead className="bg-game-darker/50">
                  <tr>
                    <th
                      onClick={() => handleSort("name")}
                      className="px-4 py-3 text-left text-xs font-medium text-game-text-muted uppercase tracking-wider cursor-pointer hover:text-game-accent select-none transition-colors"
                    >
                      Equipment{sortIndicator("name")}
                    </th>
                    <th
                      onClick={() => handleSort("type")}
                      className="px-4 py-3 text-center text-xs font-medium text-game-text-muted uppercase tracking-wider cursor-pointer hover:text-game-accent select-none transition-colors"
                    >
                      Type{sortIndicator("type")}
                    </th>
                    <th
                      onClick={() => handleSort("quantity")}
                      className="px-4 py-3 text-center text-xs font-medium text-game-text-muted uppercase tracking-wider cursor-pointer hover:text-game-accent select-none transition-colors"
                    >
                      Qty{sortIndicator("quantity")}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-game-text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-game-border">
                  {filteredGearLog.map((entry) => {
                    const realIdx = gearLog.indexOf(entry);
                    return (
                      <tr
                        key={entry._id || realIdx}
                        className="hover:bg-game-card-hover/30 transition-colors"
                      >
                        {editingGearIdx === realIdx ? (
                          <>
                            <td className="px-4 py-3 text-sm text-game-text">
                              {entry.equipment.name}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              <span
                                className={`text-xs ${entry.equipment.type === "gear" ? "text-game-gear" : "text-game-special"}`}
                              >
                                {entry.equipment.type || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                value={editGearQty}
                                onChange={(e) =>
                                  setEditGearQty(
                                    Math.max(1, Number(e.target.value)),
                                  )
                                }
                                className="w-16 bg-game-darker/50 border border-game-border rounded px-2 py-1 text-sm text-game-text focus:outline-none focus:border-game-accent text-center"
                                min={1}
                              />
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              <button
                                onClick={handleSaveEditGear}
                                className="text-game-success hover:text-game-success/80 mr-3 transition-colors cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEditGear}
                                className="text-game-text-muted hover:text-game-text transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-sm text-game-text">
                              {entry.equipment.name}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              <span
                                className={`text-xs ${entry.equipment.type === "gear" ? "text-game-gear" : "text-game-special"}`}
                              >
                                {entry.equipment.type || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-game-text">
                              {entry.quantity}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              <button
                                onClick={() => handleStartEditGear(realIdx)}
                                className="text-game-accent hover:text-game-accent-hover mr-3 transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleRemoveGear(realIdx)}
                                className="text-game-danger hover:text-game-danger-hover transition-colors cursor-pointer"
                              >
                                Remove
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Remove confirmation dialog */}
        {removeConfirmIdx !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-game-card border border-game-border rounded p-6 max-w-sm w-full mx-4">
              <h4 className="text-game-text font-semibold mb-2">
                Remove Equipment
              </h4>
              <p className="text-sm text-game-text-muted mb-4">
                Are you sure you want to remove{" "}
                <span className="text-game-accent font-medium">
                  {gearLog[removeConfirmIdx]?.equipment.name}
                </span>{" "}
                from your gear log?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRemoveConfirmIdx(null)}
                  className="px-4 py-2 text-sm text-game-text-muted hover:text-game-text border border-game-border rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveGear}
                  className="px-4 py-2 text-sm font-medium text-white bg-game-danger rounded hover:bg-game-danger-hover transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
