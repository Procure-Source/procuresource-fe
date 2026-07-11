"use client";

import { useEffect } from "react";

export const useKeyboardShortcut = (
  key: string,
  callback: () => void,
  metaKey = true
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((metaKey ? event.metaKey || event.ctrlKey : true) && event.key === key) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, metaKey]);
};
