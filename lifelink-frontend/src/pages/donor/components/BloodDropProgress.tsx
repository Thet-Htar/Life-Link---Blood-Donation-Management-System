import { useId, type ComponentType } from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Droplet,
  History,
  type LucideProps,
} from "lucide-react";

import type { DonationHistoryType } from "@/types/auth/Auth";

interface BloodDropProgressProps {
  lastDonationDate?: string | null;
  donationHistoryType?: DonationHistoryType;
  waitingMonths?: number;
}

type DonationScheduleState =
  | "ELIGIBLE"
  | "RECOVERING"
  | "DATE_REQUIRED"
  | "INVALID_DATE"
  | "FUTURE_DATE";

interface DonationSchedule {
  state: DonationScheduleState;
  progress: number;
  daysRemaining: number;
  nextDonationDate: string;
  lastDonationDisplayDate: string;
}

interface DonationStatus {
  title: string;
  description: string;
  badgeLabel: string;
  titleClassName: string;
  badgeClassName: string;
  fillColor: string;
}

interface DetailRowProps {
  icon: ComponentType<LucideProps>;
  label: string;
  value: string;
}

interface BloodBagGraphicProps {
  progress: number;
  fillColor: string;
  clipPathId: string;
  gradientId: string;
}

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

const startOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const parseLocalDate = (value: string): Date | null => {
  const parts = value.split("-").map(Number);

  if (parts.length !== 3) {
    return null;
  }

  const [year, month, day] = parts;

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  const isValid =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return isValid ? date : null;
};

const addMonthsClamped = (date: Date, months: number): Date => {
  const originalDay = date.getDate();

  const targetMonth = new Date(date.getFullYear(), date.getMonth() + months, 1);

  const lastDayOfTargetMonth = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth() + 1,
    0,
  ).getDate();

  return new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth(),
    Math.min(originalDay, lastDayOfTargetMonth),
  );
};

const differenceInCalendarDays = (
  laterDate: Date,
  earlierDate: Date,
): number => {
  const laterUtc = Date.UTC(
    laterDate.getFullYear(),
    laterDate.getMonth(),
    laterDate.getDate(),
  );

  const earlierUtc = Date.UTC(
    earlierDate.getFullYear(),
    earlierDate.getMonth(),
    earlierDate.getDate(),
  );

  return Math.round((laterUtc - earlierUtc) / MILLISECONDS_PER_DAY);
};

const formatDisplayDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const createInvalidSchedule = (
  state: "DATE_REQUIRED" | "INVALID_DATE" | "FUTURE_DATE",
  nextDonationDate: string,
  lastDonationDisplayDate = "Not recorded",
): DonationSchedule => {
  return {
    state,
    progress: 0,
    daysRemaining: 0,
    nextDonationDate,
    lastDonationDisplayDate,
  };
};

export const calculateDonationSchedule = (
  lastDonationDate: string | null | undefined,
  donationHistoryType: DonationHistoryType | undefined,
  waitingMonths = 4,
): DonationSchedule => {
  const today = startOfDay(new Date());

  const safeWaitingMonths = Math.max(0, Math.floor(waitingMonths));

  if (lastDonationDate) {
    const parsedDate = parseLocalDate(lastDonationDate);

    if (!parsedDate) {
      return createInvalidSchedule(
        "INVALID_DATE",
        "Invalid date",
        "Invalid date",
      );
    }

    const normalizedLastDonationDate = startOfDay(parsedDate);

    if (normalizedLastDonationDate > today) {
      return createInvalidSchedule(
        "FUTURE_DATE",
        "Future date is not allowed",
        formatDisplayDate(normalizedLastDonationDate),
      );
    }

    const nextEligibleDate = addMonthsClamped(
      normalizedLastDonationDate,
      safeWaitingMonths,
    );

    const eligible = today >= nextEligibleDate;

    const totalRecoveryDays = Math.max(
      1,
      differenceInCalendarDays(nextEligibleDate, normalizedLastDonationDate),
    );

    const completedRecoveryDays = Math.max(
      0,
      differenceInCalendarDays(today, normalizedLastDonationDate),
    );

    const progress = eligible
      ? 100
      : Math.min(
          99,
          Math.max(
            0,
            Math.round((completedRecoveryDays / totalRecoveryDays) * 100),
          ),
        );

    const daysRemaining = eligible
      ? 0
      : Math.max(0, differenceInCalendarDays(nextEligibleDate, today));

    return {
      state: eligible ? "ELIGIBLE" : "RECOVERING",
      progress,
      daysRemaining,
      nextDonationDate: formatDisplayDate(nextEligibleDate),
      lastDonationDisplayDate: formatDisplayDate(normalizedLastDonationDate),
    };
  }

  if (donationHistoryType === "EXACT_DATE") {
    return createInvalidSchedule("DATE_REQUIRED", "Date required");
  }

  if (
    donationHistoryType === "NEVER_DONATED" ||
    donationHistoryType === "OVER_FOUR_MONTHS_NO_DATE"
  ) {
    return {
      state: "ELIGIBLE",
      progress: 100,
      daysRemaining: 0,
      nextDonationDate: "Eligible now",
      lastDonationDisplayDate: "No recent donation",
    };
  }

  return createInvalidSchedule("DATE_REQUIRED", "Donation history required");
};

