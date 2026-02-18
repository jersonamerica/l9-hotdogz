"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="bg-game-danger/10 border border-game-danger/30 hover:bg-game-danger/20 text-game-danger font-semibold py-2 px-4 rounded transition-colors text-sm"
    >
      Sign Out
    </button>
  );
}
