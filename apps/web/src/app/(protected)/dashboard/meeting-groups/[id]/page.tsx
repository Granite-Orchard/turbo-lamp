"use server";
import { meetingGroupsApi } from "@/lib/api/meeting-groups";
import { meetingSlotsApi } from "@/lib/api/meeting-slots";
import {
  calculateSlotsAction,
  createMeetingAction,
  listSlotsAction,
} from "./actions";
import { MeetingGroupDetail } from "./meeting-group-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const [group, slots] = await Promise.all([
    meetingGroupsApi.get(id),
    meetingSlotsApi.list(id),
  ]);

  return (
    <MeetingGroupDetail
      group={group}
      initialSlots={slots}
      initialParticipants={group.participants}
      actions={{
        listSlotsAction: listSlotsAction,
        calculateSlotsAction: calculateSlotsAction,
        createMeetingAction: createMeetingAction,
      }}
    />
  );
}