const getDonationStatus = (
  state: DonationScheduleState,
  progress: number,
): DonationStatus => {
  if (state === "DATE_REQUIRED") {
    return {
      title: "Donation information required",
      description:
        "Please update your donation history to calculate eligibility.",
      badgeLabel: "Incomplete",
      titleClassName: "text-slate-700",
      badgeClassName: "border-slate-200 bg-slate-100 text-slate-700",
      fillColor: "#94a3b8",
    };
  }

  if (state === "INVALID_DATE") {
    return {
      title: "Invalid donation date",
      description: "Please provide a valid last donation date.",
      badgeLabel: "Invalid",
      titleClassName: "text-red-700",
      badgeClassName: "border-red-100 bg-red-50 text-red-700",
      fillColor: "#94a3b8",
    };
  }

  if (state === "FUTURE_DATE") {
    return {
      title: "Future date detected",
      description: "The last donation date cannot be in the future.",
      badgeLabel: "Invalid",
      titleClassName: "text-red-700",
      badgeClassName: "border-red-100 bg-red-50 text-red-700",
      fillColor: "#94a3b8",
    };
  }

  if (state === "ELIGIBLE") {
    return {
      title: "Ready to donate",
      description: "You are eligible for your next blood donation.",
      badgeLabel: "Eligible",
      titleClassName: "text-emerald-700",
      badgeClassName: "border-emerald-100 bg-emerald-50 text-emerald-700",
      fillColor: "#dc2626",
    };
  }

  if (progress >= 75) {
    return {
      title: "Almost eligible",
      description: "Your recovery period is nearly complete.",
      badgeLabel: "Recovering",
      titleClassName: "text-red-700",
      badgeClassName: "border-red-100 bg-red-50 text-red-700",
      fillColor: "#dc2626",
    };
  }

  if (progress >= 40) {
    return {
      title: "Recovery in progress",
      description: "Your body is still rebuilding after your last donation.",
      badgeLabel: "Recovering",
      titleClassName: "text-amber-700",
      badgeClassName: "border-amber-100 bg-amber-50 text-amber-700",
      fillColor: "#f59e0b",
    };
  }

  return {
    title: "Rest period",
    description: "Please allow more time before your next donation.",
    badgeLabel: "Recovering",
    titleClassName: "text-slate-700",
    badgeClassName: "border-slate-200 bg-slate-100 text-slate-700",
    fillColor: "#94a3b8",
  };
};

const DetailRow = ({ icon: Icon, label, value }: DetailRowProps) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3.5 py-3">
      <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-500">
        <Icon className="h-4 w-4 shrink-0 text-red-600" />

        <span>{label}</span>
      </div>

      <span className="text-right text-sm font-black text-slate-950">
        {value}
      </span>
    </div>
  );
};

