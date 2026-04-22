"use client";

import * as React from "react";

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onOutside: () => void,
  opts?: { ignore?: (target: EventTarget | null) => boolean },
) {
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (opts?.ignore?.(e.target)) return;
      if (!ref.current?.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside, opts]);
}

