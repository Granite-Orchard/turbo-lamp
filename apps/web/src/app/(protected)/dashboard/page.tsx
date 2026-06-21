import { listMeetingGroupsAction } from "@/lib/actions/meeting-groups";
import { listMeetingsAction } from "@/lib/actions/meetings";
import DashboardClient from "./dashboard-client";

export default async function Page() {
  const [meetingGroupsResult, meetingsResult] = await Promise.all([
    listMeetingGroupsAction(),
    listMeetingsAction(),
  ]);

  return (
    <DashboardClient
      initialData={{
        meetingGroups: meetingGroupsResult,
        meetings: meetingsResult,
        participations: [],
      }}
    />
  );
}
