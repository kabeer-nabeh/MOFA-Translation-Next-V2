import { FlowRegistry } from "@/components/flows/FlowRegistry";

export const metadata = { title: "Flow Registry — Baseer Voice" };

export default function FlowsPage() {
  return (
    <div className="h-dvh flex flex-col" style={{ background: "var(--mofa-page-bg)" }}>
      <FlowRegistry />
    </div>
  );
}
