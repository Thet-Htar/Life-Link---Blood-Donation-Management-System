import {
  ArrowUpRight,
  BadgeCheck,
  Droplet,
  Heart,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import BloodDropProgress, {
  calculateDonationSchedule,
} from "./BloodDropProgress";
import type { DonationHistoryType } from "@/types/auth/Auth";

interface DashboardOverviewProps {
  donorCode: string;
  eligible: boolean;
  donationCount: number;
  lastDonationDate: string | null;
  donationHistoryType?: DonationHistoryType;
}

const LIVES_SUPPORTED_PER_DONATION = 3;

const RECOVERY_WAITING_MONTHS = 4;

const DashboardOverview = ({
  donorCode,
  eligible,
  donationCount,
  lastDonationDate,
  donationHistoryType,
}: DashboardOverviewProps) => {
  const safeDonationCount = Math.max(
    Number.isFinite(donationCount) ? donationCount : 0,
    0,
  );

  const livesSupported = safeDonationCount * LIVES_SUPPORTED_PER_DONATION;

  const schedule = calculateDonationSchedule(
    lastDonationDate,
    donationHistoryType,
    RECOVERY_WAITING_MONTHS,
  );

  const hasScheduleInformation = Boolean(
    lastDonationDate || donationHistoryType,
  );

  const displayedEligible = hasScheduleInformation
    ? schedule.eligible
    : eligible;

  const hasCompletedDonation =
    safeDonationCount > 0 || Boolean(lastDonationDate);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
            Dashboard overview
          </p>

          <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-950">
            Your donation impact
          </h2>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Review your successful donations, donor identity, and next donation
            window.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold text-blue-700">
            <BadgeCheck className="h-3.5 w-3.5" />
            Donor ID: {donorCode}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-extrabold ${
              displayedEligible
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-amber-100 bg-amber-50 text-amber-700"
            }`}
          >
            {displayedEligible ? (
              <ShieldCheck className="h-3.5 w-3.5" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5" />
            )}

            {displayedEligible ? "Eligible donor" : "Not currently eligible"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
        <article className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-red-50" />

          <div className="pointer-events-none absolute bottom-[-4rem] right-8 h-28 w-28 rounded-full bg-rose-50 blur-xl" />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Life impact
                </p>

                <h3 className="mt-1 text-base font-black tracking-tight text-slate-950">
                  Every donation creates hope
                </h3>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Heart className="h-5 w-5 fill-current" />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-5xl font-black tracking-[-0.06em] text-red-600">
                  {livesSupported}
                </p>

                <p className="mt-1 text-xs font-extrabold text-slate-700">
                  Lives supported
                </p>

                <p className="mt-1 text-[10px] font-medium text-slate-500">
                  Each successful donation may support up to{" "}
                  {LIVES_SUPPORTED_PER_DONATION} lives.
                </p>
              </div>

              <div className="rounded-2xl border border-red-100 bg-red-50/70 px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1 text-[10px] font-black text-red-700">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Positive impact
                </div>

                <p className="mt-1 max-w-[180px] text-[9px] font-medium leading-4 text-slate-500">
                  Your contribution helps hospitals respond more effectively to
                  blood needs.
                </p>
              </div>
            </div>

            <div className="mt-7 rounded-xl border border-red-100 bg-red-50/70 p-3.5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm ring-1 ring-red-100">
                    <Droplet className="h-4 w-4 fill-current" />
                  </span>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-red-700/70">
                      Successful donations
                    </p>

                    <p className="mt-0.5 text-sm font-black text-slate-950">
                      {safeDonationCount}{" "}
                      {safeDonationCount === 1 ? "donation" : "donations"}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-extrabold text-red-700 shadow-sm ring-1 ring-red-100">
                  {safeDonationCount}
                </span>
              </div>
            </div>
          </div>
        </article>

        {hasCompletedDonation ? (
          <BloodDropProgress
            lastDonationDate={lastDonationDate}
            donationHistoryType={donationHistoryType}
            waitingMonths={RECOVERY_WAITING_MONTHS}
          />
        ) : (
          <article className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Droplet className="h-6 w-6 fill-current" />
            </span>

            <h3 className="mt-4 text-base font-black text-slate-950">
              First donation journey
            </h3>

            <p className="mt-2 max-w-sm text-xs font-medium leading-5 text-slate-500">
              No successful donation is currently recorded. Browse published
              events and register for your first LifeLink donation mission.
            </p>
          </article>
        )}
      </div>
    </section>
  );
};

export default DashboardOverview;
