import { Calendar, Globe2, User2 } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { Participant } from "@/types/meeting";

export type MeetingCardProps = {
  className?: string;
  title: string;
  dateTimeLabel: string;
  hostLabel: string;
  languageLabel: string;
  participants?: Participant[];
  participantsCount?: number;
  joinAction?: {
    label: string;
    href: string;
  };
};

export function MeetingCard({
  className,
  title,
  dateTimeLabel,
  hostLabel,
  languageLabel,
  participants,
  participantsCount,
  joinAction,
}: MeetingCardProps) {
  const count = participantsCount ?? participants?.length;

  return (
    <Card className={cn("border-0 bg-[#f3f3f7]", className)}>
      <Card.Content className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 space-y-2">
            <p className="text-lg font-semibold leading-7 text-slate-700">
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

          {joinAction ? (
            <ButtonLink
              href={joinAction.href}
              variant="primary"
              size="md"
              className="h-10 px-4"
            >
              {joinAction.label}
            </ButtonLink>
          ) : null}
        </div>

        {typeof count === "number" ? (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center">
              {(participants ?? []).slice(0, 3).map((p, idx) => (
                <Avatar
                  key={p.id}
                  src={p.avatarSrc ?? null}
                  alt={p.name}
                  fallback={p.name
                    .split(" ")
                    .slice(0, 2)
                    .map((s) => s[0]?.toUpperCase() ?? "")
                    .join("")}
                  className={cn(
                    "h-[34px] w-[34px] border border-[#f3f3f7]",
                    idx !== 0 && "-ml-3",
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-slate-700">
              <span className="font-semibold">{count} </span>
              <span className="font-normal">Participants</span>
            </p>
          </div>
        ) : null}
      </Card.Content>
    </Card>
  );
}

