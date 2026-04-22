import * as React from "react";

import { cn } from "@/lib/utils";

export type PageContainerProps = React.ComponentPropsWithoutRef<"main">;

export function PageContainer({ className, ...props }: PageContainerProps) {
  return (
    <main
      className={cn("mx-auto w-full max-w-6xl px-4 py-10", className)}
      {...props}
    />
  );
}

