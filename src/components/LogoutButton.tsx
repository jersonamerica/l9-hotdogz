"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui";

export default function LogoutButton() {
  return (
    <Button
      variant="danger"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="bg-game-danger/10 border border-game-danger/30 hover:bg-game-danger/20 text-game-danger"
    >
      Sign Out
    </Button>
  );
}
