"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CalendarOff, Clock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { TIMES } from "@/lib/constants";
import type { AvailabilityOverride } from "@/lib/types";

type Actions = {
  createAvailabilityOverrideAction: (
    data: Partial<AvailabilityOverride>,
  ) => Promise<AvailabilityOverride>;
  updateAvailabilityOverrideAction: (
    id: string,
    data: Partial<AvailabilityOverride>,
  ) => Promise<AvailabilityOverride>;
  deleteAvailabilityOverrideAction: (id: string) => Promise<unknown>;
};

function formatDate(dateString: string) {
  return new Date(dateString.split("T")[0] + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
}

function formatTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const ampm = hour < 12 ? "AM" : "PM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

export default function OverridesClient({
  initialData,
  actions,
}: {
  initialData: AvailabilityOverride[];
  actions: Actions;
}) {
  const [overrides, setOverrides] =
    useState<AvailabilityOverride[]>(initialData);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOverride, setNewOverride] = useState({
    date: "",
    isAvailable: false,
    startTime: "09:00",
    endTime: "17:00",
  });

  const addOverride = async () => {
    if (!newOverride.date) return;

    const override = await actions.createAvailabilityOverrideAction({
      ...newOverride,
      startTime: newOverride.isAvailable ? newOverride.startTime : "00:00",
      endTime: newOverride.isAvailable ? newOverride.endTime : "00:00",
    });

    setOverrides((prev) => [...prev, override]);
    setIsDialogOpen(false);
    setNewOverride({
      date: "",
      isAvailable: false,
      startTime: "09:00",
      endTime: "17:00",
    });
  };

  const removeOverride = async (id: string) => {
    await actions.deleteAvailabilityOverrideAction(id);
    setOverrides((prev) => prev.filter((o) => o.id !== id));
  };

  const sortedOverrides = [...overrides].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const upcomingOverrides = sortedOverrides.filter(
    (o) => new Date(o.date) >= new Date(new Date().toDateString()),
  );
  const pastOverrides = sortedOverrides.filter(
    (o) => new Date(o.date) < new Date(new Date().toDateString()),
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 self-end">
            <Plus className="size-4" />
            Add Override
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Availability Override</DialogTitle>
            <DialogDescription>
              Block off a date or set custom hours for a specific day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newOverride.date}
                onChange={(e) =>
                  setNewOverride((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Custom Hours</Label>
                <p className="text-xs text-muted-foreground">
                  {newOverride.isAvailable
                    ? "Set specific available hours"
                    : "Mark as completely unavailable"}
                </p>
              </div>
              <Switch
                checked={newOverride.isAvailable}
                onCheckedChange={(checked) =>
                  setNewOverride((prev) => ({
                    ...prev,
                    isAvailable: checked,
                  }))
                }
              />
            </div>
            {newOverride.isAvailable && (
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-2">
                  <Label>Start Time</Label>
                  <Select
                    value={newOverride.startTime}
                    onValueChange={(value) =>
                      setNewOverride((prev) => ({
                        ...prev,
                        startTime: value,
                      }))
                    }
                  >
                    <SelectTrigger>
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
                <div className="flex-1 space-y-2">
                  <Label>End Time</Label>
                  <Select
                    value={newOverride.endTime}
                    onValueChange={(value) =>
                      setNewOverride((prev) => ({ ...prev, endTime: value }))
                    }
                  >
                    <SelectTrigger>
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
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addOverride} disabled={!newOverride.date}>
              Add Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Overrides</CardTitle>
          <CardDescription>
            These dates will override your regular weekly availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingOverrides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarOff className="size-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No upcoming overrides
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add an override for dates when you need different availability
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingOverrides.map((override) => (
                <div
                  key={override.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg ${
                        override.isAvailable
                          ? "bg-primary/10"
                          : "bg-destructive/10"
                      }`}
                    >
                      {override.isAvailable ? (
                        <Clock className="size-5 text-primary" />
                      ) : (
                        <CalendarOff className="size-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{formatDate(override.date)}</p>
                      <p className="text-sm text-muted-foreground">
                        {override.isAvailable
                          ? `Available ${formatTime(override.startTime)} - ${formatTime(override.endTime)}`
                          : "Unavailable all day"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={override.isAvailable ? "default" : "destructive"}
                    >
                      {override.isAvailable ? "Custom Hours" : "Blocked"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOverride(override.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pastOverrides.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Past Overrides</CardTitle>
            <CardDescription>
              Historical overrides that have already passed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 opacity-60">
              {pastOverrides.map((override) => (
                <div
                  key={override.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      {override.isAvailable ? (
                        <Clock className="size-5 text-muted-foreground" />
                      ) : (
                        <CalendarOff className="size-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{formatDate(override.date)}</p>
                      <p className="text-sm text-muted-foreground">
                        {override.isAvailable
                          ? `Available ${formatTime(override.startTime)} - ${formatTime(override.endTime)}`
                          : "Unavailable all day"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Past</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
