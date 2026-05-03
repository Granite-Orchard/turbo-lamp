import { listMeetingsAction, updateMeetingAction } from "./actions";
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
