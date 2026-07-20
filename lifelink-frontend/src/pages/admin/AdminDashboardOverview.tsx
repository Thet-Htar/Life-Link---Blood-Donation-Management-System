import {
  useCallback,
  useEffect,
  useState,
  type ComponentType,
} from "react";

import { useNavigate } from "react-router-dom";

import type { LucideProps } from "lucide-react";

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Clock3,
  LockKeyhole,
  MailCheck,
  RefreshCcw,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { searchAdminDonors, searchAdminHospitals } from "@/services/adminService";

type StatisticIcon =
  ComponentType<LucideProps>;

interface DashboardStatistic {
  label: string;
  value: string;
  description: string;
  icon: StatisticIcon;
  iconClassName: string;
}

const AdminDashboardOverview = () => {
  const navigate = useNavigate();

  const [pendingHospitals, setPendingHospitals] =
    useState<number | null>(null);

  const [totalHospitals, setTotalHospitals] =
    useState<number | null>(null);

  const [totalDonors, setTotalDonors] =
    useState<number | null>(null);

  const [approvedHospitals, setApprovedHospitals] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadDashboard = useCallback(
    async (): Promise<void> => {
      try {
        setLoading(true);
        setErrorMessage("");

        const [
          pendingHospitalsResult,
          allHospitalsResult,
          allDonorsResult,
          approvedHospitalsResult,
        ] = await Promise.all([
          searchAdminHospitals({
            status: "UNDER_REVIEW",
            page: 0,
            size: 1,
          }),

          searchAdminHospitals({
            page: 0,
            size: 1,
          }),

          searchAdminDonors({
            page: 0,
            size: 1,
          }),

          searchAdminHospitals({
            status: "APPROVED",
            page: 0,
            size: 1,
          }),
        ]);

        setPendingHospitals(
          pendingHospitalsResult.totalElements,
        );

        setTotalHospitals(
          allHospitalsResult.totalElements,
        );

        setTotalDonors(
          allDonorsResult.totalElements,
        );

        setApprovedHospitals(
          approvedHospitalsResult.totalElements,
        );
      } catch (error) {
        console.error(
          "Unable to load admin dashboard:",
          error,
        );

        setErrorMessage(
          "Unable to load the latest administration summary.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const statistics: DashboardStatistic[] = [
    {
      label: "Pending approvals",
      value: loading
        ? "..."
        : String(pendingHospitals ?? 0),
      description:
        "Hospital registrations awaiting review",
      icon: Clock3,
      iconClassName:
        "bg-amber-50 text-amber-600 ring-amber-100",
    },
    {
      label: "Registered hospitals",
      value: loading
        ? "..."
        : String(totalHospitals ?? 0),
      description:
        "Hospitals registered with LifeLink",
      icon: Building2,
      iconClassName:
        "bg-red-50 text-red-600 ring-red-100",
    },
    {
      label: "Registered donors",
      value: loading
        ? "..."
        : String(totalDonors ?? 0),
      description:
        "Blood donors registered with LifeLink",
      icon: UsersRound,
      iconClassName:
        "bg-blue-50 text-blue-600 ring-blue-100",
    },
    {
      label: "Approved hospitals",
      value: loading
        ? "..."
        : String(approvedHospitals ?? 0),
      description:
        "Hospitals approved for portal access",
      icon: BadgeCheck,
      iconClassName:
        "bg-emerald-50 text-emerald-600 ring-emerald-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-50" />

        <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-slate-50" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20">
              <ShieldCheck className="h-6 w-6" />
            </span>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-600">
                Administrative control
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
                Welcome to LifeLink Admin
              </h2>

              <p className="mt-2 max-w-2xl text-xs font-medium leading-5 text-slate-500">
                Review hospital registrations, monitor
                registered accounts, and protect system
                access from one administrative workspace.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/approvals")
            }
            className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-[10px] font-black text-white shadow-md shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700"
          >
            <UserRoundCheck className="h-4 w-4" />

            Review Hospital Approvals

            {!loading &&
              (pendingHospitals ?? 0) > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[9px] font-black text-red-600">
                  {pendingHospitals}
                </span>
              )}
          </button>
        </div>
      </section>

      {/* Error message */}
      {errorMessage && (
        <section className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold text-red-700">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadDashboard()
            }
            disabled={loading}
            className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-[9px] font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw
              className={[
                "h-3.5 w-3.5",
                loading
                  ? "animate-spin"
                  : "",
              ].join(" ")}
            />

            Try Again
          </button>
        </section>
      )}

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((statistic) => {
          const Icon = statistic.icon;

          return (
            <article
              key={statistic.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                    {statistic.label}
                  </p>

                  <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950">
                    {statistic.value}
                  </p>
                </div>

                <span
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1",
                    statistic.iconClassName,
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>

              <p className="mt-3 text-[10px] font-medium leading-4 text-slate-500">
                {statistic.description}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
        {/* Quick actions */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-red-600">
              Quick actions
            </p>

            <h3 className="mt-1 text-xl font-black tracking-[-0.04em] text-slate-950">
              Administration workspace
            </h3>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Open the most important management pages.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {/* Approvals */}
            <button
              type="button"
              onClick={() =>
                navigate("/admin/approvals")
              }
              className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-red-200 hover:bg-red-50"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                  <UserRoundCheck className="h-5 w-5" />
                </span>

                {!loading &&
                  (pendingHospitals ?? 0) > 0 && (
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-100 px-2 py-1 text-[9px] font-black text-amber-700">
                      {pendingHospitals}
                    </span>
                  )}
              </div>

              <p className="mt-4 text-xs font-black text-slate-900">
                Hospital approvals
              </p>

              <p className="mt-1 text-[10px] font-medium leading-4 text-slate-500">
                Review and approve pending registrations.
              </p>

              <ArrowRight className="mt-4 h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-red-600" />
            </button>

            {/* Hospitals */}
            <button
              type="button"
              onClick={() =>
                navigate("/admin/hospitals")
              }
              className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-red-200 hover:bg-red-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
                <Building2 className="h-5 w-5" />
              </span>

              <p className="mt-4 text-xs font-black text-slate-900">
                Hospital accounts
              </p>

              <p className="mt-1 text-[10px] font-medium leading-4 text-slate-500">
                View hospitals and control account access.
              </p>

              <ArrowRight className="mt-4 h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-red-600" />
            </button>

            {/* Donors */}
            <button
              type="button"
              onClick={() =>
                navigate("/admin/donors")
              }
              className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-red-200 hover:bg-red-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <UsersRound className="h-5 w-5" />
              </span>

              <p className="mt-4 text-xs font-black text-slate-900">
                Donor accounts
              </p>

              <p className="mt-1 text-[10px] font-medium leading-4 text-slate-500">
                View donors and control account access.
              </p>

              <ArrowRight className="mt-4 h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-red-600" />
            </button>
          </div>
        </article>

        {/* System information */}
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-red-600">
            System status
          </p>

          <h3 className="mt-1 text-lg font-black tracking-[-0.04em] text-slate-950">
            Administrative services
          </h3>

          <div className="mt-5 space-y-3">
            {/* Authentication */}
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
              </span>

              <div className="min-w-0">
                <p className="text-[10px] font-black text-emerald-800">
                  Admin authentication
                </p>

                <p className="mt-0.5 text-[9px] font-medium text-emerald-600">
                  Protected by role authorization
                </p>
              </div>
            </div>

            {/* Mail */}
            <div className="flex items-center gap-3 rounded-2xl bg-blue-50 p-3 ring-1 ring-blue-100">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
                <MailCheck className="h-4 w-4" />
              </span>

              <div className="min-w-0">
                <p className="text-[10px] font-black text-blue-800">
                  Gmail notification service
                </p>

                <p className="mt-0.5 text-[9px] font-medium text-blue-600">
                  Hospital approval emails enabled
                </p>
              </div>
            </div>

            {/* Account control */}
            <div className="flex items-center gap-3 rounded-2xl bg-violet-50 p-3 ring-1 ring-violet-100">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600">
                <LockKeyhole className="h-4 w-4" />
              </span>

              <div className="min-w-0">
                <p className="text-[10px] font-black text-violet-800">
                  Account access control
                </p>

                <p className="mt-0.5 text-[9px] font-medium text-violet-600">
                  Hospital and donor lock controls enabled
                </p>
              </div>
            </div>

            {/* Approval service */}
            <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-100">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600">
                <BadgeCheck className="h-4 w-4" />
              </span>

              <div className="min-w-0">
                <p className="text-[10px] font-black text-amber-800">
                  Hospital verification
                </p>

                <p className="mt-0.5 text-[9px] font-medium text-amber-600">
                  Approval workflow operational
                </p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};

export default AdminDashboardOverview;