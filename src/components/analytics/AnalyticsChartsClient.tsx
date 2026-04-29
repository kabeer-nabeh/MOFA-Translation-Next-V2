"use client";

import * as React from "react";
import { Activity, BarChart3, Languages, Type } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { UsageByUserTypeCard } from "@/components/analytics/UsageByUserTypeCard";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

import {
  getKpis,
  LANGUAGE_SHARE,
  LATENCY_SERIES,
  SESSION_TRENDS,
  WORDS_OVER_TIME,
  type DateRangeKey,
  type LanguageFilter,
} from "@/components/analytics/analytics-data";

function asNumber(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

const LANGUAGE_OPTIONS: { id: LanguageFilter; label: string }[] = [
  { id: "all", label: "All Language" },
  { id: "Arabic", label: "Arabic" },
  { id: "English", label: "English" },
  { id: "French", label: "French" },
  { id: "Urdu", label: "Urdu" },
  { id: "Spanish", label: "Spanish" },
  { id: "German", label: "German" },
];

const RANGE_OPTIONS: { id: DateRangeKey; label: string }[] = [
  { id: "7", label: "Last 7 days" },
  { id: "30", label: "Last 30 days" },
];


export function AnalyticsChartsClient() {
  const [mounted, setMounted] = React.useState(false);
  const [range, setRange] = React.useState<DateRangeKey>("7");
  const [language, setLanguage] = React.useState<LanguageFilter>("all");

  React.useEffect(() => setMounted(true), []);

  const kpis = React.useMemo(() => getKpis(range), [range]);

  const languageBars = React.useMemo(() => {
    if (language === "all") return LANGUAGE_SHARE;
    const row = LANGUAGE_SHARE.find((l) => l.name === language);
    return row ? [row] : LANGUAGE_SHARE;
  }, [language]);

  const wordsData = WORDS_OVER_TIME[range];
  const sessionData = SESSION_TRENDS[range];

  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="flex h-10 items-center justify-between gap-4">
        <h1 className="text-2xl font-medium tracking-tight text-black">
          Analytics Overview
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <SelectDropdown
            value={language}
            options={LANGUAGE_OPTIONS}
            onChange={(val) => setLanguage(val as LanguageFilter)}
            align="right"
          />

          <SelectDropdown
            value={range}
            options={RANGE_OPTIONS}
            onChange={(val) => setRange(val as DateRangeKey)}
            align="right"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-[#eeedf5] rounded-2xl border border-[#e9eaeb] bg-white sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        <KpiCell
          primary={kpis.active.value}
          secondary={kpis.active.plus}
          hint={kpis.hints.active}
          icon={Activity}
          secondaryStyle="plus"
        />
        <KpiCell
          primary={kpis.total.value}
          secondary={kpis.total.unit}
          hint={kpis.hints.total}
          icon={BarChart3}
        />
        <KpiCell
          primary={kpis.words.value}
          secondary={kpis.words.unit}
          hint={kpis.hints.words}
          icon={Type}
        />
        <KpiCell
          primary={kpis.avg.value}
          secondary={kpis.avg.unit}
          hint={kpis.hints.avg}
          icon={Languages}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
        <ChartShell
          title="Most Used Languages"
          icon={Languages}
          className="min-h-[360px]"
        >
          {mounted ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                layout="vertical"
                data={languageBars}
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 50]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`${asNumber(value)}%`, "Share"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Bar dataKey="pct" radius={[0, 6, 6, 0]} maxBarSize={18}>
                  {languageBars.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartPlaceholder />
          )}
        </ChartShell>

        <ChartShell
          title="Words Translated Over Time"
          icon={Type}
          className="min-h-[360px]"
        >
          {mounted ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={wordsData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="wordsFillAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#48476e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#48476e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v) => `${v / 1000}K`}
                  domain={[0, "auto"]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(v) => [`${(asNumber(v) / 1000).toFixed(1)}K`, "Words"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Area
                  type="monotone"
                  dataKey="words"
                  stroke="#48476e"
                  strokeWidth={2}
                  fill="url(#wordsFillAnalytics)"
                  dot={{ r: 3, fill: "#48476e" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ChartPlaceholder />
          )}
        </ChartShell>
      </div>

      <ChartShell title="Translation Latency" icon={Activity} className="min-h-[340px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={LATENCY_SERIES} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyTotalFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="0 0" />
              <XAxis
                dataKey="t"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 1200]}
                tickFormatter={(v) => `${v}ms`}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [`${asNumber(v)} ms`, ""]}
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                content={<LatencyLegend />}
              />
              <Area
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#2563eb"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                fill="url(#latencyTotalFill)"
                fillOpacity={1}
              />
              <Line type="monotone" dataKey="stt" name="STT" stroke="#16a34a" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tts" name="TTS" stroke="#9333ea" strokeWidth={2} dot={false} />
              <Line
                type="monotone"
                dataKey="translation"
                name="Translation"
                stroke="#ea580c"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <ChartPlaceholder tall />
        )}
      </ChartShell>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartShell title="Session Trends" icon={BarChart3} className="min-h-[340px]">
          {mounted ? (
            <div className="-ml-2 -mb-1">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={sessionData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 36]}
                    width={30}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                <Tooltip
                  formatter={(v) => [asNumber(v), "Sessions"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Bar dataKey="sessions" fill="#5d5d7a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartPlaceholder />
          )}
        </ChartShell>

        <UsageByUserTypeCard />
      </div>
    </div>
  );
}

