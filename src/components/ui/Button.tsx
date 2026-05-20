import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mofa-accent)]/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "rounded-lg border-2 border-[color:var(--mofa-btn-primary-border)] bg-[color:var(--mofa-btn-primary-bg)] text-white " +
          "shadow-[0_1px_2px_0_rgb(0_0_0_/_0.08),inset_0_1px_0_0_rgb(255_255_255_/_0.08)] " +
          "hover:bg-[color:var(--mofa-btn-primary-hover)] focus-visible:ring-[color:var(--mofa-accent)]",
        secondary:
          "rounded-lg border border-[color:var(--mofa-border-default)] bg-white font-semibold text-[color:var(--mofa-text-body)] " +
          "shadow-[0_1px_2px_0_rgba(10,13,18,0.05)] " +
          "hover:bg-[color:var(--mofa-btn-outline-hover)] active:scale-[0.98] " +
          "aria-[expanded=true]:bg-[color:var(--mofa-btn-outline-selected)] " +
          "focus-visible:ring-2 focus-visible:ring-[color:var(--mofa-accent)]/50 focus-visible:ring-offset-1",
        tertiary:
          "rounded-lg border border-transparent bg-transparent font-semibold text-[color:var(--mofa-text-muted)] " +
          "shadow-none " +
          "hover:bg-[color:var(--mofa-btn-outline-hover)] hover:text-[color:var(--mofa-text-secondary)] " +
          "focus-visible:ring-[color:var(--mofa-btn-outline-focus-halo)]",
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
