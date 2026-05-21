"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowUpRight, LayoutTemplate } from "lucide-react";
import type { Flow } from "@/lib/flows";

export function FlowCard({ flow }: { flow: Flow }) {
  const isBuilt = flow.status === "built";

  const card = (
    <div
      className="group flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: isBuilt ? "white" : "var(--mofa-sidebar-bg)",
        border: `1px solid ${isBuilt ? "var(--mofa-border-default)" : "var(--mofa-border-subtle)"}`,
        opacity: isBuilt ? 1 : 0.5,
        cursor: isBuilt ? "pointer" : "default",
        transition: "box-shadow 180ms cubic-bezier(0.25,1,0.5,1), transform 180ms cubic-bezier(0.25,1,0.5,1)",
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative w-full"
        style={{ aspectRatio: "16/10", background: "var(--mofa-sidebar-bg)" }}
      >
        {isBuilt && flow.screenshotPath ? (
          <Image
            src={flow.screenshotPath}
            alt={flow.name}
            fill
            className="object-cover object-top"
          />
        ) : isBuilt ? (
          /* Built but no screenshot yet — styled placeholder */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <LayoutTemplate size={22} style={{ color: "var(--mofa-accent-muted)" }} />
            <span className="text-[11px] font-medium" style={{ color: "var(--mofa-text-muted)" }}>
              Screenshot pending
            </span>
          </div>
        ) : (
          /* Missing flow — dashed placeholder */
          <div
            className="absolute inset-2 rounded-xl flex flex-col items-center justify-center gap-1.5"
            style={{ border: "1.5px dashed var(--mofa-border-default)" }}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.07em]" style={{ color: "var(--mofa-text-muted)" }}>
              Not built
            </span>
          </div>
        )}

        {/* Flow ID chip */}
        <span
          className="absolute top-2.5 left-2.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
          style={{
            background: isBuilt ? "var(--mofa-accent)" : "var(--mofa-border-default)",
            color: isBuilt ? "white" : "var(--mofa-text-muted)",
          }}
        >
          {flow.id}
        </span>

        {/* External link icon — built flows only, shown on hover */}
        {isBuilt && (
          <span
            className="absolute top-2.5 right-2.5 flex items-center justify-center size-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
            aria-hidden
          >
            <ArrowUpRight size={12} style={{ color: "var(--mofa-accent)" }} />
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-col gap-1.5 p-4">
        {/* Category tag */}
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.07em]"
          style={{ color: "var(--mofa-text-muted)" }}
        >
          {flow.category.replace(/-/g, " ")}
        </span>

        {/* Name */}
        <p
          className="text-sm font-semibold leading-snug"
          style={{ color: "var(--mofa-text-primary)" }}
        >
          {flow.name}
        </p>

        {/* Description */}
        <p
          className="text-[12px] leading-relaxed line-clamp-3"
          style={{ color: "var(--mofa-text-muted)" }}
        >
          {flow.description}
        </p>

        {/* Footer */}
        <div className="mt-1 flex items-center justify-between">
          <span
            className="text-[11px]"
            style={{ color: "var(--mofa-text-faint)" }}
          >
            {flow.lastUpdated === "—" ? "—" : `Updated ${flow.lastUpdated}`}
          </span>
        </div>
      </div>
    </div>
  );

  if (isBuilt && flow.liveRoute) {
    return (
      <a
        href={flow.liveRoute}
        target="_blank"
        rel="noopener noreferrer"
        className="block no-underline"
        onMouseEnter={(e) => {
          const el = e.currentTarget.firstElementChild as HTMLElement;
          if (el) {
            el.style.boxShadow = "0 8px 24px rgba(4,30,22,0.10)";
            el.style.transform = "translateY(-2px)";
          }
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget.firstElementChild as HTMLElement;
          if (el) {
            el.style.boxShadow = "";
            el.style.transform = "";
          }
        }}
      >
        {card}
      </a>
    );
  }

  return card;
}
