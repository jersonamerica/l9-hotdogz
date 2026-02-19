"use client";

import { useState } from "react";
import Image from "next/image";
import { MASTERY_OPTIONS, MASTERY_IMAGES } from "@/lib/constants";

export default function OnboardingForm() {
  const [name, setName] = useState("");
  const [cp, setCp] = useState("");
  const [mastery, setMastery] = useState("");
  const [equipmentType, setEquipmentType] = useState("Plate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mastery) {
      setError("Please fill in your IGN and select a mastery.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          cp: Number(cp) || 0,
          mastery,
          equipmentType,
        }),
      });

      if (res.ok) {
        window.location.href = "/";
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const selectedImage = mastery ? MASTERY_IMAGES[mastery] : null;

  return (
    <div className="min-h-screen bg-game-dark flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-game-accent mb-2">
            <Image
              src={"/logo/intro_logo.png"}
              alt={mastery}
              width={60}
              height={60}
              className="inline-block align-middle mr-2"
            />
            Welcome, Adventurer!
          </h1>
          <p className="text-game-text-muted">
            Set up your character before entering the guild.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded text-sm border bg-game-danger/10 border-game-danger/30 text-game-danger">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-game-text-muted mb-1">
                IGN (In-Game Name) *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-game-card border border-game-border rounded px-3 py-2 text-sm text-game-text focus:outline-none focus:border-game-accent placeholder-game-text-muted"
                placeholder="Enter your IGN"
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
                className="w-full bg-game-card border border-game-border rounded px-3 py-2 text-sm text-game-text focus:outline-none focus:border-game-accent placeholder-game-text-muted"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-game-text-muted mb-2">
              Mastery *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MASTERY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMastery(option)}
                  className={`flex flex-col items-center gap-2 p-3 rounded border transition-colors ${
                    mastery === option
                      ? "border-game-accent bg-game-accent/10 text-game-accent"
                      : "border-game-border bg-game-card text-game-text-muted hover:border-game-text-muted"
                  }`}
                >
                  <img
                    src={MASTERY_IMAGES[option]}
                    alt={option}
                    className="w-12 h-12 object-contain"
                  />
                  <span className="text-xs font-medium text-center leading-tight">
                    {option}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage}
                alt={mastery}
                className="w-32 h-32 object-contain drop-shadow-lg"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-game-text-muted mb-2">
              Equipment Type *s
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["Plate", "Leather", "Cloth"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEquipmentType(type)}
                  className={`flex flex-col items-center gap-2 p-3 rounded border transition-colors ${
                    equipmentType === type
                      ? "border-game-accent bg-game-accent/10 text-game-accent"
                      : "border-game-border bg-game-card text-game-text-muted hover:border-game-text-muted"
                  }`}
                >
                  <Image
                    src={
                      type === "Plate"
                        ? "/image/plate-armor.png"
                        : type === "Leather"
                          ? "/image/leather-armor.png"
                          : "/image/cloth-armor.png"
                    }
                    alt={type}
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                  <span className="text-xs font-medium">{type}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim() || !mastery}
            className="w-full px-4 py-3 text-sm font-bold text-white bg-game-accent rounded hover:bg-game-accent-hover disabled:opacity-50 transition-colors uppercase tracking-wider"
          >
            {loading ? "Setting up..." : "Enter the Guild"}
          </button>
        </form>
      </div>
    </div>
  );
}
