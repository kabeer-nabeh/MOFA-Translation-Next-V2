import Image from "next/image";

export default function PostLoginFlow() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center gap-6"
      style={{ background: "var(--mofa-sidebar-bg)" }}
    >
      <Image src="/baseer-logo.png" alt="Baseer Voice" width={120} height={34} priority />

      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="Loading">
          <circle cx="16" cy="16" r="13" stroke="var(--mofa-accent-muted)" strokeWidth="3" />
          <path d="M16 3 A13 13 0 0 1 29 16" stroke="var(--mofa-accent)" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="text-sm font-medium" style={{ color: "var(--mofa-text-muted)" }}>
          Setting up your workspace…
        </p>
      </div>
    </div>
  );
}
