"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioCardOption<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface RadioCardGroupProps<T extends string> {
  value: T | null;
  options: RadioCardOption<T>[];
  onChange: (val: T) => void;
  className?: string;
  layout?: "row" | "column";
}

/**
 * Reusable Radio Card Group for selecting one out of a few options.
 * Matches standard UI library patterns as requested.
 */
export function RadioCardGroup<T extends string>({
  value,
  options,
  onChange,
  className,
  layout = "row",
}: RadioCardGroupProps<T>) {
  return (
    <div className={cn("flex flex-wrap gap-3", layout === "column" && "flex-col", className)}>
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={selected}
            className={cn(
              "flex flex-1 items-start gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
              layout === "row" && "min-w-[120px]",
              selected
                ? "border-[color:var(--mofa-accent)] bg-[color:var(--mofa-accent-light)] text-[color:var(--mofa-accent)]"
                : "border-[color:var(--mofa-border-default)] bg-white text-[color:var(--mofa-text-body)] hover:border-[#c5c7ca] hover:bg-[color:var(--mofa-sidebar-active-bg)]"
            )}
          >
            {opt.icon && (
              <span className={cn("shrink-0", selected ? "text-[color:var(--mofa-accent)]" : "text-[color:var(--mofa-text-muted)]")}>
                {opt.icon}
              </span>
            )}
            <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
              <span className="truncate">{opt.label}</span>
              {opt.description ? (
                <span
                  className={cn(
                    "truncate whitespace-nowrap text-[12px] font-normal leading-[18px]",
                    selected ? "text-[color:var(--mofa-accent)]" : "text-[color:var(--mofa-text-muted)]",
                  )}
                >
                  {opt.description}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
