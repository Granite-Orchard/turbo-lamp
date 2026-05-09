import { deleteMeetingAction, getMeetingAction } from "@/lib/actions/meetings";
import MeetingClient from "./meeting-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const meeting = await getMeetingAction(id);

  return (
    <MeetingClient
      initialData={{
        meeting,
      }}
      actions={{
        cancelMeetingAction: deleteMeetingAction,
      }}
    />
  );
}
