import * as React from "react";

import { cn } from "@/lib/utils";

export type PageContainerProps = React.ComponentPropsWithoutRef<"main">;

export function PageContainer({ className, ...props }: PageContainerProps) {
  return (
    <main
      className={cn("w-full max-w-6xl mx-auto px-8 py-8", className)}
      {...props}
    />
  );
}

