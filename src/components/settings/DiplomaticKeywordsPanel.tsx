"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Keyword = {
  id: string;
  keyword: string;
  translation: string;
  enabled: boolean;
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_KEYWORDS: Keyword[] = [
  { id: "k1",  keyword: "Diplomatic Immunity",          translation: "الحصانة الدبلوماسية",         enabled: true  },
  { id: "k2",  keyword: "Bilateral Agreement",          translation: "اتفاقية ثنائية",               enabled: true  },
  { id: "k3",  keyword: "Memorandum of Understanding",  translation: "مذكرة تفاهم",                  enabled: true  },
  { id: "k4",  keyword: "Ambassador Plenipotentiary",   translation: "سفير فوق العادة",              enabled: true  },
  { id: "k5",  keyword: "Consular Affairs",             translation: "الشؤون القنصلية",              enabled: true  },
  { id: "k6",  keyword: "Protocol Officer",             translation: "مسؤول البروتوكول",             enabled: false },
  { id: "k7",  keyword: "State Visit",                  translation: "زيارة دولة",                   enabled: true  },
  { id: "k8",  keyword: "GCC Summit",                   translation: "قمة مجلس التعاون الخليجي",    enabled: true  },
  { id: "k9",  keyword: "Foreign Affairs Ministry",     translation: "وزارة الخارجية",               enabled: true  },
  { id: "k10", keyword: "Cease-fire Agreement",         translation: "اتفاقية وقف إطلاق النار",     enabled: false },
  { id: "k11", keyword: "Extradition Treaty",           translation: "معاهدة تسليم المجرمين",        enabled: false },
  { id: "k12", keyword: "Diplomatic Cable",             translation: "برقية دبلوماسية",              enabled: true  },
  { id: "k13", keyword: "Head of Mission",              translation: "رئيس البعثة الدبلوماسية",     enabled: true  },
  { id: "k14", keyword: "Persona Non Grata",            translation: "شخص غير مرغوب فيه",           enabled: true  },
  { id: "k15", keyword: "Diplomatic Note",              translation: "مذكرة دبلوماسية",              enabled: false },
];

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#48476e]/30",
        checked ? "bg-[#48476e]" : "bg-[#d5d7da]",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm ring-0 transition-transform",
          checked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
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
      (k) =>
        k.keyword.toLowerCase().includes(q) ||
        k.translation.includes(q),
    );
  }, [keywords, search]);

  const enabledCount = keywords.filter((k) => k.enabled).length;

  const toggle = (id: string) => {
    setKeywords((prev) =>
      prev.map((k) => (k.id === id ? { ...k, enabled: !k.enabled } : k)),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-2xl border border-[#e9eaeb] bg-white p-6">
        <h2 className="text-base font-semibold text-[#111827]">Diplomatic Keywords</h2>
        <p className="mt-0.5 text-sm text-[#717680]">
          Manage specialised terms used during live translation. Enabled keywords are prioritised by the translation engine.
        </p>

        {/* Stats row */}
        <div className="mt-4 flex items-center gap-4 rounded-xl bg-[#f8f8fb] px-4 py-3">
          <div className="text-sm text-[#717680]">
            <span className="font-semibold text-[#414651]">{keywords.length}</span> total keywords
          </div>
          <div className="h-3.5 w-px bg-[#e0dde8]" />
          <div className="text-sm text-[#717680]">
            <span className="font-semibold text-[#414651]">{enabledCount}</span> enabled
          </div>
          <div className="h-3.5 w-px bg-[#e0dde8]" />
          <div className="text-sm text-[#717680]">
            <span className="font-semibold text-[#414651]">{keywords.length - enabledCount}</span> disabled
          </div>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-[#e9eaeb] bg-white overflow-hidden">
        {/* Search bar */}
        <div className="border-b border-[#f0eff6] px-4 py-3">
          <div className="relative">
            <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b3bb]" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keywords…"
              className="h-8 w-full rounded-lg border border-[#e9eaeb] bg-[#fafafa] pl-8 pr-3 text-sm text-[#414651] outline-none placeholder:text-[#b0b3bb] focus:border-[#c5c3d8] focus:ring-2 focus:ring-[#6f6e8a]/20"
            />
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_1fr_80px] border-b border-[#f0eff6] bg-[#fafafa] px-5 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9a9aaf]">Keyword (EN)</span>
          <span className="text-right text-xs font-semibold uppercase tracking-wider text-[#9a9aaf]">Translation (AR)</span>
          <span className="text-right text-xs font-semibold uppercase tracking-wider text-[#9a9aaf]">Status</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[#b0b3bb]">
            No keywords match your search.
          </div>
        ) : (
          <ul className="divide-y divide-[#f0eff6]">
            {filtered.map((kw) => (
              <li
                key={kw.id}
                className={cn(
                  "grid grid-cols-[1fr_1fr_80px] items-center px-5 py-3.5 transition-colors",
                  !kw.enabled && "opacity-50",
                )}
              >
                <span className="text-sm font-medium text-[#414651]">{kw.keyword}</span>
                <span
                  dir="rtl"
                  className="text-right text-sm text-[#535862]"
                  style={{ fontFamily: "var(--font-ibm-plex-sans-arabic, var(--font-ibm-plex-sans))" }}
                >
                  {kw.translation}
                </span>
                <div className="flex justify-end">
                  <Toggle checked={kw.enabled} onChange={() => toggle(kw.id)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
