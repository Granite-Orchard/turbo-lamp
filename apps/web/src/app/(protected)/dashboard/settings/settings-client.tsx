"use client";

import { Calendar, ExternalCalendar } from "@/lib/types";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarIcon, Link2, Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export function CalendarEntry({
  calendar,
  toggleCalendarEnabledAction,
}: {
  calendar: Calendar;
  toggleCalendarEnabledAction: (
    id: string,
    data: Partial<Calendar>,
  ) => Promise<Calendar>;
}) {
  const [checked, setChecked] = useState<boolean>(calendar.enabled);

  const handleOnCheckedChange = async (id: string) => {
    const previous = checked;
    const newChecked = !checked;
    setChecked(newChecked);
    try {
      return await toggleCalendarEnabledAction(id, { enabled: newChecked });
    } catch {
      setChecked(previous);
    }
  };
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <CalendarIcon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{calendar.name}</p>
          <p className="text-xs text-muted-foreground">
            {calendar.providerId} • {calendar.timezone}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={checked}
          onCheckedChange={async () => await handleOnCheckedChange(calendar.id)}
        />
        <Badge variant={checked ? "secondary" : "outline"}>
          {checked ? "Active" : "Disabled"}
        </Badge>
      </div>
    </div>
  );
}

export function AddCalendarDialog({
  externalCalendars,
  calendars,
}: {
  externalCalendars: ExternalCalendar[];
  calendars: Calendar[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 self-end">
          <Plus className="size-4" />
          Add External Calendar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add External Calendar</DialogTitle>
          <DialogDescription>
            Add new Calendars from your external source. These can then be used
            when creating meeting groups.
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="flex flex-col gap-2">
            {externalCalendars.map((c) => {
              const checked = calendars.some(
                (cal) => c.calendarId === cal.externalId,
              );
              return (
                <label
                  key={c.calendarId}
                  htmlFor={`cal-${c.calendarId}`}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-lg border p-2 transition-colors duration-150",
                    checked
                      ? "border-primary/40 bg-primary/5"
                      : "border-border hover:border-muted-foreground/40 hover:bg-muted/30",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
                        checked
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {(c.name ?? "C")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {c.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {c.providerId}
                      </p>
                    </div>
                  </div>
                  <Checkbox
                    id={`cal-${c.calendarId}`}
                    checked={checked}
                    onCheckedChange={() => console.log("changed")}
                  />
                </label>
              );
            })}
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => console.log("hello world")} disabled={true}>
            Add Calendar(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type Actions = {
  toggleCalendarEnabledAction: (
    id: string,
    data: Partial<Calendar>,
  ) => Promise<Calendar>;
  createCalendarAction: (data: Partial<Calendar>) => Promise<Calendar>;
};

export default function SettingsClient({
  initialData,
  actions,
}: {
  initialData: {
    calendars: Calendar[];
    externalCalendars: ExternalCalendar[];
  };
  actions: Actions;
}) {
  const {
    calendars: initialCalendars,
    externalCalendars: initialExternalCalendars,
  } = initialData;
  const [calendars, setCalendars] = useState<Calendar[]>(initialCalendars);
  const [externalCalendars, setExternalCalendars] = useState<
    ExternalCalendar[]
  >(initialExternalCalendars);

  return (
    <div className="">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Connected Calendars
              </CardTitle>
              <CardDescription>
                Manage your connected calendar accounts
              </CardDescription>
            </div>
            <AddCalendarDialog
              externalCalendars={externalCalendars}
              calendars={calendars}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            {calendars.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No calendars connected.
              </p>
            ) : (
              calendars.map((cal) => (
                <CalendarEntry
                  key={cal.id}
                  calendar={cal}
                  toggleCalendarEnabledAction={
                    actions.toggleCalendarEnabledAction
                  }
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive email updates about meetings
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Calendar sync</p>
                <p className="text-xs text-muted-foreground">
                  Sync meetings to your calendar
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Delete account</p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive" disabled>
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
