import {
  BarChart3,
  Calendar,
  Globe2,
  Home,
  Video,
} from "lucide-react";

import { ANALYTICS_AVATAR, ANALYTICS_LOGO } from "@/components/analytics/analytics-assets";
import { MeetingsPageClient } from "@/components/meetings/MeetingsPageClient";
import { Navbar } from "@/components/layout/Navbar";

export function MeetingsView() {
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

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 min-h-0 px-[120px]">
        <MeetingsPageClient />
      </main>
    </div>
  );
}
