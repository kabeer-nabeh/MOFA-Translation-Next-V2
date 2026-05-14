import { CalendarView } from "@/components/calendar/CalendarView";

// Always server-render on demand so new Date() reflects the visitor's real date,
// not the stale build-time date from static pre-generation.
export const dynamic = "force-dynamic";

export default function CalendarPage() {
  return <CalendarView />;
}
