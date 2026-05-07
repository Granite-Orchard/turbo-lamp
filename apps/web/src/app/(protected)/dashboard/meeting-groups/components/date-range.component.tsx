"use client";

import { z } from "zod";
import * as React from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { meetingGroupSchema } from "@/lib/schemas";

const today = new Date();

type FormData = z.input<typeof meetingGroupSchema>;

type Actions = {
  handleAfterAction: (after: FormData["after"]) => void;
  handleBeforeAction: (before: FormData["before"]) => void;
};

export function DatePickerWithRange({ actions }: { actions: Actions }) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    to: addDays(
      new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      7,
    ),
  });

  return (
    <Field className="w-auto">
      <FieldLabel htmlFor="date-picker-range">Date Range</FieldLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date-picker-range"
            className="justify-start px-2.5 font-normal"
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            required={true}
            defaultMonth={date?.from}
            selected={date}
            onSelect={(data: DateRange) => {
              if (data.from)
                actions.handleAfterAction(data.from!.toISOString());
              if (data.to) actions.handleBeforeAction(data.to!.toISOString());
              setDate(data);
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
