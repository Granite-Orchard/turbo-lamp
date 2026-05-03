"use client";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meeting, MeetingGroup, MeetingParticipant } from "@/lib/types";
import { format } from "date-fns";
import { Calendar, CheckCircle, Clock, Users } from "lucide-react";
import { Badge } from "../../../components/ui/badge";

type InitialData = {
  meetingGroups: MeetingGroup[];
  meetings: Meeting[];
  participations: MeetingParticipant[];
};

export default function DashboardClient({
  initialData,
}: {
  initialData: InitialData;
}) {
  const { meetingGroups, meetings, participations } = initialData;

  const now = new Date();

  const activeGroups = meetingGroups.filter((g) => g.status === "open").length;

  const upcomingMeetings = meetings.filter(
    (m) => new Date(m.start) > now,
  ).length;

  const pendingInvitations = participations.filter(
    (p) => p.invitationState === "pending",
  ).length;

  const scheduledMeetings = meetingGroups.filter(
    (g) => g.status === "finalized",
  ).length;

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Active Groups" value={activeGroups} icon={Users} />
        <MetricCard
          title="Upcoming Meetings"
          value={upcomingMeetings}
          icon={Calendar}
        />
        <MetricCard
          title="Pending Invitations"
          value={pendingInvitations}
          icon={Clock}
        />
        <MetricCard
          title="Scheduled"
          value={scheduledMeetings}
          icon={CheckCircle}
        />
      </div>
      {/* Recent Meeting Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Meeting Groups</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {meetingGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No meeting groups yet
            </p>
          ) : (
            meetingGroups.slice(0, 5).map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between border rounded-md p-3"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <h2 className="font-bold">{group.summary}</h2>
                    <Badge variant={"outline"} className="rounded-md p-2">
                      {group.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="text-xs flex gap-2 text-muted-foreground">
                    <div>{format(group.after, "MMM d, yyyy h:mm a")}</div>
                    {"to"}
                    <div>{format(group.before, "MMM d, yyyy h:mm a")}</div>
                  </div>
                  <p>{group.description}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      {/* Upcoming Meetings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Meetings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {meetings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No meetings scheduled
            </p>
          ) : (
            meetings
              .filter((m) => new Date(m.start) > now)
              .slice(0, 5)
              .map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between border rounded-md p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {meeting.meetingGroup?.summary}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(meeting.start).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
