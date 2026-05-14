"use client";

import * as React from "react";
import {
  Bell,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import {
  type TimelineEvent,
  DEFAULT_SELECTED_EVENT_ID,
  DAYS_WITH_DOTS,
  NOW_MINUTES_FROM_8,
  TIMELINE_EVENTS,
  TIMELINE_HEIGHT_PX,
  VISIBLE_HOUR_LABELS,
  calendarViewOptions,
  eventTopAndHeight,
} from "@/components/calendar/calendar-data";
import { NewMeetingModalTrigger } from "@/components/meetings/NewMeetingModalTrigger";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SelectMenu } from "@/components/ui/SelectMenu";
import {
  getMonthGridCells,
  isSameDate,
  WEEKDAYS,
} from "@/lib/calendar/calendar-utils";
import { cn } from "@/lib/utils";

// No module-level date constants — always derive from client-side new Date() to avoid
// SSR/hydration mismatches on statically generated pages.

type ViewMode = (typeof calendarViewOptions)[number]["id"];

const variantClass: Record<
  TimelineEvent["variant"],
  { block: string; title: string }
> = {
  neutral: {
    block: "border border-[#d6d3d0] bg-[#f0f0f0]",
    title: "text-[#1d1d1f]",
  },
  soft: {
    block: "border border-[#e0dde8] bg-[#f3f3f7]",
    title: "text-[#1d1d1f]",
  },
  indigo: {
    block: "border border-[#c7d7fe] bg-[#eef4ff]",
    title: "text-[#1d1d1f]",
  },
};

function dateChipText(d: Date) {
  const m = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  return `${m} / ${d.getDate()}`;
}

