"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setChecking(false);
      return;
    }

    // Check localStorage flag first (set during onboarding submit)
    if (localStorage.getItem("onboarding_complete") === "true") {
      setOnboarded(true);
      setChecking(false);
      // Clean up the flag after a delay to let API catch up
      setTimeout(() => localStorage.removeItem("onboarding_complete"), 5000);
      return;
    }

    // Check onboarding status from the API (source of truth)
    fetch("/api/user")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch");
      })
      .then((data) => {
        setOnboarded(!!data.isOnboarded);
        setChecking(false);
      })
      .catch(() => {
        setOnboarded(false);
        setChecking(false);
      });
  }, [status, pathname]);

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
