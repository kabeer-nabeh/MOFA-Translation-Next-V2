import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/Button";

export type IconButtonProps = Omit<ButtonProps, "children"> & {
  icon: LucideIcon;
  "aria-label": string;
};

export function IconButton({
  className,
  icon: Icon,
  size = "md",
  ...props
}: IconButtonProps) {
  const iconSize = size === "sm" ? 16 : size === "lg" ? 20 : 18;

  return (
    <Button
      className={cn(
        "px-0",
        size === "sm" && "h-9 w-9",
        size === "md" && "h-10 w-10",
        size === "lg" && "h-11 w-11",
        className,
      )}
      size={size}
      {...props}
    >
      <Icon size={iconSize} aria-hidden="true" />
    </Button>
  );
}

