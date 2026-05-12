"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown, Download, DollarSign, Search, Type, Users } from "lucide-react";
import * as React from "react";

import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { COST_SERIES, USAGE_TABLE, USAGE_BY_MEETINGS_ROWS } from "@/lib/mocks/settings";

type UsageMode = "users" | "meetings";
type RangeKey = "7" | "30" | "90";
type UnitKey = "USD" | "SAR" | "Words";

const RANGE_OPTIONS: Array<{ id: RangeKey; label: string }> = [
  { id: "7", label: "Last 7 days" },
  { id: "30", label: "Last 30 days" },
  { id: "90", label: "Last 90 days" },
];

const UNIT_OPTIONS: Array<{ id: UnitKey; label: string }> = [
  { id: "USD", label: "USD" },
  { id: "SAR", label: "SAR" },
  { id: "Words", label: "Words" },
];

function formatUsd(v: number) {
  return `US$${v.toFixed(2)}`;
}

function formatSar(v: number) {
  return `SAR ${v.toFixed(2)}`;
}

function asNumber(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}


function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[#eeedf5] bg-white p-[21px]">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e7eb] bg-[#f3f3f7]">
          {icon}
        </div>
        <div className="text-sm font-medium leading-[21px] text-[#535862]">
          {label}
        </div>
      </div>
      <div className="text-[32px] font-medium leading-[48px] tracking-[-0.8px] text-[#414651]">
        {value}
      </div>
    </div>
  );
}

