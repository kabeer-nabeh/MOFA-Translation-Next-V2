"use client";

import {
  BarChart3,
  BookKey,
  Calendar,
  Globe2,
  Home,
  Plug2,
  Shield,
  User,
  Users,
  Video,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Navbar } from "@/components/layout/Navbar";
import { DiplomaticKeywordsPanel } from "@/components/settings/DiplomaticKeywordsPanel";
import { IntegrationsSettingsPanel } from "@/components/settings/IntegrationsSettingsPanel";
import { SETTINGS_AVATAR, SETTINGS_LOGO } from "@/components/settings/settings-assets";
import { ProfileSettingsPanel } from "@/components/settings/ProfileSettingsPanel";
import { RolesSettingsPanel } from "@/components/settings/RolesSettingsPanel";
import { UsageCostsPanel } from "@/components/settings/UsageCostsPanel";
import { UsersSettingsPanel } from "@/components/settings/UsersSettingsPanel";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "users" | "roles" | "usage" | "integrations" | "keywords";

const TAB_ITEMS: Array<{
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { id: "profile", label: "Profile", icon: User },
  { id: "users", label: "Users", icon: Users },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "usage", label: "Usage & Costs", icon: BarChart3 },
  { id: "integrations", label: "Integrations", icon: Plug2 },
  { id: "keywords", label: "Diplomatic Keywords", icon: BookKey },
];

const VALID: SettingsTab[] = [
  "profile",
  "users",
  "roles",
  "usage",
  "integrations",
  "keywords",
];

function parseTab(v: string | null): SettingsTab {
  if (v && (VALID as string[]).includes(v)) return v as SettingsTab;
  return "profile";
}

export function SettingsView({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [tab, setTab] = React.useState<SettingsTab>(() => parseTab(sp.get("tab")));

  React.useEffect(() => {
    setTab(parseTab(sp.get("tab")));
  }, [sp]);

  const setTabWithUrl = React.useCallback(
    (next: SettingsTab) => {
      setTab(next);
      const q = new URLSearchParams(sp.toString());
      q.set("tab", next);
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    },
    [router, pathname, sp],
  );

  return (
    <div className={cn("min-h-dvh bg-white", className)}>
      <Navbar
        className="bg-white pt-3"
        containerClassName="max-w-[1440px] px-[120px]"
        logo={{ src: SETTINGS_LOGO, alt: "Baseer Voice for MOFA", width: 160, height: 44 }}
        items={[
          { label: "Home", href: "/", icon: Home },
          { label: "Meetings", href: "/meetings", icon: Video },
          { label: "Calendar", href: "/calendar", icon: Calendar },
          { label: "Analytics", href: "/analytics", icon: BarChart3 },
        ]}
        activeHref="/settings"
        activeStyle="brand"
        language={{ label: "عربي", href: "/ar", icon: Globe2 }}
        notificationsHref="/notifications"
        settingsHref="/settings"
        user={{ name: "Abdullah Al Harbi", avatarSrc: SETTINGS_AVATAR }}
      />

      <main className="mx-auto w-full max-w-[1440px] px-[120px] pb-16">
        <div className="flex items-start gap-[60px]">
          <aside className="w-[200px] shrink-0">
            <div className="text-2xl font-medium leading-8 text-black">
              Settings
            </div>
            <div className="mt-4 flex flex-col gap-1">
              {TAB_ITEMS.map((item) => {
                const active = tab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTabWithUrl(item.id)}
                    className={cn(
                      "relative flex h-[37px] w-full items-center rounded-lg px-3 text-left text-sm font-medium leading-[21px]",
                      active ? "bg-[#eeedf5] text-[#111827]" : "text-[#64748b]",
                    )}
                  >
                    <Icon
                      size={16}
                      className={cn(
                        "mr-3",
                        active ? "text-[#111827]" : "text-[#64748b]",
                      )}
                      aria-hidden="true"
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="flex-1 min-w-0">
            {tab === "profile" ? <ProfileSettingsPanel /> : null}
            {tab === "users" ? <UsersSettingsPanel /> : null}
            {tab === "roles" ? <RolesSettingsPanel /> : null}
            {tab === "usage" ? <UsageCostsPanel /> : null}
            {tab === "integrations" ? <IntegrationsSettingsPanel /> : null}
            {tab === "keywords" ? <DiplomaticKeywordsPanel /> : null}
          </section>
        </div>
      </main>
    </div>
  );
}

