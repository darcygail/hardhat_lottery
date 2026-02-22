"use client";

import { MoralisProvider } from "react-moralis";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MoralisProvider initializeOnMount={false}>{children}</MoralisProvider>
  );
}