function UsageLegend({
  payload,
}: {
  payload?: Array<{ value?: string; color?: string }>;
}) {
  const items = (payload ?? []).filter((p) => p.value);
  const order = ["Transcription (STT)", "Translation (LLM)"];
  items.sort(
    (a, b) => order.indexOf(a.value ?? "") - order.indexOf(b.value ?? ""),
  );

  return (
    <div className="flex w-full items-center justify-center gap-4 pt-2">
      {items.map((it) => (
        <div key={it.value} className="flex items-center gap-2">
          <span
            className="h-[14px] w-[14px] rounded-sm"
            style={{ backgroundColor: it.color ?? "#94a3b8" }}
            aria-hidden="true"
          />
          <span
            className="text-[13px] leading-[19.5px]"
            style={{ color: it.color ?? "#475569" }}
          >
            {it.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function UsageCostsPanel() {
  const [mode, setMode] = React.useState<UsageMode>("users");
  const [range, setRange] = React.useState<RangeKey>("30");
  const [unit, setUnit] = React.useState<UnitKey>("USD");
  const [query, setQuery] = React.useState("");

  const tableRows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return USAGE_TABLE;
    return USAGE_TABLE.filter((r) => r.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center rounded-lg bg-[#f3f3f7] p-1">
          <button
            type="button"
            onClick={() => setMode("users")}
            className={cn(
              "h-[31.5px] rounded-md px-4 text-[13px] font-semibold leading-[19.5px]",
              mode === "users"
                ? "bg-white text-black shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.1)]"
                : "text-[#535862]",
            )}
          >
            Usage by Users
          </button>
          <button
            type="button"
            onClick={() => setMode("meetings")}
            className={cn(
              "h-[31.5px] rounded-md px-4 text-[13px] font-semibold leading-[19.5px]",
              mode === "meetings"
                ? "bg-white text-black shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.1)]"
                : "text-[#535862]",
            )}
          >
            Usage by Meetings
          </button>
        </div>

        <SelectDropdown
          value={range}
          options={RANGE_OPTIONS}
          onChange={setRange}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {mode === "users" ? (
          <>
            <KpiCard
              label="Total API Cost (30 days)"
              value="$789.10"
              icon={
                <DollarSign size={18} className="text-[#414651]" aria-hidden="true" />
              }
            />
            <KpiCard
              label="Avg Cost per User"
              value="$157.82"
              icon={<Users size={18} className="text-[#414651]" aria-hidden="true" />}
            />
            <KpiCard
              label="Total Words Translated"
              value="115.7k"
              icon={<Type size={18} className="text-[#414651]" aria-hidden="true" />}
            />
          </>
        ) : (
          <>
            <KpiCard
              label="Total API Cost (30 days)"
              value="$248.20"
              icon={
                <DollarSign size={18} className="text-[#414651]" aria-hidden="true" />
              }
            />
            <KpiCard
              label="Avg Meeting Cost"
              value="$62.05"
              icon={<Users size={18} className="text-[#414651]" aria-hidden="true" />}
            />
            <KpiCard
              label="Total Words Translated"
              value="47.9k"
              icon={<Type size={18} className="text-[#414651]" aria-hidden="true" />}
            />
          </>
        )}
      </div>

      <div className="rounded-2xl border border-[#eeedf5] bg-white px-[25px] pb-5 pt-[25px]">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[18px] font-semibold leading-7 text-[#414651]">
              Your Usage
            </div>
            <div className="mt-1 text-sm leading-5 text-[#535862]">
              Your cumulative spend per day across this billing period
            </div>
          </div>
          <SelectDropdown
            value={unit}
            options={UNIT_OPTIONS}
            onChange={setUnit}
            className="h-10"
          />
        </div>

        <div className="mt-4 h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={COST_SERIES} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="fillSTT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillLLM" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="#eeedf5" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#535862" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#535862" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => {
                  const n = asNumber(v);
                  if (unit === "Words") return `${Math.round(n * 1000)}`;
                  if (unit === "SAR") return `SAR${n}.00`;
                  return `US$${n}.00`;
                }}
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(v, name) => {
                  const n = asNumber(v);
                  if (unit === "Words") return [`${Math.round(n * 1000)}`, String(name ?? "")];
                  if (unit === "SAR") return [formatSar(n), String(name ?? "")];
                  return [formatUsd(n), String(name ?? "")];
                }}
                contentStyle={{ borderRadius: 8, border: "1px solid #eeedf5" }}
              />
              <Legend content={<UsageLegend />} />

              <Area
                type="monotone"
                dataKey="stt"
                name="Transcription (STT)"
                stackId="1"
                stroke="#0d9488"
                fill="url(#fillSTT)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="llm"
                name="Translation (LLM)"
                stackId="1"
                stroke="#6366f1"
                fill="url(#fillLLM)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {mode === "users" ? (
        <>
          <div className="flex items-center justify-between">
            <div className="relative w-[300px]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by user..."
                className="h-10 w-full rounded-lg border border-[#eeedf5] bg-white pl-9 pr-3 text-sm text-[#414651] shadow-[0_1px_2px_rgba(10,13,18,0.05)] placeholder:text-[rgba(65,70,81,0.5)] focus:outline-none"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#414651]"
                aria-hidden="true"
              />
            </div>

            <Button variant="secondary">
              <Download size={16} aria-hidden="true" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#eeedf5] bg-white">
            <div className="grid grid-cols-[1fr_180px_180px_180px_180px] border-b border-[#e5e7eb] bg-[#fdfcfc] py-[15px] text-sm font-medium text-[#535862]">
              <div className="px-6">User Name</div>
              <div className="px-6">Meetings Attended</div>
              <div className="px-6">Words Translated</div>
              <div className="px-6">Avg per Meeting</div>
              <div className="px-6 text-right">Total API Cost</div>
            </div>

            {tableRows.map((r, idx) => {
              const isLast = idx === tableRows.length - 1;
              return (
                <div
                  key={r.name}
                  className={cn(
                    "grid grid-cols-[1fr_180px_180px_180px_180px] items-center py-4",
                    !isLast && "border-b border-[#eeedf5]",
                  )}
                >
                  <div className="px-6 text-sm font-semibold text-[#414651]">
                    {r.name}
                  </div>
                  <div className="px-6 text-sm text-[#535862]">{r.meetings}</div>
                  <div className="px-6 text-sm text-[#535862]">
                    {r.words.toLocaleString()}
                  </div>
                  <div className="px-6 text-sm text-[#535862]">
                    {formatUsd(r.avg)}
                  </div>
                  <div className="px-6 text-right text-sm font-semibold text-[#414651]">
                    {formatUsd(r.cost)}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="relative w-[300px]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by meeting name or host..."
                className="h-10 w-full rounded-lg border border-[#eeedf5] bg-white pl-9 pr-3 text-sm text-[#414651] shadow-[0_1px_2px_rgba(10,13,18,0.05)] placeholder:text-[rgba(65,70,81,0.5)] focus:outline-none"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#414651]"
                aria-hidden="true"
              />
            </div>

            <Button variant="secondary">
              <Download size={16} aria-hidden="true" />
              Export CSV
            </Button>
          </div>

          <UsageByMeetingsTable query={query} />
        </>
      )}
    </div>
  );
}

function UsageByMeetingsTable({ query }: { query: string }) {
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return USAGE_BY_MEETINGS_ROWS;
    return USAGE_BY_MEETINGS_ROWS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.host.toLowerCase().includes(q) ||
        r.date.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-[#eeedf5] bg-white">
      <div className="w-full min-w-0 overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[1fr_180px_140px_130px_120px_120px] border-b border-[#e5e7eb] bg-[#fdfcfc] py-[15px] text-sm font-medium text-[#535862]">
            <div className="px-6">Meeting Name</div>
            <div className="px-6">Host</div>
            <div className="px-6">Date</div>
            <div className="px-6">Participants</div>
            <div className="px-6">Words</div>
            <div className="px-6 text-right">Total Cost</div>
          </div>
          {filtered.map((r, idx) => {
            const isLast = idx === filtered.length - 1;
            return (
              <div
                key={`${r.name}-${r.date}`}
                className={cn(
                  "grid grid-cols-[1fr_180px_140px_130px_120px_120px] items-center py-4",
                  !isLast && "border-b border-[#eeedf5]",
                )}
              >
                <div className="flex min-w-0 items-center gap-3 px-6">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#f3f3f7] text-[#6e6b8b]">
                    <span className="text-[12px] font-semibold">⟡</span>
                  </div>
                  <div className="min-w-0 truncate text-sm font-semibold text-[#414651]">
                    {r.name}
                  </div>
                </div>
                <div className="px-6 text-sm text-[#535862]">{r.host}</div>
                <div className="px-6 text-sm text-[#535862]">{r.date}</div>
                <div className="px-6 text-sm text-[#535862]">{r.participants}</div>
                <div className="px-6 text-sm text-[#535862]">
                  {r.words.toLocaleString()}
                </div>
                <div className="px-6 text-right text-sm font-semibold text-[#414651]">
                  ${r.cost.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

