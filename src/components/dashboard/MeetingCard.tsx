"use client";

import * as React from "react";
import { Calendar, Globe2, Monitor, User2, Video } from "lucide-react";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { CalendarBadgeDate, MeetingPlatform } from "@/types/meeting";

// ─── Platform Badge ──────────────────────────────────────────────────────────

const PLATFORM_STYLES: Record<
  MeetingPlatform,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  "In App": {
    bg: "#f3f3f7",
    text: "#545469",
    border: "#d5d3e8",
    icon: <Monitor size={13} className="text-[#545469]" aria-hidden />,
  },
  Teams: {
    bg: "#f0eefe",
    text: "#5b5bd6",
    border: "#c9c6f7",
    // eslint-disable-next-line @next/next/no-img-element
    icon: <img src="/teams.png" alt="" className="size-[13px] object-contain" />,
  },
  Beem: {
    bg: "#e8f1fd",
    text: "#1554c0",
    border: "#b8d0fb",
    // eslint-disable-next-line @next/next/no-img-element
    icon: <img src="/beam-logo.png" alt="Beem" className="size-[13px] object-contain" />,
  },
};

function PlatformBadge({ platform }: { platform: MeetingPlatform }) {
  const s = PLATFORM_STYLES[platform];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {s.icon}
      {platform}
    </span>
  );
}

// ─── Relative Time Badge ─────────────────────────────────────────────────────

function useRelativeTime(startIso?: string, endIso?: string) {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return React.useMemo(() => {
    if (!startIso || !endIso) return null;

    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) return null;

    if (now > end) return { label: "Ended", style: "neutral" as const };
    if (now >= start && now <= end)
      return { label: "In Progress", style: "live" as const };

    const msUntil = start - now;
    const minutes = Math.max(1, Math.ceil(msUntil / 60_000));
    if (minutes < 60)
      return {
        label: `Starts in ${minutes} min`,
        style: minutes <= 15 ? ("urgent" as const) : ("soon" as const),
      };
    return null;
  }, [now, startIso, endIso]);
}

// ─── Main Component ──────────────────────────────────────────────────────────

export type MeetingCardProps = {
  className?: string;
  date?: CalendarBadgeDate;
  title: string;
  dateTimeLabel: string;
  hostLabel: string;
  languageLabel: string;
  platform?: MeetingPlatform;
  startDatetime?: string;
  endDatetime?: string;
  joinAction?: {
    label: string;
    href: string;
  };
};

export function MeetingCard({
  className,
  date,
  title,
  dateTimeLabel,
  hostLabel,
  languageLabel,
  platform,
  startDatetime,
  endDatetime,
  joinAction,
}: MeetingCardProps) {
  const relativeTime = useRelativeTime(startDatetime, endDatetime);

  return (
    <Card className={cn("border-0 bg-[#f3f3f7]", className)}>
      <Card.Content className="flex items-center gap-6 p-6">
        {/* Date Chip */}
        {date ? (
          <div className="w-16 shrink-0 overflow-hidden rounded-md border border-[#e9eaeb] bg-white shadow-[0_0_0_2px_white,0_0_0_4px_#8988ab]">
            <div className="flex items-center justify-center bg-[#e7e7ee] px-2 pb-0.5 pt-1 text-xs font-semibold uppercase tracking-wide text-[#717680]">
              {date.monthShort}
            </div>
            <div className="flex items-center justify-center pb-[3px] pt-px text-lg font-bold leading-7 text-[#545469]">
              {date.day}
            </div>
          </div>
        ) : null}

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Title + badges */}
          <div className="flex flex-wrap items-center gap-2">
            <p className="line-clamp-1 text-lg font-semibold leading-7 text-[#414651]">
              {title}
            </p>
            {platform && <PlatformBadge platform={platform} />}
            {relativeTime?.style === "live" && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[#abefc6] bg-[#ecfdf3] px-2 py-0.5 text-xs font-semibold text-[#067647]">
                <span className="size-2 animate-pulse rounded-full bg-[#17b26a]" aria-hidden />
                {relativeTime.label}
              </span>
            )}
            {relativeTime?.style === "soon" && (
              <span className="inline-flex items-center rounded-md border border-[#fedf89] bg-[#fffaeb] px-2 py-0.5 text-xs font-semibold text-[#b54708]">
                {relativeTime.label}
              </span>
            )}
            {relativeTime?.style === "urgent" && (
              <span className="inline-flex items-center rounded-md border border-[#fecdca] bg-[#fff1f0] px-2 py-0.5 text-xs font-semibold text-[#b42318]">
                {relativeTime.label}
              </span>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#414651]">
            <div className="flex items-center gap-1">
              <Calendar size={16} aria-hidden="true" className="shrink-0 text-[#717680]" />
              <span>{dateTimeLabel}</span>
            </div>
            <div className="flex items-center gap-1">
              <User2 size={16} aria-hidden="true" className="shrink-0 text-[#717680]" />
              <span>{hostLabel}</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe2 size={16} aria-hidden="true" className="shrink-0 text-[#717680]" />
              <span>{languageLabel}</span>
            </div>
          </div>

        </div>

        {/* Action Button */}
        {joinAction ? (
          <div className="shrink-0">
            <ButtonLink
              href={joinAction.href}
              variant="primary"
              size="md"
              className="h-10 gap-2 px-4 whitespace-nowrap no-underline"
            >
              {platform === "In App" ? (
                <Monitor size={16} aria-hidden />
              ) : (
                <Video size={16} aria-hidden />
              )}
              {joinAction.label}
            </ButtonLink>
          </div>
        ) : null}
      </Card.Content>
    </Card>
  );
}
