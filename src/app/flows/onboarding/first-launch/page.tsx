import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { CalendarDays, Mic, Plus } from "lucide-react";

export default function FirstLaunchFlow() {
  return (
    <AppShell>
      <main className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
        <div
          className="mb-6 flex size-16 items-center justify-center rounded-2xl"
          style={{ background: "var(--mofa-accent-light)" }}
        >
          <Mic size={28} style={{ color: "var(--mofa-accent)" }} aria-hidden />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--mofa-text-primary)" }}>
          Welcome to Baseer Voice
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--mofa-text-muted)" }}>
          Your real-time translation workspace is ready. Create your first meeting to get started.
        </p>

        <Link
          href="/meetings"
          className="mt-8 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: "var(--mofa-accent)" }}
        >
          <Plus size={15} aria-hidden />
          Create your first meeting
        </Link>

        <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg w-full">
          {[
            { icon: Mic, title: "Live translation", body: "Real-time Arabic and English translation in every meeting." },
            { icon: CalendarDays, title: "Calendar sync", body: "Connect Outlook or Teams to schedule meetings automatically." },
            { icon: Plus, title: "Invite guests", body: "Share a secure link so external attendees can follow along." },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl p-4 text-left"
              style={{ background: "white", border: "1px solid var(--mofa-border-subtle)" }}
            >
              <Icon size={16} className="mb-2" style={{ color: "var(--mofa-accent)" }} aria-hidden />
              <p className="text-xs font-semibold" style={{ color: "var(--mofa-text-primary)" }}>{title}</p>
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--mofa-text-muted)" }}>{body}</p>
            </div>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
