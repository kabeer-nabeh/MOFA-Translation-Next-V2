import { AppShell } from "@/components/layout/AppShell";
import { Plus, Video } from "lucide-react";

const TABS = ["Upcoming", "Live", "Past"];

export default function MeetingsEmptyFlow() {
  return (
    <AppShell>
      <main className="h-full overflow-y-auto px-8 py-8">
        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold" style={{ color: "var(--mofa-text-primary)" }}>Meetings</h1>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--mofa-accent)" }}
          >
            <Plus size={14} aria-hidden />
            New Meeting
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 border-b" style={{ borderColor: "var(--mofa-border-subtle)" }}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              className="px-4 pb-3 text-sm font-medium"
              style={{
                color: i === 0 ? "var(--mofa-text-primary)" : "var(--mofa-text-muted)",
                borderBottom: i === 0 ? "2px solid var(--mofa-accent)" : "2px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Empty state */}
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20 text-center"
          style={{ border: "1px dashed var(--mofa-border-default)", background: "white" }}
        >
          <div
            className="flex size-12 items-center justify-center rounded-xl"
            style={{ background: "var(--mofa-accent-light)" }}
          >
            <Video size={20} style={{ color: "var(--mofa-accent)" }} aria-hidden />
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--mofa-text-primary)" }}>
            No meetings scheduled
          </p>
          <p className="max-w-xs text-xs leading-relaxed" style={{ color: "var(--mofa-text-muted)" }}>
            Once you create a meeting it will appear here. You can also sync your calendar to import existing events.
          </p>
          <button
            type="button"
            className="mt-2 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--mofa-accent)" }}
          >
            <Plus size={13} aria-hidden />
            Create first meeting
          </button>
        </div>
      </main>
    </AppShell>
  );
}
