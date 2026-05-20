"use client";

import * as React from "react";
import { Info, Users } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { USER_TYPE_DONUT } from "@/components/analytics/analytics-data";

function asNumber(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

/** Figma node 166:2688 — padding 25px, gap 20px, donut 190×190, legend with pills + info + % */
export function UsageByUserTypeCard() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const data = React.useMemo(
    () => USER_TYPE_DONUT.map((d) => ({ ...d })),
    [],
  );

  return (
    <div
      className="flex w-full flex-col items-center gap-5 rounded-2xl border border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-sidebar-bg)] p-[25px]"
      data-name="Usage by User Type"
      data-node-id="166:2688"
    >
      <div className="flex h-9 w-full shrink-0 items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--mofa-accent-muted)] bg-white/70">
          <Users size={18} className="text-[color:var(--mofa-accent-dark)]" aria-hidden />
        </div>
        <h2 className="text-lg font-medium leading-7 text-[color:var(--mofa-text-body)]">
          Usage by User Type
        </h2>
      </div>

      <div className="size-[190px] shrink-0">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={95}
                paddingAngle={4}
                cornerRadius={6}
                stroke="rgba(255,255,255,0.85)"
                strokeWidth={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [`${asNumber(v)}%`, ""]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--mofa-border-default)",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            Loading…
          </div>
        )}
      </div>

      <div className="flex h-[55.5px] w-full shrink-0 items-start justify-center gap-8 px-[42.75px]">
        {data.map((row) => (
          <div
            key={row.name}
            className="flex min-w-0 flex-col items-center gap-1"
          >
            <div className="flex h-[19.5px] items-center justify-center gap-2">
              <span
                className="h-3.5 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: row.legendBar }}
              />
              <span className="whitespace-nowrap text-center text-[13px] font-medium leading-[19.5px] text-[color:var(--mofa-text-subtle)]">
                {row.name}
              </span>
              <Info
                className="size-3.5 shrink-0 text-[color:var(--mofa-text-placeholder)]"
                aria-hidden
                strokeWidth={2}
              />
            </div>
            <p className="text-center text-2xl font-semibold leading-8 tracking-tight text-[color:var(--mofa-text-body)]">
              {row.value}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
