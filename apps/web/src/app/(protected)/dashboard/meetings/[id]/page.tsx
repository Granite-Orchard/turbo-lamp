import { meetingsApi } from "@/lib/api/meetings";
import MeetingClient from "./meeting-client";
import { cancelMeetingAction } from "./actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const meeting = await meetingsApi.get(id);

  return (
    <MeetingClient
      initialData={{
        meeting,
      }}
      actions={{
        cancelMeetingAction,
      }}
    />
  );
}
