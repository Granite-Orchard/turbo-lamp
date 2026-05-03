"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meeting } from "@/lib/types";
import { formatDateTime } from "@/lib/utils/datetime";
import { Calendar, MoreVertical } from "lucide-react";
import Link from "next/link";

type Actions = {
  updateMeetingAction: (id: string, data: Partial<Meeting>) => Promise<Meeting>;
};

export default function MeetingsClient({
  initialData,
  actions,
}: {
  initialData: {
    meetings: Meeting[];
  };
  actions: Actions;
}) {
  const { meetings } = initialData;

  return (
    <div className="">
      {meetings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="size-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-lg">No meetings scheduled</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create a meeting group to schedule meetings
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <Card
              key={meeting.id}
              className="group transition-colors hover:bg-muted/50"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">
                      {meeting.meetingGroup?.summary || "Meeting"}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    asChild
                  >
                    <Link href={`/dashboard/meetings/${meeting.id}`}>
                      <MoreVertical className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    {formatDateTime(meeting.start)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {meeting.attendees?.slice(0, 4).map((a) => (
                        <Avatar
                          key={a.id}
                          className="size-7 border-2 border-background"
                        >
                          <AvatarImage src={a.user?.image} />
                          <AvatarFallback className="text-xs">
                            {a.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    {meeting.attendees && meeting.attendees.length > 4 && (
                      <span className="text-xs text-muted-foreground">
                        +{meeting.attendees.length - 4}
                      </span>
                    )}
                  </div>
                  <Badge variant="secondary">Scheduled</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
