"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  Send,
  Users,
  Languages,
  HelpCircle,
  Monitor,
  Search,
  Check,
  ChevronDown,
  X,
} from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { cn } from "@/lib/utils";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { useClickOutside } from "@/components/ui/useClickOutside";

type Option = { id: string; label: string; icon?: React.ReactNode; description?: string };
type PersonOption = {
  id: string;
  label: string;
  email: string;
  avatarSrc?: string | null;
};

const PEOPLE: PersonOption[] = [
  { id: "abdullah", label: "Abdullah Al Harbi", email: "abdullah@mofa.gov.sa" },
  { id: "suliman", label: "Suliman Alawi", email: "suliman@mofa.gov.sa" },
  { id: "fatima", label: "Fatima Alzahra", email: "fatima@mofa.gov.sa" },
  { id: "khalid", label: "Khalid Mansour", email: "khalid@mofa.gov.sa" },
];

const LANGUAGES: Option[] = [
  { id: "Arabic", label: "Arabic" },
  { id: "English", label: "English" },
  { id: "French", label: "French" },
  { id: "Urdu", label: "Urdu" },
];

const TIMES: Option[] = [
  { id: "3:00 PM", label: "3:00 PM" },
  { id: "3:30 PM", label: "3:30 PM" },
  { id: "4:00 PM", label: "4:00 PM" },
  { id: "4:30 PM", label: "4:30 PM" },
  { id: "5:00 PM", label: "5:00 PM" },
  { id: "5:30 PM", label: "5:30 PM" },
];

const LOCATION: Option[] = [
  {
    id: "in-app",
    label: "In App",
    description: "Online in MOFA app",
    icon: <Monitor size={18} aria-hidden="true" />,
  },
  {
    id: "teams",
    label: "Teams",
    description: "Online via Microsoft Teams",
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/teams.png" alt="" className="h-[18px] w-[18px]" />
    ),
  },
  {
    id: "beam",
    label: "Beem",
    description: "Online via Beem",
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/beam-logo.png" alt="Beem" className="h-[18px] w-[18px] object-contain" />
    ),
  },
];

