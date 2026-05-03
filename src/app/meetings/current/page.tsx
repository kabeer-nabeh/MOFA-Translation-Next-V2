import { redirect } from "next/navigation";

import { getCurrentMeeting } from "@/lib/services/meetings";

/** Alias route — resolves to whatever `getCurrentMeeting` returns as active/live demo meeting. */
export default async function MeetingCurrentRedirectPage() {
  const meeting = await getCurrentMeeting();
  if (!meeting) redirect("/meetings");
  redirect(`/meetings/${meeting.id}`);
}
