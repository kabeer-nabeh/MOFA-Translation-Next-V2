import { AnalyticsChartsClient } from "@/components/analytics/AnalyticsChartsClient";
import { AppShell } from "@/components/layout/AppShell";

export function AnalyticsView() {
  return (
    <AppShell>
      <main className="w-full max-w-6xl mx-auto px-8 py-8 pb-16">
        <AnalyticsChartsClient />
      </main>
    </AppShell>
  );
}
