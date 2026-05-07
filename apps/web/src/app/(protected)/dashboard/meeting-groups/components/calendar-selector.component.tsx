"use client";

import { z } from "zod";

import { meetingGroupSchema } from "@/lib/schemas";
import { Calendar } from "@/lib/types";

import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormData = z.input<typeof meetingGroupSchema>;
type FormErrors = Partial<Record<keyof FormData | "root", string>>;

export function CalendarSelector({
  form,
  calendars,
  errors,
  handleChangeAction,
}: {
  form: FormData;
  calendars: Calendar[];
  errors: FormErrors;
  handleChangeAction: <K extends keyof FormData>(
    key: K,
    value: FormData[K],
  ) => void;
}) {
  return (
    <Field className="w-auto">
      <FieldLabel htmlFor="select-calendar">
        Select a Calendar for this group
      </FieldLabel>

      <Select
        value={form.calendarId ?? ""}
        onValueChange={(value) => handleChangeAction("calendarId", value)}
        disabled={calendars.length === 0}
      >
        <SelectTrigger id="select-calendar" className="w-72">
          <SelectValue placeholder="Select a Calendar" />
        </SelectTrigger>

        <SelectContent>
          {calendars.map((calendar) => (
            <SelectItem key={calendar.id} value={calendar.id}>
              {calendar.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {calendars.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          No calendars available.
        </p>
      )}

      {errors.calendarId && (
        <p className="mt-2 text-xs text-destructive">{errors.calendarId}</p>
      )}
    </Field>
  );
}
