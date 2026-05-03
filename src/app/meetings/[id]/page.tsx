import { ANALYTICS_AVATAR, ANALYTICS_LOGO } from "@/components/analytics/analytics-assets";
import { MeetingDetailClient } from "@/components/meetings/MeetingDetailClient";
import { Navbar } from "@/components/layout/Navbar";
import {
  BarChart3,
  Calendar,
  Globe2,
  Home,
  Video,
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MeetingDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <Navbar
        className="bg-white pt-3"
        containerClassName="max-w-[1440px] px-[120px]"
        logo={{ src: ANALYTICS_LOGO, alt: "MOFA" }}
        items={[
          { label: "Home", href: "/", icon: Home },
          { label: "Meetings", href: "/meetings", icon: Video },
          { label: "Calendar", href: "/calendar", icon: Calendar },
          { label: "Analytics", href: "/analytics", icon: BarChart3 },
        ]}
        activeHref="/meetings"
        activeStyle="brand"
        language={{ label: "عربي", href: "/ar", icon: Globe2 }}
        notificationsHref="/notifications"
        settingsHref="/settings"
        user={{
          name: "Abdullah Al Harbi",
          avatarSrc: ANALYTICS_AVATAR,
        }}
      />

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 min-h-0 px-[120px] overflow-hidden">
        <MeetingDetailClient meetingId={id} />
      </main>
    </div>
  );
}
