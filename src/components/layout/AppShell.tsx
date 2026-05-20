import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Avatar } from "@/components/ui/Avatar";

export type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-dvh bg-[color:var(--mofa-sidebar-bg)]">
      <AppSidebar />

      {/* Right column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar — outside the container, aligned with sidebar logo height */}
        <header className="shrink-0 flex items-center justify-end gap-2 px-6" style={{ height: "44px" }}>
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="flex items-center justify-center size-7 rounded-md transition-colors hover:bg-[color:var(--mofa-sidebar-active-bg)]"
            style={{ color: "var(--mofa-sidebar-text-muted)" }}
          >
            <Bell size={13} strokeWidth={2.2} aria-hidden />
          </Link>
          <Avatar
            src="/avatar.jpg"
            alt="Abdullah Al Harbi"
            fallback="AA"
            className="h-7 w-7"
          />
        </header>

        {/* Rounded container — fills remaining height, doesn't touch bottom edge */}
        <div
          className="flex-1 min-h-0 mx-3 mb-3 rounded-2xl overflow-y-auto bg-[color:var(--mofa-page-bg)]"
          style={{ border: "1px solid var(--mofa-border-default)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
