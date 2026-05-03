"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { formatDateTime } from "@/lib/utils/datetime";
import { Meeting } from "@/lib/types";

type Actions = {
  cancelMeetingAction: (id: string) => Promise<void>;
};

export default function MeetingClient({
  initialData,
  actions,
}: {
  initialData: { meeting: Meeting };
  actions: Actions;
}) {
  const { meeting } = initialData;
  const { cancelMeetingAction } = actions;
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {meeting.meetingGroup?.summary || "Meeting"}
          </h1>
          <p className="text-muted-foreground">
            {meeting.meetingGroup?.description || "No description"}
          </p>
        </div>
        <form action={async () => await cancelMeetingAction(meeting.id)}>
          <Button variant="destructive" type="submit">
            Cancel Meeting
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDateTime(meeting.start)}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {format(parseISO(meeting.start), "h:mm a")} -{" "}
                  {format(parseISO(meeting.end), "h:mm a")}
                </span>
              </div>

              {meeting.meetingGroup?.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{meeting.meetingGroup.location}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Attendees ({meeting.attendees?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {meeting.attendees?.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="size-7">
                      <AvatarImage src={a.user?.image} />
                      <AvatarFallback className="text-xs">
                        {a.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {a.user?.name || a.email}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Meeting Group</CardTitle>
              <CardDescription>
                Original scheduling configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Summary</span>
                <span className="font-medium">
                  {meeting.meetingGroup?.summary}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary">
                  {meeting.meetingGroup?.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span>
                  {meeting.meetingGroup?.duration ||
                    Math.round(
                      (new Date(meeting.end).getTime() -
                        new Date(meeting.start).getTime()) /
                        60000,
                    )}{" "}
                  minutes
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
