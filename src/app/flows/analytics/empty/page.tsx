import { AppShell } from "@/components/layout/AppShell";
import { BarChart2, Globe, Mic, Clock } from "lucide-react";

export default function AnalyticsEmptyFlow() {
  return (
    <AppShell>
      <main className="h-full overflow-y-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-lg font-semibold" style={{ color: "var(--mofa-text-primary)" }}>Analytics</h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--mofa-text-muted)" }}>Usage and translation statistics</p>
        </div>

        {/* Stat cards — zeroed */}
        <div className="mb-6 grid grid-cols-4 gap-3">
          {[
            { label: "Total Meetings", value: "0", icon: BarChart2 },
            { label: "Words Translated", value: "0", icon: Globe },
            { label: "Hours of Audio", value: "0h", icon: Mic },
            { label: "Avg. Duration", value: "—", icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl p-4"
              style={{ background: "white", border: "1px solid var(--mofa-border-default)" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: "var(--mofa-text-muted)" }}>{label}</span>
                <Icon size={14} style={{ color: "var(--mofa-accent-muted)" }} aria-hidden />
              </div>
              <p className="text-2xl font-semibold" style={{ color: "var(--mofa-text-primary)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Chart area — empty state */}
        <div className="grid grid-cols-2 gap-4">
          <ChartEmpty label="Translation volume over time" />
          <ChartEmpty label="Language pair breakdown" />
        </div>

        {/* Global empty prompt */}
        <div
          className="mt-5 flex items-center justify-center gap-3 rounded-xl py-5"
          style={{ background: "var(--mofa-accent-light)", border: "1px solid var(--mofa-accent-muted)" }}
        >
          <BarChart2 size={16} style={{ color: "var(--mofa-accent)" }} aria-hidden />
          <p className="text-sm" style={{ color: "var(--mofa-accent)" }}>
            Analytics will populate once you start running meetings with live translation.
          </p>
        </div>
      </main>
    </AppShell>
  );
}

function ChartEmpty({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col rounded-xl p-5"
      style={{ background: "white", border: "1px solid var(--mofa-border-default)" }}
    >
      <p className="mb-4 text-xs font-semibold" style={{ color: "var(--mofa-text-primary)" }}>{label}</p>
      <div
        className="flex flex-1 items-center justify-center rounded-lg py-10"
        style={{ background: "var(--mofa-sidebar-bg)", border: "1px dashed var(--mofa-border-default)" }}
      >
        <p className="text-xs" style={{ color: "var(--mofa-text-muted)" }}>No data yet</p>
      </div>
    </div>
  );
}
