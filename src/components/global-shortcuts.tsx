"use client";

import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { useRouter } from "next/navigation";

export default function GlobalShortcuts() {
  const router = useRouter();

  useKeyboardShortcut("k", () => {
    router.push("/search");
  });

  return null;
}
