import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.ComponentPropsWithoutRef<"input">;

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition-shadow placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

