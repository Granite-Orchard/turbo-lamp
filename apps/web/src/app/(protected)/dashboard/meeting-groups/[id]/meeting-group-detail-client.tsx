"use client";

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
} from "@/components/ui/dialog";
import {
  Meeting,
  MeetingGroup,
  MeetingParticipant,
  MeetingSlot,
} from "@/lib/types";
import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  RefreshCw,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";

type Actions = {
  listSlotsAction: (id: string) => Promise<MeetingSlot[]>;
  calculateSlotsAction: (id: string) => Promise<MeetingSlot[]>;
  createMeetingAction: (data: Partial<Meeting>) => Promise<Meeting>;
};

interface MeetingGroupDetailProps {
  group: MeetingGroup;
  initialSlots: MeetingSlot[];
  initialParticipants: MeetingParticipant[];
  actions: Actions;
}

type InvitationState = "pending" | "accepted" | "declined";

const invitationColors: Record<InvitationState, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  declined: "bg-red-50 text-red-700 border-red-200",
};

type AuthState = "authorized" | "unauthorized" | "not_required";

const authColors: Record<AuthState, string> = {
  not_required: "bg-amber-50 text-amber-700 border-amber-200",
  authorized: "bg-green-50 text-green-700 border-green-200",
  unauthorized: "bg-red-50 text-red-700 border-red-200",
};

const statusConfig: Record<
  MeetingGroup["status"],
  { label: string; className: string }
