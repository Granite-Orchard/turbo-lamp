import { listMeetingGroupsAction } from "@/lib/actions/meeting-groups";
import { listMeetingsAction } from "@/lib/actions/meetings";
import DashboardClient from "./dashboard-client";
import { listMeetingGroupParticipantsAction } from "@/lib/actions/meeting-participants";

export default async function Page() {
  const [meetingGroupsResult, meetingsResult, participationsResult] =
    await Promise.all([
      listMeetingGroupsAction(),
      listMeetingsAction(),
      listMeetingGroupParticipantsAction(),
    ]);

  return (
    <DashboardClient
      initialData={{
        meetingGroups: meetingGroupsResult,
        meetings: meetingsResult,
        participations: participationsResult,
      }}
    />
  );
}
