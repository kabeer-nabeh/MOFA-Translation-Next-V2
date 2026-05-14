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
  left:    { label: "Left",                dot: "#717680", text: "#717680" },
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
        className="w-full max-w-sm rounded-2xl border border-[#e9eaeb] bg-white p-6 shadow-[0_20px_40px_rgba(0,0,0,0.12)] animate-[fadeSlideIn_0.2s_ease-out]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-[#fff1f0]">
          <UserX size={18} className="text-[#f04438]" />
        </div>
        <h2 className="text-base font-semibold text-[#181d27]">
          Revoke {guest.name}'s access?
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-[#535862]">
          Their session link will be immediately invalidated. They will be unable to join or
          rejoin this meeting.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 flex-1 items-center justify-center rounded-lg border border-[#d5d7da] bg-white text-sm font-semibold text-[#414651] transition hover:bg-[#f8f8fb]"
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
      className="relative flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#f8f8fb]"
    >
      {/* Avatar */}
      <div
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-[#414651]"
        style={{ backgroundColor: guest.bg }}
      >
        {guest.initials}
      </div>

      {/* Name + status */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs font-semibold text-[#414651]">{guest.name}</span>
          <span className="shrink-0 rounded-full border border-[#c8c7d8] bg-[#f3f3f7] px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-[#545469]">
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
          "flex size-6 shrink-0 items-center justify-center rounded-full text-[#9fa3ae] transition hover:bg-[#f0f0f4] hover:text-[#535862]",
          showInfo && "bg-[#f0f0f4] text-[#535862]",
        )}
      >
        <Info size={13} />
      </button>

      {/* Detail popover */}
      {showInfo && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl border border-[#e9eaeb] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.1)] animate-[fadeSlideIn_0.15s_ease-out]"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-0 divide-y divide-[#f0f0f4]">
            {/* Info block */}
            <div className="flex flex-col gap-0.5 px-3.5 py-3">
              <p className="text-[11px] font-semibold text-[#414651]">{guest.affiliation}</p>
              <p className="text-[11px] text-[#717680]">{guest.email}</p>
              {(guest.outputs.sendTranscript || guest.outputs.sendSummary) && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {guest.outputs.sendTranscript && (
                    <span className="rounded-full border border-[#e0dde8] bg-[#f8f8fb] px-2 py-0.5 text-[10px] text-[#545469]">
                      📄 Transcript
                    </span>
                  )}
                  {guest.outputs.sendSummary && (
                    <span className="rounded-full border border-[#e0dde8] bg-[#f8f8fb] px-2 py-0.5 text-[10px] text-[#545469]">
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
      "h-9 w-full rounded-lg border px-3 text-sm text-[#414651] outline-none placeholder:text-[#9fa3ae] transition focus:ring-2 focus:ring-[#6f6e8a]/30",
      hasError
        ? "border-[#f04438] bg-[#fff8f7]"
        : "border-[#d5d7da] bg-white hover:border-[#9fa3ae]"
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
        className="w-full max-w-md rounded-2xl border border-[#e9eaeb] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.12)] animate-[fadeSlideIn_0.2s_ease-out]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#f0f0f4] px-5 py-4">
          <div>
            <h2 id="add-guest-title" className="text-base font-semibold text-[#181d27]">
              Add External Guest
            </h2>
            <p className="mt-0.5 text-xs text-[#717680]">
              Guest receives a one-time access link scoped to this session only
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-[#717680] transition hover:bg-[#f3f3f7]"
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
              <label className="text-xs font-semibold text-[#414651]">
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
              <label className="text-xs font-semibold text-[#414651]">
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
              <label className="text-xs font-semibold text-[#414651]">
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
              <p className="text-xs font-semibold text-[#414651]">Post-Meeting Outputs</p>
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
                        ? "border-[#e0dde8] bg-[#f8f8fb]"
                        : "border-[#f0f0f4] bg-white hover:border-[#e0dde8] hover:bg-[#fafafa]"
                    )}
                  >
                    {/* Icon */}
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#eeedf5]">
                      <Icon size={14} className="text-[#48476e]" />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#414651]">{label}</p>
                      <p className="text-[11px] text-[#9fa3ae]">{description}</p>
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
                          checked ? "bg-[#48476e]" : "bg-[#d5d7da]"
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
            <div className="flex items-start gap-2.5 rounded-lg border border-[#e0dde8] bg-[#f8f8fb] px-3.5 py-3">
              <Mail size={13} className="mt-px shrink-0 text-[#48476e]" />
              <p className="text-[11px] leading-5 text-[#535862]">
                Post-meeting outputs are automatically emailed within{" "}
                <span className="font-semibold text-[#414651]">30 minutes</span> of session end.
                Guest data is stored only for this meeting's retention period.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-[#f0f0f4] px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-[#d5d7da] bg-white px-4 text-sm font-semibold text-[#414651] transition hover:bg-[#f8f8fb]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex h-9 items-center gap-2 rounded-lg bg-[#48476e] px-4 text-sm font-semibold text-white transition hover:bg-[#3f3e63] disabled:opacity-60"
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
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#717680]">Guests</p>
        {activeGuests.length > 0 && (
          <span className="rounded-full bg-[#f3f3f7] px-2 py-px text-[10px] font-bold text-[#545469]">
            {activeGuests.length}
          </span>
        )}
      </div>

      {/* Guest rows */}
      {guests.length === 0 ? (
        <div className="px-3 py-3 text-center">
          <p className="text-xs text-[#9fa3ae]">No external guests yet</p>
        </div>
      ) : (
        <div className="flex flex-col px-1">
          {activeGuests.map((g) => (
            <GuestCard key={g.id} guest={g} onRevoke={setRevokeTarget} />
          ))}
          {revokedGuests.length > 0 && (
            <>
              <p className="mt-2 px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[#c1c4cd]">
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
