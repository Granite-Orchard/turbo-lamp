import { listCalendarsAction } from "@/lib/actions/calendars";
import {
  createMeetingGroupAction,
  deleteMeetingGroupAction,
  listMeetingGroupsAction,
  updateMeetingGroupAction,
} from "@/lib/actions/meeting-groups";
import { createMeetingGroupParticipantsAction } from "./actions";
import MeetingGroupsClient from "./meeting-groups-client";

export default async function Page() {
  const [meetingGroups, calendars] = await Promise.all([
    listMeetingGroupsAction(),
    listCalendarsAction(),
  ]);

  return (
    <MeetingGroupsClient
      initialData={{ meetingGroups, calendars }}
      actions={{
        createMeetingGroupAction: createMeetingGroupAction,
        updateMeetingGroupAction: updateMeetingGroupAction,
        deleteMeetingGroupAction: deleteMeetingGroupAction,
        createMeetingGroupParticipantsAction:
          createMeetingGroupParticipantsAction,
      }}
    />
  );
}
