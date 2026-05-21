"use client";

import * as React from "react";
import { LayoutTemplate } from "lucide-react";
import { FlowRegistry } from "./FlowRegistry";

export function FlowsLauncher() {
  const [open, setOpen] = React.useState(false);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock body scroll while open
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open flow registry"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-[transform,box-shadow] duration-150 hover:scale-[1.03] active:scale-[0.97]"
        style={{
          background: "var(--mofa-accent)",
          boxShadow: "0 4px 16px rgba(16,70,49,0.35)",
        }}
      >
        <LayoutTemplate size={14} aria-hidden />
        Flows
      </button>

      {/* Full-screen modal */}
      {open && (
        <div
          className="fixed inset-0 z-50"
          style={{ animation: "backdropIn 180ms cubic-bezier(0.25,1,0.5,1) both" }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(10,13,18,0.55)" }}
            onClick={() => setOpen(false)}
          />

          {/* Panel — full screen inset */}
          <div
            className="absolute inset-3 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              animation: "dialogIn 260ms cubic-bezier(0.16,1,0.3,1) both",
            }}
          >
            <FlowRegistry onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
