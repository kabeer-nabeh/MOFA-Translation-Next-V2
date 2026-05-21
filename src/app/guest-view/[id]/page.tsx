import { GuestShell } from "@/components/layout/GuestShell";
import { MeetingDetailClient } from "@/components/meetings/MeetingDetailClient";

export default async function GuestViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <GuestShell>
      <main className="flex h-full w-full max-w-6xl mx-auto overflow-hidden px-8 py-8">
        <MeetingDetailClient meetingId={id} />
      </main>
    </GuestShell>
  );
}
