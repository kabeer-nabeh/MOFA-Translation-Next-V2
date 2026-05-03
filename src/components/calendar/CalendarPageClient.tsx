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

const AGENDA_DATE = new Date(2025, 0, 10);

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

function dateChipMonth(d: Date) {
  return d.toLocaleString("en-US", { month: "short" }).toUpperCase();
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
  const [viewYear, setViewYear] = React.useState(2025);
  const [viewMonth0, setViewMonth0] = React.useState(0);
  const [selected, setSelected] = React.useState(AGENDA_DATE);
  const [selectedId, setSelectedId] = React.useState(DEFAULT_SELECTED_EVENT_ID);

  const hasAgendaDay = isSameDate(selected, AGENDA_DATE);
  const eventsForDay = hasAgendaDay ? TIMELINE_EVENTS : [];

  React.useEffect(() => {
    if (!hasAgendaDay) return;
    if (TIMELINE_EVENTS.some((e) => e.id === selectedId)) return;
    setSelectedId(TIMELINE_EVENTS[0]!.id);
  }, [hasAgendaDay, selectedId]);

  const active =
    eventsForDay.find((e) => e.id === selectedId) ?? eventsForDay[0] ?? null;

  const nowTopPx = (NOW_MINUTES_FROM_8 / 60) * 96;
  const showNowLine = isSameDate(selected, AGENDA_DATE) && view === "day";

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
      <div className="flex h-[min(1400px,calc(100dvh-10rem))] min-h-0 max-h-[min(1400px,calc(100dvh-10rem))] flex-1 flex-col overflow-hidden rounded-xl border border-[#e9eaeb] bg-white shadow-sm">
        {/* Header */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="flex w-16 shrink-0 flex-col items-center overflow-hidden rounded-lg border border-[#e9eaeb] bg-white"
              aria-label={`${dateChipMonth(selected)} ${selected.getDate()}`}
            >
              <div className="flex w-full items-center justify-center bg-[#fafafa] pb-0.5 pt-1 px-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#717680]">
                  {dateChipMonth(selected)}
                </span>
              </div>
              <div className="flex w-full items-center justify-center pb-[3px] pt-px px-2">
                <span className="text-lg font-bold leading-7 text-[#545469]">
                  {selected.getDate()}
                </span>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-0.5">
              <p className="text-lg font-semibold text-[#181d27]">
                {longDateText(selected)}
              </p>
              <p className="text-sm text-[#535862]">
                {weekdayText(selected)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0">
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

        {/* Divider */}
        <div className="h-px w-full shrink-0 bg-[#e9eaeb]" />
        <div className="flex min-h-0 w-full flex-1 overflow-hidden flex-col items-stretch lg:flex-row">
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
                className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain [scrollbar-gutter:stable]"
                aria-label="Day timeline"
              >
                <div className="flex min-w-0 pl-4 sm:pl-6" style={{ minHeight: TIMELINE_HEIGHT_PX }}>
                  <div className="w-16 shrink-0 pr-2">
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
                        transparent calc(3rem - 1px),
                        #e9eaeb80 calc(3rem - 1px),
                        #e9eaeb80 3rem,
                        transparent 3rem,
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

          <div className="flex min-h-0 w-full min-w-0 flex-col overflow-hidden lg:max-w-[336px] lg:shrink-0 lg:self-stretch self-stretch max-lg:min-h-0 max-lg:flex-1">
            {/* Mini calendar */}
            <div className="shrink-0 p-4 sm:p-6">
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
                  const isDot = inM && DAYS_WITH_DOTS.has(day);
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

            {/* Event detail / empty state */}
            {active && eventsForDay.length > 0 ? (
              <>
                <div className="relative min-h-0 flex-1">
                  <div
                    className="h-full overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 sm:px-6 [scrollbar-gutter:stable]"
                    data-calendar-event-scroll="true"
                  >
                    <div className="pb-16">
                      <EventDetailScrollBody
                        detail={active.detail}
                        titleId="calendar-event-title"
                      />
                    </div>
                  </div>
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-12"
                    style={{ background: "linear-gradient(to bottom, transparent, white)" }}
                    aria-hidden
                  />
                </div>
                <div className="shrink-0 bg-white px-4 pb-4 pt-2 sm:px-6 sm:pb-5">
                  <EventJoinBar meetingLink={active.detail.meetingLink} />
                </div>
              </>
            ) : (
              <div
                className="min-h-0 flex-1 border-t border-[#e9eaeb] px-4 pt-4 sm:px-6"
                role="status"
              >
                <div className="rounded-lg border border-dashed border-[#e0dde8] bg-[#fafbfc] px-4 py-8 text-center text-sm text-[#535862]">
                  No meetings on this day. Pick January 10 to view the sample agenda, or
                  add a new meeting.
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

      <p className="text-xs text-[#717680]">
        {(() => {
          const [first, ...rest] = detail.rsvpSummary.split(" | ");
          return (
            <>
              <span className="font-semibold text-[#414651]">{first}</span>
              {rest.length > 0 && ` | ${rest.join(" | ")}`}
            </>
          );
        })()}
      </p>

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
      Join Meeting
    </ButtonLink>
  );
}
