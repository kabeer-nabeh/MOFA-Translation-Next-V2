"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: Date;
  onChange: (d: Date) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  
  const [viewDate, setViewDate] = React.useState(new Date(value));

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // e.g. "22/04/26"
  const formatInput = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const daysInPrevMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0).getDate();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <button 
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-[#d5d7da] bg-white px-[14px] py-[10px] text-[16px] text-[#414651] shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none focus:shadow-[0_1px_2px_rgba(10,13,18,0.05),0_0_0_2px_var(--mofa-btn-outline-focus-halo)]"
      >
        <span>{formatInput(value)}</span>
        <CalendarIcon size={18} className="text-[#717680]" />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-50 w-72 rounded-xl border border-[#e9eaeb] bg-white p-4 shadow-[0_12px_24px_rgba(0,0,0,0.12)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[17px] font-semibold text-[#414651]">
              {viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-1">
              <button 
                type="button" 
                onClick={handlePrevMonth} 
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#717680] transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#48476e]"
              >
                <ArrowUp size={16} />
              </button>
              <button 
                type="button" 
                onClick={handleNextMonth} 
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#717680] transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#48476e]"
              >
                <ArrowDown size={16} />
              </button>
            </div>
          </div>
          
          <div className="mb-2 grid grid-cols-7 gap-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-[13px] font-medium text-[#717680]">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center">
            {/* Prev month days */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="flex h-8 w-8 items-center justify-center mx-auto text-[14px] text-[#d5d7da]">
                {daysInPrevMonth - firstDay + i + 1}
              </div>
            ))}
            
            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = 
                value.getDate() === day && 
                value.getMonth() === viewDate.getMonth() && 
                value.getFullYear() === viewDate.getFullYear();
                
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                    onChange(newDate);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center mx-auto rounded-full text-[14px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#48476e]",
                    isSelected 
                      ? "bg-[#48476e] font-semibold text-white hover:bg-[#3f3e63]" 
                      : "text-[#414651] hover:bg-slate-100"
                  )}
                >
                  {day}
                </button>
              );
            })}
            
            {/* Next month days padding to always show 6 rows (42 cells) */}
            {Array.from({ length: 42 - (firstDay + daysInMonth) }).map((_, i) => (
              <div key={`next-${i}`} className="flex h-8 w-8 items-center justify-center mx-auto text-[14px] text-[#d5d7da]">
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
