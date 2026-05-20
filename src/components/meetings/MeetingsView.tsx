import { MeetingsPageClient } from "@/components/meetings/MeetingsPageClient";
import { AppShell } from "@/components/layout/AppShell";

export function MeetingsView() {
  return (
    <AppShell>
      <main className="flex w-full max-w-6xl mx-auto flex-1 min-h-0 flex-col px-8 py-8">
        <MeetingsPageClient />
      </main>
    </AppShell>
  );
}
