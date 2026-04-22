import * as React from "react";

import { cn } from "@/lib/utils";

export type SidebarProps = React.ComponentPropsWithoutRef<"aside">;

export function Sidebar({ className, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block",
        className,
      )}
      {...props}
    />
  );
}

