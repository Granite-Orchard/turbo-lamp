import { meetingsApi } from "@/lib/api/meetings";
import MeetingsClient from "./meetings-client";

const updateMeetingAction = async () => {
  await Promise.resolve();
};

export default async function Page() {
  const meetings = await meetingsApi.list();

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
