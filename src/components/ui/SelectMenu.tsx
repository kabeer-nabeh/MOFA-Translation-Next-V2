"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";
import { useClickOutside } from "@/components/ui/useClickOutside";

export type SelectOption<T extends string> = { id: T; label: string };

export function SelectMenu<T extends string>({
  id,
  value,
  onChange,
  options,
  placeholder = "Select…",
  leadingIcon,
  buttonClassName,
  menuClassName,
}: {
  id: string;
  value: T | null;
  onChange: (v: T) => void;
  options: Array<SelectOption<T>>;
  placeholder?: string;
  leadingIcon?: React.ReactNode;
  buttonClassName?: string;
  menuClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [menuRect, setMenuRect] = React.useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  useClickOutside(rootRef, () => setOpen(false));

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    function recompute() {
      const el = buttonRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setMenuRect({ left: r.left, top: r.bottom + 4, width: r.width });
    }
    if (!open) return;
    recompute();
    window.addEventListener("scroll", recompute, true);
    window.addEventListener("resize", recompute);
    return () => {
      window.removeEventListener("scroll", recompute, true);
      window.removeEventListener("resize", recompute);
    };
  }, [open]);

  const current = options.find((o) => o.id === value)?.label ?? "";

  return (
    <div className="relative" ref={rootRef}>
      <button
        id={id}
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          buttonVariants({ variant: "secondary", size: "md" }),
          "w-full justify-between text-left",
          buttonClassName,
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {leadingIcon ? (
            <span className="shrink-0 text-[#717680]" aria-hidden="true">
              {leadingIcon}
            </span>
          ) : null}
          <span className={cn("min-w-0 truncate", !current && "text-[rgba(65,70,81,0.5)]")}>
            {current || placeholder}
          </span>
        </span>
        <ChevronDown size={18} className="text-[#535862]" aria-hidden="true" />
      </button>

      {open && menuRect
        ? createPortal(
            <div
              role="listbox"
              aria-labelledby={id}
              data-mofa-portal="select-menu"
              onMouseDown={(e) => e.stopPropagation()}
              className={cn(
                "max-h-64 overflow-auto rounded-lg border border-[#eeedf5] bg-white py-1 shadow-lg",
                menuClassName,
              )}
              style={{
                position: "fixed",
                left: menuRect.left,
                top: menuRect.top,
                width: menuRect.width,
                // Needs to sit above modal overlays (e.g. z-[80])
                zIndex: 200,
              }}
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
                      "flex w-full items-center px-3 py-2 text-left text-sm text-[#414651]",
                      "hover:bg-[color:var(--mofa-btn-outline-hover)]",
                      selected &&
                        "bg-[color:var(--mofa-btn-outline-selected)] font-semibold hover:bg-[color:var(--mofa-btn-outline-selected)]",
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
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

