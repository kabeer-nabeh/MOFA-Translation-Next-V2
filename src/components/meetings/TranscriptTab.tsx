"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import type { TranscriptEntry } from "@/components/meetings/meeting-detail-data";
import { cn } from "@/lib/utils";

// ─── Language badge config ────────────────────────────────────────────────────

const LANGUAGE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  EN: { label: "EN", bg: "#e8f0fa", text: "#4a72a8" },
  ES: { label: "ES", bg: "var(--mofa-accent-muted)", text: "var(--mofa-accent-dark)" },
  JA: { label: "JA", bg: "#e8fae8", text: "#3f6f3f" },
  KO: { label: "KO", bg: "#fae8e8", text: "#8b3a3a" },
  ZH: { label: "ZH", bg: "#f5e8fa", text: "#6b4a7f" },
  TL: { label: "TL", bg: "#fae8f0", text: "#7f4a5f" },
  PT: { label: "PT", bg: "#e8f5fa", text: "#3a6b7f" },
  FR: { label: "FR", bg: "#faf5e8", text: "#7f6b3a" },
};

function getLanguageConfig(lang?: string) {
  return LANGUAGE_CONFIG[lang || "EN"] || LANGUAGE_CONFIG["EN"];
}

// ─── Text helpers ─────────────────────────────────────────────────────────────

const DIPLOMATIC_TERMS_AR = [
  "الحصانة الدبلوماسية",
  "اتفاقية ثنائية",
  "مذكرة تفاهم",
  "الشؤون القنصلية",
  "زيارة دولة",
  "وزارة الخارجية",
  "سفير فوق العادة",
  "برقية دبلوماسية",
  "شخص غير مرغوب فيه",
];

function highlightDiplomaticTerms(text: string): React.ReactNode {
  if (!text) return text;
  const escaped = DIPLOMATIC_TERMS_AR.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "g");
  const parts = text.split(pattern);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    DIPLOMATIC_TERMS_AR.includes(part) ? (
      <span key={i} className="group/kw relative inline-block">
        <mark className="rounded-sm px-1 py-0.5 font-bold not-italic cursor-default bg-[color:var(--mofa-accent-muted)] text-[color:var(--mofa-accent-dark)] ring-1 ring-inset ring-[color:var(--mofa-accent-light)]">
          {part}
        </mark>
        <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#181d27] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/kw:opacity-100">
          Diplomatic Keyword
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#181d27]" />
        </span>
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

export function countUnclearMarkers(text: string): number {
  return (text.match(/\[unclear\]/gi) ?? []).length;
}

export function stripUnclearMarkers(text: string): string {
  return text.replace(/\[unclear\]/gi, "· · ·");
}

// ─── Unclear placeholder (clickable → editable inline) ───────────────────────

function UnclearPlaceholder({ isRtl }: { isRtl?: boolean }) {
  const [editing, setEditing] = React.useState(false);
  const [filled, setFilled] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const commit = () => setEditing(false);

  React.useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (filled && !editing) {
    return (
      <span
        className="group/filled relative inline-block cursor-pointer"
        onClick={() => setEditing(true)}
        title="Click to edit"
      >
        <span
          className="rounded-sm px-1 py-0.5 text-sm font-medium"
          style={{ backgroundColor: "#d1fae5", color: "#065f46", boxShadow: "inset 0 0 0 1px #a7f3d0" }}
        >
          {filled}
        </span>
      </span>
    );
  }

  if (editing) {
    return (
      <span className="relative inline-block align-baseline">
        <input
          ref={inputRef}
          dir={isRtl ? "rtl" : "ltr"}
          type="text"
          value={filled}
          onChange={(e) => setFilled(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); commit(); }
            if (e.key === "Escape") { setFilled(""); setEditing(false); }
          }}
          placeholder="type word…"
          className="inline-block w-28 rounded-md border border-[#fbbf24] bg-[#fffbeb] px-2 py-0.5 text-sm text-[#92400e] outline-none placeholder:text-[#d97706]/60 focus:ring-2 focus:ring-[#fbbf24]/40"
          style={{ verticalAlign: "baseline" }}
        />
      </span>
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to fill unclear word"
      className="group/unclear relative inline-block cursor-text select-none"
    >
      <span
        className="rounded-sm px-2 py-0.5 text-xs font-semibold tracking-widest transition-colors duration-100 group-hover/unclear:bg-[#fef3c7]"
        style={{ color: "#d97706", border: "1.5px dashed #fbbf24", backgroundColor: "#fffbeb" }}
      >
        · · ·
      </span>
    </span>
  );
}