function LatencyLegend({
  payload,
}: {
  payload?: Array<{ value?: string; color?: string }>;
}) {
  const items = (payload ?? [])
    .filter((p) => p.value && ["STT", "TTS", "Total", "Translation"].includes(p.value))
    .sort((a, b) => {
      const order = ["STT", "TTS", "Total", "Translation"];
      return order.indexOf(a.value ?? "") - order.indexOf(b.value ?? "");
    });

  return (
    <div className="flex w-full items-center justify-center gap-4 pb-1">
      {items.map((it) => (
        <div key={it.value} className="flex items-center gap-2 text-sm font-semibold">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: it.color ?? "#94a3b8" }}
            aria-hidden="true"
          />
          <span style={{ color: it.color ?? "#475569" }}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}

function KpiCell({
  primary,
  secondary,
  hint,
  icon: Icon,
  secondaryStyle,
}: {
  primary: string;
  secondary?: string;
  hint: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  /** "+" uses smaller superscript-style weight */
  secondaryStyle?: "plus" | "unit";
}) {
  return (
    <div className="px-5 py-5">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 text-[36px] font-medium leading-[44px] tracking-tight text-[#414651]">
          {primary}
          {secondary ? (
            <span
              className={cn(
                "font-medium text-[#6e6b8b]",
                secondaryStyle === "plus" ? "text-2xl" : "ml-1 text-base",
              )}
            >
              {secondary}
            </span>
          ) : null}
        </p>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-[#f3f3f7]">
          <Icon className="text-[#414651]" size={18} />
        </div>
      </div>
      <p className="mt-2 text-[13px] leading-[18px] text-[#535862]">{hint}</p>
    </div>
  );
}

function ChartShell({
  title,
  icon: Icon,
  className,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "border border-[#eeedf5] bg-white shadow-none",
        className,
      )}
    >
      <Card.Content className="flex flex-col gap-3 p-5 pt-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-full border border-[#e5e7eb] bg-[#f3f3f7]">
            <Icon className="text-[#414651]" size={18} />
          </div>
          <h2 className="text-lg font-medium text-[#414651]">{title}</h2>
        </div>
        {children}
      </Card.Content>
    </Card>
  );
}

function ChartPlaceholder({ tall }: { tall?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500",
        tall ? "h-[280px]" : "h-[260px]",
      )}
    >
      Loading chart…
    </div>
  );
}
