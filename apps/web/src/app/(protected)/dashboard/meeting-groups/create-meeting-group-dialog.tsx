"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Calendar, MeetingGroup, MeetingParticipant } from "@/lib/types";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { meetingGroupSchema } from "@/lib/schemas";
import { DatePickerWithRange } from "./components/date-range.component";
import { CalendarSelector } from "./components/calendar-selector.component";

// ─── Constants ────────────────────────────────────────────────────────────────

const DURATIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

const today = new Date().toISOString().split("T")[0];

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const emailSchema = z.email("Invalid email address");

type FormData = z.input<typeof meetingGroupSchema>;
type FormErrors = Partial<Record<keyof FormData | "root", string>>;

type ParticipantDraft = {
  email: string;
  required: boolean;
};

// ─── Default form factory ─────────────────────────────────────────────────────

function defaultForm(calendars: Calendar[]): FormData {
  return {
    summary: "",
    description: "",
    duration: 60,
    location: "",
    after: today,
    before: today,
    calendarId: calendars[0]?.id ?? "",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateGroupDialog({
  calendars,
  isDialogOpen,
  setIsDialogOpenAction,
  handleSubmitAction,
  createMeetingGroupParticipantsAction,
}: {
  calendars: Calendar[];
  isDialogOpen: boolean;
  setIsDialogOpenAction: (open: boolean) => void;
  handleSubmitAction: (data: Partial<MeetingGroup>) => Promise<MeetingGroup>;
  createMeetingGroupParticipantsAction: (
    data: Partial<MeetingParticipant>[],
  ) => Promise<MeetingParticipant[]>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(() => defaultForm(calendars));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [participants, setParticipants] = useState<ParticipantDraft[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [newRequired, setNewRequired] = useState(false);

  // ── Form helpers ────────────────────────────────────────────────────────────

  function handleChange<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function resetState() {
    setForm(defaultForm(calendars));
    setErrors({});
    setParticipants([]);
    setEmailInput("");
    setEmailError(undefined);
    setNewRequired(false);
  }

  function handleClose() {
    resetState();
    setIsDialogOpenAction(false);
  }

  // ── Participant helpers ─────────────────────────────────────────────────────

  function addParticipant() {
    const parsed = emailSchema.safeParse(emailInput.trim());
    if (!parsed.success) {
      setEmailError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    if (participants.some((p) => p.email === parsed.data)) {
      setEmailError("This email has already been added");
      return;
    }
    setParticipants((prev) => [
      ...prev,
      { email: parsed.data, required: newRequired },
    ]);
    setEmailInput("");
    setEmailError(undefined);
    setNewRequired(false);
  }

  function removeParticipant(email: string) {
    setParticipants((prev) => prev.filter((p) => p.email !== email));
  }

  function toggleRequired(email: string) {
    setParticipants((prev) =>
      prev.map((p) =>
        p.email === email ? { ...p, required: !p.required } : p,
      ),
    );
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    form.after = new Date(form.after).toISOString();
    form.before = new Date(form.before).toISOString();
    const result = meetingGroupSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();

      const createdGroup = await handleSubmitAction({
        id: crypto.randomUUID(),
        authorId: "",
        summary: result.data.summary,
        description: result.data.description,
        duration: result.data.duration,
        location: result.data.location,
        after: new Date(result.data.after).toISOString(),
        before: new Date(result.data.before).toISOString(),
        calendarId: result.data.calendarId,
        timezone: calendars.find((c) => c.id === result.data.calendarId)!
          .timezone,
        status: "open",
        participants: [],
        createdAt: now,
        updatedAt: now,
      });

      if (participants.length > 0) {
        await createMeetingGroupParticipantsAction(
          participants.map((p) => {
            return {
              meetingGroupId: createdGroup.id,
              email: p.email,
              required: p.required,
            };
          }),
        );
      }

      resetState();
      setIsDialogOpenAction(false);
      router.push(`/dashboard/meeting-groups/${createdGroup.id}`);
    } catch {
      setErrors({ root: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpenAction}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Create Group
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md w-full flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Meeting Group</DialogTitle>
          <DialogDescription>
            Define a time window and duration for group scheduling.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Title</Label>
            <Input
              id="summary"
              placeholder="e.g. Team sync, 1-on-1 with manager"
              value={form.summary}
              onChange={(e) => handleChange("summary", e.target.value)}
            />
            {errors.summary && (
              <p className="text-xs text-destructive">{errors.summary}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Meeting to chat about personal progress within the team."
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Location <Badge variant={"outline"}>Not Required</Badge>
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g. 55 San Andreas Ave."
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-between">
            <DatePickerWithRange
              actions={{
                handleAfterAction: (after: string) =>
                  handleChange("after", after),
                handleBeforeAction: (before: string) =>
                  handleChange("before", before),
              }}
            />
            {/* Duration */}
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select
                value={String(form.duration)}
                onValueChange={(v) => handleChange("duration", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.duration && (
                <p className="text-xs text-destructive">{errors.duration}</p>
              )}
            </div>
          </div>

          <CalendarSelector
            form={form}
            calendars={calendars}
            errors={errors}
            handleChangeAction={handleChange}
          />
          <Separator />

          {/* Participants */}
          <div className="space-y-3">
            <Label htmlFor="participants">
              Participants <Badge variant={"outline"}>Not Required</Badge>
            </Label>
            {/* Email input row */}
            <div className="flex gap-2">
              <Input
                placeholder="email@example.com"
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setEmailError(undefined);
                }}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addParticipant())
                }
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addParticipant}
              >
                <Plus className="size-4" />
              </Button>
            </div>

            {/* Required toggle for next participant to be added */}
            <div className="flex items-center gap-2">
              <Switch
                id="new-required"
                checked={newRequired}
                onCheckedChange={setNewRequired}
              />
              <Label
                htmlFor="new-required"
                className="text-xs text-muted-foreground cursor-pointer font-normal"
              >
                Mark as required attendee
              </Label>
            </div>

            {emailError && (
              <p className="text-xs text-destructive">{emailError}</p>
            )}

            {/* Participant list */}
            {participants.length > 0 && (
              <ul className="space-y-2 max-h-[10vh] overflow-y-auto">
                {participants.map((p) => (
                  <li
                    key={p.email}
                    className="flex items-center gap-2 rounded-md border px-3 py-2"
                  >
                    <span className="flex-1 truncate text-sm">{p.email}</span>

                    {p.required && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        Required
                      </Badge>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto shrink-0 px-2 py-0.5 text-xs text-muted-foreground"
                      onClick={() => toggleRequired(p.email)}
                    >
                      {p.required ? "Make optional" : "Make required"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeParticipant(p.email)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Root / server error */}
          {errors.root && (
            <p className="text-sm text-destructive">{errors.root}</p>
          )}
        </div>
        <DialogFooter className="flex justify-between items-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
