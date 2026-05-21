"use client";

import * as React from "react";
import Image from "next/image";
import { Check, Eye, EyeOff, Globe, User } from "lucide-react";

// ─── Shared password generator (mirrors MeetingDetailClient) ─────────────────

function generatePassword(meetingId: string): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  let seed = meetingId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let i = 0; i < 8; i++) {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    result += chars[Math.abs(seed) % chars.length];
  }
  return result;
}

// ─── Mock meeting lookup ──────────────────────────────────────────────────────

type GuestMeeting = {
  id: string;
  title: string;
  hostName: string;
  dateLabel: string;
  timeRange: string;
  languages: string[];
};

function getMeetingById(id: string): GuestMeeting {
  const now = new Date();
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const range = (s: Date, e: Date) => `${fmtTime(s)} - ${fmtTime(e)}`;

  const meetings: GuestMeeting[] = [
    {
      id: "m8",
      title: "Product Strategy Discussion - Q2 Planning",
      hostName: "Abdullah Al Harbi",
      dateLabel: fmt(new Date(now.getTime() - 15 * 60_000)),
      timeRange: range(new Date(now.getTime() - 15 * 60_000), new Date(now.getTime() + 45 * 60_000)),
      languages: ["Arabic", "English"],
    },
    {
      id: "m9",
      title: "GCC Diplomatic Coordination - Live Translation",
      hostName: "Suliman Alawi",
      dateLabel: fmt(new Date(now.getTime() - 5 * 60_000)),
      timeRange: range(new Date(now.getTime() - 5 * 60_000), new Date(now.getTime() + 55 * 60_000)),
      languages: ["Arabic", "English"],
    },
    {
      id: "m1",
      title: "MOFA Live Translation - System Performance Review",
      hostName: "Suliman Alawi",
      dateLabel: "Dec 24, 2025",
      timeRange: "9:00 AM - 9:30 AM",
      languages: ["Arabic", "English"],
    },
  ];

  return meetings.find((m) => m.id === id) ?? {
    id,
    title: "MOFA Meeting",
    hostName: "MOFA Staff",
    dateLabel: fmt(now),
    timeRange: `${fmtTime(now)} - ${fmtTime(new Date(now.getTime() + 60 * 60_000))}`,
    languages: ["Arabic", "English"],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

type Step = "form" | "success";

export function GuestJoinClient({ meetingId }: { meetingId: string }) {
  const meeting = getMeetingById(meetingId);
  const correctPassword = generatePassword(meetingId);

  const [step, setStep] = React.useState<Step>("form");
  const [name, setName] = React.useState("");
  const [org, setOrg] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<{ name?: string; password?: string }>({});
  const [shaking, setShaking] = React.useState(false);
  const [countdown, setCountdown] = React.useState(3);

  React.useEffect(() => {
    if (step !== "success") return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          window.location.href = `/guest-view/${meetingId}`;
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, meetingId]);

  function validate() {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Full name is required.";
    if (!password.trim()) next.password = "Password is required.";
    else if (password !== correctPassword) next.password = "Incorrect password. Check your invite.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }
    setStep("success");
  }

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center px-4 py-10"
      style={{ background: "var(--mofa-page-bg)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl border bg-white shadow-[0_8px_40px_rgba(4,30,22,0.08)]"
        style={{
          borderColor: "var(--mofa-border-default)",
          animation: "dialogIn 300ms cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: "var(--mofa-border-subtle)" }}
        >
          <Image src="/baseer-logo.png" alt="Baseer Voice for MOFA" width={108} height={30} priority />
          <span
            className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em]"
            style={{
              borderColor: "var(--mofa-border-default)",
              color: "var(--mofa-text-muted)",
            }}
          >
            Guest Access
          </span>
        </div>

        {step === "form" ? (
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 pb-6 pt-5">
              <h1
                className="text-xl font-semibold tracking-tight"
                style={{ color: "var(--mofa-text-primary)" }}
              >
                Join Meeting
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--mofa-text-muted)" }}>
                Enter your details and the meeting password to get access.
              </p>

              {/* Meeting info card */}
              <div
                className="mt-4 rounded-xl border p-4"
                style={{
                  borderColor: "var(--mofa-border-default)",
                  background: "var(--mofa-sidebar-bg)",
                }}
              >
                <p
                  className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em]"
                  style={{ color: "var(--mofa-text-muted)" }}
                >
                  You're joining
                </p>
                <p className="text-sm font-semibold leading-snug" style={{ color: "var(--mofa-text-primary)" }}>
                  {meeting.title}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1 text-[12px]" style={{ color: "var(--mofa-text-muted)" }}>
                    <User size={11} aria-hidden />
                    {meeting.hostName}
                  </span>
                  <span className="flex items-center gap-1 text-[12px]" style={{ color: "var(--mofa-text-muted)" }}>
                    <span aria-hidden className="text-[10px]">📅</span>
                    {meeting.dateLabel} · {meeting.timeRange}
                  </span>
                  <span className="flex items-center gap-1 text-[12px]" style={{ color: "var(--mofa-text-muted)" }}>
                    <Globe size={11} aria-hidden />
                    {meeting.languages.join(", ")}
                  </span>
                </div>
              </div>

              {/* Fields */}
              <div className="mt-5 space-y-4">
                <Field
                  label="Full Name"
                  error={errors.name}
                  shaking={shaking && !!errors.name}
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                    placeholder="e.g. Sarah Johnson"
                    autoComplete="name"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-[color:var(--mofa-text-placeholder)] focus:border-[color:var(--mofa-accent)] focus:ring-2 focus:ring-[color:var(--mofa-accent)]/20"
                    style={{ borderColor: errors.name ? "#f97316" : "var(--mofa-border-default)", color: "var(--mofa-text-body)" }}
                  />
                </Field>

                <Field label="Organization / Affiliation">
                  <input
                    type="text"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="e.g. United Nations Office"
                    autoComplete="organization"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-[color:var(--mofa-text-placeholder)] focus:border-[color:var(--mofa-accent)] focus:ring-2 focus:ring-[color:var(--mofa-accent)]/20"
                    style={{ borderColor: "var(--mofa-border-default)", color: "var(--mofa-text-body)" }}
                  />
                </Field>

                <Field
                  label="Meeting Password"
                  error={errors.password}
                  shaking={shaking && !!errors.password}
                >
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                      placeholder="Enter the password from your invite"
                      autoComplete="current-password"
                      className="w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-[color:var(--mofa-text-placeholder)] focus:border-[color:var(--mofa-accent)] focus:ring-2 focus:ring-[color:var(--mofa-accent)]/20"
                      style={{ borderColor: errors.password ? "#f97316" : "var(--mofa-border-default)", color: "var(--mofa-text-body)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--mofa-text-muted)] hover:text-[color:var(--mofa-text-body)] transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-xl py-3 text-sm font-semibold text-white transition-[background-color,transform] duration-150 hover:opacity-90 active:scale-[0.98]"
                style={{ background: "var(--mofa-accent)" }}
              >
                Join Meeting
              </button>

              <p className="mt-3 text-center text-[11px]" style={{ color: "var(--mofa-text-muted)" }}>
                By joining, you agree to be recorded for translation purposes.
              </p>
            </div>
          </form>
        ) : (
          <div className="px-6 pb-6 pt-8 text-center">
            <div
              className="mx-auto flex size-16 items-center justify-center rounded-full"
              style={{
                background: "var(--mofa-accent)",
                animation: "dialogIn 400ms cubic-bezier(0.16,1,0.3,1) both",
              }}
            >
              <Check size={28} strokeWidth={2.5} className="text-white" aria-hidden />
            </div>
            <h2
              className="mt-4 text-xl font-semibold tracking-tight"
              style={{ color: "var(--mofa-text-primary)" }}
            >
              You're in, {name.split(" ")[0]}!
            </h2>
            <p className="mt-1.5 text-sm" style={{ color: "var(--mofa-text-muted)" }}>
              Your access has been verified. Entering in {countdown}s.
            </p>

            {/* Spinner */}
            <div className="mt-5 flex justify-center">
              <svg
                className="animate-spin"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                aria-label="Loading"
              >
                <circle
                  cx="16" cy="16" r="13"
                  stroke="var(--mofa-accent-muted)"
                  strokeWidth="3"
                />
                <path
                  d="M16 3 A13 13 0 0 1 29 16"
                  stroke="var(--mofa-accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div
              className="mt-4 rounded-xl border p-4 text-left"
              style={{ borderColor: "var(--mofa-border-default)", background: "var(--mofa-sidebar-bg)" }}
            >
              <p
                className="mb-1 text-[10px] font-semibold uppercase tracking-[0.07em]"
                style={{ color: "var(--mofa-text-muted)" }}
              >
                Meeting Details
              </p>
              <p className="text-sm font-semibold leading-snug" style={{ color: "var(--mofa-text-primary)" }}>
                {meeting.title}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                <span className="flex items-center gap-1 text-[12px]" style={{ color: "var(--mofa-text-muted)" }}>
                  <User size={11} aria-hidden />
                  Host: {meeting.hostName}
                </span>
                <span className="text-[12px]" style={{ color: "var(--mofa-text-muted)" }}>
                  {meeting.dateLabel} · {meeting.timeRange}
                </span>
              </div>
            </div>

            <p className="mt-4 text-[11px]" style={{ color: "var(--mofa-text-muted)" }}>
              You'll join as a guest with view-only access to the translation feed.
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          className="border-t px-6 py-3 text-center text-[11px]"
          style={{ borderColor: "var(--mofa-border-subtle)", color: "var(--mofa-text-faint)" }}
        >
          Powered by Baseer Voice — Ministry of Foreign Affairs
        </div>
      </div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  shaking,
  children,
}: {
  label: string;
  error?: string;
  shaking?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={shaking ? { animation: "shakeX 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both" } : undefined}>
      <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--mofa-text-body)" }}>
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[12px]" style={{ color: "#ea580c" }}>
          {error}
        </p>
      )}
    </div>
  );
}
