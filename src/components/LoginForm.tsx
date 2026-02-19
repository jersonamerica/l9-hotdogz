"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const error = searchParams.get("error");

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { redirect: true, callbackUrl: "/" });
    } catch (error) {
      console.error("Error during sign in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-game-dark">
      <div className="bg-game-card border border-game-border rounded p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚔️</div>
          <h1 className="text-3xl font-bold text-game-accent mb-2">
            Y3 HotdogzZ
          </h1>
          <p className="text-game-text-muted">
            Sign in to manage your equipment
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-game-danger/10 border border-game-danger/30 rounded">
            <p className="text-game-danger text-sm">
              {error === "OAuthSignin" && "Error connecting to Google"}
              {error === "OAuthCallback" && "Error during callback"}
              {error === "OAuthCreateAccount" && "Error creating account"}
              {error === "EmailSignInError" && "Error signing in"}
              {error === "Callback" && "Error during callback"}
              {error === "Default" && "An error occurred"}
            </p>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-game-card border border-game-border text-game-text py-3 rounded font-semibold hover:bg-game-card-hover hover:border-game-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-game-border border-t-game-accent rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <p className="text-center text-game-text-muted text-sm mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
