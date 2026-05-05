import {
  listMeetingsAction,
  updateMeetingAction,
} from "@/lib/actions/meetings";
import MeetingsClient from "./meetings-client";

export default async function Page() {
  const meetings = await listMeetingsAction();

  return (
    <MeetingsClient
      initialData={{
        meetings,
      }}
      actions={{
        updateMeetingAction,
      }}
    />
  );
}
