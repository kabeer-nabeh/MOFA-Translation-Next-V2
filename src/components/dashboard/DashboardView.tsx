import { BarChart3, Calendar, Globe2, Home, Video } from "lucide-react";

import { DashboardUpcomingMeetings } from "@/components/dashboard/DashboardUpcomingMeetings";
import { GreetingSection } from "@/components/dashboard/GreetingSection";
import { MeetingCard } from "@/components/dashboard/MeetingCard";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { NewMeetingModalTrigger } from "@/components/meetings/NewMeetingModalTrigger";
import { getCurrentMeeting } from "@/lib/services/meetings";

const logoSrc =
  "https://www.figma.com/api/mcp/asset/07071394-f040-458b-a0ba-f05352719e1a";

/** Production-ready MOFA home dashboard */
export async function DashboardView() {
  // Fetch data cleanly from the service
  const currentMeeting = await getCurrentMeeting();

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
            subtitle="Your meeting is ready to start"
            primaryAction={<NewMeetingModalTrigger label="New Meeting" />}
          />

          {currentMeeting ? (
            <MeetingCard
              title={currentMeeting.title}
              dateTimeLabel={`${currentMeeting.startLabel} • ${currentMeeting.timeRangeLabel}`}
              hostLabel={`Host: ${currentMeeting.hostName}`}
              languageLabel={`Language: ${currentMeeting.languages.join(", ")}`}
              participants={currentMeeting.participants}
              participantsCount={currentMeeting.participantsCount}
              joinAction={{
                label: "Join Meeting",
                href: `/meetings/${currentMeeting.id}`,
              }}
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
                variant="secondary"
                size="md"
                className="h-10 px-4"
              >
                View All
              </ButtonLink>
            </div>

            <DashboardUpcomingMeetings maxItems={6} />
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
