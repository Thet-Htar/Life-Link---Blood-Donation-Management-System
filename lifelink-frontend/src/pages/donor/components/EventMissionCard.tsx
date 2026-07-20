import { MATCH_TYPE_LABELS, type DonorEventResponse } from "@/types/donorEvents";
import type { LucideIcon } from "lucide-react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Droplet,
  Hospital,
  Loader2,
  MapPin,
  ShieldCheck,
  Trash2,
  UsersRound,
} from "lucide-react";

interface EventMissionCardProps {
  event: DonorEventResponse | null;
  isLoading?: boolean;
  isSubmitting?: boolean;

  onRegister: (event: DonorEventResponse) => void;

  onCancel: (event: DonorEventResponse) => void;
}

const BLOOD_TYPE_LABELS: Record<string, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
};

const EventMissionCard = ({
  event,
  isLoading = false,
  isSubmitting = false,
  onRegister,
  onCancel,
}: EventMissionCardProps) => {
  if (isLoading) {
    return <EventMissionCardSkeleton />;
  }

  if (!event) {
    return <EventMissionCardEmptyState />;
  }

  const targetDonorCount = Math.max(event.targetDonorCount ?? 0, 0);

  const registeredDonorCount = Math.max(event.registeredDonorCount ?? 0, 0);

  const remainingSlots = Math.max(event.remainingSlots ?? 0, 0);

  const capacityPercentage =
    targetDonorCount > 0
      ? Math.min(
          100,
          Math.round((registeredDonorCount / targetDonorCount) * 100),
        )
      : 0;

  const location = [event.street, event.township, event.city]
    .filter(Boolean)
    .join(", ");

  const bloodTypes = event.requiredBloodTypes ?? [];

  const matchLabel = MATCH_TYPE_LABELS[event.matchType] ?? "Recommended";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      {/* Event hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-600 to-rose-700 p-5 text-white">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10" />

        <div className="pointer-events-none absolute -bottom-16 right-16 h-32 w-32 rounded-full bg-rose-300/20 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] ring-1 ring-white/20 backdrop-blur">
              <Droplet className="h-3.5 w-3.5 fill-current" />
              Donation event
            </div>

            <span className="rounded-full bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-red-700 shadow-sm">
              {matchLabel}
            </span>
          </div>

          <div className="mt-7 flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
              <CalendarDays className="h-6 w-6" />
            </span>

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-red-100">
                Upcoming donation mission
              </p>

              <h2 className="mt-1 text-xl font-black leading-tight tracking-[-0.03em] text-white">
                {event.eventTitle}
              </h2>

              <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold text-red-100">
                <Hospital className="h-3.5 w-3.5 shrink-0" />

                <span className="truncate">{event.hospitalName}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            <EventHeroFact
              icon={CalendarDays}
              label="Event date"
              value={formatDate(event.eventDate)}
            />

            <EventHeroFact
              icon={Clock3}
              label="Time"
              value={`${formatTime(event.startTime)} - ${formatTime(
                event.endTime,
              )}`}
            />

            <EventHeroFact
              icon={MapPin}
              label="Location"
              value={
                event.township && event.city
                  ? `${event.township}, ${event.city}`
                  : event.city || "Not provided"
              }
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Registered status */}
        {event.alreadyRegistered && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
              <ShieldCheck className="h-4 w-4" />
            </span>

            <div className="min-w-0">
              <p className="text-[10px] font-black text-emerald-800">
                Already registered
              </p>

              <p className="mt-0.5 text-[9px] font-medium text-emerald-700">
                Your donation slot has been reserved.
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
              About this event
            </p>

            <p className="mt-1.5 line-clamp-3 text-[11px] font-medium leading-5 text-slate-600">
              {event.description}
            </p>
          </div>
        )}

        {/* Venue */}
        <div className="mt-3 flex items-start gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <MapPin className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              Event venue
            </p>

            <p className="mt-1 text-[11px] font-extrabold leading-5 text-slate-700">
              {location || "Location not provided"}
            </p>
          </div>
        </div>

        {/* Blood type and capacity */}
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm ring-1 ring-red-100">
                <Droplet className="h-5 w-5 fill-current" />
              </span>

              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Required blood types
                </p>

                <p className="mt-0.5 text-[10px] font-semibold text-slate-600">
                  Accepted blood groups
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {bloodTypes.length > 0 ? (
                bloodTypes.map((bloodType) => (
                  <span
                    key={bloodType}
                    className="inline-flex min-w-9 items-center justify-center rounded-lg bg-white px-2.5 py-1.5 text-[9px] font-black text-red-700 shadow-sm ring-1 ring-red-100"
                  >
                    {BLOOD_TYPE_LABELS[bloodType] ?? bloodType}
                  </span>
                ))
              ) : (
                <span className="text-[10px] font-semibold text-slate-500">
                  No blood types specified
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Registration capacity
                </p>

                <div className="mt-2 flex items-end gap-1">
                  <span className="text-2xl font-black tracking-[-0.04em] text-slate-950">
                    {registeredDonorCount}
                  </span>

                  <span className="pb-1 text-[10px] font-bold text-slate-400">
                    / {targetDonorCount}
                  </span>
                </div>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm ring-1 ring-slate-200">
                <UsersRound className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-red-600 transition-all duration-500"
                style={{
                  width: `${capacityPercentage}%`,
                }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-[9px] font-bold text-slate-500">
                {capacityPercentage}% filled
              </p>

              <p
                className={`text-[9px] font-black ${
                  event.registrationFull ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {event.registrationFull
                  ? "Registration full"
                  : `${remainingSlots} slots left`}
              </p>
            </div>
          </div>
        </div>

        {/* Contact and deadline */}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              Contact person
            </p>

            <p className="mt-1 text-[11px] font-extrabold text-slate-700">
              {event.contactPersonName || "Not provided"}
            </p>

            <p className="mt-0.5 text-[9px] font-semibold text-slate-500">
              {event.contactPhone || "No phone number"}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              Registration deadline
            </p>

            <p className="mt-1 text-[11px] font-extrabold text-slate-700">
              {formatDate(event.registrationDeadline)}
            </p>

            <p className="mt-0.5 text-[9px] font-semibold text-slate-500">
              Register before closing date
            </p>
          </div>
        </div>

        {/* Actions */}
        {event.alreadyRegistered ? (
          <div className="mt-5 space-y-2">
            <button
              type="button"
              disabled
              className="flex h-11 w-full cursor-default items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 text-xs font-extrabold text-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Already registered
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onCancel(event)}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-[10px] font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}

              {isSubmitting ? "Processing..." : "Cancel registration"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={event.registrationFull || isSubmitting}
            onClick={() => onRegister(event)}
            className={`mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-extrabold transition ${
              event.registrationFull
                ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                : "bg-red-600 text-white shadow-lg shadow-red-600/20 hover:-translate-y-0.5 hover:bg-red-700 active:translate-y-0"
            } disabled:opacity-70`}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : event.registrationFull ? (
              <UsersRound className="h-4 w-4" />
            ) : (
              <Droplet className="h-4 w-4 fill-current" />
            )}

            {isSubmitting
              ? "Processing..."
              : event.registrationFull
                ? "Registration full"
                : "Register for this event"}
          </button>
        )}

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] font-semibold text-slate-400">
          <Clock3 className="h-3.5 w-3.5" />
          Event begins on {formatDate(event.eventDate)}
        </div>
      </div>
    </article>
  );
};

const EventMissionCardEmptyState = () => {
  return (
    <section className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <CalendarDays className="h-7 w-7" />
      </span>

      <h2 className="mt-5 text-lg font-black text-slate-950">
        No matching event
      </h2>

      <p className="mt-2 max-w-md text-xs font-medium leading-5 text-slate-500">
        There are currently no published donation events matching your blood
        type and location.
      </p>
    </section>
  );
};

interface EventHeroFactProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

const EventHeroFact = ({ icon: Icon, label, value }: EventHeroFactProps) => {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 ring-1 ring-white/15 backdrop-blur-sm">
      <Icon className="h-4 w-4 shrink-0 text-red-100" />

      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-wider text-red-100/80">
          {label}
        </p>

        <p className="mt-0.5 truncate text-[9px] font-extrabold text-white">
          {value}
        </p>
      </div>
    </div>
  );
};

export const EventMissionCardSkeleton = () => {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="bg-red-50 p-5">
        <div className="flex justify-between gap-4">
          <div className="h-6 w-32 animate-pulse rounded-full bg-red-100" />

          <div className="h-6 w-20 animate-pulse rounded-full bg-red-100" />
        </div>

        <div className="mt-7 flex items-start gap-4">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-red-100" />

          <div className="flex-1">
            <div className="h-3 w-28 animate-pulse rounded bg-red-100" />

            <div className="mt-2 h-6 w-3/4 animate-pulse rounded bg-red-100" />

            <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-red-100" />
          </div>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          <div className="h-14 animate-pulse rounded-xl bg-red-100" />

          <div className="h-14 animate-pulse rounded-xl bg-red-100" />

          <div className="h-14 animate-pulse rounded-xl bg-red-100" />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="h-16 animate-pulse rounded-xl bg-slate-100" />

        <div className="h-14 animate-pulse rounded-xl bg-slate-100" />

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="h-32 animate-pulse rounded-xl bg-red-50" />

          <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="h-20 animate-pulse rounded-xl bg-slate-100" />

          <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
        </div>

        <div className="h-11 animate-pulse rounded-xl bg-red-100" />
      </div>
    </section>
  );
};

const formatDate = (value?: string | null): string => {
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

const formatTime = (value?: string | null): string => {
  if (!value) {
    return "--:--";
  }

  const [hours, minutes] = value.split(":");

  const hourNumber = Number(hours);
  const minuteNumber = Number(minutes);

  if (Number.isNaN(hourNumber) || Number.isNaN(minuteNumber)) {
    return value;
  }

  const time = new Date();

  time.setHours(hourNumber, minuteNumber, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(time);
};

export default EventMissionCard;
