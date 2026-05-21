import { GuestJoinClient } from "@/components/guest/GuestJoinClient";

export default async function GuestJoinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GuestJoinClient meetingId={id} />;
}
