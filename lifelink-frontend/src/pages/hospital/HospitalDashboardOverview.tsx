import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Activity,
  ArrowRight,
  Award,
  CalendarDays,
  CalendarPlus2,
  Droplets,
  PackageOpen,
  RefreshCcw,
  ShieldCheck,
  Users,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { getHospitalDonationEvents } from "@/services/hospital/hospitalDonationService";

import type { DonationEventResponse } from "@/types/hospitalEvents";

import type { DonationCertificateResponse } from "@/types/donationCertificate";
import { getHospitalInventory } from "@/services/hospital/hospitalInventoryService";
import { getHospitalCertificates } from "@/services/hospital/hospitalCertificateService";
import type { BloodInventoryUnitResponse } from "@/types/hospitalInventory";

type ActionCardVariant = "red" | "indigo";

interface ActionCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  icon: LucideIcon;
  variant: ActionCardVariant;
  onClick: () => void;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  helperText: string;
  helperTone?: "green" | "red" | "amber" | "slate";
}

type DonationEventWithCounts = DonationEventResponse & {
  registeredDonorCount?: number;
  registeredDonors?: number;
};

const actionStyles = {
  red: {
    card: "bg-gradient-to-br from-red-700 via-red-600 to-red-500",

    icon: "bg-white/15 text-white ring-white/20",

    button: "text-red-700",

    decoration: "border-white/10",
  },

  indigo: {
    card: "bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600",

    icon: "bg-white/15 text-white ring-white/20",

    button: "text-indigo-700",

    decoration: "border-white/10",
  },
} satisfies Record<
  ActionCardVariant,
  {
    card: string;
    icon: string;
    button: string;
    decoration: string;
  }
>;

const helperToneStyles = {
  green: "bg-emerald-50 text-emerald-700",

  red: "bg-red-50 text-red-700",

  amber: "bg-amber-50 text-amber-700",

  slate: "bg-slate-100 text-slate-600",
};

