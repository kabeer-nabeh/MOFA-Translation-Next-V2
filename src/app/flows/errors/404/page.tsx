import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function NotFoundFlow() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center" style={{ background: "var(--mofa-sidebar-bg)" }}>
      <Image src="/baseer-logo.png" alt="Baseer Voice" width={108} height={30} priority className="mb-12" />

      <p className="text-[80px] font-bold leading-none tracking-tight" style={{ color: "var(--mofa-accent)" }}>
        404
      </p>
      <h1 className="mt-3 text-xl font-semibold" style={{ color: "var(--mofa-text-primary)" }}>
        Page not found
      </h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed" style={{ color: "var(--mofa-text-muted)" }}>
        The page you are looking for does not exist or has been moved.
      </p>

      <Link
        href="/dashboard"
        className="mt-8 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
        style={{ background: "var(--mofa-accent)" }}
      >
        <ArrowLeft size={14} aria-hidden />
        Back to dashboard
      </Link>
    </div>
  );
}
