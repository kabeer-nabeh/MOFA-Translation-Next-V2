"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Calendar,
  Globe2,
  Home,
  Languages,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Video,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { SettingsModal } from "@/components/settings/SettingsModal";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Meetings", href: "/meetings", icon: Video },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
];

export type AppSidebarProps = Record<string, never>;

export function AppSidebar(_props: AppSidebarProps = {}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
  <>
    <aside
      className="hidden md:flex flex-col shrink-0 h-dvh sticky top-0 overflow-y-auto overflow-x-hidden transition-[width] duration-200 ease-in-out"
      style={{ width: collapsed ? "56px" : "var(--mofa-sidebar-width)" }}
    >
      {/* Logo row */}
      <div
        className="flex items-center shrink-0 px-2"
        style={{ height: "62px", justifyContent: collapsed ? "center" : "space-between", paddingLeft: collapsed ? undefined : "16px" }}
      >
        {!collapsed && (
          <Link href="/" className="inline-flex items-center shrink-0">
            <Image
              src="/baseer-logo.png"
              alt="Baseer Voice for MOFA"
              width={120}
              height={34}
              priority
            />
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center justify-center size-7 rounded-md transition-colors hover:bg-[color:var(--mofa-sidebar-active-bg)] shrink-0"
          style={{ color: "var(--mofa-sidebar-text-muted)" }}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      {/* Primary nav */}
      <nav className={cn("space-y-0.5", collapsed ? "px-1.5" : "px-3")}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sidebar metrics */}
      {!collapsed && (
        <div className="mx-3 mb-2 rounded-xl border p-3 space-y-2.5" style={{ borderColor: "var(--mofa-sidebar-active-border)", background: "var(--mofa-sidebar-active-bg)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--mofa-sidebar-text-muted)" }}>Today</p>
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md border" style={{ borderColor: "var(--mofa-sidebar-active-border)", color: "var(--mofa-sidebar-text)" }}>
              <Activity size={13} aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold leading-none" style={{ color: "var(--mofa-sidebar-active-text)" }}>12 active</p>
              <p className="mt-0.5 text-[11px] leading-none" style={{ color: "var(--mofa-sidebar-text-muted)" }}>Sessions now</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md border" style={{ borderColor: "var(--mofa-sidebar-active-border)", color: "var(--mofa-sidebar-text)" }}>
              <Video size={13} aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold leading-none" style={{ color: "var(--mofa-sidebar-active-text)" }}>3 meetings</p>
              <p className="mt-0.5 text-[11px] leading-none" style={{ color: "var(--mofa-sidebar-text-muted)" }}>Scheduled today</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md border" style={{ borderColor: "var(--mofa-sidebar-active-border)", color: "var(--mofa-sidebar-text)" }}>
              <Languages size={13} aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold leading-none" style={{ color: "var(--mofa-sidebar-active-text)" }}>30K words</p>
              <p className="mt-0.5 text-[11px] leading-none" style={{ color: "var(--mofa-sidebar-text-muted)" }}>Translated today</p>
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div
        className="mx-3 my-2 h-px"
        style={{ background: "var(--mofa-sidebar-divider)" }}
      />

      {/* Bottom nav */}
      <div className={cn("space-y-0.5 pb-3", collapsed ? "px-1.5" : "px-3")}>
        {BOTTOM_ITEMS.map((item) =>
          item.href === "/settings" ? (
            <button
              key={item.href}
              type="button"
              title={collapsed ? item.label : undefined}
              onClick={() => setSettingsOpen(true)}
              className={cn(
                "w-full flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors border border-transparent hover:bg-[color:var(--mofa-sidebar-active-bg)]",
                collapsed ? "justify-center px-0" : "gap-3 px-3",
              )}
              style={{ color: "var(--mofa-sidebar-text-muted)" }}
            >
              <item.icon size={18} aria-hidden />
              {!collapsed && item.label}
            </button>
          ) : (
            <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />
          )
        )}

        {/* Language switcher */}
        <Link
          href="/ar"
          title="عربي"
          className={cn(
            "flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors",
            collapsed ? "justify-center px-0" : "gap-3 px-3",
          )}
          style={{ color: "var(--mofa-sidebar-text-muted)" }}
        >
          <Globe2 size={18} aria-hidden />
          {!collapsed && <span>عربي</span>}
        </Link>
      </div>

    </aside>
    <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
  </>
  );
}

function NavLink({ item, active, collapsed }: { item: NavItem; active: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors",
        collapsed ? "justify-center px-0" : "gap-3 px-3",
        active ? "border" : "border border-transparent hover:bg-[color:var(--mofa-sidebar-active-bg)]",
      )}
      style={
        active
          ? {
              background: "var(--mofa-sidebar-active-bg)",
              borderColor: "var(--mofa-sidebar-active-border)",
              color: "var(--mofa-sidebar-active-text)",
            }
          : { color: "var(--mofa-sidebar-text)" }
      }
    >
      <Icon size={18} aria-hidden />
      {!collapsed && item.label}
    </Link>
  );
}
