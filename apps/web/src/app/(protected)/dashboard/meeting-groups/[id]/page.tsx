"use server";
import { getMeetingGroupAction } from "@/lib/actions/meeting-groups";
import { createMeetingAction } from "@/lib/actions/meetings";
import {
  calculateMeetingSlotsAction,
  listMeetingSlotsAction,
} from "@/lib/actions/meeting-slots";
import { MeetingGroupDetail } from "./meeting-group-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const [group, slots] = await Promise.all([
    getMeetingGroupAction(id),
    listMeetingSlotsAction(id),
  ]);

  return (
    <MeetingGroupDetail
      group={group}
      initialSlots={slots}
      initialParticipants={group.participants}
      actions={{
        listSlotsAction: listMeetingSlotsAction,
        calculateSlotsAction: calculateMeetingSlotsAction,
        createMeetingAction: createMeetingAction,
      }}
    />
  );
}
