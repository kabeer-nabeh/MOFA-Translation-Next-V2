"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Loader2, Unplug, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  type IntegrationId,
  clearIntegrationState,
  clearPendingIntegration,
  getIntegrationState,
  getPendingIntegration,
  setPendingIntegration,
} from "@/lib/integrations/client-storage";

type RowProps = {
  id: IntegrationId;
  name: string;
  description: string;
  icon: React.ReactNode;
};

const AUTHORIZE_PATH: Record<IntegrationId, string> = {
  teams: "/api/integrations/teams/authorize",
  outlook: "/api/integrations/outlook/authorize",
  beam: "/api/integrations/beam/authorize",
};

const DISCONNECT_PATH: Record<IntegrationId, string> = {
  teams: "/api/integrations/teams/disconnect",
  outlook: "/api/integrations/outlook/disconnect",
  beam: "/api/integrations/beam/disconnect",
};

const ROWS: RowProps[] = [
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Connect your tenant so MOFA can schedule and join meetings in Teams.",
    icon: (
      <img src="/teams.png" alt="" className="h-9 w-9" />
    ),
  },
  {
    id: "outlook",
    name: "Outlook",
    description:
      "Connect Outlook and Microsoft 365 mail so MOFA can send invites and keep calendars in sync.",
    icon: (
      <img src="/outlook.png" alt="" className="h-9 w-9 object-contain" />
    ),
  },
  {
    id: "beam",
    name: "Beam",
    description: "Link Beam to run interpretation meetings with the same team workflow.",
    icon: (
      <img src="/beam-logo.png" alt="" className="h-9 w-9 object-contain" aria-hidden />
    ),
  },
];

function StatusPill({
  status,
}: {
  status: "not_connected" | "pending" | "done";
}) {
  if (status === "done") {
    return (
      <span className="inline-flex items-center rounded-full bg-[#ecfdf3] px-2.5 py-0.5 text-xs font-semibold text-[#027a48]">
        Done
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center rounded-full bg-[#fff7ed] px-2.5 py-0.5 text-xs font-semibold text-[#b45309]">
        Awaiting sign-in
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[#f3f3f7] px-2.5 py-0.5 text-xs font-medium text-[#64748b]">
      Not connected
    </span>
  );
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#eeedf5] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="border-b border-[#eeedf5] bg-[#fdfcfc] px-6 pb-5 pt-5">
        <div className="text-base font-semibold leading-6 text-[#414651]">
          {title}
        </div>
        <div className="mt-1 text-[13px] leading-[19.5px] text-[#535862]">
          {description}
        </div>
      </div>
      <div className="px-6 py-2 pb-6">{children}</div>
    </div>
  );
}

export function IntegrationsSettingsPanel() {
  const [tick, setTick] = React.useState(0);
  const refresh = React.useCallback(() => setTick((n) => n + 1), []);
  const [mounted, setMounted] = React.useState(false);
  const [dialog, setDialog] = React.useState<
    null | { id: IntegrationId; name: string }
  >(null);
  const [busy, setBusy] = React.useState(false);
  const [disconnectError, setDisconnectError] = React.useState<string | null>(null);

  const connected = React.useMemo(() => {
    void tick;
    return {
      teams: getIntegrationState("teams"),
      outlook: getIntegrationState("outlook"),
      beam: getIntegrationState("beam"),
    };
  }, [tick]);

  const pending = React.useMemo(() => {
    void tick;
    return getPendingIntegration();
  }, [tick]);

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onStore = (e: StorageEvent) => {
      if (e.key?.startsWith("mofa:integration:")) refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("storage", onStore);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStore);
    };
  }, [refresh]);

  React.useEffect(() => {
    if (!dialog) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) setDialog(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialog, busy]);

  function statusFor(id: IntegrationId): "not_connected" | "pending" | "done" {
    if (connected[id]) return "done";
    if (pending === id) return "pending";
    return "not_connected";
  }

  function onIntegrate(id: IntegrationId) {
    setPendingIntegration(id);
    window.location.assign(AUTHORIZE_PATH[id]);
  }

  function openDisconnectDialog(id: IntegrationId, displayName: string) {
    setDisconnectError(null);
    setDialog({ id, name: displayName });
  }

  async function runDisconnect() {
    if (!dialog) return;
    setDisconnectError(null);
    setBusy(true);
    const path = DISCONNECT_PATH[dialog.id];
    try {
      const res = await fetch(path, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (!res.ok || !data.ok) {
        setDisconnectError("Could not disconnect. Please try again.");
        return;
      }
      clearIntegrationState(dialog.id);
      if (getPendingIntegration() === dialog.id) clearPendingIntegration();
      refresh();
      setDialog(null);
    } catch {
      setDisconnectError("Could not disconnect. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {mounted && dialog
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-10"
              role="presentation"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget && !busy) setDialog(null);
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="disconnect-title"
                className="w-full max-w-md rounded-2xl border border-[#eeedf5] bg-white p-6 shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2
                    id="disconnect-title"
                    className="text-base font-semibold text-[#181d27]"
                  >
                    Disconnect {dialog.name}?
                  </h2>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#d5d7da] bg-white text-[#414651] shadow-[0_1px_2px_rgba(10,13,18,0.05)] disabled:opacity-50"
                    onClick={() => !busy && setDialog(null)}
                    aria-label="Close"
                    disabled={busy}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#535862]">
                  MOFA will remove this connection after you confirm. You can
                  integrate again at any time.
                </p>
                {disconnectError ? (
                  <p
                    className="mt-3 text-sm text-[#b91c1c]"
                    role="alert"
                  >
                    {disconnectError}
                  </p>
                ) : null}
                <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => !busy && setDialog(null)}
                    disabled={busy}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="min-w-[120px] gap-2 bg-[#b91c1c] text-white border-[#b91c1c] hover:bg-[#a31515]"
                    onClick={runDisconnect}
                    disabled={busy}
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    ) : null}
                    {busy ? "Disconnecting…" : "Disconnect"}
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
      <SettingsCard
        title="Connected platforms"
        description="Authorize MOFA to work with your meeting and collaboration tools. You can disconnect any time."
      >
        {ROWS.map((row, i) => {
          const s = statusFor(row.id);
          const isLast = i === ROWS.length - 1;
          return (
            <div
              key={row.id}
              className={cn(
                "flex flex-col gap-4 border-[#eeedf5] py-5 sm:flex-row sm:items-center sm:justify-between",
                !isLast && "border-b",
              )}
            >
              <div className="flex min-w-0 items-start gap-4">
                <div className="shrink-0 rounded-xl border border-[#eeedf5] bg-white p-2">
                  {row.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#414651]">
                      {row.name}
                    </h3>
                    <StatusPill status={s} />
                  </div>
                  <p className="mt-1 max-w-xl text-[13px] leading-[19.5px] text-[#535862]">
                    {row.description}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-end gap-2 sm:ml-4">
                {s === "done" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="gap-2"
                    onClick={() => openDisconnectDialog(row.id, row.name)}
                  >
                    <Unplug size={16} aria-hidden />
                    Disconnect
                  </Button>
                ) : null}
                {s !== "done" ? (
                  <Button
                    type="button"
                    variant="primary"
                    className="gap-2"
                    onClick={() => onIntegrate(row.id)}
                    title={
                      s === "pending"
                        ? "If you did not complete sign-in, try again. You can also return after finishing in the provider window."
                        : undefined
                    }
                  >
                    <ExternalLink size={16} aria-hidden />
                    {s === "pending" ? "Try again" : "Integrate"}
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </SettingsCard>
    </div>
  );
}
