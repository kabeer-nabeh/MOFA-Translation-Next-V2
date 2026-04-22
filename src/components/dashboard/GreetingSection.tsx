"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type GreetingSectionProps = {
  className?: string;
  greetingName: string;
  subtitle: string;
  primaryAction?: React.ReactNode;
};

export function GreetingSection({
  className,
  greetingName,
  subtitle,
  primaryAction,
}: GreetingSectionProps) {
  return (
    <section className={cn("flex items-center justify-between gap-6", className)}>
      <div className="min-w-0">
        <p className="text-2xl font-medium tracking-tight text-black">
          <span className="mr-1" aria-hidden="true">
            👋
          </span>
          Hi, {greetingName}!
        </p>
        <p className="mt-4 text-xl font-medium text-black">{subtitle}</p>
      </div>

      {primaryAction}
    </section>
  );
}

