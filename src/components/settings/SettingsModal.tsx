"use client";

import * as React from "react";
import { X, BarChart3, BookKey, Plug2, Shield, User, Users } from "lucide-react";

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

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = React.useState<SettingsTab>("profile");

  React.useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ background: "rgba(10,13,18,0.45)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex w-full max-w-6xl overflow-hidden rounded-2xl bg-white"
        style={{
          height: "min(680px, 90vh)",
          border: "1px solid var(--mofa-border-default)",
          boxShadow: "0 24px 64px rgba(10,13,18,0.24)",
        }}
      >
        {/* Left panel */}
        <aside
          className="flex w-[220px] shrink-0 flex-col overflow-y-auto py-6"
          style={{ background: "var(--mofa-sidebar-bg)", borderRight: "1px solid var(--mofa-sidebar-divider)" }}
        >
          <p
            className="mb-3 px-5 text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--mofa-text-muted)" }}
          >
            Settings
          </p>
          <div className="flex flex-col gap-0.5 px-3">
            {TAB_ITEMS.map((item) => {
              const active = tab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "flex h-[37px] w-full items-center rounded-lg border px-3 text-left text-sm font-medium transition-colors",
                    active
                      ? "border-[color:var(--mofa-sidebar-active-border)] bg-[color:var(--mofa-sidebar-active-bg)] text-[color:var(--mofa-text-primary)]"
                      : "border-transparent text-[color:var(--mofa-text-muted)] hover:bg-[color:var(--mofa-btn-outline-hover)]",
                  )}
                >
                  <Icon size={15} className="mr-3 shrink-0" aria-hidden />
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right column */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header with close button */}
          <div className="flex shrink-0 items-center justify-end px-5 py-3" style={{ borderBottom: "1px solid var(--mofa-border-subtle)" }}>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close settings"
              className="flex size-7 items-center justify-center rounded-md transition-colors hover:bg-[color:var(--mofa-btn-outline-hover)]"
              style={{ color: "var(--mofa-text-muted)" }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
            {tab === "profile" && <ProfileSettingsPanel />}
            {tab === "users" && <UsersSettingsPanel />}
            {tab === "roles" && <RolesSettingsPanel />}
            {tab === "usage" && <UsageCostsPanel />}
            {tab === "integrations" && <IntegrationsSettingsPanel />}
            {tab === "keywords" && <DiplomaticKeywordsPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}
