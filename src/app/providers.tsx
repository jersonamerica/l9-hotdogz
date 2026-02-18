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
          revalidateOnFocus: true,
          revalidateOnMount: true,
          revalidateOnReconnect: false,
          revalidateIfStale: true,
          dedupingInterval: 60000,
        }}
      >
        {children}
      </SWRConfig>
    </SessionProvider>
  );
}
