"use client";

import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { ReactNode } from "react";
import { fetcher } from "@/lib/fetcher";

export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SWRConfig
        value={{
          fetcher,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          revalidateIfStale: false,
          dedupingInterval: 60000,
        }}
      >
        {children}
      </SWRConfig>
    </SessionProvider>
  );
}
