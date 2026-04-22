import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export type AvatarProps = React.ComponentPropsWithoutRef<"div"> & {
  src?: string | null;
  alt?: string;
  fallback?: string;
};

export function Avatar({ className, src, alt, fallback, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-50",
        className,
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? ""}
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-medium text-slate-600">
          {fallback ?? ""}
        </div>
      )}
    </div>
  );
}

