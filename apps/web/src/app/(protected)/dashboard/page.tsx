import { meetingGroupsApi } from "@/lib/api/meeting-groups";
import { meetingParticipantsApi } from "@/lib/api/meeting-participants";
import { meetingsApi } from "@/lib/api/meetings";
import DashboardClient from "./dashboard-client";

export default async function Page() {
  const [meetingGroupsResult, meetingsResult, participationsResult] =
    await Promise.all([
      meetingGroupsApi.list(),
      meetingsApi.list(),
      meetingParticipantsApi.list(),
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
