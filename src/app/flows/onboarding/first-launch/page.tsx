import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { Mic, Plus } from "lucide-react";

const INTEGRATIONS = [
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Connect your tenant so Baseer Voice can schedule and join meetings in Teams.",
    icon: "/teams.png",
  },
  {
    id: "outlook",
    name: "Outlook",
    description: "Connect Outlook so Baseer Voice can send invites and keep your calendar in sync.",
    icon: "/outlook.png",
  },
  {
    id: "beem",
    name: "Beem",
    description: "Link Beem to run interpretation meetings with the same team workflow.",
    icon: "/beam-logo.png",
  },
];

export default function FirstLaunchFlow() {
  return (
    <AppShell>
      <main className="h-full overflow-y-auto px-8 py-12">
        {/* Hero */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div
            className="mb-5 flex size-14 items-center justify-center rounded-2xl"
            style={{ background: "var(--mofa-accent-light)" }}
          >
            <Mic size={24} style={{ color: "var(--mofa-accent)" }} aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--mofa-text-primary)" }}>
            Welcome to Baseer Voice
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--mofa-text-muted)" }}>
            Your real-time translation workspace is ready. Create your first meeting to get started.
          </p>
          <Link
            href="/meetings"
            className="mt-6 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: "var(--mofa-accent)" }}
          >
            <Plus size={14} aria-hidden />
            Create your first meeting
          </Link>
        </div>

        {/* Integrations */}
        <div className="mx-auto max-w-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--mofa-text-primary)" }}>
                Connect your tools
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--mofa-text-muted)" }}>
                Link your existing platforms to get the most out of Baseer Voice.
              </p>
            </div>
            <Link
              href="/settings"
              className="text-xs font-medium"
              style={{ color: "var(--mofa-accent)" }}
            >
              Manage all
            </Link>
          </div>

          <div
            className="overflow-hidden rounded-2xl"
            style={{ border: "1px solid var(--mofa-border-default)", background: "white" }}
          >
            {INTEGRATIONS.map((integration, idx) => (
              <div
                key={integration.id}
                className="flex items-center gap-4 px-5 py-4"
                style={{
                  borderTop: idx > 0 ? "1px solid var(--mofa-border-subtle)" : undefined,
                }}
              >
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "var(--mofa-sidebar-bg)", border: "1px solid var(--mofa-border-subtle)" }}
                >
                  <Image
                    src={integration.icon}
                    alt={integration.name}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--mofa-text-primary)" }}>
                    {integration.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs" style={{ color: "var(--mofa-text-muted)" }}>
                    {integration.description}
                  </p>
                </div>

                <button
                  type="button"
                  className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{
                    borderColor: "var(--mofa-border-default)",
                    color: "var(--mofa-text-body)",
                    background: "white",
                  }}
                >
                  Connect
                </button>
              </div>
            ))}
          </div>

          <p className="mt-3 text-center text-[11px]" style={{ color: "var(--mofa-text-faint)" }}>
            You can always connect integrations later from Settings.
          </p>
        </div>
      </main>
    </AppShell>
  );
}
