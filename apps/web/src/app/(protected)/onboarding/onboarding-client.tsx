"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { DAYS } from "@/lib/constants";
import type {
  Availability,
  AvailabilityOverride,
  Calendar,
  ExternalCalendar,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

// Sentinel times for "all day blocked" overrides (isAvailable: false)
const ALL_DAY_START = "00:00";
const ALL_DAY_END = "23:59";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

type ValidationError = string | null;

type Props = {
  initialData: {
    externalCalendars: ExternalCalendar[];
    calendars: Calendar[];
    availabilities: Availability[];
    overrides: AvailabilityOverride[];
  };
  actions: {
    saveCalendarsAction: (data: Calendar[]) => Promise<Calendar[]>;
    saveAvailabilitiesAction: (
      data: Partial<Availability>[],
    ) => Promise<Availability[]>;
    saveAvailabilityOverridesAction: (
      data: AvailabilityOverride[],
    ) => Promise<AvailabilityOverride[]>;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createDefaultAvailabilities(): Partial<Availability>[] {
  return DAYS.map((_, dayIndex) => {
    const isWeekend = [0, 6].includes(dayIndex);
    return {
      dayOfWeek: dayIndex,
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: !isWeekend,
    };
  });
}

function normalizeChecked(value: unknown): boolean {
  return value === true;
}

/** Returns true if endTime is strictly after startTime */
function isTimeRangeValid(startTime: string, endTime: string): boolean {
  return startTime < endTime;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEP_LABELS: Record<Step, string> = {
  1: "Calendars",
  2: "Availability",
  3: "Overrides",
};

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-0">
      {([1, 2, 3] as Step[]).map((s, i) => {
        const done = current > s;
        const active = current === s;
        return (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-300",
                  done && "border-primary bg-primary text-primary-foreground",
                  active &&
                    "border-primary bg-background text-primary shadow-sm ring-2 ring-primary/20",
                  !done &&
                    !active &&
                    "border-muted-foreground/30 bg-muted text-muted-foreground",
                )}
              >
                {done ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  s
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-200",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {STEP_LABELS[s]}
              </span>
            </div>
            {i < 2 && (
              <div
                className={cn(
                  "mx-2 mb-5 h-0.5 w-16 rounded-full transition-all duration-500",
                  current > s ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Time Input ───────────────────────────────────────────────────────────────

function TimeInput({
  value,
  onChange,
  disabled,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <input
      id={id}
      type="time"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "transition-opacity duration-150",
      )}
    />
  );
}

// ─── Step 1 — Calendars ───────────────────────────────────────────────────────

function CalendarsStep({
  externalCalendars,
  selectedCalendarIds,
  onToggle,
  error,
}: {
  externalCalendars: ExternalCalendar[];
  selectedCalendarIds: Set<string>;
  onToggle: (id: string, checked: boolean) => void;
  error: ValidationError;
}) {
  if (externalCalendars.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <svg
              className="h-6 w-6 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium">No calendars connected</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Connect a calendar provider to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Calendars</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose which calendars to sync with your workspace.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856C18.448 19 19 18.105 19 17c0-.34-.07-.67-.2-.97L13.73 4.58A2 2 0 0012 3.5a2 2 0 00-1.73 1.08L4.2 16.03c-.13.3-.2.63-.2.97 0 1.105.552 2 1.082 2z"
              />
            </svg>
            {error}
          </div>
        )}
        {externalCalendars.map((c) => {
          const checked = selectedCalendarIds.has(c.calendarId);
          return (
            <label
              key={c.calendarId}
              htmlFor={`cal-${c.calendarId}`}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-lg border p-3.5 transition-colors duration-150",
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
                  <p className="text-sm font-medium leading-none">{c.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {c.providerId}
                  </p>
                </div>
              </div>
              <Checkbox
                id={`cal-${c.calendarId}`}
                checked={checked}
                onCheckedChange={(v) =>
                  onToggle(c.calendarId, normalizeChecked(v))
                }
              />
            </label>
          );
        })}
        <p className="mt-1 text-xs text-muted-foreground">
          {selectedCalendarIds.size} of {externalCalendars.length} selected
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Step 2 — Availability ────────────────────────────────────────────────────

function AvailabilityStep({
  availabilities,
  allDaysFilled,
  onAdd,
  onRemove,
  onToggle,
  onUpdate,
  error,
}: {
  availabilities: Availability[];
  allDaysFilled: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  onUpdate: (
    id: string,
    field: "startTime" | "endTime" | "dayOfWeek",
    value: string | number,
  ) => void;
  error: ValidationError;
}) {
  const enabledCount = availabilities.filter((a) => a.isAvailable).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Weekly Availability</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Set the hours you&apos;re available each day.
            </p>
          </div>
          {!allDaysFilled && (
            <Button variant="outline" size="sm" onClick={onAdd}>
              <svg
                className="mr-1.5 h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add day
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856C18.448 19 19 18.105 19 17c0-.34-.07-.67-.2-.97L13.73 4.58A2 2 0 0012 3.5a2 2 0 00-1.73 1.08L4.2 16.03c-.13.3-.2.63-.2.97 0 1.105.552 2 1.082 2z"
              />
            </svg>
            {error}
          </div>
        )}

        {availabilities
          .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
          .map((a) => {
            const invalid =
              a.isAvailable && !isTimeRangeValid(a.startTime, a.endTime);
            return (
              <div
                key={a.id}
                className={cn(
                  "rounded-lg border p-3.5 transition-colors duration-150",
                  a.isAvailable
                    ? invalid
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-primary/20 bg-primary/5"
                    : "border-border bg-muted/20",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      id={`day-${a.id}`}
                      checked={a.isAvailable}
                      onCheckedChange={() => onToggle(a.id)}
                    />
                    <select
                      value={a.dayOfWeek}
                      onChange={(e) =>
                        onUpdate(
                          a.id,
                          "dayOfWeek",
                          parseInt(e.target.value, 10),
                        )
                      }
                      className={cn(
                        "w-28 rounded-md border border-input bg-background px-2 py-1.5 text-sm shadow-sm",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                        !a.isAvailable && "text-muted-foreground",
                      )}
                    >
                      {DAYS.map((day, i) => (
                        <option key={i} value={i}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {a.isAvailable ? (
                      <>
                        <TimeInput
                          value={a.startTime}
                          onChange={(v) => onUpdate(a.id, "startTime", v)}
                        />
                        <span className="text-xs text-muted-foreground">
                          to
                        </span>
                        <TimeInput
                          value={a.endTime}
                          onChange={(v) => onUpdate(a.id, "endTime", v)}
                        />
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Unavailable
                      </span>
                    )}
                    <button
                      onClick={() => onRemove(a.id)}
                      className="ml-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove day"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {invalid && (
                  <p className="mt-1.5 text-xs text-destructive">
                    End time must be after start time.
                  </p>
                )}
              </div>
            );
          })}

        {availabilities.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <svg
                className="h-5 w-5 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">No availability set</p>
              <p className="text-xs text-muted-foreground">
                Add a day to define your weekly hours.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onAdd}
              className="mt-1"
            >
              Add your first day
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{enabledCount}</span>{" "}
            of 7 days active
          </p>
          {enabledCount === 0 && (
            <Badge variant="destructive" className="text-xs">
              No days enabled
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Step 3 — Overrides ───────────────────────────────────────────────────────

function OverridesStep({
  overrides,
  onAdd,
  onUpdate,
  onRemove,
  error,
}: {
  overrides: AvailabilityOverride[];
  onAdd: () => void;
  onUpdate: (
    id: string,
    field: keyof AvailabilityOverride,
    value: unknown,
  ) => void;
  onRemove: (id: string) => void;
  error: ValidationError;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Date Overrides</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Mark specific dates as unavailable or with custom hours.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onAdd}>
            <svg
              className="mr-1.5 h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add override
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856C18.448 19 19 18.105 19 17c0-.34-.07-.67-.2-.97L13.73 4.58A2 2 0 0012 3.5a2 2 0 00-1.73 1.08L4.2 16.03c-.13.3-.2.63-.2.97 0 1.105.552 2 1.082 2z"
              />
            </svg>
            {error}
          </div>
        )}

        {overrides.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <svg
                className="h-5 w-5 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">No overrides yet</p>
              <p className="text-xs text-muted-foreground">
                Add an override to block or adjust a specific date.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onAdd}
              className="mt-1"
            >
              Add your first override
            </Button>
          </div>
        ) : (
          overrides.map((o) => {
            const timeInvalid =
              o.isAvailable && !isTimeRangeValid(o.startTime, o.endTime);
            return (
              <div
                key={o.id}
                className={cn(
                  "rounded-lg border p-3.5 transition-colors duration-150",
                  o.isAvailable
                    ? "border-primary/20 bg-primary/5"
                    : "border-border bg-muted/20",
                  timeInvalid && "border-destructive/40 bg-destructive/5",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-1 flex-wrap items-center gap-3">
                    {/* Date */}
                    <div className="flex flex-col gap-0.5">
                      <label className="text-xs text-muted-foreground">
                        Date
                      </label>
                      <input
                        type="date"
                        value={o.date.split("T")[0]}
                        onChange={(e) => onUpdate(o.id, "date", e.target.value)}
                        className={cn(
                          "rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm",
                          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                        )}
                      />
                    </div>

                    {/* Available toggle */}
                    <div className="flex flex-col gap-0.5">
                      <label className="text-xs text-muted-foreground">
                        Available
                      </label>
                      <div className="flex h-8.5 items-center">
                        <Checkbox
                          id={`override-avail-${o.id}`}
                          checked={o.isAvailable}
                          onCheckedChange={(v) => {
                            const nowAvailable = normalizeChecked(v);
                            onUpdate(o.id, "isAvailable", nowAvailable);
                            // When switching blocked → available, replace
                            // all-day sentinels with usable time defaults.
                            if (nowAvailable) {
                              if (o.startTime === ALL_DAY_START)
                                onUpdate(o.id, "startTime", "09:00");
                              if (o.endTime === ALL_DAY_END)
                                onUpdate(o.id, "endTime", "17:00");
                            }
                          }}
                        />
                        <label
                          htmlFor={`override-avail-${o.id}`}
                          className="ml-2 cursor-pointer select-none text-sm"
                        >
                          {o.isAvailable ? "Yes" : "No (blocked)"}
                        </label>
                      </div>
                    </div>

                    {/* Time range — only relevant when available */}
                    {o.isAvailable && (
                      <div className="flex flex-col gap-0.5">
                        <label className="text-xs text-muted-foreground">
                          Hours
                        </label>
                        <div className="flex items-center gap-2">
                          <TimeInput
                            value={o.startTime}
                            onChange={(v) => onUpdate(o.id, "startTime", v)}
                          />
                          <span className="text-xs text-muted-foreground">
                            to
                          </span>
                          <TimeInput
                            value={o.endTime}
                            onChange={(v) => onUpdate(o.id, "endTime", v)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => onRemove(o.id)}
                    className={cn(
                      "mt-0.5 rounded-md p-1.5 text-muted-foreground transition-colors",
                      "hover:bg-destructive/10 hover:text-destructive",
                    )}
                    aria-label="Remove override"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                {timeInvalid && (
                  <p className="mt-1.5 text-xs text-destructive">
                    End time must be after start time.
                  </p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// ─── Constants (continued) ────────────────────────────────────────────────────

const STEP_SESSION_KEY = "onboarding-step";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingClient({ initialData, actions }: Props) {
  const { externalCalendars, calendars, availabilities, overrides } =
    initialData;
  const {
    saveCalendarsAction,
    saveAvailabilitiesAction,
    saveAvailabilityOverridesAction,
  } = actions;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ── Step persistence via sessionStorage ──────────────────────────────────
  // Initialize to 1 unconditionally so SSR and the initial client render
  // produce identical HTML — no hydration mismatch. The stored step is
  // applied in a useEffect which only runs on the client after hydration.
  const [step, setStepState] = useState<Step>(1);

  useEffect(() => {
    async function process() {
      const stored = sessionStorage.getItem(STEP_SESSION_KEY);
      if (!stored) return;
      const parsed = parseInt(stored, 10);
      if (parsed === 2 || parsed === 3) {
        setStepState(parsed as Step);
      }
    }
    process();
  }, []);

  function setStep(s: Step) {
    sessionStorage.setItem(STEP_SESSION_KEY, String(s));
    setStepState(s);
  }

  const [validationError, setValidationError] = useState<ValidationError>(null);

  // Derive userId eagerly — needed synchronously by the lazy useState
  // initialisers below. useMemo cannot be used before useState calls.
  const userId =
    availabilities?.[0]?.userId ??
    calendars?.[0]?.userId ??
    overrides?.[0]?.userId ??
    "";

  const [selectedCalendarIds, setSelectedCalendarIds] = useState<Set<string>>(
    () => new Set(calendars?.map((c) => c.externalId) ?? []),
  );

  const [localAvailabilities, setLocalAvailabilities] = useState<
    Partial<Availability>[]
  >(() => {
    if (availabilities?.length) return availabilities;
    return createDefaultAvailabilities();
  });

  const [localOverrides, setLocalOverrides] = useState<AvailabilityOverride[]>(
    () => overrides ?? [],
  );



  // ── Handlers ────────────────────────────────────────────────────────────────

  function toggleCalendar(id: string, checked: boolean) {
    setSelectedCalendarIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function addAvailability() {
    // Find the first day index not already present so we don't duplicate.
    const usedDays = new Set(localAvailabilities.map((a) => a.dayOfWeek));
    const nextDay = DAYS.findIndex((_, i) => !usedDays.has(i));
    if (nextDay === -1) return; // all 7 days already exist
    setLocalAvailabilities((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        userId,
        dayOfWeek: nextDay,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
        createdAt: "",
        updatedAt: "",
      },
    ]);
  }

  function removeAvailability(id: string) {
    setLocalAvailabilities((prev) => prev.filter((a) => a.id !== id));
  }

  function toggleAvailability(id: string) {
    setLocalAvailabilities((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, isAvailable: !a.isAvailable } : a,
      ),
    );
  }

  function updateAvailability(
    id: string,
    field: "startTime" | "endTime" | "dayOfWeek",
    value: string | number,
  ) {
    setLocalAvailabilities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    );
  }

  function updateOverride(
    id: string,
    field: keyof AvailabilityOverride,
    value: unknown,
  ) {
    setLocalOverrides((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)),
    );
  }

  function addOverride() {
    setLocalOverrides((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        userId,
        date: new Date().toISOString().split("T")[0],
        // Blocked by default — use all-day sentinels so nothing is lost if
        // the user later toggles isAvailable on without picking times.
        startTime: ALL_DAY_START,
        endTime: ALL_DAY_END,
        isAvailable: false,
        createdAt: "",
        updatedAt: "",
      },
    ]);
  }

  function removeOverride(id: string) {
    setLocalOverrides((prev) => prev.filter((o) => o.id !== id));
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  function validateStep(s: Step): ValidationError {
    if (s === 1) {
      if (externalCalendars.length > 0 && selectedCalendarIds.size === 0) {
        return "Select at least one calendar to continue.";
      }
    }
    if (s === 2) {
      const enabled = localAvailabilities.filter((a) => a.isAvailable);
      if (enabled.length === 0) {
        return "Enable at least one day of availability.";
      }
      const invalid = enabled.find(
        (a) => !isTimeRangeValid(a.startTime!, a.endTime!),
      );
      if (invalid) {
        return `${DAYS[invalid.dayOfWeek!]}: end time must be after start time.`;
      }
    }
    if (s === 3) {
      const invalid = localOverrides.find(
        (o) => o.isAvailable && !isTimeRangeValid(o.startTime, o.endTime),
      );
      if (invalid) {
        return `Override on ${invalid.date}: end time must be after start time.`;
      }
    }
    return null;
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  function next() {
    const err = validateStep(step);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);

    startTransition(async () => {
      if (step === 1) {
        const payload: Calendar[] = externalCalendars
          .filter((c) => selectedCalendarIds.has(c.calendarId))
          .map((c) => ({
            providerId: c.providerId,
            externalId: c.calendarId,
            name: c.name ?? "Calendar",
            timezone: c.timezone ?? "UTC",
            enabled: true,
          })) as Calendar[];
        await saveCalendarsAction(payload);
        const result = await saveAvailabilitiesAction(localAvailabilities);
        setLocalAvailabilities(result);
        setStep(3);
        return;
      }
      if (step === 2) {
        setStep(3);
        return;
      }
      // Normalize blocked overrides: isAvailable=false always saves as all-day
      // so no stale 09:00–17:00 leaks into the database.
      const overridePayload = localOverrides.map((o) =>
        o.isAvailable
          ? o
          : { ...o, startTime: ALL_DAY_START, endTime: ALL_DAY_END },
      );
      await saveAvailabilityOverridesAction(overridePayload);
      sessionStorage.removeItem(STEP_SESSION_KEY);
      router.push("/dashboard/meeting-groups");
    });
  }

  function back() {
    setValidationError(null);
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Set up your workspace
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your calendars, weekly availability, and date exceptions.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex justify-center py-2">
        <StepIndicator current={step} />
      </div>

      <Separator />

      {/* Step content */}
      {step === 1 && (
        <CalendarsStep
          externalCalendars={externalCalendars}
          selectedCalendarIds={selectedCalendarIds}
          onToggle={toggleCalendar}
          error={validationError}
        />
      )}

      {step === 2 && (
        <AvailabilityStep
          availabilities={localAvailabilities as Availability[]}
          allDaysFilled={localAvailabilities.length >= 7}
          onAdd={addAvailability}
          onRemove={removeAvailability}
          onToggle={toggleAvailability}
          onUpdate={updateAvailability}
          error={validationError}
        />
      )}

      {step === 3 && (
        <OverridesStep
          overrides={localOverrides}
          onAdd={addOverride}
          onUpdate={updateOverride}
          onRemove={removeOverride}
          error={validationError}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={back}
          disabled={step === 1 || isPending}
        >
          Back
        </Button>

        <Button onClick={next} disabled={isPending} className="min-w-24">
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Saving…
            </span>
          ) : step === 3 ? (
            "Finish setup"
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
}
