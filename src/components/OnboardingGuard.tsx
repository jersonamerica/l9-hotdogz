"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface UserData {
  isOnboarded: boolean;
}

export default function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const pathname = usePathname();
  const [localOnboarded, setLocalOnboarded] = useState<boolean | null>(null);

  // Check localStorage flag first (set during onboarding submit)
  useEffect(() => {
    if (status === "authenticated") {
      const localFlag = localStorage.getItem("onboarding_complete");
      if (localFlag === "true") {
        setLocalOnboarded(true);
        // Clean up the flag after a delay to let API catch up
        setTimeout(() => localStorage.removeItem("onboarding_complete"), 5000);
      }
    }
  }, [status]);

  // Fetch onboarding status from API (source of truth)
  const { data: userData, isLoading: isLoadingUser } = useQuery<UserData>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    enabled: status === "authenticated",
    staleTime: 0, // Always check fresh for onboarding status
  });

  const onboarded = localOnboarded ?? userData?.isOnboarded ?? null;
  const checking = isLoadingUser;

  useEffect(() => {
    if (checking || status !== "authenticated" || onboarded === null) return;

    if (!onboarded && pathname !== "/onboarding" && pathname !== "/login") {
      window.location.replace("/onboarding");
    }

    if (onboarded && pathname === "/onboarding") {
      window.location.replace("/");
    }
  }, [checking, onboarded, pathname, status]);

  if (status === "loading" || (status === "authenticated" && checking)) {
    return (
      <div className="min-h-screen bg-game-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-game-accent"></div>
      </div>
    );
  }

  // Don't render children if redirect is needed
  if (
    status === "authenticated" &&
    onboarded === false &&
    pathname !== "/onboarding"
  ) {
    return (
      <div className="min-h-screen bg-game-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-game-accent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
