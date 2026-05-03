"use client";

import { Availability } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DAYS, TIMES, TIMEZONES } from "@/lib/constants";
import { Clock } from "lucide-react";
import { useProfile } from "@/lib/providers/profile-provider";

type Actions = {
  updateAvailabilityAction: (
    id: string,
    data: Partial<Availability>,
  ) => Promise<Availability>;
};

export default function AvailabilityClient({
  initialData,
  actions,
}: {
  initialData: Availability[];
  actions: Actions;
}) {
  const profile = useProfile();
  const router = useRouter();
  const [availabilities, setAvailabilities] =
    useState<Availability[]>(initialData);

  const updateAvailability = async (
    id: string,
    field: keyof Availability,
    value: string | boolean,
  ) => {
    const foundAvailability = availabilities.find((a) => a.id === id);
    if (!foundAvailability) return;
    const updatedCopy: Availability = {
      ...foundAvailability,
      [field]: value,
    };
    await actions.updateAvailabilityAction(id, updatedCopy);
    setAvailabilities(
      availabilities.map((a) => (a.id === id ? updatedCopy : a)),
    );
    router.refresh();
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timezone</CardTitle>
          <CardDescription>
            All times are displayed in your selected timezone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select defaultValue={profile.user.timezone ?? "America/Halifax"}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => {
                return (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Schedule</CardTitle>
          <CardDescription>
            Define the hours you&apos;re available for meetings each day of the
            week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availabilities.map((day) => (
            <div
              key={day.id}
              className={`flex flex-col gap-4 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center ${
                day.isAvailable ? "bg-background" : "bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3 sm:w-40">
                <Switch
                  id={`day-${day.dayOfWeek}`}
                  checked={day.isAvailable}
                  onCheckedChange={(checked) =>
                    updateAvailability(
                      day.id,
                      "isAvailable",
                      checked as boolean,
                    )
                  }
                />
                <Label
                  htmlFor={`day-${day.dayOfWeek}`}
                  className={`font-medium ${!day.isAvailable ? "text-muted-foreground" : ""}`}
                >
                  {DAYS[day.dayOfWeek]}
                </Label>
              </div>

              {day.isAvailable ? (
                <div className="flex flex-1 flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <Select
                      value={day.startTime}
                      onValueChange={(value) =>
                        updateAvailability(day.id, "startTime", value)
                      }
                    >
                      <SelectTrigger className="w-32.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMES.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-muted-foreground">to</span>
                  <Select
                    value={day.endTime}
                    onValueChange={(value) =>
                      updateAvailability(day.id, "endTime", value)
                    }
                  >
                    <SelectTrigger className="w-32.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMES.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Unavailable
                </span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
