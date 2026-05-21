import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft, VideoOff } from "lucide-react";

export default function MeetingNotFoundFlow() {
  return (
    <AppShell>
      <main className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div
          className="mb-5 flex size-14 items-center justify-center rounded-2xl"
          style={{ background: "var(--mofa-sidebar-bg)", border: "1px solid var(--mofa-border-default)" }}
        >
          <VideoOff size={24} style={{ color: "var(--mofa-text-muted)" }} aria-hidden />
        </div>

        <h1 className="text-lg font-semibold" style={{ color: "var(--mofa-text-primary)" }}>
          Meeting not found
        </h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed" style={{ color: "var(--mofa-text-muted)" }}>
          This meeting may have been deleted or the link is no longer valid.
        </p>

        <Link
          href="/meetings"
          className="mt-7 flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold"
          style={{ borderColor: "var(--mofa-border-default)", color: "var(--mofa-text-body)", background: "white" }}
        >
          <ArrowLeft size={14} aria-hidden />
          Back to meetings
        </Link>
      </main>
    </AppShell>
  );
}
