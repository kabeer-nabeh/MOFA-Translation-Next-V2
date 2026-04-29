"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  Send,
  Users,
  Languages,
  HelpCircle,
  Monitor,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { cn } from "@/lib/utils";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { useClickOutside } from "@/components/ui/useClickOutside";

type Option = { id: string; label: string; icon?: React.ReactNode; description?: string };

const PEOPLE: Option[] = [
  { id: "abdullah", label: "Abdullah Al Harbi" },
  { id: "suliman", label: "Suliman Alawi" },
  { id: "fatima", label: "Fatima Alzahra" },
  { id: "khalid", label: "Khalid Mansour" },
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
      <img src="/teams.png" alt="" className="h-[18px] w-[18px]" />
    ),
  },
  {
    id: "beam",
    label: "Beam",
    description: "Online via Beam",
    icon: (
      <img src="/beam-blue.png" alt="" className="h-[18px] w-[18px] object-contain" />
    ),
  },
];

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
  const [attendees, setAttendees] = React.useState<string | null>(null);
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
    if (!attendees) next.attendees = "Please select at least one attendee.";
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
          <div className="text-[18px] font-semibold leading-7 text-[#181d27]">
            Create a New Meeting
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#d5d7da] bg-white text-[#414651] shadow-[0_1px_2px_rgba(10,13,18,0.05)]"
            aria-label="Close"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 flex-1 overflow-y-auto px-6">
          <div className="rounded-2xl border border-[#e9eaeb] bg-[#f3f3f7] p-6">
            <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
              <div className="min-w-[200px] max-w-[280px] flex-1 text-sm font-semibold text-[#414651]">
                Meeting Title
              </div>
              <div className="min-w-[480px] max-w-[512px] flex-1">
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
                    "h-11 w-full rounded-lg border bg-white px-[14px] py-[10px] text-[16px] text-[#181d27] shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none placeholder:text-[#717680] focus:shadow-[0_1px_2px_rgba(10,13,18,0.05),0_0_0_2px_var(--mofa-btn-outline-focus-halo)]",
                    errors.title ? "border-[#fca5a5]" : "border-[#d5d7da]",
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
              <div className="min-w-[200px] max-w-[280px] flex-1 text-sm font-semibold text-[#414651]">
                Invite Attendees
              </div>
              <div className="min-w-[480px] max-w-[512px] flex-1">
                <SelectMenu
                  value={attendees}
                  onChange={(v) => {
                    setAttendees(v);
                    if (errors.attendees)
                      setErrors((p) => ({ ...p, attendees: undefined }));
                  }}
                  options={PEOPLE}
                  leadingIcon={<Users size={18} aria-hidden="true" />}
                  placeholder="Select Attendees"
                  id="new-meeting-attendees"
                  buttonClassName={cn(
                    "h-11 px-[14px] py-[10px] shadow-[0_1px_2px_rgba(10,13,18,0.05)]",
                    errors.attendees ? "border-[#fca5a5]" : "border-[#d5d7da]",
                  )}
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
              <div className="min-w-[200px] max-w-[280px] flex-1 text-sm font-semibold text-[#414651]">
                Where do you want to take meeting
              </div>
              <div className="min-w-[480px] max-w-[512px] flex-1">
                <RadioCardGroup
                  value={location}
                  onChange={setLocation}
                  options={LOCATION}
                />
              </div>
            </div>

            <div className="my-4 h-px w-full bg-[#e9eaeb]" />

            <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
              <div className="min-w-[200px] max-w-[280px] flex-1 text-sm font-semibold text-[#414651]">
                My Language during this meeting
              </div>
              <div className="min-w-[480px] max-w-[512px] flex-1">
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
                    errors.myLanguage ? "border-[#fca5a5]" : "border-[#d5d7da]",
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
              <div className="min-w-[200px] max-w-[280px] flex-1 text-sm font-semibold text-[#414651]">
                <span className="inline-flex items-center gap-1">
                  Meeting Date & Time <HelpCircle size={16} className="text-[#717680]" aria-hidden="true" />
                </span>
              </div>
              <div className="min-w-[480px] max-w-[512px] flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="mb-2 text-sm text-[#717680]">Start date</div>
                    <div className="relative">
                      <DatePicker value={startDate} onChange={setStartDate} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 text-sm text-[#717680]">Start time</div>
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
                        errors.startTime ? "border-[#fca5a5]" : "border-[#d5d7da]",
                      )}
                    />
                    {errors.startTime ? (
                      <div className="mt-1 text-[12px] leading-[18px] text-[#b91c1c]">
                        {errors.startTime}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 text-sm text-[#717680]">End time</div>
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
                        errors.endTime ? "border-[#fca5a5]" : "border-[#d5d7da]",
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
              <div className="min-w-[200px] max-w-[280px] flex-1 text-sm font-semibold text-[#414651]">
                Short Description
              </div>
              <div className="min-w-[480px] max-w-[512px] flex-1">
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Add a short MOFA meeting description (e.g., agenda, briefing context, key discussion points, and any preparation notes)."
                  className="h-[120px] w-full resize-none rounded-lg border border-[#d5d7da] bg-white p-4 text-[16px] leading-6 text-[#181d27] shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none focus:shadow-[0_1px_2px_rgba(10,13,18,0.05),0_0_0_2px_var(--mofa-btn-outline-focus-halo)]"
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

