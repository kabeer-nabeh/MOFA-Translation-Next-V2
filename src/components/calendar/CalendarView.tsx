import { CalendarPageClient } from "@/components/calendar/CalendarPageClient";
import { AppShell } from "@/components/layout/AppShell";

export function CalendarView() {
  return (
    <AppShell>
      <main className="flex min-h-0 w-full max-w-6xl mx-auto flex-1 flex-col px-8 py-8 pb-16">
        <CalendarPageClient />
      </main>
    </AppShell>
  );
}
