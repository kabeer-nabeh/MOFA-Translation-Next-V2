import Image from "next/image";
import { ShieldAlert } from "lucide-react";

export default function SessionExpiredFlow() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center" style={{ background: "var(--mofa-sidebar-bg)" }}>
      <Image src="/baseer-logo.png" alt="Baseer Voice" width={108} height={30} priority className="mb-12" />

      <div
        className="mb-5 flex size-14 items-center justify-center rounded-2xl"
        style={{ background: "white", border: "1px solid var(--mofa-border-default)" }}
      >
        <ShieldAlert size={22} style={{ color: "#f59e0b" }} aria-hidden />
      </div>

      <h1 className="text-xl font-semibold" style={{ color: "var(--mofa-text-primary)" }}>
        Your session has expired
      </h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed" style={{ color: "var(--mofa-text-muted)" }}>
        For your security, you have been signed out after a period of inactivity. Please sign in again to continue.
      </p>

      <button
        type="button"
        className="mt-8 rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
        style={{ background: "var(--mofa-accent)" }}
      >
        Sign in again
      </button>
    </div>
  );
}
