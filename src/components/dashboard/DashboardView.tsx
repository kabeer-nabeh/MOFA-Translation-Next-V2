import { ChevronRight } from "lucide-react";

import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { MeetingCard as LiveMeetingCard } from "@/components/dashboard/MeetingCard";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { NewMeetingModalTrigger } from "@/components/meetings/NewMeetingModalTrigger";
import { RecentCompletedMeetings } from "@/components/dashboard/RecentCompletedMeetings";
import type { CalendarBadgeDate, Meeting } from "@/types/meeting";

import {
  getLiveMeetings,
} from "@/lib/services/meetings";

function extractDateBadge(startLabel: string): CalendarBadgeDate {
  const date = new Date(startLabel);
  if (!Number.isNaN(date.getTime())) {
    return {
      monthShort: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      day: String(date.getDate()),
    };
  }
  const monthMatch = startLabel.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
  const dayMatch = startLabel.match(/\s(\d{1,2})/);
  if (monthMatch && dayMatch) return { monthShort: monthMatch[1].toUpperCase(), day: dayMatch[1] };
  return { monthShort: "JAN", day: "1" };
}

function getMeetingSubtitle(meeting: Meeting | null): string {
  if (!meeting) return "No meetings right now";
  if (!meeting.startDatetime || !meeting.endDatetime) return "Your meeting is ready to start";

  const now = Date.now();
  const start = new Date(meeting.startDatetime).getTime();
  const end = new Date(meeting.endDatetime).getTime();

  if (now >= start && now <= end) return "Your meeting is in progress — join now";
  if (now > end) return "Your last meeting has ended";

  const minutes = Math.ceil((start - now) / 60_000);
  if (minutes <= 5) return "Your meeting is about to start";
  if (minutes <= 30) return `Your meeting starts in ${minutes} minutes`;
  return "Your meeting is ready to start";
}


export async function DashboardView() {
  const liveMeetings = await getLiveMeetings();
  const currentMeeting = liveMeetings[0] ?? null;

  return (
    <AppShell>
      <PageContainer>
        <div className="flex flex-col">

          {/* Hero banner */}
          <HeroBanner />

          {/* Live meeting(s) */}
          {liveMeetings.length > 0 && (
            <div className="mt-6 flex flex-col gap-3">
              {liveMeetings.map((m) => (
                <LiveMeetingCard
                  key={m.id}
                  date={extractDateBadge(m.startLabel)}
                  title={m.title}
                  dateTimeLabel={`${m.startLabel} • ${m.timeRangeLabel}`}
                  hostLabel={`Host: ${m.hostName}`}
                  languageLabel={`Language: ${m.languages.join(", ")}`}
                  platform={m.platform}
                  startDatetime={m.startDatetime}
                  endDatetime={m.endDatetime}
                  joinAction={{ label: "Join Meeting", href: `/meetings/${m.id}` }}
                />
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="mt-10 h-px w-full" style={{ background: "var(--mofa-border-default)" }} />

          {/* Recent completed meetings */}
          <section className="mt-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[color:var(--mofa-text-faint)]">
                Recent Meetings
              </h2>
              <ButtonLink href="/meetings" variant="tertiary" size="md">
                View All
                <ChevronRight size={16} aria-hidden />
              </ButtonLink>
            </div>
            <RecentCompletedMeetings />
          </section>

        </div>
      </PageContainer>
    </AppShell>
  );
}