function longDateText(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function weekdayText(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

const monthLabel = (y: number, m0: number) =>
  new Date(y, m0, 1).toLocaleString("en-US", { month: "long" });

export function CalendarPageClient() {
  const [view, setView] = React.useState<ViewMode>("day");
  // Use lazy initialisers so these always reflect the CLIENT's current date,
  // not the build-time date from SSR static generation.
  const [viewYear, setViewYear] = React.useState(() => new Date().getFullYear());
  const [viewMonth0, setViewMonth0] = React.useState(() => new Date().getMonth());
  const [selected, setSelected] = React.useState(() => new Date());
  const [selectedId, setSelectedId] = React.useState(DEFAULT_SELECTED_EVENT_ID);

  const hasAgendaDay = isSameDate(selected, new Date());
  const eventsForDay = hasAgendaDay ? TIMELINE_EVENTS : [];

  React.useEffect(() => {
    if (!hasAgendaDay) return;
    if (TIMELINE_EVENTS.some((e) => e.id === selectedId)) return;
    setSelectedId(TIMELINE_EVENTS[0]!.id);
  }, [hasAgendaDay, selectedId]);

  const active =
    eventsForDay.find((e) => e.id === selectedId) ?? eventsForDay[0] ?? null;

  const nowTopPx = (NOW_MINUTES_FROM_8 / 60) * 96;
  const showNowLine = isSameDate(selected, new Date()) && view === "day";

  // Derive today's formatted date label for event details (overrides hardcoded dates in data)
  const todayMonthLabel = selected.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
  const todayWeekday = selected.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

  const cells = React.useMemo(
    () => getMonthGridCells(viewYear, viewMonth0),
    [viewYear, viewMonth0],
  );

  const prevMonth = () => {
    const d = new Date(viewYear, viewMonth0, 1);
    d.setMonth(d.getMonth() - 1);
    setViewYear(d.getFullYear());
    setViewMonth0(d.getMonth());
  };

  const nextMonth = () => {
    const d = new Date(viewYear, viewMonth0, 1);
    d.setMonth(d.getMonth() + 1);
    setViewYear(d.getFullYear());
    setViewMonth0(d.getMonth());
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col pt-6">
      <div className="mb-6 flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className="flex h-10 shrink-0 items-center justify-center rounded-lg border border-[#e9eaeb] bg-[#fafbfc] px-3.5 text-xs font-semibold tracking-wide text-[#414651]"
            aria-label={dateChipText(selected)}
          >
            {dateChipText(selected)}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-[#1d1d1f] sm:text-3xl">
              {longDateText(selected)}
            </h1>
            <p className="text-sm text-[#717680]">
              {weekdayText(selected)} · {view === "day" ? "Day schedule" : "Week schedule"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-44 min-w-0">
            <SelectMenu
              id="calendar-view"
              value={view}
              onChange={setView}
              options={calendarViewOptions}
              leadingIcon={
                <CalendarDays size={16} strokeWidth={1.7} className="text-[#535862]" />
              }
            />
          </div>
          <NewMeetingModalTrigger label="New meeting" />
        </div>
      </div>

      <div className="flex h-[min(1200px,calc(100dvh-15.5rem))] min-h-0 max-h-[min(1200px,calc(100dvh-15.5rem))] flex-1 flex-col overflow-hidden rounded-xl border border-[#e9eaeb] bg-white shadow-sm">
        <div className="flex h-full min-h-0 w-full flex-1 flex-col items-stretch lg:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-[#e9eaeb] lg:border-b-0 lg:border-r lg:border-[#e9eaeb]">
            {view === "week" ? (
              <div
                className="flex min-h-[320px] items-center justify-center p-4 sm:p-6"
                role="status"
              >
                <div className="rounded-lg border border-dashed border-[#e0dde8] bg-[#fafbfc] px-6 py-12 text-center">
                  <p className="text-sm text-[#535862]">
                    Week view is not available yet. Use Day view to see your timeline.
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 sm:p-6 [scrollbar-gutter:stable]"
                aria-label="Day timeline"
              >
                <div className="flex min-w-0" style={{ minHeight: TIMELINE_HEIGHT_PX }}>
                  <div className="w-12 shrink-0 pr-1 sm:w-16 sm:pr-2">
                    {VISIBLE_HOUR_LABELS.map((row) => (
                      <div
                        key={row.hour}
                        className="flex h-24 items-start justify-end pt-0 text-xs text-[#717680]"
                      >
                        {row.label}
                      </div>
                    ))}
                  </div>
                  <div
                    className="relative min-w-0 flex-1 border-l border-[#e9eaeb]"
                    style={{ minHeight: TIMELINE_HEIGHT_PX }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        backgroundImage: `repeating-linear-gradient(
                        to bottom,
                        transparent 0,
                        transparent calc(6rem - 1px),
                        #e9eaeb calc(6rem - 1px),
                        #e9eaeb 6rem
                      )`,
                      }}
                      aria-hidden
                    />
                    {showNowLine && (
                      <div
                        className="absolute left-0 right-0 z-10"
                        style={{ top: nowTopPx }}
                      >
                        <div className="flex items-center pl-0">
                          <span
                            className="size-2 shrink-0 rounded-full bg-[#0d99ff] ring-4 ring-white"
                            aria-hidden
                          />
                          <div className="h-px flex-1 bg-[#0d99ff]" />
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 px-1 sm:px-2">
                      {eventsForDay.map((ev) => {
                        const { top, height } = eventTopAndHeight(ev.startMin, ev.endMin);
                        const selectedBlock = ev.id === active?.id;
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={() => setSelectedId(ev.id)}
                            className={cn(
                              "absolute left-0 right-0 rounded-lg p-2 text-left shadow-sm transition",
                              variantClass[ev.variant].block,
                              selectedBlock
                                ? "ring-2 ring-[#0d99ff] ring-offset-0"
                                : "hover:brightness-[0.99]",
                            )}
                            style={{ top, height }}
                          >
                            <div
                              className={cn(
                                "line-clamp-2 text-sm font-medium",
                                variantClass[ev.variant].title,
                              )}
                            >
                              {ev.title}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className={cn(
              "grid h-full min-h-0 w-full min-w-0 overflow-x-hidden p-4 sm:p-6 lg:min-h-0 lg:max-w-[336px] lg:shrink-0 lg:self-stretch self-stretch max-lg:min-h-0 max-lg:flex-1 gap-6",
              active && eventsForDay.length > 0
                ? "[grid-template-rows:auto_minmax(0,1fr)_auto]"
                : "[grid-template-rows:auto_minmax(0,1fr)]",
            )}
          >
            <div className="row-start-1 self-start">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[#1d1d1f]">
                  {monthLabel(viewYear, viewMonth0)} {viewYear}
                </h2>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="inline-flex size-8 items-center justify-center rounded-md text-[#535862] transition hover:bg-[#f0f0f0]"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="inline-flex size-8 items-center justify-center rounded-md text-[#535862] transition hover:bg-[#f0f0f0]"
                    aria-label="Next month"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="mb-1 text-[10px] font-medium text-[#9aa0a6]">
                    {d}
                  </div>
                ))}
                {cells.map((c) => {
                  const isSelected = isSameDate(c.date, selected);
                  const inM = c.inCurrentMonth;
                  const day = c.date.getDate();
                  const isDot = inM && (DAYS_WITH_DOTS.has(day) || isSameDate(c.date, selected));
                  return (
                    <button
                      key={+c.date}
                      type="button"
                      onClick={() => setSelected(c.date)}
                      className={cn(
                        "relative mx-auto flex size-8 items-center justify-center rounded-full text-xs transition",
                        !inM && "text-[#b8bcc2]",
                        inM && "text-[#1d1d1f]",
                        isSelected && "bg-[#48476e] font-semibold text-white",
                        !isSelected && inM && "hover:bg-[#f0f0f0]",
                      )}
                    >
                      {day}
                      {isDot && !isSelected && (
                        <span className="absolute bottom-0.5 size-1 rounded-full bg-[#0d99ff]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {active && eventsForDay.length > 0 ? (
              <>
                <div className="row-start-2 flex min-h-0 min-w-0 flex-col overflow-x-hidden overflow-y-hidden [min-height:0]">
                  <div
                    className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain [scrollbar-gutter:stable] [overscroll-behavior:contain]"
                    data-calendar-event-scroll="true"
                  >
                    <div className="pr-0.5 pb-8 sm:pb-10">
                      <EventDetailScrollBody
                        detail={{
                          ...active.detail,
                          monthLabel: todayMonthLabel,
                          weekday: todayWeekday,
                        }}
                        titleId="calendar-event-title"
                      />
                    </div>
                  </div>
                </div>
                <div className="row-start-3 relative z-20 w-full min-w-0">
                  <div
                    className="pointer-events-none absolute -top-16 left-0 right-0 z-0 h-16 sm:-top-20 sm:h-20"
                    style={{
                      background:
                        "linear-gradient(to top, #ffffff 0%, rgba(255, 255, 255, 0.95) 35%, rgba(255, 255, 255, 0) 100%)",
                    }}
                    aria-hidden
                  />
                  <div className="relative z-10 bg-white px-1.5 pb-3 sm:px-2.5 sm:pb-4">
                    <EventJoinBar meetingLink={active.detail.meetingLink} />
                  </div>
                </div>
              </>
            ) : (
              <div
                className="row-start-2 min-h-0 border-t border-[#e9eaeb] pt-4 [min-height:0]"
                role="status"
              >
                <div className="rounded-lg border border-dashed border-[#e0dde8] bg-[#fafbfc] px-4 py-8 text-center text-sm text-[#535862]">
                  No meetings on this day. Add a new meeting to get started.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Scrollable event copy; the Join action is a separate third row in the right-hand grid. */
function EventDetailScrollBody({
  detail,
  titleId,
}: {
  detail: TimelineEvent["detail"];
  titleId: string;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-2">
        <h3 id={titleId} className="text-base font-semibold text-[#1d1d1f] sm:text-lg">
          {detail.title}
        </h3>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-md text-[#535862] transition hover:bg-[#f0f0f0]"
            aria-label="Copy event"
            onClick={() => {
              void navigator.clipboard?.writeText(detail.meetingLink);
            }}
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-md text-[#535862] transition hover:bg-[#f0f0f0]"
            aria-label="Delete event"
          >
            <Trash2 size={16} />
          </button>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-md text-[#535862] transition hover:bg-[#f0f0f0]"
            aria-label="Edit event"
          >
            <Pencil size={16} />
          </button>
        </div>
      </div>

      <ul className="space-y-3 text-sm text-[#414651]">
        <li className="flex items-start gap-2">
          <Calendar size={16} className="mt-0.5 shrink-0 text-[#535862]" aria-hidden />
          <span>
            <span className="font-medium text-[#1d1d1f]">
              {detail.monthLabel} · {detail.weekday}
            </span>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Clock size={16} className="mt-0.5 shrink-0 text-[#535862]" aria-hidden />
          <span>
            {detail.timeRange} (ends {detail.endTimeLabel})
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Bell size={16} className="mt-0.5 shrink-0 text-[#535862]" aria-hidden />
          <span>Reminder · {detail.remindLabel}</span>
        </li>
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex -space-x-1.5">
          {detail.guests.map((g) => (
            <div
              key={g.id}
              className="inline-flex size-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-medium text-[#1d1d1f] shadow-sm"
              style={{ backgroundColor: g.bg, zIndex: 0 }}
              title={g.initials}
            >
              {g.initials}
            </div>
          ))}
        </div>
        {detail.otherGuestsInitials ? (
          <div className="inline-flex size-8 items-center justify-center rounded-full border-2 border-dashed border-[#c8cdd4] bg-white text-sm text-[#535862]">
            <Plus size={16} />
          </div>
        ) : null}
      </div>

      <p className="text-xs text-[#717680]">{detail.rsvpSummary}</p>

      <div>
        <h4 className="mb-1.5 text-sm font-medium text-[#1d1d1f]">About this event</h4>
        <p className="pb-1 text-sm leading-relaxed text-[#414651]">{detail.about}</p>
      </div>
    </div>
  );
}

function EventJoinBar({ meetingLink }: { meetingLink: string }) {
  return (
    <ButtonLink
      href={meetingLink}
      size="md"
      variant="primary"
      className="w-full no-underline [&>svg]:shrink-0 [&>svg]:text-inherit"
      rel="noreferrer"
      target="_blank"
    >
      <ExternalLink className="size-4" strokeWidth={2} aria-hidden />
      Join meeting
    </ButtonLink>
  );
}