const BloodBagGraphic = ({
  progress,
  fillColor,
  clipPathId,
  gradientId,
}: BloodBagGraphicProps) => {
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  const fillHeight = 102 * (safeProgress / 100);

  const fillY = 131 - fillHeight;

  return (
    <div className="relative mx-auto flex h-[178px] w-[138px] items-center justify-center">
      <div className="absolute inset-x-2 bottom-1 h-5 rounded-full bg-red-950/10 blur-md" />

      <svg
        viewBox="0 0 120 170"
        className="relative h-full w-full drop-shadow-[0_14px_18px_rgba(127,29,29,0.14)]"
        role="img"
        aria-label={`${safeProgress}% donation recovery progress`}
      >
        <defs>
          <clipPath id={clipPathId}>
            <rect x="18" y="30" width="84" height="112" rx="14" />
          </clipPath>

          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.82" />

            <stop offset="100%" stopColor={fillColor} />
          </linearGradient>
        </defs>

        <path
          d="M44 18C44 10 50 6 60 6C70 6 76 10 76 18V25H68V19C68 16 65 14 60 14C55 14 52 16 52 19V25H44V18Z"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="2"
        />

        <rect
          x="15"
          y="26"
          width="90"
          height="120"
          rx="17"
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth="2.5"
        />

        <g clipPath={`url(#${clipPathId})`}>
          <rect
            x="18"
            y={fillY}
            width="84"
            height={fillHeight}
            fill={`url(#${gradientId})`}
            className="transition-all duration-1000 ease-out"
          />

          <path
            d={`
              M18 ${fillY + 2}
              C35 ${fillY - 4},
               48 ${fillY + 8},
               64 ${fillY + 2}
              C80 ${fillY - 4},
               91 ${fillY + 5},
               102 ${fillY + 1}
              V${fillY + 12}
              H18
              Z
            `}
            fill={fillColor}
            opacity="0.8"
            className="transition-all duration-1000 ease-out"
          />
        </g>

        <line
          x1="28"
          y1="40"
          x2="28"
          y2="127"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.35"
        />

        <rect
          x="34"
          y="54"
          width="52"
          height="44"
          rx="8"
          fill="#ffffff"
          fillOpacity="0.92"
          stroke="#e2e8f0"
        />

        <path
          d="M60 62C60 62 51 72 51 80C51 86 55 90 60 90C65 90 69 86 69 80C69 72 60 62 60 62Z"
          fill="#dc2626"
        />

        <text
          x="60"
          y="109"
          textAnchor="middle"
          fontSize="16"
          fontWeight="900"
          fill={safeProgress > 58 ? "#ffffff" : "#0f172a"}
        >
          {safeProgress}%
        </text>

        <path
          d="M62 146V154C62 161 67 164 74 164H84"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <circle cx="87" cy="164" r="4" fill="#dc2626" />
      </svg>
    </div>
  );
};

const BloodDropProgress = ({
  lastDonationDate,
  donationHistoryType,
  waitingMonths = 4,
}: BloodDropProgressProps) => {
  const generatedId = useId().replace(/:/g, "");

  const clipPathId = `blood-bag-fill-${generatedId}`;

  const gradientId = `blood-bag-fluid-${generatedId}`;

  const schedule = calculateDonationSchedule(
    lastDonationDate,
    donationHistoryType,
    waitingMonths,
  );

  const status = getDonationStatus(schedule.state, schedule.progress);

  const hasDateProblem =
    schedule.state === "DATE_REQUIRED" ||
    schedule.state === "INVALID_DATE" ||
    schedule.state === "FUTURE_DATE";

  const daysRemainingText = hasDateProblem
    ? "Unknown"
    : schedule.daysRemaining === 0
      ? "0 days"
      : `${schedule.daysRemaining} days`;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">
            Donation schedule
          </p>

          <h3 className="mt-1 text-base font-black tracking-tight text-slate-950">
            Next Donation Eligibility
          </h3>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${status.badgeClassName}`}
        >
          {status.badgeLabel}
        </span>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-[150px_1fr] sm:items-center">
        <BloodBagGraphic
          progress={schedule.progress}
          fillColor={status.fillColor}
          clipPathId={clipPathId}
          gradientId={gradientId}
        />

        <div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Droplet className="h-4 w-4 fill-current" />
            </span>

            <div>
              <p
                className={`text-lg font-black tracking-tight ${status.titleClassName}`}
              >
                {status.title}
              </p>

              <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                {status.description}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            <DetailRow
              icon={History}
              label="Last donation"
              value={schedule.lastDonationDisplayDate}
            />

            <DetailRow
              icon={Clock3}
              label="Days remaining"
              value={daysRemainingText}
            />

            <DetailRow
              icon={CalendarDays}
              label="Eligible from"
              value={schedule.nextDonationDate}
            />
          </div>

          <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />

            <span>
              Eligibility is based on a {waitingMonths}-month recovery period.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BloodDropProgress;
