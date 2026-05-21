import Image from "next/image";
import { GuestShell } from "@/components/layout/GuestShell";
import { LinkIcon, Mail } from "lucide-react";

export default function GuestInvalidLinkFlow() {
  return (
    <GuestShell>
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-sm rounded-2xl bg-white p-8 text-center"
          style={{
            border: "1px solid var(--mofa-border-default)",
            boxShadow: "0 8px 32px rgba(4,30,22,0.07)",
          }}
        >
          <div
            className="mx-auto mb-5 flex size-12 items-center justify-center rounded-xl"
            style={{ background: "var(--mofa-sidebar-bg)", border: "1px solid var(--mofa-border-subtle)" }}
          >
            <LinkIcon size={20} style={{ color: "var(--mofa-text-muted)" }} aria-hidden />
          </div>

          <h1 className="text-base font-semibold" style={{ color: "var(--mofa-text-primary)" }}>
            This link has expired
          </h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--mofa-text-muted)" }}>
            The meeting invite you followed is no longer valid. It may have expired or been revoked by the host.
          </p>

          <div
            className="mt-6 rounded-xl p-4 text-left"
            style={{ background: "var(--mofa-sidebar-bg)", border: "1px solid var(--mofa-border-subtle)" }}
          >
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.07em]" style={{ color: "var(--mofa-text-muted)" }}>
              What to do
            </p>
            <ul className="space-y-1.5">
              {[
                "Contact the meeting host to request a new invite link.",
                "Check your email for an updated invitation.",
                "Ensure you are using the most recent link sent to you.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: "var(--mofa-text-body)" }}>
                  <span className="mt-0.5 shrink-0 text-[10px]">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <a
            href="mailto:"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ background: "var(--mofa-accent)" }}
          >
            <Mail size={14} aria-hidden />
            Contact the host
          </a>
        </div>
      </div>
    </GuestShell>
  );
}
