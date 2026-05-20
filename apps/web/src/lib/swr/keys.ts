export const meetingParticipantKeys = {
  list: (meetingGroupId: string) =>
    ["meeting-participants", "group", meetingGroupId] as const,

  detail: (id: string) => ["meeting-participants", "detail", id] as const,
};
