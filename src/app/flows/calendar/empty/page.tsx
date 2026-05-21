import { AppShell } from "@/components/layout/AppShell";
import { CalendarDays, Plus } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["May 2026"];

export default function CalendarEmptyFlow() {
  return (
    <AppShell>
      <main className="h-full overflow-y-auto px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold" style={{ color: "var(--mofa-text-primary)" }}>Calendar</h1>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--mofa-accent)" }}
          >
            <Plus size={14} aria-hidden />
            New Meeting
          </button>
        </div>

        {/* Month header */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-base font-semibold" style={{ color: "var(--mofa-text-primary)" }}>May 2026</span>
        </div>

        {/* Calendar grid */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--mofa-border-default)", background: "white" }}
        >
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--mofa-border-subtle)" }}>
            {DAYS.map(d => (
              <div key={d} className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--mofa-text-muted)" }}>
                {d}
              </div>
            ))}
          </div>

          {/* 5 empty weeks */}
          {Array.from({ length: 5 }).map((_, week) => (
            <div key={week} className="grid grid-cols-7" style={{ borderBottom: week < 4 ? "1px solid var(--mofa-border-subtle)" : undefined }}>
              {Array.from({ length: 7 }).map((_, day) => {
                const num = week * 7 + day - 2; // offset so 1st starts on Wed
                return (
                  <div
                    key={day}
                    className="min-h-[72px] p-2"
                    style={{ borderRight: day < 6 ? "1px solid var(--mofa-border-subtle)" : undefined }}
                  >
                    {num >= 1 && num <= 31 && (
                      <span className="text-xs font-medium" style={{ color: num === 21 ? "white" : "var(--mofa-text-muted)", background: num === 21 ? "var(--mofa-accent)" : undefined, borderRadius: "50%", padding: num === 21 ? "2px 6px" : undefined }}>
                        {num}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Empty state overlay message */}
        <div className="mt-6 flex items-center justify-center gap-3 rounded-xl py-5" style={{ background: "var(--mofa-accent-light)", border: "1px solid var(--mofa-accent-muted)" }}>
          <CalendarDays size={16} style={{ color: "var(--mofa-accent)" }} aria-hidden />
          <p className="text-sm" style={{ color: "var(--mofa-accent)" }}>
            No meetings scheduled. Connect your calendar or create a meeting to see events here.
          </p>
        </div>
      </main>
    </AppShell>
  );
}