const HospitalDashboardOverview = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState<DonationEventResponse[]>([]);

  const [inventory, setInventory] = useState<BloodInventoryUnitResponse[]>([]);

  const [certificates, setCertificates] = useState<
    DonationCertificateResponse[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);

  const [loadWarning, setLoadWarning] = useState("");

  const loadDashboardData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setLoadWarning("");

      const [eventResult, inventoryResult, certificateResult] =
        await Promise.allSettled([
          getHospitalDonationEvents(),
          getHospitalInventory(),
          getHospitalCertificates(),
        ]);

      const failedSections: string[] = [];

      if (eventResult.status === "fulfilled") {
        setEvents(Array.isArray(eventResult.value) ? eventResult.value : []);
      } else {
        setEvents([]);
        failedSections.push("events");
      }

      if (inventoryResult.status === "fulfilled") {
        setInventory(
          Array.isArray(inventoryResult.value) ? inventoryResult.value : [],
        );
      } else {
        setInventory([]);
        failedSections.push("inventory");
      }

      if (certificateResult.status === "fulfilled") {
        setCertificates(
          Array.isArray(certificateResult.value) ? certificateResult.value : [],
        );
      } else {
        setCertificates([]);
        failedSections.push("certificates");
      }

      if (failedSections.length > 0) {
        setLoadWarning(
          `Some dashboard data could not be loaded: ${failedSections.join(
            ", ",
          )}.`,
        );
      }
    } catch (error) {
      console.error("Unable to load hospital dashboard:", error);

      setEvents([]);
      setInventory([]);
      setCertificates([]);

      setLoadWarning("Unable to load the hospital dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const dashboardSummary = useMemo(() => {
    const today = getToday();

    const publishedEvents = events.filter(
      (event) => event.status === "PUBLISHED",
    );

    const draftEvents = events.filter((event) => event.status === "DRAFT");

    const upcomingEvents = publishedEvents
      .filter((event) => Boolean(event.eventDate) && event.eventDate! >= today)
      .sort((first, second) =>
        (first.eventDate ?? "").localeCompare(second.eventDate ?? ""),
      );

    const registeredDonors = publishedEvents.reduce(
      (total, event) => total + getRegisteredDonorCount(event),
      0,
    );

    const totalTargetDonors = publishedEvents.reduce(
      (total, event) => total + Math.max(event.targetDonorCount ?? 0, 0),
      0,
    );

    const availableUnits = inventory.filter(
      (unit) => unit.status === "AVAILABLE",
    );

    const reservedUnits = inventory.filter(
      (unit) => unit.status === "RESERVED",
    );

    const expiringSoonUnits = inventory.filter((unit) =>
      isExpiringSoon(unit.expiryDate, unit.status),
    );

    const activeCertificates = certificates.filter(
      (certificate) => certificate.status === "ACTIVE",
    );

    return {
      publishedEvents: publishedEvents.length,

      draftEvents: draftEvents.length,

      upcomingEvents: upcomingEvents.length,

      nextUpcomingEvent: upcomingEvents[0] ?? null,

      registeredDonors,

      totalTargetDonors,

      availableUnits: availableUnits.length,

      reservedUnits: reservedUnits.length,

      expiringSoonUnits: expiringSoonUnits.length,

      totalInventory: inventory.length,

      activeCertificates: activeCertificates.length,
    };
  }, [events, inventory, certificates]);

  const registrationProgress = calculatePercentage(
    dashboardSummary.registeredDonors,
    dashboardSummary.totalTargetDonors,
  );

  const availableInventoryProgress = calculatePercentage(
    dashboardSummary.availableUnits,
    dashboardSummary.totalInventory,
  );

  const reservedInventoryProgress = calculatePercentage(
    dashboardSummary.reservedUnits,
    dashboardSummary.totalInventory,
  );

  return (
    <section className="space-y-4">
      {/* Dashboard status bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-red-600">
            Hospital operations
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            Current inventory, donation event, and certificate data.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadDashboardData()}
          disabled={isLoading}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw
            className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh Overview
        </button>
      </div>

      {loadWarning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[10px] font-bold text-amber-800">
          {loadWarning}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Available Blood Units"
          value={isLoading ? "—" : dashboardSummary.availableUnits}
          icon={Droplets}
          helperText={
            isLoading ? "Loading" : `${dashboardSummary.reservedUnits} reserved`
          }
          helperTone="green"
        />

        <StatCard
          label="Registered Donors"
          value={isLoading ? "—" : dashboardSummary.registeredDonors}
          icon={Users}
          helperText={
            dashboardSummary.totalTargetDonors > 0
              ? `${dashboardSummary.totalTargetDonors} target`
              : "No target"
          }
          helperTone="red"
        />

        <StatCard
          label="Active Certificates"
          value={isLoading ? "—" : dashboardSummary.activeCertificates}
          icon={Award}
          helperText="Verified records"
          helperTone="slate"
        />

        <StatCard
          label="Upcoming Events"
          value={isLoading ? "—" : dashboardSummary.upcomingEvents}
          icon={CalendarDays}
          helperText={`${dashboardSummary.draftEvents} drafts`}
          helperTone="amber"
        />
      </div>

      {/* Main dashboard actions */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_310px]">
        <ActionCard
          title="Manage Blood Inventory"
          description="Review available units, reserved blood bags, expiry dates, storage locations, and inventory history."
          buttonLabel="Open Inventory"
          icon={PackageOpen}
          variant="red"
          onClick={() => navigate("/hospital/inventory")}
        />

        <ActionCard
          title="Organize Donation Events"
          description="Review existing events, manage drafts, monitor donor registrations, and create new donation campaigns."
          buttonLabel="Open Scheduler"
          icon={CalendarPlus2}
          variant="indigo"
          onClick={() => navigate("/hospital/events")}
        />

        {/* Actual operational overview */}
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-600">
                Live overview
              </p>

              <h2 className="mt-1 text-base font-black tracking-tight text-slate-950">
                Current Operations
              </h2>

              <p className="mt-1 text-[9px] font-medium text-slate-400">
                Updated from current API records
              </p>
            </div>

            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Activity className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <ActivityItem
              label="Available Inventory"
              value={`${dashboardSummary.availableUnits} units`}
              helperText={`${dashboardSummary.totalInventory} total`}
              progress={availableInventoryProgress}
              progressClass="bg-emerald-500"
            />

            <ActivityItem
              label="Reserved Inventory"
              value={`${dashboardSummary.reservedUnits} units`}
              helperText={`${dashboardSummary.expiringSoonUnits} expiring soon`}
              progress={reservedInventoryProgress}
              progressClass="bg-amber-500"
            />

            <ActivityItem
              label="Event Registrations"
              value={`${dashboardSummary.registeredDonors} donors`}
              helperText={
                dashboardSummary.totalTargetDonors > 0
                  ? `${dashboardSummary.totalTargetDonors} target`
                  : "No target set"
              }
              progress={registrationProgress}
              progressClass="bg-indigo-500"
            />
          </div>

          <NextEventCard event={dashboardSummary.nextUpcomingEvent} />

          <button
            type="button"
            onClick={() => navigate("/hospital/events")}
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-red-100 bg-red-50/70 px-3.5 py-3 text-left transition hover:border-red-200 hover:bg-red-50"
          >
            <span className="text-[10px] font-black text-red-700">
              View event schedule
            </span>

            <ArrowRight className="h-3.5 w-3.5 text-red-600" />
          </button>
        </article>
      </div>
    </section>
  );
};

