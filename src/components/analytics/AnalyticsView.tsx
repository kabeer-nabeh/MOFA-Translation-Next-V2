import {
  BarChart3,
  Calendar,
  Globe2,
  Home,
  Video,
} from "lucide-react";

import { AnalyticsChartsClient } from "@/components/analytics/AnalyticsChartsClient";
import { ANALYTICS_AVATAR, ANALYTICS_LOGO } from "@/components/analytics/analytics-assets";
import { Navbar } from "@/components/layout/Navbar";

export function AnalyticsView() {
  return (
    <div className="min-h-dvh bg-white">
      <Navbar
        className="bg-white pt-3"
        containerClassName="max-w-[1440px] px-[120px]"
        logo={{ src: ANALYTICS_LOGO, alt: "Baseer Voice for MOFA", width: 160, height: 44 }}
        items={[
          { label: "Home", href: "/", icon: Home },
          { label: "Meetings", href: "/meetings", icon: Video },
          { label: "Calendar", href: "/calendar", icon: Calendar },
          { label: "Analytics", href: "/analytics", icon: BarChart3 },
        ]}
        activeHref="/analytics"
        activeStyle="brand"
        language={{ label: "عربي", href: "/ar", icon: Globe2 }}
        notificationsHref="/notifications"
        settingsHref="/settings"
        user={{
          name: "Abdullah Al Harbi",
          avatarSrc: ANALYTICS_AVATAR,
        }}
      />

      <main className="mx-auto w-full max-w-[1440px] px-[120px] pb-16">
        <AnalyticsChartsClient />
      </main>
    </div>
  );
}
