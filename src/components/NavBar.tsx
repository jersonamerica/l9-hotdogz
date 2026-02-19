"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/item-log", label: "Item Log" },
  { href: "/equipment", label: "Equipment" },
  { href: "/members", label: "Members" },
  { href: "/profile", label: "Profile" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <span className="hidden sm:inline">MC ` HotdogzZ</span>
        </h1>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
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

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col gap-1.5"
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-0.5 bg-game-accent transition-all origin-center ${isMenuOpen ? "rotate-45 translate-y-3 mb-2" : ""}`}
          ></span>
          <span
            className={`w-6 h-0.5 bg-game-accent transition-all ${isMenuOpen ? "opacity-0" : ""}`}
          ></span>
          <span
            className={`w-6 h-0.5 bg-game-accent transition-all origin-center ${isMenuOpen ? "-rotate-45 -translate-y-3 position-relative top-7" : ""}`}
          ></span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-game-darker/95 border-t border-game-border">
          <div className="w-[90%] mx-auto py-4 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={
                  pathname === link.href
                    ? "text-game-accent font-medium text-sm block py-2"
                    : "text-game-text-muted hover:text-game-accent font-medium text-sm block py-2 transition-colors"
                }
              >
                {link.label}
              </Link>
            ))}
            <div className="py-2 border-t border-game-border mt-2">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
