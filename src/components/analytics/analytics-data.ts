export type DateRangeKey = "7" | "30";

export type LanguageFilter =
  | "all"
  | "Arabic"
  | "English"
  | "French"
  | "Urdu"
  | "Spanish"
  | "German";

export type KpiModel = {
  active: { value: string; plus?: string };
  total: { value: string; unit: string };
  words: { value: string; unit: string };
  avg: { value: string; unit: string };
  hints: {
    active: string;
    total: string;
    words: string;
    avg: string;
  };
};

const KPI_7: KpiModel = {
  active: { value: "12", plus: "+" },
  total: { value: "173", unit: "sessions" },
  words: { value: "30K", unit: "words" },
  avg: { value: "174", unit: "avg" },
  hints: {
    active: "Active sessions running right now.",
    total: "Total sessions in the last 7 days.",
    words: "Words translated across all sessions.",
    avg: "Average words translated per session.",
  },
};

const KPI_30: KpiModel = {
  active: { value: "28", plus: "+" },
  total: { value: "612", unit: "sessions" },
  words: { value: "118K", unit: "words" },
  avg: { value: "193", unit: "avg" },
  hints: {
    active: "Active sessions running right now.",
    total: "Total sessions in the last 30 days.",
    words: "Words translated across all sessions.",
    avg: "Average words translated per session.",
  },
};

export function getKpis(range: DateRangeKey): KpiModel {
  return range === "7" ? KPI_7 : KPI_30;
}

export const LANGUAGE_SHARE = [
  { name: "Arabic", pct: 48, fill: "var(--mofa-accent)" },
  { name: "English", pct: 32, fill: "#16a34a" },
  { name: "French", pct: 18, fill: "#2563eb" },
  { name: "Urdu", pct: 12, fill: "#ea580c" },
  { name: "Spanish", pct: 8, fill: "#dc2626" },
  { name: "German", pct: 6, fill: "#9333ea" },
];

export const WORDS_OVER_TIME = {
  "7": [
    { day: "Mon", words: 2100 },
    { day: "Tue", words: 3800 },
    { day: "Wed", words: 4200 },
    { day: "Thu", words: 5100 },
    { day: "Fri", words: 2600 },
    { day: "Sat", words: 4100 },
    { day: "Sun", words: 1200 },
  ],
  "30": [
    { day: "Mon", words: 1800 },
    { day: "Tue", words: 3200 },
    { day: "Wed", words: 4500 },
    { day: "Thu", words: 4800 },
    { day: "Fri", words: 3100 },
    { day: "Sat", words: 3600 },
    { day: "Sun", words: 1900 },
  ],
};

export const SESSION_TRENDS = {
  "7": [
    { day: "Mon", sessions: 22 },
    { day: "Tue", sessions: 28 },
    { day: "Wed", sessions: 30 },
    { day: "Thu", sessions: 26 },
    { day: "Fri", sessions: 32 },
    { day: "Sat", sessions: 18 },
    { day: "Sun", sessions: 14 },
  ],
  "30": [
    { day: "Mon", sessions: 20 },
    { day: "Tue", sessions: 24 },
    { day: "Wed", sessions: 29 },
    { day: "Thu", sessions: 27 },
    { day: "Fri", sessions: 31 },
    { day: "Sat", sessions: 17 },
    { day: "Sun", sessions: 15 },
  ],
};

/** Figma node 166:2688 — donut + legend swatches */
export const USER_TYPE_DONUT = [
  {
    name: "MOFA Staff",
    value: 64,
    fill: "var(--mofa-accent)",
    legendBar: "var(--mofa-accent)",
  },
  {
    name: "External Parties",
    value: 36,
    fill: "var(--mofa-accent-muted)",
    legendBar: "var(--mofa-accent-muted)",
  },
];

export const LATENCY_SERIES = [
  { t: "11:51:46", total: 980, stt: 420, tts: 380, translation: 210 },
  { t: "11:52:10", total: 1020, stt: 440, tts: 400, translation: 220 },
  { t: "11:52:34", total: 990, stt: 410, tts: 390, translation: 200 },
  { t: "11:52:58", total: 1050, stt: 460, tts: 410, translation: 230 },
  { t: "11:53:22", total: 1010, stt: 430, tts: 395, translation: 215 },
  { t: "11:53:46", total: 1080, stt: 480, tts: 420, translation: 240 },
  { t: "11:53:51", total: 1040, stt: 450, tts: 405, translation: 225 },
];
