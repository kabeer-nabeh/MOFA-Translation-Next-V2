import * as React from "react";
import Image from "next/image";
import Link from "next/link";

export function GuestShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col bg-[color:var(--mofa-sidebar-bg)]">
      {/* Minimal top bar — logo only */}
      <header
        className="shrink-0 flex items-center px-6"
        style={{ height: "62px", borderBottom: "1px solid var(--mofa-border-subtle)" }}
      >
        <Link href="/" className="inline-flex items-center shrink-0">
          <Image
            src="/baseer-logo.png"
            alt="Baseer Voice for MOFA"
            width={120}
            height={34}
            priority
          />
        </Link>
      </header>

      {/* Content */}
      <div
        className="flex-1 min-h-0 mx-3 mb-3 mt-3 rounded-2xl overflow-y-auto bg-[color:var(--mofa-page-bg)]"
        style={{ border: "1px solid var(--mofa-border-default)" }}
      >
        {children}
      </div>
    </div>
  );
}
