"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="block text-[13px] font-medium leading-[19.5px] text-[#414651]"
      >
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "h-10 w-full rounded-lg border px-3 text-sm shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] outline-none transition-shadow",
          disabled
            ? "cursor-not-allowed border-[#eeedf5] bg-[#f9f9fb] text-[#535862]"
            : "border-[#eeedf5] bg-white text-[#414651]",
          error ? "border-[#fca5a5]" : null,
          !disabled &&
            "focus:shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1),0_0_0_2px_var(--mofa-btn-outline-focus-halo)]",
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <div
          id={`${id}-error`}
          className="text-[12px] leading-[18px] text-[#b91c1c]"
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}

