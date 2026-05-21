import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function ServerErrorFlow() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center" style={{ background: "var(--mofa-sidebar-bg)" }}>
      <Image src="/baseer-logo.png" alt="Baseer Voice" width={108} height={30} priority className="mb-12" />

      <div
        className="mb-5 flex size-14 items-center justify-center rounded-2xl"
        style={{ background: "white", border: "1px solid var(--mofa-border-default)" }}
      >
        <RefreshCw size={22} style={{ color: "var(--mofa-text-muted)" }} aria-hidden />
      </div>

      <h1 className="text-xl font-semibold" style={{ color: "var(--mofa-text-primary)" }}>
        Something went wrong
      </h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed" style={{ color: "var(--mofa-text-muted)" }}>
        An unexpected error occurred. Our team has been notified. Please try again.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: "var(--mofa-accent)" }}
        >
          <RefreshCw size={14} aria-hidden />
          Try again
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold"
          style={{ borderColor: "var(--mofa-border-default)", color: "var(--mofa-text-body)", background: "white" }}
        >
          <ArrowLeft size={14} aria-hidden />
          Go home
        </Link>
      </div>
    </div>
  );
}
