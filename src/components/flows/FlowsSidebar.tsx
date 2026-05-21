"use client";

import * as React from "react";
import { FLOW_CATEGORIES, getCategoryStats, getOverallStats } from "@/lib/flows";

interface FlowsSidebarProps {
  activeCategory: string | null;
  onSelect: (id: string | null) => void;
}

export function FlowsSidebar({ activeCategory, onSelect }: FlowsSidebarProps) {
  const overall = getOverallStats();

  return (
    <nav className="flex flex-col gap-0.5 py-3">
      {/* All flows */}
      <SidebarItem
        label="All Flows"
        built={overall.built}
        total={overall.total}
        active={activeCategory === null}
        onClick={() => onSelect(null)}
      />

      <div
        className="my-2 mx-3"
        style={{ height: "1px", background: "var(--mofa-border-subtle)" }}
      />

      {FLOW_CATEGORIES.map((cat) => {
        const stats = getCategoryStats(cat.id);
        return (
          <SidebarItem
            key={cat.id}
            label={cat.label}
            built={stats.built}
            total={stats.total}
            active={activeCategory === cat.id}
            onClick={() => onSelect(cat.id)}
          />
        );
      })}
    </nav>
  );
}

function SidebarItem({
  label,
  built,
  total,
  active,
  onClick,
}: {
  label: string;
  built: number;
  total: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 mx-2 text-left transition-colors"
      style={{
        background: active ? "var(--mofa-sidebar-active-bg)" : "transparent",
        color: active ? "var(--mofa-sidebar-active-text)" : "var(--mofa-sidebar-text)",
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "var(--mofa-sidebar-active-bg)";
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <span className={`text-sm ${active ? "font-semibold" : "font-medium"} truncate`}>
        {label}
      </span>
      <span
        className="shrink-0 text-[11px] tabular-nums font-medium"
        style={{ color: active ? "var(--mofa-accent)" : "var(--mofa-text-faint)" }}
      >
        {built}/{total}
      </span>
    </button>
  );
}
