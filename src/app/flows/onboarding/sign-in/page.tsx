import Image from "next/image";
import { Lock, Mail } from "lucide-react";

export default function SignInFlow() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4"
      style={{ background: "var(--mofa-sidebar-bg)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white px-8 py-10"
        style={{
          border: "1px solid var(--mofa-border-default)",
          boxShadow: "0 8px 40px rgba(4,30,22,0.07)",
        }}
      >
        <div className="mb-8 flex justify-center">
          <Image src="/baseer-logo.png" alt="Baseer Voice" width={128} height={36} priority />
        </div>

        <h1 className="mb-1 text-xl font-semibold tracking-tight" style={{ color: "var(--mofa-text-primary)" }}>
          Welcome back
        </h1>
        <p className="mb-7 text-sm" style={{ color: "var(--mofa-text-muted)" }}>
          Sign in to your MOFA account to continue.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--mofa-text-body)" }}>
              Email address
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--mofa-text-muted)" }} aria-hidden />
              <input
                type="email"
                placeholder="you@mofa.gov.sa"
                readOnly
                className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none"
                style={{ borderColor: "var(--mofa-border-default)", color: "var(--mofa-text-body)", background: "white" }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium" style={{ color: "var(--mofa-text-body)" }}>Password</label>
              <span className="text-xs" style={{ color: "var(--mofa-accent)" }}>Forgot password?</span>
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--mofa-text-muted)" }} aria-hidden />
              <input
                type="password"
                placeholder="••••••••"
                readOnly
                className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none"
                style={{ borderColor: "var(--mofa-border-default)", color: "var(--mofa-text-body)", background: "white" }}
              />
            </div>
          </div>

          <button
            type="button"
            className="mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white"
            style={{ background: "var(--mofa-accent)" }}
          >
            Sign in
          </button>
        </div>
      </div>

      <p className="mt-6 text-[11px]" style={{ color: "var(--mofa-text-faint)" }}>
        Powered by Baseer Voice — Ministry of Foreign Affairs
      </p>
    </div>
  );
}