const ActionCard = ({
  title,
  description,
  buttonLabel,
  icon: Icon,
  variant,
  onClick,
}: ActionCardProps) => {
  const styles = actionStyles[variant];

  return (
    <article
      className={`relative min-h-[220px] overflow-hidden rounded-2xl p-5 text-white shadow-lg ${styles.card}`}
    >
      <div
        className={`pointer-events-none absolute -bottom-14 -right-10 h-36 w-36 rounded-full border-[20px] ${styles.decoration}`}
      />

      <div
        className={`pointer-events-none absolute bottom-3 right-8 h-16 w-16 rotate-12 rounded-2xl border-[10px] ${styles.decoration}`}
      />

      <div className="relative z-10 flex h-full flex-col">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${styles.icon}`}
        >
          <Icon className="h-5 w-5" />
        </span>

        <div className="mt-5">
          <h2 className="max-w-[250px] text-xl font-black leading-6 tracking-[-0.03em]">
            {title}
          </h2>

          <p className="mt-2 max-w-[310px] text-[10px] font-medium leading-4 text-white/75">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={onClick}
          className={`mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-[10px] font-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${styles.button}`}
        >
          {buttonLabel}

          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
};

const NextEventCard = ({ event }: { event: DonationEventResponse | null }) => {
  if (!event) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3">
        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
          Next event
        </p>

        <p className="mt-1 text-[10px] font-bold text-slate-600">
          No upcoming published event
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-3">
      <div className="flex items-start gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600">
          <CalendarDays className="h-4 w-4" />
        </span>

        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-wider text-indigo-500">
            Next published event
          </p>

          <p className="mt-1 truncate text-[10px] font-black text-slate-900">
            {event.eventTitle || "Untitled event"}
          </p>

          <p className="mt-1 text-[9px] font-semibold text-slate-500">
            {formatDate(event.eventDate)}

            {event.startTime ? ` • ${formatTime(event.startTime)}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({
  label,
  value,
  helperText,
  progress,
  progressClass,
}: {
  label: string;
  value: string;
  helperText: string;
  progress: number;
  progressClass: string;
}) => {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 text-sm font-black text-slate-950">{value}</p>
        </div>

        <p className="text-right text-[8px] font-bold text-slate-400">
          {helperText}
        </p>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${progressClass}`}
          style={{
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
          }}
        />
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  helperText,
  helperTone = "slate",
}: StatCardProps) => {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <Icon className="h-4 w-4" />
        </span>

        <span
          className={`rounded-full px-2.5 py-1 text-[8px] font-black ${helperToneStyles[helperTone]}`}
        >
          {helperText}
        </span>
      </div>

      <p className="mt-5 text-[9px] font-extrabold text-slate-400">{label}</p>

      <div className="mt-1 flex items-end justify-between">
        <p className="text-2xl font-black tracking-[-0.04em] text-slate-950">
          {value}
        </p>

        <ShieldCheck className="h-4 w-4 text-slate-200" />
      </div>
    </article>
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

const calculatePercentage = (value: number, total: number): number => {
  if (total <= 0) {
    return 0;
  }

  return Math.min(Math.round((value / total) * 100), 100);
};

const getToday = (): string => {
  const now = new Date();

  const timezoneOffset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const isExpiringSoon = (
  expiryDate: string | null | undefined,
  status: string,
): boolean => {
  if (!expiryDate || !["AVAILABLE", "RESERVED"].includes(status)) {
    return false;
  }

  const today = new Date(`${getToday()}T00:00:00`);

  const expiry = new Date(`${expiryDate.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(expiry.getTime())) {
    return false;
  }

  const differenceInDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / 86_400_000,
  );

  return differenceInDays >= 0 && differenceInDays <= 7;
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatTime = (value: string | null | undefined): string => {
  if (!value) {
    return "--:--";
  }

  return value.slice(0, 5);
};

export default HospitalDashboardOverview;
