import { AppShell } from "@/components/layout/AppShell";
import { Mic, MicOff } from "lucide-react";

const STEPS = [
  { step: "1", label: "Click the lock icon in your browser's address bar." },
  { step: "2", label: "Find Microphone and set it to \"Allow\"." },
  { step: "3", label: "Reload the page and join again." },
];

export default function NoMicFlow() {
  return (
    <AppShell>
      <main className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="relative mb-6">
          <div
            className="flex size-16 items-center justify-center rounded-2xl"
            style={{ background: "var(--mofa-sidebar-bg)", border: "1px solid var(--mofa-border-default)" }}
          >
            <Mic size={26} style={{ color: "var(--mofa-text-muted)" }} aria-hidden />
          </div>
          <div
            className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full"
            style={{ background: "#dc2626" }}
          >
            <MicOff size={12} className="text-white" aria-hidden />
          </div>
        </div>

        <h1 className="text-lg font-semibold" style={{ color: "var(--mofa-text-primary)" }}>
          Microphone access blocked
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--mofa-text-muted)" }}>
          Baseer Voice needs microphone access to capture and translate speech. Your browser has blocked it.
        </p>

        <div className="mt-7 w-full max-w-sm rounded-xl text-left" style={{ border: "1px solid var(--mofa-border-default)", background: "white" }}>
          <div className="border-b px-4 py-3" style={{ borderColor: "var(--mofa-border-subtle)" }}>
            <p className="text-xs font-semibold" style={{ color: "var(--mofa-text-primary)" }}>How to re-enable microphone</p>
          </div>
          <div className="divide-y" style={{ "--tw-divide-opacity": "1" } as React.CSSProperties}>
            {STEPS.map(({ step, label }) => (
              <div key={step} className="flex items-start gap-3 px-4 py-3">
                <span
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: "var(--mofa-accent)" }}
                >
                  {step}
                </span>
                <p className="text-xs leading-relaxed" style={{ color: "var(--mofa-text-body)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="mt-6 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: "var(--mofa-accent)" }}
        >
          <Mic size={14} aria-hidden />
          Try again
        </button>
      </main>
    </AppShell>
  );
}
