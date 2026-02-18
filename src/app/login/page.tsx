"use client";

import { Suspense } from "react";
import LoginForm from "../../components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-game-dark">
          <div className="bg-game-card border border-game-border rounded p-8 w-full max-w-md">
            <div className="animate-pulse">
              <div className="h-8 bg-game-border rounded mb-4"></div>
              <div className="h-4 bg-game-border rounded mb-8 w-2/3"></div>
              <div className="h-12 bg-game-border rounded"></div>
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
