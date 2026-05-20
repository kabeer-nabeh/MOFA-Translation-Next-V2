"use client";

import {
  BarChart3,
  BookKey,
  Plug2,
  Shield,
  User,
  Users,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { AppShell } from "@/components/layout/AppShell";
import { DiplomaticKeywordsPanel } from "@/components/settings/DiplomaticKeywordsPanel";
import { IntegrationsSettingsPanel } from "@/components/settings/IntegrationsSettingsPanel";
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
    <AppShell>
      <main className={cn("w-full max-w-6xl mx-auto px-8 py-8 pb-16", className)}>
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
                      "relative flex h-[37px] w-full items-center rounded-lg border px-3 text-left text-sm font-medium leading-[21px] transition-colors",
                      active
                        ? "border-[color:var(--mofa-sidebar-active-border)] bg-[color:var(--mofa-sidebar-active-bg)] text-[color:var(--mofa-text-primary)]"
                        : "border-transparent text-[color:var(--mofa-text-muted)] hover:bg-[color:var(--mofa-btn-outline-hover)]",
                    )}
                  >
                    <Icon
                      size={16}
                      className="mr-3"
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
    </AppShell>
  );
}

