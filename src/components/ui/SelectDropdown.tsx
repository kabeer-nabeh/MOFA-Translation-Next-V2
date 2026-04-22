"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        onOutside();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

export interface SelectOption<T extends string> {
  id: T;
  label: string;
}

export interface SelectDropdownProps<T extends string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  align?: "left" | "right";
}

/**
 * Reusable Select Dropdown Component
 * Extracted to prevent UI logic duplication across the codebase.
 */
export function SelectDropdown<T extends string>({
  value,
  options,
  onChange,
  className,
  align = "right",
}: SelectDropdownProps<T>) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  useClickOutside(rootRef, () => setOpen(false));

  const currentLabel = options.find((o) => o.id === value)?.label ?? String(value);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          buttonVariants({ variant: "secondary", size: "md" }),
          "gap-2 px-3",
          className,
        )}
      >
        {currentLabel}
        <ChevronDown
          size={20}
          className={cn(
            "text-[color:var(--mofa-text-primary)] transition-transform",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className={cn(
            "absolute z-50 mt-1 w-44 overflow-hidden rounded-lg border border-[color:var(--mofa-border-subtle)] bg-white py-1 shadow-lg",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {options.map((opt) => {
            const selected = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={selected}
                className={cn(
                  "flex w-full px-3 py-2 text-left text-sm text-[color:var(--mofa-text-primary)]",
                  "hover:bg-[color:var(--mofa-btn-outline-hover)]",
                  selected &&
                    "bg-[color:var(--mofa-btn-outline-selected)] font-semibold hover:bg-[color:var(--mofa-btn-outline-selected)]"
                )}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