export function renderWithUnclearPlaceholders(
  text: string,
  options?: { isRtl?: boolean; highlightKeywords?: boolean },
): React.ReactNode {
  const parts = text.split(/(\[unclear\])/gi);
  if (parts.length === 1) {
    return options?.highlightKeywords ? highlightDiplomaticTerms(text) : text;
  }
  return parts.map((part, i) => {
    if (/^\[unclear\]$/i.test(part)) {
      return <UnclearPlaceholder key={i} isRtl={options?.isRtl} />;
    }
    const content = options?.highlightKeywords ? highlightDiplomaticTerms(part) : part;
    return <React.Fragment key={i}>{content}</React.Fragment>;
  });
}

// ─── Highlighted search text ──────────────────────────────────────────────────

function HighlightedText({ text, query }: { text: string; query: string }) {
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="rounded bg-[#fef3c7] px-0.5 text-[color:var(--mofa-text-body)]">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// ─── Transcript Tab ───────────────────────────────────────────────────────────

export function TranscriptTab({
  entries,
  search,
}: {
  entries: TranscriptEntry[];
  search: string;
}) {
  const filtered = React.useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) => e.text.toLowerCase().includes(q) || e.speakerName.toLowerCase().includes(q),
    );
  }, [entries, search]);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-btn-outline-hover)] py-16 text-center">
        <p className="text-sm font-medium text-[color:var(--mofa-text-body)]">No results found</p>
        <p className="mt-1 text-sm text-[color:var(--mofa-text-muted)]">Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {filtered.map((entry, idx) => {
        const prevSpeaker = idx > 0 ? filtered[idx - 1]?.speakerId : null;
        const showHeader = entry.speakerId !== prevSpeaker;
        const arUnclearCount = entry.arabicTranslation ? countUnclearMarkers(entry.arabicTranslation) : 0;
        const totalUnclear = arUnclearCount;
        const hasUnclear = totalUnclear > 0;
        return (
          <div key={entry.id} className={cn(showHeader && idx > 0 && "mt-5")}>
            {showHeader && (
              <div className="mb-2 flex items-center gap-2">
                <div
                  className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-[color:var(--mofa-text-body)]"
                  style={{ backgroundColor: entry.speakerBg }}
                >
                  {entry.speakerInitials}
                </div>
                <span className="text-xs font-semibold text-[color:var(--mofa-text-body)]">{entry.speakerName}</span>
                <span className="text-[11px] tabular-nums text-[color:var(--mofa-text-faint)]">{entry.timestamp}</span>
                {hasUnclear && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#fde68a] bg-[#fffbeb] px-2 py-0.5 text-[10px] font-semibold text-[#b45309]">
                    <AlertTriangle size={9} className="shrink-0" aria-hidden />
                    {totalUnclear} word{totalUnclear > 1 ? "s" : ""} unclear
                  </span>
                )}
              </div>
            )}

            <div className={cn("ml-8 overflow-hidden rounded-xl border bg-white", hasUnclear ? "border-[#fde68a]" : "border-[color:var(--mofa-border-default)]")}>
              {(() => {
                const langConfig = getLanguageConfig(entry.language);
                return (
                  <div className="flex items-start gap-2.5 px-4 py-3">
                    <span
                      className="mt-[3px] shrink-0 rounded-[4px] px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wide"
                      style={{ backgroundColor: langConfig.bg, color: langConfig.text }}
                    >
                      {langConfig.label}
                    </span>
                    <p className="flex-1 text-sm leading-6 text-[color:var(--mofa-text-body)]">
                      {search.trim() ? <HighlightedText text={entry.text} query={search} /> : entry.text}
                    </p>
                  </div>
                );
              })()}
              {entry.arabicTranslation && (
                <div className="flex items-start gap-2.5 border-t border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-btn-outline-hover)] px-4 py-3">
                  <span className="mt-[3px] shrink-0 rounded-[4px] bg-[color:var(--mofa-accent-muted)] px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wide text-[color:var(--mofa-accent-dark)]">
                    AR
                  </span>
                  <p
                    dir="rtl"
                    className="flex-1 text-sm leading-7 text-[color:var(--mofa-text-subtle)]"
                    style={{ fontFamily: "var(--font-ibm-plex-sans-arabic, var(--font-ibm-plex-sans))" }}
                  >
                    {renderWithUnclearPlaceholders(entry.arabicTranslation, { isRtl: true, highlightKeywords: true })}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
