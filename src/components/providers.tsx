"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/lib/language-context";
import { AuthProvider } from "@/lib/auth-context";
import CommandPalette from "@/components/command-palette";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        {children}
        <CommandPalette />
      </AuthProvider>
    </LanguageProvider>
  );
}
