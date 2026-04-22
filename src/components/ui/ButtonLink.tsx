import Link, { type LinkProps } from "next/link";
import * as React from "react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";

export type ButtonLinkProps = LinkProps &
  Omit<React.ComponentPropsWithoutRef<"a">, "href"> &
  VariantProps<typeof buttonVariants>;

export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

