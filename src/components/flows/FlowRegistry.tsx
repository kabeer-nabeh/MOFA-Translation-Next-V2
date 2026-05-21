"use client";

import * as React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { FLOWS, FLOW_CATEGORIES, getFlowsByCategory, getOverallStats } from "@/lib/flows";
import { FlowCard } from "./FlowCard";
import { FlowsSidebar } from "./FlowsSidebar";

interface FlowRegistryProps {
  onClose?: () => void;
}

export function FlowRegistry({ onClose }: FlowRegistryProps) {
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const overall = getOverallStats();

  const flows = activeCategory ? getFlowsByCategory(activeCategory) : FLOWS;
  const categoryLabel = activeCategory
    ? FLOW_CATEGORIES.find((c) => c.id === activeCategory)?.label ?? "Flows"
    : "All Flows";

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--mofa-page-bg)" }}>
      {/* Header */}
      <header
        className="shrink-0 flex items-center justify-between gap-4 px-6"
        style={{
          height: "60px",
          borderBottom: "1px solid var(--mofa-border-subtle)",
          background: "white",
        }}
      >
        <div className="flex items-center gap-4">
          <Image src="/baseer-logo.png" alt="Baseer Voice" width={100} height={28} priority />
          <div
            className="h-4 w-px"
            style={{ background: "var(--mofa-border-default)" }}
          />
          <div>
            <span className="text-sm font-semibold" style={{ color: "var(--mofa-text-primary)" }}>
              Flow Registry
            </span>
            <span
              className="ml-2 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]"
              style={{ borderColor: "var(--mofa-border-default)", color: "var(--mofa-text-muted)" }}
            >
              Internal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats pill */}
          <span
            className="rounded-full px-3 py-1 text-[12px] font-medium"
            style={{ background: "var(--mofa-accent-light)", color: "var(--mofa-accent)" }}
          >
            {overall.built} of {overall.total} built
          </span>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close flow registry"
              className="flex items-center justify-center size-8 rounded-lg transition-colors"
              style={{ color: "var(--mofa-text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--mofa-sidebar-active-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside
          className="shrink-0 overflow-y-auto"
          style={{
            width: "220px",
            borderRight: "1px solid var(--mofa-border-subtle)",
            background: "var(--mofa-sidebar-bg)",
          }}
        >
          <FlowsSidebar activeCategory={activeCategory} onSelect={setActiveCategory} />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto px-6 py-6">
          {/* Section header */}
          <div className="mb-5 flex items-baseline gap-3">
            <h2 className="text-base font-semibold" style={{ color: "var(--mofa-text-primary)" }}>
              {categoryLabel}
            </h2>
            <span className="text-sm" style={{ color: "var(--mofa-text-muted)" }}>
              {flows.length} flow{flows.length !== 1 ? "s" : ""}
              {" · "}
              {flows.filter((f) => f.status === "built").length} built
            </span>
          </div>

          {/* Card grid */}
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
          >
            {flows.map((flow) => (
              <FlowCard key={flow.id} flow={flow} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
