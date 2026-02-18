"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/item-log", label: "Item Log" },
  { href: "/members", label: "Members" },
  { href: "/profile", label: "Profile" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-game-nav/80 backdrop-blur-sm border-b border-game-border">
      <div className="w-[90%] mx-auto py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-game-accent flex items-center gap-2">
          <Image
            src="/logo/hotdog_logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="w-20 h-20"
          />{" "}
          MC ` HotdogzZ
        </h1>
        <div className="flex items-center gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "text-game-accent font-medium text-sm"
                  : "text-game-text-muted hover:text-game-accent font-medium text-sm transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
