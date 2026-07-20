import { useEffect, useState } from "react";

import {
  CalendarClock,
  Droplet,
  LoaderCircle,
  PackageOpen,
  Plus,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import {
  createHospitalBloodUnit,
  getHospitalInventorySummary,
} from "@/services/hospital/hospitalInventoryService";

import type {
  BloodInventorySummaryResponse,
  CreateBloodUnitRequest,
} from "@/types/hospitalInventory";

import AddBloodUnitModal from "@/pages/hospital/components/AddBloodUnitModal";
import BloodTypeOverview from "./BloodTypeOverview";

const getErrorMessage = (error: unknown): string => {
  const candidate = error as {
    response?: {
      data?: {
        message?: string;
        detail?: string;
        error?: string;
      };
    };
    message?: string;
  };

  return (
    candidate.response?.data?.message ??
    candidate.response?.data?.detail ??
    candidate.response?.data?.error ??
    candidate.message ??
    "Unable to load blood inventory summary."
  );
};

const HospitalInventoryPage = () => {
  const [summary, setSummary] = useState<BloodInventorySummaryResponse | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);

  const loadSummary = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await getHospitalInventorySummary();

      setSummary(response);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSummary();
  }, []);

  const handleCreate = async (
    request: CreateBloodUnitRequest,
  ): Promise<void> => {
    setSubmitting(true);

    try {
      await createHospitalBloodUnit(request);

      setAddModalOpen(false);

      await loadSummary();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50/70 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1450px]">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
              LifeLink Hospital
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Blood Inventory
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Monitor blood-unit availability, reservations and upcoming expiry
              dates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />
            Add Blood Unit
          </button>
        </header>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 flex min-h-72 items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
              <LoaderCircle className="h-5 w-5 animate-spin text-red-600" />
              Loading inventory overview...
            </div>
          </div>
        ) : (
          <>
            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Total"
                value={summary?.totalUnits ?? 0}
                helper="All inventory records"
                icon={PackageOpen}
                valueClassName="text-slate-800"
                iconClassName="bg-slate-100 text-slate-700"
              />

              <SummaryCard
                label="Available"
                value={summary?.availableUnits ?? 0}
                helper="Ready for reservation or issue"
                icon={ShieldCheck}
                valueClassName="text-emerald-700"
                iconClassName="bg-emerald-50 text-emerald-600"
              />

              <SummaryCard
                label="Reserved"
                value={summary?.reservedUnits ?? 0}
                helper="Reserved for departments or patients"
                icon={Droplet}
                valueClassName="text-amber-700"
                iconClassName="bg-amber-50 text-amber-600"
              />

              <SummaryCard
                label="Expiring Soon"
                value={summary?.expiringSoonUnits ?? 0}
                helper="Expiring within seven days"
                icon={CalendarClock}
                valueClassName="text-red-700"
                iconClassName="bg-red-50 text-red-600"
              />
            </section>

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <BloodTypeOverview bloodTypes={summary?.bloodTypes ?? []} />
            </section>
          </>
        )}
      </div>

      <AddBloodUnitModal
        open={addModalOpen}
        submitting={submitting}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  valueClassName: string;
  iconClassName: string;
}

const SummaryCard = ({
  label,
  value,
  helper,
  icon: Icon,
  valueClassName,
  iconClassName,
}: SummaryCardProps) => {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>

          <p className={`mt-3 text-3xl font-black ${valueClassName}`}>
            {value}
          </p>

          <p className="mt-1 text-xs font-medium leading-5 text-slate-400">
            {helper}
          </p>
        </div>

        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
};

export default HospitalInventoryPage;
