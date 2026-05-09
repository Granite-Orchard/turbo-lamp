import { listMeetingAttendeesAction } from "@/lib/actions/meeting-attendees";
import { AttendeesClient } from "./attendees-client";

export default async function Page() {
  const attendees = await listMeetingAttendeesAction();

  return <AttendeesClient initialAttendees={attendees} />;
}

