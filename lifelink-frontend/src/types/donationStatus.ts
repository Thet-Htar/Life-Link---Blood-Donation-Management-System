import type { DonationScheduleState } from "./donationSchedule";

interface DonationStatus {
  title: string;
  description: string;
  badgeLabel: string;
  titleClassName: string;
  badgeClassName: string;
  fillColor: string;
}

export const getDonationStatus = (
  state: DonationScheduleState,
  progress: number,
): DonationStatus => {
    //just checking error fall back
  if (state === "DATE_REQUIRED") {
    return {
      title: "Donation date required",
      description: "Please enter your last donation date.",
      badgeLabel: "Incomplete",
      titleClassName: "text-slate-700",
      badgeClassName: "border-slate-200 bg-slate-100 text-slate-700",
      fillColor: "#94a3b8",
    };
  }

  if (state === "INVALID_DATE") {
    return {
      title: "Invalid donation date",
      description: "Please provide a valid donation date.",
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
      description: "Your body is still rebuilding.",
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
