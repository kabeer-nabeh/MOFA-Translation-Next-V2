import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-slate-200 bg-slate-50 text-slate-900",
        secondary: "border-transparent bg-slate-900 text-white",
        outline: "border-slate-200 bg-transparent text-slate-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeProps = React.ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

