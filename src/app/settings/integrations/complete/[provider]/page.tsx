"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  type IntegrationId,
  clearPendingIntegration,
  setIntegrationConnected,
} from "@/lib/integrations/client-storage";
import { cn } from "@/lib/utils";

export default function IntegrationCompletePage() {
  const params = useParams();
  const router = useRouter();
  const [state, setState] = React.useState<"working" | "ok" | "err">("working");
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  const provider = String(params?.provider ?? "");

  React.useEffect(() => {
    const qs = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    const source = qs.get("source") === "demo" ? "demo" : "oauth";
    const authError = qs.get("error");
    if (authError) {
      setState("err");
      setErrMsg("Authorization was not completed. Please try again.");
      return;
    }
    const id = provider as IntegrationId;
    if (id !== "teams" && id !== "outlook" && id !== "beam") {
      setState("err");
      setErrMsg("Unknown integration.");
      return;
    }
    try {
      setIntegrationConnected(id, { source: source });
      clearPendingIntegration();
      setState("ok");
      const t = setTimeout(
        () => {
          router.replace("/settings?tab=integrations");
        },
        900,
      );
      return () => clearTimeout(t);
    } catch {
      setState("err");
      setErrMsg("Could not save connection. Try again.");
    }
  }, [provider, router]);

  const label =
    provider === "teams"
      ? "Microsoft Teams"
      : provider === "outlook"
        ? "Outlook"
        : provider === "beam"
          ? "Beam"
          : "Integration";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#f3f3f7] px-4">
      <div
        className={cn(
          "w-full max-w-md rounded-2xl border border-[#eeedf5] bg-white p-8 text-center shadow-[0_12px_24px_rgba(0,0,0,0.06)]",
        )}
      >
        {state === "working" ? (
          <>
            <Loader2
              className="mx-auto h-10 w-10 animate-spin text-[#48476e]"
              aria-hidden
            />
            <h1 className="mt-4 text-lg font-semibold text-[#181d27]">
              Finishing {label}…
            </h1>
            <p className="mt-2 text-sm text-[#535862]">
              Securing your connection to MOFA.
            </p>
          </>
        ) : null}

        {state === "ok" ? (
          <>
            <CheckCircle2
              className="mx-auto h-10 w-10 text-[#008236]"
              aria-hidden
            />
            <h1 className="mt-4 text-lg font-semibold text-[#181d27]">
              {label} connected
            </h1>
            <p className="mt-2 text-sm text-[#535862]">
              Redirecting you back to Settings…
            </p>
          </>
        ) : null}

        {state === "err" ? (
          <>
            <h1 className="text-lg font-semibold text-[#181d27]">Something went wrong</h1>
            <p className="mt-2 text-sm text-[#b91c1c]">
              {errMsg ?? "Please try again."}
            </p>
            <div className="mt-6 flex justify-center">
              <Button
                type="button"
                variant="primary"
                onClick={() => router.replace("/settings?tab=integrations")}
              >
                Back to Settings
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
