"use client";

import * as React from "react";
import { Check, FileText, Info, Mail, Sparkles, UserX, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Guest, GuestOutputs } from "@/types/meeting";
import { addGuest, revokeGuest } from "@/lib/services/guests";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  Guest["status"],
  { label: string; dot: string; text: string }
> = {
  invited: { label: "Invited — link sent", dot: "#f79009", text: "#b54708" },
  joined:  { label: "In Meeting",          dot: "#17b26a", text: "#067647" },
  left:    { label: "Left",                dot: "var(--mofa-text-muted)", text: "var(--mofa-text-muted)" },
  revoked: { label: "Access Revoked",      dot: "#f04438", text: "#b42318" },
};

// ─── Revoke Confirm Dialog ────────────────────────────────────────────────────

function RevokeConfirmDialog({
  guest,
  loading,
  onConfirm,
  onCancel,
}: {
  guest: Guest;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4 animate-[fadeSlideIn_0.15s_ease-out]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-[color:var(--mofa-border-default)] bg-white p-6 shadow-[0_20px_40px_rgba(0,0,0,0.12)] animate-[fadeSlideIn_0.2s_ease-out]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-[#fff1f0]">
          <UserX size={18} className="text-[#f04438]" />
        </div>
        <h2 className="text-base font-semibold text-[color:var(--mofa-text-primary)]">
          Revoke {guest.name}'s access?
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-[color:var(--mofa-text-subtle)]">
          Their session link will be immediately invalidated. They will be unable to join or
          rejoin this meeting.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 flex-1 items-center justify-center rounded-lg border border-[color:var(--mofa-border-default)] bg-white text-sm font-semibold text-[color:var(--mofa-text-body)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition hover:bg-[color:var(--mofa-btn-outline-hover)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mofa-accent)]/50 focus-visible:ring-offset-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#d92d20] text-sm font-semibold text-white transition hover:bg-[#b42318] disabled:opacity-60"
          >
            {loading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              "Revoke Access"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Guest Card ───────────────────────────────────────────────────────────────
// Flat row: avatar · name · status · ⓘ icon (click → detail popover)

function GuestCard({
  guest,
  onRevoke,
}: {
  guest: Guest;
  onRevoke: (g: Guest) => void;
}) {
  const [showInfo, setShowInfo] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const s = STATUS_CONFIG[guest.status];
  const canRevoke = guest.status === "invited" || guest.status === "joined";

  // Close popover on outside click
  React.useEffect(() => {
    if (!showInfo) return;
    const handler = (e: MouseEvent) => {
      if (!cardRef.current?.contains(e.target as Node)) setShowInfo(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showInfo]);

  return (
    <div
      ref={cardRef}
      className="relative flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-[color:var(--mofa-btn-outline-hover)]"
    >
      {/* Avatar */}
      <div
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-[color:var(--mofa-text-body)]"
        style={{ backgroundColor: guest.bg }}
      >
        {guest.initials}
      </div>

      {/* Name + status */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs font-semibold text-[color:var(--mofa-text-body)]">{guest.name}</span>
          <span className="shrink-0 rounded-full border border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-sidebar-active-bg)] px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-[color:var(--mofa-text-secondary)]">
            Ext
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1">
          <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: s.dot }} />
          <span className="text-[10px] font-medium" style={{ color: s.text }}>{s.label}</span>
        </div>
      </div>

      {/* Info icon */}
      <button
        type="button"
        onClick={() => setShowInfo((v) => !v)}
        aria-label="Guest details"
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full text-[color:var(--mofa-text-placeholder)] transition hover:bg-[color:var(--mofa-btn-outline-hover)] hover:text-[color:var(--mofa-text-subtle)]",
          showInfo && "bg-[#f0f0f4] text-[color:var(--mofa-text-subtle)]",
        )}
      >
        <Info size={13} />
      </button>

      {/* Detail popover */}
      {showInfo && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl border border-[color:var(--mofa-border-default)] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.1)] animate-[fadeSlideIn_0.15s_ease-out]"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-0 divide-y divide-[#f0f0f4]">
            {/* Info block */}
            <div className="flex flex-col gap-0.5 px-3.5 py-3">
              <p className="text-[11px] font-semibold text-[color:var(--mofa-text-body)]">{guest.affiliation}</p>
              <p className="text-[11px] text-[color:var(--mofa-text-muted)]">{guest.email}</p>
              {(guest.outputs.sendTranscript || guest.outputs.sendSummary) && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {guest.outputs.sendTranscript && (
                    <span className="rounded-full border border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-btn-outline-hover)] px-2 py-0.5 text-[10px] text-[color:var(--mofa-text-secondary)]">
                      📄 Transcript
                    </span>
                  )}
                  {guest.outputs.sendSummary && (
                    <span className="rounded-full border border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-btn-outline-hover)] px-2 py-0.5 text-[10px] text-[color:var(--mofa-text-secondary)]">
                      ✨ Summary
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Revoke action */}
            {canRevoke && (
              <div className="px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => { setShowInfo(false); onRevoke(guest); }}
                  className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[#d92d20] transition hover:bg-[#fff1f0]"
                >
                  <UserX size={11} />
                  Revoke Access
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Guest Modal ──────────────────────────────────────────────────────────

function AddGuestModal({
  meetingId,
  onClose,
  onAdded,
}: {
  meetingId: string;
  onClose: () => void;
  onAdded: (guest: Guest) => void;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [affiliation, setAffiliation] = React.useState("");
  const [sendTranscript, setSendTranscript] = React.useState(true);
  const [sendSummary, setSendSummary] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Partial<Record<"name" | "email" | "affiliation", string>>>({});

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!email.trim()) errs.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = "Enter a valid email address";
    if (!affiliation.trim()) errs.affiliation = "Organization is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const guest = await addGuest(meetingId, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        affiliation: affiliation.trim(),
        outputs: { sendTranscript, sendSummary },
      });
      onAdded(guest);
    } finally {
      setLoading(false);
    }
  }

  const fieldClass = (hasError?: boolean) =>
    cn(
      "h-9 w-full rounded-lg border px-3 text-sm text-[color:var(--mofa-text-body)] outline-none placeholder:text-[color:var(--mofa-text-placeholder)] transition focus:ring-2 focus:ring-[#6f6e8a]/30",
      hasError
        ? "border-[#f04438] bg-[#fff8f7]"
        : "border-[color:var(--mofa-border-default)] bg-white hover:border-[#9fa3ae]"
    );

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4 animate-[fadeSlideIn_0.15s_ease-out]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-guest-title"
        className="w-full max-w-md rounded-2xl border border-[color:var(--mofa-border-default)] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.12)] animate-[fadeSlideIn_0.2s_ease-out]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[color:var(--mofa-border-default)] px-5 py-4">
          <div>
            <h2 id="add-guest-title" className="text-base font-semibold text-[color:var(--mofa-text-primary)]">
              Add External Guest
            </h2>
            <p className="mt-0.5 text-xs text-[color:var(--mofa-text-muted)]">
              Guest receives a one-time access link scoped to this session only
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-[color:var(--mofa-text-muted)] transition hover:bg-[color:var(--mofa-sidebar-active-bg)]"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-4 px-5 py-5">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[color:var(--mofa-text-body)]">
                Full Name <span className="text-[#f04438]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Johnson"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                className={fieldClass(!!errors.name)}
                autoFocus
              />
              {errors.name && <p className="text-[11px] text-[#f04438]">{errors.name}</p>}
            </div>

            {/* External Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[color:var(--mofa-text-body)]">
                External Email <span className="text-[#f04438]">*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. sarah@partner-org.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                className={fieldClass(!!errors.email)}
              />
              {errors.email && <p className="text-[11px] text-[#f04438]">{errors.email}</p>}
            </div>

            {/* Organization */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[color:var(--mofa-text-body)]">
                Organization / Affiliation <span className="text-[#f04438]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. UAE Ministry of Foreign Affairs"
                value={affiliation}
                onChange={(e) => { setAffiliation(e.target.value); setErrors((p) => ({ ...p, affiliation: undefined })); }}
                className={fieldClass(!!errors.affiliation)}
              />
              {errors.affiliation && (
                <p className="text-[11px] text-[#f04438]">{errors.affiliation}</p>
              )}
            </div>

            {/* Post-meeting outputs */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-[color:var(--mofa-text-body)]">Post-Meeting Outputs</p>
              <div className="flex flex-col gap-2">
                {([
                  {
                    id: "transcript",
                    label: "Meeting Transcript",
                    description: "Full verbatim transcript of the session",
                    icon: FileText,
                    checked: sendTranscript,
                    onChange: setSendTranscript,
                  },
                  {
                    id: "summary",
                    label: "Translated Summary",
                    description: "AI-generated summary with key points",
                    icon: Sparkles,
                    checked: sendSummary,
                    onChange: setSendSummary,
                  },
                ] as const).map(({ id, label, description, icon: Icon, checked, onChange }) => (
                  <label
                    key={id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all",
                      checked
                        ? "border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-btn-outline-hover)]"
                        : "border-[color:var(--mofa-border-default)] bg-white hover:border-[color:var(--mofa-border-default)] hover:bg-[color:var(--mofa-btn-outline-hover)]"
                    )}
                  >
                    {/* Icon */}
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--mofa-sidebar-active-bg)]">
                      <Icon size={14} className="text-[color:var(--mofa-accent)]" />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[color:var(--mofa-text-body)]">{label}</p>
                      <p className="text-[11px] text-[color:var(--mofa-text-placeholder)]">{description}</p>
                    </div>

                    {/* Custom toggle */}
                    <div className="relative shrink-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => onChange(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "flex h-5 w-9 items-center rounded-full transition-colors duration-200",
                          checked ? "bg-[#212121]" : "bg-[#d5d7da]"
                        )}
                      >
                        <div
                          className={cn(
                            "size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
                            checked ? "translate-x-[18px]" : "translate-x-[3px]"
                          )}
                        />
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2.5 rounded-lg border border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-btn-outline-hover)] px-3.5 py-3">
              <Mail size={13} className="mt-px shrink-0 text-[color:var(--mofa-accent)]" />
              <p className="text-[11px] leading-5 text-[color:var(--mofa-text-subtle)]">
                Post-meeting outputs are automatically emailed within{" "}
                <span className="font-semibold text-[color:var(--mofa-text-body)]">30 minutes</span> of session end.
                Guest data is stored only for this meeting's retention period.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-[color:var(--mofa-border-default)] px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-[color:var(--mofa-border-default)] bg-white px-4 text-sm font-semibold text-[color:var(--mofa-text-body)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition hover:bg-[color:var(--mofa-btn-outline-hover)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mofa-accent)]/50 focus-visible:ring-offset-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex h-9 items-center gap-2 rounded-lg bg-[#212121] px-4 text-sm font-semibold text-white transition hover:bg-[#1a1a1a] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending…
                </>
              ) : (
                <>
                  <Mail size={13} />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Guest List (exported) ────────────────────────────────────────────────────

export function GuestList({
  meetingId,
  initialGuests,
  showAddModal: externalShowModal,
  onAddModalClose,
}: {
  meetingId: string;
  initialGuests: Guest[];
  /** Controlled from outside (header button) — when true, opens the Add Guest modal */
  showAddModal?: boolean;
  onAddModalClose?: () => void;
}) {
  const [guests, setGuests] = React.useState<Guest[]>(initialGuests);
  const [revokeTarget, setRevokeTarget] = React.useState<Guest | null>(null);
  const [revokeLoading, setRevokeLoading] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  // Auto-dismiss toast after 4 s
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  function handleAdded(guest: Guest) {
    setGuests((prev) => [...prev, guest]);
    onAddModalClose?.();
    setToast(`Invitation sent to ${guest.email}`);
  }

  async function handleRevoke() {
    if (!revokeTarget) return;
    setRevokeLoading(true);
    await revokeGuest(meetingId, revokeTarget.id);
    setGuests((prev) =>
      prev.map((g) => (g.id === revokeTarget.id ? { ...g, status: "revoked" } : g))
    );
    setToast(`${revokeTarget.name}'s access has been revoked`);
    setRevokeTarget(null);
    setRevokeLoading(false);
  }

  const activeGuests = guests.filter((g) => g.status !== "revoked");
  const revokedGuests = guests.filter((g) => g.status === "revoked");

  return (
    <>
      {/* Bottom toast */}
      <div
        className={cn(
          "pointer-events-none fixed bottom-5 left-1/2 z-[300] -translate-x-1/2 transition-all duration-300",
          toast
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-2 opacity-0"
        )}
      >
        <div className="flex items-center gap-2 rounded-lg border border-[#a8e6c1] bg-[#ecfdf3] px-4 py-2.5 shadow-lg">
          <Check size={13} className="shrink-0 text-[#17b26a]" />
          <span className="text-sm font-medium text-[#067647]">{toast}</span>
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-center gap-2 px-3 pb-1.5 pt-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--mofa-text-muted)]">Guests</p>
        {activeGuests.length > 0 && (
          <span className="rounded-full bg-[color:var(--mofa-sidebar-active-bg)] px-2 py-px text-[10px] font-bold text-[color:var(--mofa-text-secondary)]">
            {activeGuests.length}
          </span>
        )}
      </div>

      {/* Guest rows */}
      {guests.length === 0 ? (
        <div className="px-3 py-3 text-center">
          <p className="text-xs text-[color:var(--mofa-text-placeholder)]">No external guests yet</p>
        </div>
      ) : (
        <div className="flex flex-col px-1">
          {activeGuests.map((g) => (
            <GuestCard key={g.id} guest={g} onRevoke={setRevokeTarget} />
          ))}
          {revokedGuests.length > 0 && (
            <>
              <p className="mt-2 px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--mofa-text-faint)]">
                Revoked
              </p>
              {revokedGuests.map((g) => (
                <GuestCard key={g.id} guest={g} onRevoke={setRevokeTarget} />
              ))}
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {externalShowModal && (
        <AddGuestModal
          meetingId={meetingId}
          onClose={() => onAddModalClose?.()}
          onAdded={handleAdded}
        />
      )}
      {revokeTarget && (
        <RevokeConfirmDialog
          guest={revokeTarget}
          loading={revokeLoading}
          onConfirm={handleRevoke}
          onCancel={() => setRevokeTarget(null)}
        />
      )}
    </>
  );
}
