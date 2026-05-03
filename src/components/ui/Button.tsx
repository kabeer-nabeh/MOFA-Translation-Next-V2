import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "rounded-lg border-2 border-[#5a597d] bg-[#48476e] text-white " +
          "shadow-[0_1px_2px_0_rgb(0_0_0_/_0.08),inset_0_1px_0_0_rgb(255_255_255_/_0.08)] " +
          "hover:bg-[#3f3e63] focus-visible:ring-blue-500",
        secondary:
          "rounded-lg border border-[#d5d7da] bg-white font-semibold text-[#414651] " +
          "shadow-[0_1px_2px_0_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05)] " +
          "hover:bg-[color:var(--mofa-btn-outline-hover)] " +
          "aria-[expanded=true]:bg-[color:var(--mofa-btn-outline-selected)] " +
          "focus-visible:ring-0 focus-visible:shadow-[0_1px_2px_0_rgba(10,13,18,0.05),inset_0_-2px_0_rgba(10,13,18,0.05),0_0_0_2px_var(--mofa-btn-outline-focus-halo)]",
      },
      size: {
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

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

