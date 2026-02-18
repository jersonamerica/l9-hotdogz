export const MASTERY_OPTIONS = [
  "Sword and Shield",
  "Battle Shield",
  "Staff",
  "Battle Staff",
  "Bow",
  "Crossbow",
  "Greatsword",
  "Dual Dagger",
] as const;

export type MasteryType = (typeof MASTERY_OPTIONS)[number];

// Map mastery names to weapon image filenames
export const MASTERY_IMAGES: Record<string, string> = {
  "Sword and Shield": "/weapon/sword_and_shield.png",
  "Battle Shield": "/weapon/battle_shield.png",
  Staff: "/weapon/staff.png",
  "Battle Staff": "/weapon/battle_staff.png",
  Bow: "/weapon/bow.png",
  Crossbow: "/weapon/crossbow.png",
  Greatsword: "/weapon/greatsword.png",
  "Dual Dagger": "/weapon/dual_dagger.png",
};
