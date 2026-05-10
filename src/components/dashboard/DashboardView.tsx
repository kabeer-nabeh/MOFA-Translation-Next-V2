import {
  BarChart3,
  Calendar,
  ChevronRight,
  Globe2,
  Home,
  Settings,
  Video,
} from "lucide-react";

import { GreetingSection } from "@/components/dashboard/GreetingSection";
import { MeetingCard } from "@/components/dashboard/MeetingCard";
import { UpcomingMeetingItem } from "@/components/dashboard/UpcomingMeetingItem";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { NewMeetingModalTrigger } from "@/components/meetings/NewMeetingModalTrigger";
import type { Meeting, CalendarBadgeDate } from "@/types/meeting";

import { getCurrentMeeting, getUpcomingMeetings } from "@/lib/services/meetings";

const logoSrc =
  "https://www.figma.com/api/mcp/asset/07071394-f040-458b-a0ba-f05352719e1a";

/** Parse meeting startLabel to extract month and day */
function extractDateBadge(startLabel: string): CalendarBadgeDate {
  // Handle formats like "December 24, 2025" or "Dec 24"
  const date = new Date(startLabel);

  if (!Number.isNaN(date.getTime())) {
    // Valid date - use the parsed date
    const monthShort = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const day = String(date.getDate());
    return { monthShort, day };
  }

  // Fallback: try to extract from the string directly
  const monthMatch = startLabel.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
  const dayMatch = startLabel.match(/\s(\d{1,2})/);

  if (monthMatch && dayMatch) {
    return {
      monthShort: monthMatch[1].toUpperCase(),
      day: dayMatch[1],
    };
  }

  // Default fallback
  return { monthShort: "JAN", day: "1" };
}

/** Derive a contextual subtitle from the current meeting state */
function getMeetingSubtitle(meeting: Meeting | null): string {
  if (!meeting) return "No meetings right now";
  if (!meeting.startDatetime || !meeting.endDatetime) return "Your meeting is ready to start";

  const now = Date.now();
  const start = new Date(meeting.startDatetime).getTime();
  const end = new Date(meeting.endDatetime).getTime();

  if (now >= start && now <= end) return "Your meeting is in progress — join now";
  if (now > end) return "Your last meeting has ended";

  const msUntil = start - now;
  const minutes = Math.ceil(msUntil / 60_000);
  if (minutes <= 5) return "Your meeting is about to start";
  if (minutes <= 30) return `Your meeting starts in ${minutes} minutes`;
  return "Your meeting is ready to start";
}

/** Production-ready MOFA home dashboard */
export async function DashboardView() {
  // Fetch data cleanly from the service
  const currentMeeting = await getCurrentMeeting();
  const upcomingMeetings = await getUpcomingMeetings();

  return (
    <div className="min-h-dvh bg-white">
      <Navbar
        className="rounded-3xl pt-3"
        containerClassName="max-w-[1440px] px-[120px]"
        logo={{ src: logoSrc, alt: "MOFA" }}
        items={[
          { label: "Home", href: "/", icon: Home },
          { label: "Meetings", href: "/meetings", icon: Video },
          { label: "Calendar", href: "/calendar", icon: Calendar },
          { label: "Analytics", href: "/analytics", icon: BarChart3 },
        ]}
        activeHref="/"
        language={{ label: "عربي", href: "/ar", icon: Globe2 }}
        notificationsHref="/notifications"
        settingsHref="/settings"
        user={{
          name: "Abdullah Al Harbi",
          avatarSrc:
            "https://www.figma.com/api/mcp/asset/94ea3eac-604a-47ba-a319-20f5ae630c98",
        }}
      />

      <PageContainer className="max-w-[1440px] px-[120px] py-0 pt-9">
        <div className="space-y-6">
          <GreetingSection
            greetingName="Abdullah Al Harbi"
            subtitle={getMeetingSubtitle(currentMeeting)}
            primaryAction={<NewMeetingModalTrigger label="New Meeting" />}
          />

          {currentMeeting ? (
            <MeetingCard
              date={extractDateBadge(currentMeeting.startLabel)}
              title={currentMeeting.title}
              dateTimeLabel={`${currentMeeting.startLabel} • ${currentMeeting.timeRangeLabel}`}
              hostLabel={`Host: ${currentMeeting.hostName}`}
              languageLabel={`Language: ${currentMeeting.languages.join(", ")}`}
              platform={currentMeeting.platform}
              startDatetime={currentMeeting.startDatetime}
              endDatetime={currentMeeting.endDatetime}
              joinAction={{ label: "Join Meeting", href: `/meetings/${currentMeeting.id}` }}
            />
          ) : (
            <div className="py-8 text-center text-slate-500">No active meeting currently.</div>
          )}

          <div className="h-px w-full bg-slate-200" />

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-black">
                Upcoming Meetings
              </h2>
              <ButtonLink
                href="/meetings"
                variant="tertiary"
                size="md"
              >
                View All
                <ChevronRight size={16} aria-hidden />
              </ButtonLink>
            </div>

            <div className="space-y-4">
              {upcomingMeetings.map((m) => (
                <UpcomingMeetingItem
                  key={m.id}
                  id={m.id}
                  date={extractDateBadge(m.startLabel)}
                  title={m.title}
                  dateTimeLabel={`${m.startLabel} • ${m.timeRangeLabel}`}
                  hostLabel={`Host: ${m.hostName}`}
                  languageLabel={`Language: ${m.languages.join(", ")}`}
                  platform={m.platform}
                  startDatetime={m.startDatetime}
                  endDatetime={m.endDatetime}
                  initialRsvp={m.rsvpStatus}
                  meetingLink={m.meetingLink}
                  detailHref={`/meetings/${m.id}`}
                />
              ))}
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
