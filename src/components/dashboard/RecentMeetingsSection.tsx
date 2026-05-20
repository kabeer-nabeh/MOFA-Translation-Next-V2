import Link from "next/link";
import { ChevronRight, Monitor, FileText } from "lucide-react";

import type { CompletedMeeting } from "@/lib/services/meetings";

const PLATFORM_STYLES: Record<
  string,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  "In App": {
    bg: "#ECEAE5",
    text: "#52525B",
    border: "var(--mofa-border-default)",
    icon: <Monitor size={12} aria-hidden />,
  },
  Teams: {
    bg: "#f0eefe",
    text: "#5b5bd6",
    border: "#c9c6f7",
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/teams.png" alt="" className="size-3 object-contain" />
    ),
  },
  Beem: {
    bg: "#e8f1fd",
    text: "#1554c0",
    border: "#b8d0fb",
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/beam-logo.png" alt="Beem" className="size-3 object-contain" />
    ),
  },
};

function PlatformBadge({ platform }: { platform: string }) {
  const s = PLATFORM_STYLES[platform] ?? PLATFORM_STYLES["In App"];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {s.icon}
      {platform}
    </span>
  );
}

export function RecentMeetingsSection({
  meetings,
}: {
  meetings: CompletedMeeting[];
}) {
  if (meetings.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold" style={{ color: "var(--mofa-text-primary)" }}>
          Recent Meetings
        </h2>
        <Link
          href="/meetings?tab=completed"
          className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--mofa-text-muted)" }}
        >
          View All
          <ChevronRight size={15} aria-hidden />
        </Link>
      </div>

      <div
        className="rounded-xl divide-y overflow-hidden"
        style={{
          border: "1px solid var(--mofa-border-default)",
          background: "white",
        }}
      >
        {meetings.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between gap-4 px-5 py-4"
            style={{ borderBottom: "1px solid var(--mofa-border-default)" }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "var(--mofa-text-primary)" }}
                >
                  {m.title}
                </p>
                {m.platform && <PlatformBadge platform={m.platform} />}
              </div>
              <p className="mt-0.5 text-xs" style={{ color: "var(--mofa-text-muted)" }}>
                {m.dateLabel} · {m.timeRange} · Host: {m.hostName}
              </p>
            </div>

            <Link
              href={`/meetings/${m.id}`}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[color:var(--mofa-btn-outline-hover)]"
              style={{
                border: "1px solid var(--mofa-border-default)",
                color: "var(--mofa-text-secondary)",
              }}
            >
              <FileText size={13} aria-hidden />
              View Transcript
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
