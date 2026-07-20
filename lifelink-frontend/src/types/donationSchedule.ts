import type { DonationHistoryType } from "@/types/auth/Auth";

export type DonationScheduleState =
  | "ELIGIBLE"
  | "RECOVERING"
  | "DATE_REQUIRED"
  | "INVALID_DATE"
  | "FUTURE_DATE";

export interface DonationSchedule {
  state: DonationScheduleState;
  progress: number;
  daysRemaining: number;
  nextDonationDate: string;
  lastDonationDisplayDate: string;
}

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

const startOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const parseLocalDate = (value: string): Date | null => {
  const [year, month, day] = value.split("-").map(Number);

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

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const createDateErrorResult = (
  state: "DATE_REQUIRED" | "INVALID_DATE" | "FUTURE_DATE",
  message: string,
): DonationSchedule => {
  return {
    state,
    progress: 0,
    daysRemaining: 0,
    nextDonationDate: message,
    lastDonationDisplayDate: "Not recorded",
  };
};

export const calculateDonationSchedule = (
  lastDonationDate: string | null | undefined,
  donationHistoryType: DonationHistoryType | undefined,
  waitingMonths = 4,
): DonationSchedule => {
  const today = startOfDay(new Date());

  const normalizedWaitingMonths = Math.max(0, Math.floor(waitingMonths));

  if (lastDonationDate) {
    const parsedDate = parseLocalDate(lastDonationDate);

    if (!parsedDate) {
      return createDateErrorResult("INVALID_DATE", "Invalid date");
    }

    const lastDonation = startOfDay(parsedDate);

    if (lastDonation > today) {
      return createDateErrorResult("FUTURE_DATE", "Future date is not allowed");
    }

    const nextEligibleDate = addMonthsClamped(
      lastDonation,
      normalizedWaitingMonths,
    );

    const eligible = today >= nextEligibleDate;

    const totalDays = Math.max(
      1,
      differenceInCalendarDays(nextEligibleDate, lastDonation),
    );

    const completedDays = Math.max(
      0,
      differenceInCalendarDays(today, lastDonation),
    );

    const progress = eligible
      ? 100
      : Math.min(99, Math.round((completedDays / totalDays) * 100));

    return {
      state: eligible ? "ELIGIBLE" : "RECOVERING",
      progress,
      daysRemaining: eligible
        ? 0
        : differenceInCalendarDays(nextEligibleDate, today),
      nextDonationDate: formatDate(nextEligibleDate),
      lastDonationDisplayDate: formatDate(lastDonation),
    };
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

  return createDateErrorResult("DATE_REQUIRED", "Date required");
};
