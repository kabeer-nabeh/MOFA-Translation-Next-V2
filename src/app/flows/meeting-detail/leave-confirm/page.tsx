import { AppShell } from "@/components/layout/AppShell";
import { LogOut, PhoneOff } from "lucide-react";

export default function LeaveConfirmFlow() {
  return (
    <AppShell>
      <div className="relative h-full overflow-hidden">
        {/* Blurred meeting room background */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: "var(--mofa-page-bg)", filter: "blur(2px)", opacity: 0.5 }}>
          <div className="h-2 w-48 rounded-full" style={{ background: "var(--mofa-border-default)" }} />
          <div className="h-2 w-64 rounded-full" style={{ background: "var(--mofa-border-default)" }} />
          <div className="h-2 w-40 rounded-full" style={{ background: "var(--mofa-border-default)" }} />
        </div>

        {/* Backdrop */}
        <div className="absolute inset-0" style={{ background: "rgba(10,13,18,0.45)" }} />

        {/* Dialog */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6"
            style={{
              border: "1px solid var(--mofa-border-default)",
              boxShadow: "0 20px 60px rgba(4,30,22,0.18)",
            }}
          >
            <div
              className="mb-4 flex size-10 items-center justify-center rounded-xl"
              style={{ background: "#fef2f2" }}
            >
              <LogOut size={18} style={{ color: "#dc2626" }} aria-hidden />
            </div>
            <h2 className="mb-1 text-base font-semibold" style={{ color: "var(--mofa-text-primary)" }}>
              Leave this meeting?
            </h2>
            <p className="mb-5 text-sm leading-relaxed" style={{ color: "var(--mofa-text-muted)" }}>
              Your call on Teams or Beem will continue. The translation feed will stop for you only.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
                style={{ background: "#dc2626" }}
              >
                <LogOut size={14} aria-hidden />
                Leave meeting
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold"
                style={{ borderColor: "var(--mofa-border-default)", color: "var(--mofa-text-body)", background: "white" }}
              >
                <PhoneOff size={14} aria-hidden />
                End for everyone
              </button>
              <button
                type="button"
                className="w-full rounded-xl py-2 text-sm font-medium"
                style={{ color: "var(--mofa-text-muted)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
