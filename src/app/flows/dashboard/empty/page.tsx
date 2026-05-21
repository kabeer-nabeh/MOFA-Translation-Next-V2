import { AppShell } from "@/components/layout/AppShell";
import { CalendarDays, Plus, Video } from "lucide-react";

export default function DashboardEmptyFlow() {
  return (
    <AppShell>
      <main className="h-full overflow-y-auto px-8 py-8">
        {/* Hero banner skeleton */}
        <div
          className="mb-6 flex items-center justify-between rounded-2xl px-8 py-7"
          style={{ background: "var(--mofa-accent)", minHeight: "130px" }}
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">Welcome</p>
            <h1 className="mt-1 text-xl font-semibold text-white">No meetings yet</h1>
            <p className="mt-1 text-sm text-white/70">Create your first meeting to start translating.</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold"
            style={{ color: "var(--mofa-accent)" }}
          >
            <Plus size={14} aria-hidden />
            Create meeting
          </button>
        </div>

        {/* Upcoming meetings — empty */}
        <Section title="Upcoming Meetings">
          <EmptySlot icon={CalendarDays} label="No upcoming meetings" sub="Scheduled meetings will appear here." />
        </Section>

        {/* Recent activity — empty */}
        <Section title="Recent Meetings">
          <EmptySlot icon={Video} label="No recent meetings" sub="Your past meetings and transcripts will appear here." />
        </Section>
      </main>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: "var(--mofa-text-primary)" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function EmptySlot({ icon: Icon, label, sub }: { icon: React.ElementType; label: string; sub: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-2xl py-12 text-center"
      style={{ border: "1px dashed var(--mofa-border-default)", background: "white" }}
    >
      <Icon size={22} style={{ color: "var(--mofa-accent-muted)" }} aria-hidden />
      <p className="text-sm font-medium" style={{ color: "var(--mofa-text-primary)" }}>{label}</p>
      <p className="text-xs" style={{ color: "var(--mofa-text-muted)" }}>{sub}</p>
    </div>
  );
}
