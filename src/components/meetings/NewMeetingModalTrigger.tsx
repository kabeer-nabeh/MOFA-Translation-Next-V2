"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { NewMeetingModal } from "@/components/meetings/NewMeetingModal";
import { Button } from "@/components/ui/Button";

export function NewMeetingModalTrigger({ label }: { label: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        className="h-11 gap-2 px-4"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Plus size={16} aria-hidden="true" />
        {label}
      </Button>
      <NewMeetingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

