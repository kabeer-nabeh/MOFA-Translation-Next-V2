"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { NewMeetingModal } from "@/components/meetings/NewMeetingModal";
import { Button } from "@/components/ui/Button";

export function HeroBanner() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <section
        aria-labelledby="hero-banner-title"
        className="relative min-h-[280px] w-full overflow-hidden rounded-2xl bg-[color:var(--mofa-accent-dark)] shadow-[0_12px_28px_rgba(4,30,22,0.14)] sm:min-h-[300px]"
      >
        <Image
          src="/hero-banner.png"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="(max-width: 640px) 300px, (max-width: 1024px) 70vw, 890px"
          className="object-cover object-[58%_center]"
          style={{ transform: "scale(1.04)" }}
        />
        <div className="relative flex min-h-[280px] max-w-[430px] flex-col justify-center px-6 py-6 sm:min-h-[300px] sm:px-8 lg:px-10">
          <h1
            id="hero-banner-title"
            className="max-w-[16ch] text-3xl font-semibold leading-[1.08] tracking-tight text-[color:var(--mofa-btn-primary-text)] sm:text-4xl"
          >
            Translate meetings
            <br />
            in real time
          </h1>
          <p className="mt-3 max-w-[42ch] text-sm leading-5 text-white/88">
            English and Arabic captions, audio, and records in one secure workspace.
          </p>
          <Button
            variant="secondary"
            size="lg"
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Create meeting"
            className="mt-5 h-11 w-fit border-white/85 bg-white px-4 text-[color:var(--mofa-accent-dark)] hover:bg-[color:var(--mofa-accent-light)]"
          >
            Create meeting
            <ArrowRight size={17} aria-hidden />
          </Button>
        </div>
      </section>
      <NewMeetingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
