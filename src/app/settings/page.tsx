import { Suspense } from "react";

import { SettingsView } from "@/components/settings/SettingsView";

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh w-full bg-[color:var(--mofa-page-bg)]" />
      }
    >
      <SettingsView />
    </Suspense>
  );
}

