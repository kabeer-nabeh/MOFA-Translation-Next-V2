import { MeetingDetailClient } from "@/components/meetings/MeetingDetailClient";
import { AppShell } from "@/components/layout/AppShell";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MeetingDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <AppShell>
      <main className="flex h-full w-full max-w-6xl mx-auto overflow-hidden px-8 py-8">
        <MeetingDetailClient meetingId={id} />
      </main>
    </AppShell>
  );
}
