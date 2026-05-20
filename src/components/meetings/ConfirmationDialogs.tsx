"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";

export function DeclineConfirmationModal({
  meetingTitle,
  onCancel,
  onConfirm,
}: {
  meetingTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0a0d12]/35 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="decline-meeting-title"
    >
      <div className="w-full max-w-md rounded-xl border border-[color:var(--mofa-border-default)] bg-white p-6 shadow-[0_24px_64px_rgba(10,13,18,0.24)]">
        <div className="flex flex-col gap-2">
          <h2 id="decline-meeting-title" className="text-lg font-semibold text-[color:var(--mofa-text-body)]">
            Decline this meeting?
          </h2>
          <p className="text-sm leading-6 text-[color:var(--mofa-text-subtle)]">
            You are about to decline &quot;{meetingTitle}&quot;. You can revoke the decline later from the meeting menu.
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" size="md" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="border-[#b42318] bg-[#b42318] hover:bg-[#912018]"
            onClick={onConfirm}
          >
            Decline meeting
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CancelMeetingModal({
  meetingTitle,
  onCancel,
  onConfirm,
}: {
  meetingTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0a0d12]/35 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-meeting-title"
    >
      <div className="w-full max-w-md rounded-xl border border-[color:var(--mofa-border-default)] bg-white p-6 shadow-[0_24px_64px_rgba(10,13,18,0.24)]">
        <div className="flex flex-col gap-2">
          <h2 id="cancel-meeting-title" className="text-lg font-semibold text-[color:var(--mofa-text-body)]">
            Cancel this meeting?
          </h2>
          <p className="text-sm leading-6 text-[color:var(--mofa-text-subtle)]">
            You are about to cancel &quot;{meetingTitle}&quot;. All attendees will be notified and the meeting will be removed from their calendars.
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" size="md" onClick={onCancel}>
            Keep meeting
          </Button>
          <Button
            variant="primary"
            size="md"
            className="border-[#b42318] bg-[#b42318] hover:bg-[#912018]"
            onClick={onConfirm}
          >
            Cancel meeting
          </Button>
        </div>
      </div>
    </div>
  );
}
