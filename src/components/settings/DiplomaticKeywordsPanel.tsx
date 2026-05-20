"use client";

import * as React from "react";
import { CheckCircle2, CircleDashed, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type AiStatus = "not_started" | "processing" | "keyword_processed";

type Keyword = {
  id: string;
  keyword: string;
  translation: string;
  enabled: boolean;
  aiStatus: AiStatus;
};

// ─── AI Status config ─────────────────────────────────────────────────────────

const AI_STATUS_CONFIG: Record<
  AiStatus,
  { label: string; dot: string; bg: string; text: string; border: string; pulse?: boolean }
> = {
  not_started:       { label: "Not Started",       dot: "var(--mofa-text-muted)", bg: "#e9eaeb", text: "var(--mofa-text-subtle)", border: "#d5d7da" },
  processing:        { label: "Processing",        dot: "#4462c8", bg: "#eff4ff", text: "#3145a0", border: "#c3cff5", pulse: true },
  keyword_processed: { label: "Keyword Processed", dot: "#17b26a", bg: "#ecfdf3", text: "#067647", border: "#a8e6c1" },
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_KEYWORDS: Keyword[] = [
  { id: "k1",  keyword: "Diplomatic Immunity",          translation: "الحصانة الدبلوماسية",         enabled: true,  aiStatus: "keyword_processed" },
  { id: "k2",  keyword: "Bilateral Agreement",          translation: "اتفاقية ثنائية",               enabled: true,  aiStatus: "keyword_processed" },
  { id: "k3",  keyword: "Memorandum of Understanding",  translation: "مذكرة تفاهم",                  enabled: true,  aiStatus: "keyword_processed" },
  { id: "k4",  keyword: "Ambassador Plenipotentiary",   translation: "سفير فوق العادة",              enabled: true,  aiStatus: "processing"        },
  { id: "k5",  keyword: "Consular Affairs",             translation: "الشؤون القنصلية",              enabled: true,  aiStatus: "keyword_processed" },
  { id: "k6",  keyword: "Protocol Officer",             translation: "مسؤول البروتوكول",             enabled: false, aiStatus: "not_started"       },
  { id: "k7",  keyword: "State Visit",                  translation: "زيارة دولة",                   enabled: true,  aiStatus: "keyword_processed" },
  { id: "k8",  keyword: "GCC Summit",                   translation: "قمة مجلس التعاون الخليجي",    enabled: true,  aiStatus: "processing"        },
  { id: "k9",  keyword: "Foreign Affairs Ministry",     translation: "وزارة الخارجية",               enabled: true,  aiStatus: "keyword_processed" },
  { id: "k10", keyword: "Cease-fire Agreement",         translation: "اتفاقية وقف إطلاق النار",     enabled: false, aiStatus: "not_started"       },
  { id: "k11", keyword: "Extradition Treaty",           translation: "معاهدة تسليم المجرمين",        enabled: false, aiStatus: "not_started"       },
  { id: "k12", keyword: "Diplomatic Cable",             translation: "برقية دبلوماسية",              enabled: true,  aiStatus: "keyword_processed" },
  { id: "k13", keyword: "Head of Mission",              translation: "رئيس البعثة الدبلوماسية",     enabled: true,  aiStatus: "processing"        },
  { id: "k14", keyword: "Persona Non Grata",            translation: "شخص غير مرغوب فيه",           enabled: true,  aiStatus: "keyword_processed" },
  { id: "k15", keyword: "Diplomatic Note",              translation: "مذكرة دبلوماسية",              enabled: false, aiStatus: "not_started"       },
];

// ─── AI Status Badge ──────────────────────────────────────────────────────────

function AiStatusBadge({ status }: { status: AiStatus }) {
  const cfg = AI_STATUS_CONFIG[status] ?? AI_STATUS_CONFIG["not_started"];
  const Icon =
    status === "keyword_processed" ? CheckCircle2 :
    status === "processing"        ? Loader2 :
                                     CircleDashed;

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1"
      style={{ backgroundColor: cfg.bg }}
    >
      <Icon
        size={11}
        className={cn("shrink-0", status === "processing" && "animate-spin")}
        style={{ color: cfg.dot }}
      />
      <span className="text-[11px] font-medium leading-none" style={{ color: cfg.text }}>
        {cfg.label}
      </span>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function DiplomaticKeywordsPanel() {
  const [keywords, setKeywords] = React.useState<Keyword[]>(SEED_KEYWORDS);
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return keywords;
    return keywords.filter(
      (k) => k.keyword.toLowerCase().includes(q) || k.translation.includes(q),
    );
  }, [keywords, search]);

  const enabledCount = keywords.filter((k) => k.enabled).length;
  const processedCount = keywords.filter((k) => k.aiStatus === "keyword_processed").length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header card */}
      <div className="rounded-2xl border border-[color:var(--mofa-border-default)] bg-white p-6">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">Diplomatic Keywords</h2>
          <p className="mt-0.5 text-sm text-[color:var(--mofa-text-muted)]">
            Manage specialised terms used during live translation. Enabled keywords are prioritised by the translation engine.
          </p>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex items-center gap-4 rounded-xl bg-[color:var(--mofa-btn-outline-hover)] px-4 py-3">
          <div className="text-sm text-[color:var(--mofa-text-muted)]">
            <span className="font-semibold text-[color:var(--mofa-text-body)]">{keywords.length}</span> total keywords
          </div>
          <div className="h-3.5 w-px bg-[color:var(--mofa-sidebar-divider)]" />
          <div className="text-sm text-[color:var(--mofa-text-muted)]">
            <span className="font-semibold text-[#17b26a]">{enabledCount}</span> enabled
          </div>
          <div className="h-3.5 w-px bg-[color:var(--mofa-sidebar-divider)]" />
          <div className="text-sm text-[color:var(--mofa-text-muted)]">
            <span className="font-semibold text-[color:var(--mofa-text-muted)]">{keywords.length - enabledCount}</span> disabled
          </div>
          <div className="h-3.5 w-px bg-[color:var(--mofa-sidebar-divider)]" />
          <div className="text-sm text-[color:var(--mofa-text-muted)]">
            <span className="font-semibold text-[#17b26a]">{processedCount}</span> keyword processed
          </div>
        </div>
      </div>

      {/* List card */}
      <div className="overflow-hidden rounded-2xl border border-[color:var(--mofa-border-default)] bg-white">

        {/* Search */}
        <div className="px-5 py-3 border-b border-[color:var(--mofa-border-default)]">
          <div className="relative">
            <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--mofa-text-muted)]" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search keywords"
              placeholder="Search keywords…"
              className="h-9 w-full rounded-lg border border-[color:var(--mofa-border-default)] bg-white pl-8 pr-3 text-sm text-[color:var(--mofa-text-body)] outline-none placeholder:text-[color:var(--mofa-text-placeholder)] transition focus:border-[color:var(--mofa-accent)]/40 focus:ring-2 focus:ring-[#6f6e8a]/15"
            />
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[2fr_168px_64px] border-b border-[color:var(--mofa-border-default)] bg-[#fafafa] px-5 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--mofa-text-faint)]">Keyword (EN)</span>
          <span className="text-center text-[11px] font-semibold uppercase tracking-wider text-[color:var(--mofa-text-faint)]">Model Processing</span>
          <span className="text-center text-[11px] font-semibold uppercase tracking-wider text-[color:var(--mofa-text-faint)]">Status</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-[color:var(--mofa-text-faint)]">
            No keywords match your search.
          </div>
        ) : (
          <ul className="divide-y divide-[#f7f7f9]">
            {filtered.map((kw) => (
              <li
                key={kw.id}
                className={cn(
                  "grid grid-cols-[2fr_168px_64px] items-center px-5 py-3 transition-colors hover:bg-[color:var(--mofa-btn-outline-hover)]",
                  !kw.enabled && "opacity-50",
                )}
              >
                {/* EN Keyword */}
                <span className="truncate pr-4 text-sm font-medium text-[#2d2d3a]">
                  {kw.keyword}
                </span>

                {/* Model Processing badge */}
                <div className="flex justify-center">
                  <AiStatusBadge status={kw.aiStatus} />
                </div>

                {/* Status — read-only toggle */}
                <div className="flex justify-center">
                  <div
                    aria-disabled="true"
                    className={cn(
                      "relative inline-flex h-[18px] w-8 shrink-0 cursor-not-allowed items-center rounded-full transition-colors",
                      kw.enabled ? "bg-[color:var(--mofa-accent)]/50" : "bg-[#d5d7da]/60",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform",
                        kw.enabled ? "translate-x-[18px]" : "translate-x-[3px]",
                      )}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
