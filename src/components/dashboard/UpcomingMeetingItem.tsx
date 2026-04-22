import { Calendar, CheckCircle2, Globe2, MoreVertical, User2, XCircle } from "lucide-react";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { CalendarBadgeDate } from "@/types/meeting";

export type UpcomingMeetingItemProps = {
  className?: string;
  date: CalendarBadgeDate;
  title: string;
  dateTimeLabel: string;
  hostLabel: string;
  languageLabel: string;
  acceptAction?: { label: string; href: string };
  declineAction?: { label: string; href: string };
  menuAction?: { label: string; href: string };
};

export function UpcomingMeetingItem({
  className,
  date,
  title,
  dateTimeLabel,
  hostLabel,
  languageLabel,
  acceptAction,
  declineAction,
  menuAction,
}: UpcomingMeetingItemProps) {
  return (
    <Card className={cn("border-0 bg-[#f3f3f7]", className)}>
      <Card.Content className="flex items-start gap-6 p-6">
        <div className="w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_0_0_2px_white,0_0_0_4px_#8988ab]">
          <div className="flex items-center justify-center bg-[#e7e7ee] px-2 pb-0.5 pt-1 text-xs font-semibold text-slate-500">
            {date.monthShort}
          </div>
          <div className="flex items-center justify-center pb-[3px] pt-px text-lg font-bold leading-7 text-[#545469]">
            {date.day}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-start justify-between gap-6">
          <div className="min-w-0 space-y-2">
            <p className="truncate text-lg font-semibold leading-7 text-slate-700">
              {title}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar size={18} aria-hidden="true" className="text-slate-500" />
                <span>{dateTimeLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <User2 size={18} aria-hidden="true" className="text-slate-500" />
                <span>{hostLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 size={18} aria-hidden="true" className="text-slate-500" />
                <span>{languageLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {acceptAction ? (
              <ButtonLink
                href={acceptAction.href}
                variant="secondary"
                size="md"
                className="h-10 gap-2 px-4"
              >
                <CheckCircle2 size={16} className="text-emerald-600" aria-hidden="true" />
                {acceptAction.label}
              </ButtonLink>
            ) : null}

            {declineAction ? (
              <ButtonLink
                href={declineAction.href}
                variant="secondary"
                size="md"
                className="h-10 gap-2 px-4"
              >
                <XCircle size={16} className="text-red-600" aria-hidden="true" />
                {declineAction.label}
              </ButtonLink>
            ) : null}

            {menuAction ? (
              <ButtonLink
                href={menuAction.href}
                variant="secondary"
                size="md"
                className="h-10 w-10 px-0"
                aria-label={menuAction.label}
              >
                <MoreVertical size={18} aria-hidden="true" />
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