function initialsFor(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function AttendeesMultiSelect({
  id,
  value,
  onChange,
  options,
  error,
}: {
  id: string;
  value: string[];
  onChange: (next: string[]) => void;
  options: PersonOption[];
  error?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useClickOutside(rootRef, () => setOpen(false));

  React.useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const selectedPeople = options.filter((person) => value.includes(person.id));
  const filteredPeople = options.filter((person) =>
    `${person.label} ${person.email}`.toLowerCase().includes(query.toLowerCase()),
  );

  function togglePerson(personId: string) {
    if (value.includes(personId)) {
      onChange(value.filter((currentId) => currentId !== personId));
      return;
    }
    onChange([...value, personId]);
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border bg-white px-[14px] py-[10px] text-left shadow-[0_1px_2px_rgba(10,13,18,0.05)]",
          error ? "border-[#fca5a5]" : "border-[color:var(--mofa-border-default)]",
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <Users size={18} aria-hidden="true" className="shrink-0 text-[color:var(--mofa-text-muted)]" />
          {selectedPeople.length > 0 ? (
            <span className="flex min-w-0 flex-wrap items-center gap-2">
              {selectedPeople.slice(0, 2).map((person) => (
                <span
                  key={person.id}
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--mofa-sidebar-active-bg)] px-2.5 py-1 text-sm font-medium text-[color:var(--mofa-text-body)]"
                >
                  <Avatar
                    src={person.avatarSrc ?? null}
                    alt={person.label}
                    fallback={initialsFor(person.label)}
                    className="h-6 w-6 border-0 bg-[#ddd9f7] text-[10px]"
                  />
                  <span className="truncate">{person.label}</span>
                </span>
              ))}
              {selectedPeople.length > 2 ? (
                <span className="text-sm font-medium text-[color:var(--mofa-text-subtle)]">
                  +{selectedPeople.length - 2} more
                </span>
              ) : null}
            </span>
          ) : (
            <span className="text-[rgba(65,70,81,0.5)]">Select Attendees</span>
          )}
        </span>
        <ChevronDown size={18} className="shrink-0 text-[color:var(--mofa-text-subtle)]" aria-hidden="true" />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-[90] w-full overflow-hidden rounded-2xl border border-[color:var(--mofa-border-default)] bg-white shadow-[0_20px_32px_rgba(10,13,18,0.16)]">
          <div className="border-b border-[color:var(--mofa-border-default)] p-3">
            <div className="flex items-center gap-2 rounded-lg border border-[color:var(--mofa-border-default)] bg-white px-3 py-2">
              <Search size={16} className="text-[color:var(--mofa-text-muted)]" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search attendees"
                className="w-full bg-transparent text-sm text-[color:var(--mofa-text-primary)] outline-none placeholder:text-[color:var(--mofa-text-placeholder)]"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto py-2" role="listbox" aria-multiselectable="true">
            {filteredPeople.length > 0 ? (
              filteredPeople.map((person) => {
                const selected = value.includes(person.id);
                return (
                  <button
                    key={person.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => togglePerson(person.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left",
                      selected ? "bg-[#f5f7ff]" : "hover:bg-[color:var(--mofa-btn-outline-hover)]",
                    )}
                  >
                    <Avatar
                      src={person.avatarSrc ?? null}
                      alt={person.label}
                      fallback={initialsFor(person.label)}
                      className="h-10 w-10 bg-[#ece9f8] text-[12px]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[color:var(--mofa-text-primary)]">
                        {person.label}
                      </span>
                      <span className="block truncate text-sm text-[#667085]">
                        {person.email}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        selected
                          ? "border-[color:var(--mofa-accent)] bg-[color:var(--mofa-accent)] text-white"
                          : "border-[color:var(--mofa-border-default)] bg-white text-transparent",
                      )}
                    >
                      <Check size={12} aria-hidden="true" />
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-6 text-center text-sm text-[#667085]">
                No attendees match your search.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function NewMeetingModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLInputElement>(null);

  const [title, setTitle] = React.useState("");
  const [attendees, setAttendees] = React.useState<string[]>([]);
  const [location, setLocation] = React.useState<string | null>("in-app");
  const [myLanguage, setMyLanguage] = React.useState<string | null>(null);
  const [startDate, setStartDate] = React.useState(new Date(2026, 3, 22));
  const [startTime, setStartTime] = React.useState<string | null>("3:30 PM");
  const [endTime, setEndTime] = React.useState<string | null>("4:00 PM");
  const [desc, setDesc] = React.useState("");
  const [errors, setErrors] = React.useState<{
    title?: string;
    attendees?: string;
    myLanguage?: string;
    startTime?: string;
    endTime?: string;
  }>({});

  useClickOutside(
    dialogRef,
    () => {
      if (open) onClose();
    },
    {
      ignore: (t) =>
        t instanceof Element && !!t.closest('[data-mofa-portal="select-menu"]'),
    },
  );

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  function focusById(id: string) {
    const el = document.getElementById(id);
    if (el && "focus" in el) (el as HTMLElement).focus();
  }

  function validate() {
    const next: typeof errors = {};
    if (!title.trim()) next.title = "Meeting title is required.";
    if (attendees.length === 0) next.attendees = "Please select at least one attendee.";
    if (!myLanguage) next.myLanguage = "Please select your language.";
    if (!startTime) next.startTime = "Start time is required.";
    if (!endTime) next.endTime = "End time is required.";
    setErrors(next);
    return next;
  }

  function onSend() {
    const next = validate();
    const first =
      next.title ? "title" : next.attendees ? "attendees" : next.myLanguage ? "myLanguage" : next.startTime ? "startTime" : next.endTime ? "endTime" : null;
    if (!first) {
      // Wire to API later.
      onClose();
      return;
    }

    if (first === "title") titleRef.current?.focus();
    else if (first === "attendees") focusById("new-meeting-attendees");
    else if (first === "myLanguage") focusById("new-meeting-my-language");
    else if (first === "startTime") focusById("new-meeting-start-time");
    else if (first === "endTime") focusById("new-meeting-end-time");
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/20 px-6 py-10"
      role="dialog"
      aria-modal="true"
      aria-label="Create a New Meeting"
    >
      <div
        ref={dialogRef}
        className="flex w-full max-w-[980px] max-h-[calc(100vh-80px)] flex-col rounded-3xl bg-white py-6 shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
      >
        <div className="flex items-start justify-between px-6">
          <div className="text-[18px] font-semibold leading-7 text-[color:var(--mofa-text-primary)]">
            Create a New Meeting
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--mofa-border-default)] bg-white text-[color:var(--mofa-text-body)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] transition hover:bg-[color:var(--mofa-btn-outline-hover)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mofa-accent)]/50 focus-visible:ring-offset-1"
            aria-label="Close"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 flex-1 overflow-y-auto px-6">
          <div className="rounded-2xl border border-[color:var(--mofa-border-default)] bg-[color:var(--mofa-sidebar-active-bg)] p-6">
            <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
              <div className="min-w-[200px] max-w-[280px] flex-1 text-sm font-semibold text-[color:var(--mofa-text-body)]">
                Meeting Title
              </div>
              <div className="w-full max-w-[512px] flex-1">
                <input
                  ref={titleRef}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
                  }}
                  placeholder="Add Title"
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? "new-meeting-title-error" : undefined}
                  className={cn(
                    "h-11 w-full rounded-lg border bg-white px-[14px] py-[10px] text-[16px] text-[color:var(--mofa-text-primary)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none placeholder:text-[color:var(--mofa-text-muted)] focus:shadow-[0_1px_2px_rgba(10,13,18,0.05),0_0_0_2px_var(--mofa-btn-outline-focus-halo)]",
                    errors.title ? "border-[#fca5a5]" : "border-[color:var(--mofa-border-default)]",
                  )}
                />
                {errors.title ? (
                  <div
                    id="new-meeting-title-error"
                    className="mt-1 text-[12px] leading-[18px] text-[#b91c1c]"
                  >
                    {errors.title}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="my-4 h-px w-full bg-[#e9eaeb]" />

            <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
              <div className="min-w-[200px] max-w-[280px] flex-1 text-sm font-semibold text-[color:var(--mofa-text-body)]">
                Invite Attendees
              </div>
              <div className="w-full max-w-[512px] flex-1">
                <AttendeesMultiSelect
                  value={attendees}
                  onChange={(nextAttendees) => {
                    setAttendees(nextAttendees);
                    if (errors.attendees)
                      setErrors((p) => ({ ...p, attendees: undefined }));
                  }}
                  options={PEOPLE}
                  id="new-meeting-attendees"
                  error={errors.attendees}
                />
                {errors.attendees ? (
                  <div className="mt-1 text-[12px] leading-[18px] text-[#b91c1c]">
                    {errors.attendees}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="my-4 h-px w-full bg-[#e9eaeb]" />

            <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
              <div className="min-w-[200px] max-w-[280px] flex-1 text-sm font-semibold text-[color:var(--mofa-text-body)]">
                Where do you want to take meeting
              </div>
              <div className="w-full max-w-[512px] flex-1">
                <RadioCardGroup
                  value={location}
                  onChange={setLocation}
                  options={LOCATION}
                />
              </div>
            </div>

            <div className="my-4 h-px w-full bg-[#e9eaeb]" />

            <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
              <div className="min-w-[200px] max-w-[280px] flex-1 text-sm font-semibold text-[color:var(--mofa-text-body)]">
                My Language during this meeting
              </div>
              <div className="w-full max-w-[512px] flex-1">
                <SelectMenu
                  value={myLanguage}
                  onChange={(v) => {
                    setMyLanguage(v);
                    if (errors.myLanguage)
                      setErrors((p) => ({ ...p, myLanguage: undefined }));
                  }}
                  options={LANGUAGES}
                  leadingIcon={<Languages size={18} aria-hidden="true" />}
                  placeholder="Select Language"
                  id="new-meeting-my-language"
                  buttonClassName={cn(
                    "h-11 px-[14px] py-[10px] shadow-[0_1px_2px_rgba(10,13,18,0.05)]",
                    errors.myLanguage ? "border-[#fca5a5]" : "border-[color:var(--mofa-border-default)]",
                  )}
                />
                {errors.myLanguage ? (
                  <div className="mt-1 text-[12px] leading-[18px] text-[#b91c1c]">
                    {errors.myLanguage}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="my-4 h-px w-full bg-[#e9eaeb]" />

            <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
              <div className="min-w-[200px] max-w-[280px] flex-1 text-sm font-semibold text-[color:var(--mofa-text-body)]">
                <span className="inline-flex items-center gap-1">
                  Meeting Date & Time <HelpCircle size={16} className="text-[color:var(--mofa-text-muted)]" aria-hidden="true" />
                </span>
              </div>
              <div className="w-full max-w-[512px] flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="mb-2 text-sm text-[color:var(--mofa-text-muted)]">Start date</div>
                    <div className="relative">
                      <DatePicker value={startDate} onChange={setStartDate} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 text-sm text-[color:var(--mofa-text-muted)]">Start time</div>
                    <SelectMenu
                      value={startTime}
                      onChange={(v) => {
                        setStartTime(v);
                        if (errors.startTime)
                          setErrors((p) => ({ ...p, startTime: undefined }));
                      }}
                      options={TIMES}
                      placeholder="Time"
                      id="new-meeting-start-time"
                      buttonClassName={cn(
                        "h-11 px-[14px] py-[10px] shadow-[0_1px_2px_rgba(10,13,18,0.05)]",
                        errors.startTime ? "border-[#fca5a5]" : "border-[color:var(--mofa-border-default)]",
                      )}
                    />
                    {errors.startTime ? (
                      <div className="mt-1 text-[12px] leading-[18px] text-[#b91c1c]">
                        {errors.startTime}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 text-sm text-[color:var(--mofa-text-muted)]">End time</div>
                    <SelectMenu
                      value={endTime}
                      onChange={(v) => {
                        setEndTime(v);
                        if (errors.endTime)
                          setErrors((p) => ({ ...p, endTime: undefined }));
                      }}
                      options={TIMES}
                      placeholder="Time"
                      id="new-meeting-end-time"
                      buttonClassName={cn(
                        "h-11 px-[14px] py-[10px] shadow-[0_1px_2px_rgba(10,13,18,0.05)]",
                        errors.endTime ? "border-[#fca5a5]" : "border-[color:var(--mofa-border-default)]",
                      )}
                    />
                    {errors.endTime ? (
                      <div className="mt-1 text-[12px] leading-[18px] text-[#b91c1c]">
                        {errors.endTime}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="my-4 h-px w-full bg-[#e9eaeb]" />

            <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
              <div className="min-w-[200px] max-w-[280px] flex-1 text-sm font-semibold text-[color:var(--mofa-text-body)]">
                Short Description
              </div>
              <div className="w-full max-w-[512px] flex-1">
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Add a short MOFA meeting description (e.g., agenda, briefing context, key discussion points, and any preparation notes)."
                  className="h-[120px] w-full resize-none rounded-lg border border-[color:var(--mofa-border-default)] bg-white p-4 text-[16px] leading-6 text-[color:var(--mofa-text-primary)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none focus:shadow-[0_1px_2px_rgba(10,13,18,0.05),0_0_0_2px_var(--mofa-btn-outline-focus-halo)]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 px-6">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={onSend}>
            <Send size={18} aria-hidden="true" />
            Send Meeting Invite
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