> = {
  open: {
    label: "Open",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  finalized: {
    label: "Scheduled",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

export function MeetingGroupDetail({
  group,
  initialSlots,
  initialParticipants,
  actions,
}: MeetingGroupDetailProps) {
  const router = useRouter();
  const [participants, setParticipants] = useState(initialParticipants);
  const [slots, setSlots] = useState<MeetingSlot[]>(initialSlots);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<MeetingSlot | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const requestIdRef = useRef(0);

  const statusConf = statusConfig[group.status];

  const activeParticipants = useMemo(
    () =>
      participants.filter(
        (p) =>
          p.invitationState === "accepted" &&
          ["authorized", "not_required"].includes(p.authState),
      ),
    [participants],
  );

  const canSchedule = useMemo(() => {
    return activeParticipants.length > 1;
  }, [activeParticipants]);

  async function loadSlots() {
    const requestId = ++requestIdRef.current;

    setSlotsLoading(true);
    setSlotsError(null);

    try {
      const result = await actions.listSlotsAction(group.id);

      if (requestId !== requestIdRef.current) return;

      setSlots(result);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setSlotsError(getErrorMessage(err));
    } finally {
      if (requestId === requestIdRef.current) {
        setSlotsLoading(false);
      }
    }
  }

  async function refreshSlots() {
    const requestId = ++requestIdRef.current;

    setSlotsLoading(true);
    setSlotsError(null);

    try {
      const result = await actions.calculateSlotsAction(group.id);

      if (requestId !== requestIdRef.current) return;

      setSlots(result);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setSlotsError(getErrorMessage(err));
    } finally {
      if (requestId === requestIdRef.current) {
        setSlotsLoading(false);
      }
    }
  }

  useEffect(() => {
    if (group.status !== "finalized") {
      loadSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.status]);

  function handleSelectSlot(slot: MeetingSlot) {
    if (!canSchedule) {
      toast.error("Participants must be accepted before scheduling");
      return;
    }
    setSelectedSlot(slot);
    setConfirmOpen(true);
  }

  async function handleConfirmSlot() {
    if (!selectedSlot) return;

    setIsScheduling(true);

    try {
      const meeting = await actions.createMeetingAction({
        id: selectedSlot.id,
        meetingGroupId: group.id,
        start: selectedSlot.start,
        end: selectedSlot.end,
        status: "scheduled",
      });

      toast.success("Meeting scheduled successfully");
      setConfirmOpen(false);
      router.push(`/dashboard/meetings/${meeting.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsScheduling(false);
    }
  }

  const slotsByDay = useMemo(() => {
    return slots
      .sort((a, b) => a.rank! - b.rank!)
      .reduce<Record<string, MeetingSlot[]>>((acc, slot) => {
        const day = format(parseISO(slot.start), "yyyy-MM-dd");
        if (!acc[day]) acc[day] = [];
        acc[day].push(slot);
        return acc;
      }, {});
  }, [slots]);

  const magicLinkRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {group.summary}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConf.className}`}
            >
              {statusConf.label}
            </span>
          </div>
          {group.description && (
            <p className="text-muted-foreground">{group.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{group.duration} minutes</span>
              </div>

              <div className="flex items-start gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4 mt-0.5" />
                <div>
                  <div>{format(group.after, "MMM d, yyyy h:mm a")}</div>
                  <div className="text-xs">
                    to {format(group.before, "MMM d, yyyy h:mm a")}
                  </div>
                </div>
              </div>
              {group.magicLink && (
                <div className="flex flex-col gap-2 text-muted-foreground">
                  <Label htmlFor="magic-link">Invitation link</Label>
                  <div className="flex">
                    <Input
                      ref={magicLinkRef}
                      id="magic-link"
                      value={group.magicLink}
                      disabled
                      readOnly
                    />
                    <Button
                      variant="secondary"
                      className="shrink-0"
                      onClick={async () => {
                        console.log(magicLinkRef.current);
                        if (magicLinkRef.current) {
                          await navigator.clipboard.writeText(
                            magicLinkRef.current.value,
                          );
                          toast.success(`Copied ${magicLinkRef.current.value}`);
                        }
                      }}
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>
              )}

              {group.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{group.location}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {(p.email[0] || "?").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {p.user?.name || p.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    {p.userId === group.authorId ? (
                      <Badge
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs border ${invitationColors["pending"]}`}
                      >
                        Author
                      </Badge>
                    ) : undefined}
                    <Badge
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs border ${
                        invitationColors[
                          (p.invitationState as InvitationState) || "pending"
                        ]
                      }`}
                    >
                      {p.invitationState}
                    </Badge>
                    <Badge
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs border ${
                        authColors[(p.authState as AuthState) || "unauthorized"]
                      }`}
                    >
                      {p.authState}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Available Slots</CardTitle>
                <CardDescription>
                  Derived from participant availability
                </CardDescription>
              </div>

              {group.status !== "finalized" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshSlots}
                  disabled={slotsLoading || !canSchedule}
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 mr-1.5 ${
                      slotsLoading ? "animate-spin" : ""
                    }`}
                  />
                  Recalculate
                </Button>
              )}
            </CardHeader>

            <CardContent>
              {group.status === "finalized" ? (
                <div className="text-center py-10">
                  <CheckCircle className="h-10 w-10 mx-auto text-green-500 mb-3" />
                  <p className="font-medium">Scheduled</p>
                </div>
              ) : slotsLoading ? (
                <div className="space-y-4">
                  <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-16 bg-muted animate-pulse rounded" />
                    <div className="h-16 bg-muted animate-pulse rounded" />
                    <div className="h-16 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ) : slotsError ? (
                <div className="text-center py-10">
                  <AlertCircle className="h-10 w-10 mx-auto text-red-500 mb-3" />
                  <p>{slotsError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadSlots}
                    className="mt-4"
                  >
                    Retry
                  </Button>
                </div>
              ) : Object.keys(slotsByDay).length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p>No slots available</p>
                </div>
              ) : (
                Object.entries(slotsByDay).map(([day, daySlots]) => (
                  <div key={day} className="mb-6">
                    <div className="text-s font-semibold mb-2">
                      {format(parseISO(day), "EEEE, MMM d")}
                    </div>

                    <div className="w-full flex flex-wrap gap-2 justify-start align-middle items-center text-center">
                      {daySlots.map((slot) => (
                        <SlotCard
                          key={`${slot.start}-${slot.end}`}
                          slot={slot}
                          onSelect={() => handleSelectSlot(slot)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Slot</DialogTitle>
            <DialogDescription>
              This will create a meeting and invite participants.
            </DialogDescription>
          </DialogHeader>

          {selectedSlot && (
            <div className="text-sm space-y-2 border rounded p-3 bg-muted/30">
              <div>{format(parseISO(selectedSlot.start), "PPP p")}</div>
              <div>{format(parseISO(selectedSlot.end), "p")}</div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isScheduling}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSlot} disabled={isScheduling}>
              {isScheduling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SlotCard({
  slot,
  onSelect,
}: {
  slot: MeetingSlot;
  onSelect: () => void;
}) {
  const border_color =
    slot.rank === 0
      ? "border-green-500 dark:border-green-300"
      : slot.rank! < 4
        ? "border-yellow-500 dark:border-yellow-300"
        : "border-red-500 dark:border-red-300";

  return (
    <Button
      variant={"outline"}
      onClick={onSelect}
      className={cn(
        `border rounded p-3 text-left hover:border-primary hover:bg-primary/5 ${border_color}`,
      )}
    >
      {slot.rank === 0 ? <Badge>Best</Badge> : undefined}
      <div className="text-sm font-medium">
        {format(parseISO(slot.start), "h:mm a")}
      </div>
      <div className="text-xs text-muted-foreground">
        {format(parseISO(slot.end), "h:mm a")}
      </div>
    </Button>
  );
}
