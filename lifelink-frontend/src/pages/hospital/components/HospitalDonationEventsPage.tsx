import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  CalendarDays,
  CalendarPlus,
  Eye,
  LoaderCircle,
  Pencil,
  RefreshCcw,
  TriangleAlert,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  BLOOD_TYPE_LABELS,
  type DonationEventResponse,
  type DonationEventStatus,
} from "@/types/hospitalEvents";

import { getHospitalDonationEvents } from "@/services/hospital/hospitalDonationService";

interface HospitalDonationEventsPageProps {
  onCreateEvent: () => void;

  onEditEvent: (eventId: number) => void;
}

type EventFilter = "ALL" | DonationEventStatus;

type DonationEventWithCounts = DonationEventResponse & {
  registeredDonorCount?: number;
  registeredDonors?: number;
};

const HospitalDonationEventsPage = ({
  onCreateEvent,
  onEditEvent,
}: HospitalDonationEventsPageProps) => {
  const navigate = useNavigate();

  const [events, setEvents] = useState<DonationEventResponse[]>([]);

  const [activeFilter, setActiveFilter] = useState<EventFilter>("ALL");

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const loadEvents = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getHospitalDonationEvents();

      setEvents(Array.isArray(response) ? response : []);
    } catch (loadError) {
      console.error("Failed to load donation events:", loadError);

      setEvents([]);

      setError("Unable to load donation events.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const matchingEvents =
      activeFilter === "ALL"
        ? events
        : events.filter((event) => event.status === activeFilter);

    return [...matchingEvents].sort((first, second) => {
      const firstCreatedAt = first.createdAt ?? "";

      const secondCreatedAt = second.createdAt ?? "";

      return secondCreatedAt.localeCompare(firstCreatedAt);
    });
  }, [events, activeFilter]);

  const publishedCount = events.filter(
    (event) => event.status === "PUBLISHED",
  ).length;

  const draftCount = events.filter((event) => event.status === "DRAFT").length;

  const registeredDonorCount = events.reduce(
    (total, event) => total + getRegisteredDonorCount(event),
    0,
  );

  const handleViewDetails = (eventId: number): void => {
    navigate(`/hospital/events/${eventId}`);
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-red-600">
            <CalendarDays className="h-4 w-4" />
            Event Management
          </div>

          <h1 className="mt-2 text-2xl font-black text-slate-950">
            Donation Events
          </h1>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Create, edit and monitor donation events and registered donors.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateEvent}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-xs font-black text-white shadow-sm transition hover:bg-red-700"
        >
          <CalendarPlus className="h-4 w-4" />
          Create Donation Event
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatisticCard label="Published Events" value={publishedCount} />

        <StatisticCard label="Draft Events" value={draftCount} />

        <StatisticCard label="Registered Donors" value={registeredDonorCount} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["ALL", "DRAFT", "PUBLISHED"] as EventFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-xl border px-4 py-2 text-[10px] font-black transition ${
                activeFilter === filter
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50"
              }`}
            >
              {filter === "ALL" ? "All Events" : formatEnumLabel(filter)}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            void loadEvents();
          }}
          disabled={isLoading}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw
            className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => {
            void loadEvents();
          }}
        />
      ) : filteredEvents.length === 0 ? (
        <EmptyState onCreateEvent={onCreateEvent} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <TableHeading>Event</TableHeading>

                  <TableHeading>Date & Time</TableHeading>

                  <TableHeading>Location</TableHeading>

                  <TableHeading>Blood Types</TableHeading>

                  <TableHeading>Donors</TableHeading>

                  <TableHeading>Status</TableHeading>

                  <TableHeading align="right">Actions</TableHeading>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((event) => {
                  const location = [
                    event.address?.street,
                    event.address?.township,
                    event.address?.city,
                  ]
                    .filter(Boolean)
                    .join(", ");

                  const requiredBloodTypes = event.requiredBloodTypes ?? [];

                  const registeredCount = getRegisteredDonorCount(event);

                
                  const canEditEvent =
                    event.status === "DRAFT" || event.status === "PUBLISHED";

                  return (
                    <tr key={event.id} className="transition hover:bg-slate-50">
                      <TableCell>
                        <p className="font-black text-slate-900">
                          {event.eventTitle || "Untitled event"}
                        </p>

                        <p className="mt-1 max-w-[240px] truncate text-[9px] text-slate-400">
                          {event.description || "No description"}
                        </p>
                      </TableCell>

                      <TableCell>
                        <p className="font-bold text-slate-700">
                          {formatDate(event.eventDate)}
                        </p>

                        <p className="mt-1 text-[9px] text-slate-400">
                          {formatTime(event.startTime)}

                          {" - "}

                          {formatTime(event.endTime)}
                        </p>
                      </TableCell>

                      <TableCell>
                        <p className="max-w-[180px] whitespace-normal text-[10px] font-semibold leading-4 text-slate-600">
                          {location || "Not provided"}
                        </p>
                      </TableCell>

                      <TableCell>
                        <div className="flex max-w-[180px] flex-wrap gap-1">
                          {requiredBloodTypes.length > 0 ? (
                            requiredBloodTypes.map((bloodType) => (
                              <span
                                key={bloodType}
                                className="rounded-md bg-red-50 px-2 py-1 text-[8px] font-black text-red-700"
                              >
                                {BLOOD_TYPE_LABELS[bloodType] ?? bloodType}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-slate-400">
                              None
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <p className="font-black text-slate-800">
                          {registeredCount}

                          {" / "}

                          {event.targetDonorCount ?? "--"}
                        </p>

                        <p className="mt-1 text-[9px] text-slate-400">
                          {getRemainingSlots(event)} remaining
                        </p>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={event.status} />
                      </TableCell>

                      <TableCell align="right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(event.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[9px] font-black text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Details
                          </button>

                          {canEditEvent && (
                            <button
                              type="button"
                              onClick={() => onEditEvent(event.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[9px] font-black text-amber-700 transition hover:bg-amber-100"
                            >
                              <Pencil className="h-3.5 w-3.5" />

                              {event.status === "PUBLISHED"
                                ? "Edit Published"
                                : "Edit Draft"}
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

const LoadingState = () => {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <div className="text-center">
        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-red-600" />

        <p className="mt-3 text-xs font-bold text-slate-500">
          Loading donation events...
        </p>
      </div>
    </div>
  );
};

const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
      <TriangleAlert className="h-8 w-8 text-red-600" />

      <p className="mt-3 text-xs font-bold text-red-700">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-[10px] font-black text-white transition hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  );
};

const EmptyState = ({ onCreateEvent }: { onCreateEvent: () => void }) => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <CalendarDays className="h-10 w-10 text-slate-300" />

      <h2 className="mt-4 text-base font-black text-slate-900">
        No donation events found
      </h2>

      <p className="mt-2 text-xs text-slate-500">
        Create your first donation event.
      </p>

      <button
        type="button"
        onClick={onCreateEvent}
        className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-[10px] font-black text-white transition hover:bg-red-700"
      >
        Create Donation Event
      </button>
    </div>
  );
};

const StatisticCard = ({ label, value }: { label: string; value: number }) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </article>
  );
};

const StatusBadge = ({ status }: { status: DonationEventStatus }) => {
  const isDraft = status === "DRAFT";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[8px] font-black ${
        isDraft
          ? "border-amber-100 bg-amber-50 text-amber-700"
          : "border-emerald-100 bg-emerald-50 text-emerald-700"
      }`}
    >
      {formatEnumLabel(status)}
    </span>
  );
};

const TableHeading = ({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) => {
  return (
    <th
      className={`px-4 py-3 text-[8px] font-black uppercase tracking-wider text-slate-400 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
};

const TableCell = ({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) => {
  return (
    <td
      className={`px-4 py-4 text-[10px] ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
};

const getRegisteredDonorCount = (event: DonationEventResponse): number => {
  const eventWithCounts = event as DonationEventWithCounts;

  return (
    eventWithCounts.registeredDonorCount ??
    eventWithCounts.registeredDonors ??
    0
  );
};

const getRemainingSlots = (event: DonationEventResponse): number => {
  const target = event.targetDonorCount ?? 0;

  const registered = getRegisteredDonorCount(event);

  return Math.max(target - registered, 0);
};

const formatDate = (value: string | null): string => {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const formatTime = (value: string | null): string => {
  if (!value) {
    return "--:--";
  }

  return value.slice(0, 5);
};

const formatEnumLabel = (value: string): string => {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default HospitalDonationEventsPage;
