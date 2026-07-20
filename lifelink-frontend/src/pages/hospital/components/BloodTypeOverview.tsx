import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

import type {
  BloodTypeInventorySummary,
  StockLevel,
} from "@/types/hospitalInventory";

import type { BloodType } from "@/types/auth/Auth";

interface BloodTypeOverviewProps {
  bloodTypes: BloodTypeInventorySummary[];
}

interface StockLevelStyles {
  badge: string;
  bar: string;
  card: string;
  bloodType: string;
  availableValue: string;
}

const BLOOD_TYPE_ORDER: BloodType[] = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
];

const formatBloodType = (
  bloodType: BloodType,
): string => {
  return bloodType
    .replace("_POSITIVE", "+")
    .replace("_NEGATIVE", "−");
};

const getStockLevelStyles = (
  stockLevel: StockLevel,
): StockLevelStyles => {
  switch (stockLevel) {
    case "HEALTHY":
      return {
        badge:
          "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100",
        bar: "bg-emerald-500",
        card:
          "border-red-200 bg-white hover:border-red-300",
        bloodType: "text-slate-950",
        availableValue: "text-emerald-700",
      };

    case "LOW":
      return {
        badge:
          "bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100",
        bar: "bg-amber-500",
        card:
          "border-red-200 bg-white hover:border-amber-300",
        bloodType: "text-slate-950",
        availableValue: "text-amber-700",
      };

    case "CRITICAL":
      return {
        badge:
          "bg-red-600 text-white",
        bar: "bg-red-500",
        card:
          "border-red-200 bg-red-50/40 hover:border-red-400",
        bloodType: "text-red-600",
        availableValue: "text-red-600",
      };

    default:
      return {
        badge:
          "bg-slate-100 text-slate-600",
        bar: "bg-slate-400",
        card:
          "border-slate-200 bg-white",
        bloodType: "text-slate-950",
        availableValue: "text-slate-700",
      };
  }
};

const BloodTypeOverview = ({
  bloodTypes,
}: BloodTypeOverviewProps) => {
  /*
   * Always show all eight blood types
   * in the following order:
   *
   * A+, A−, B+, B−
   * AB+, AB−, O+, O−
   */
  const sortedBloodTypes: BloodTypeInventorySummary[] =
    BLOOD_TYPE_ORDER.map((bloodType) => {
      const existing = bloodTypes.find(
        (item) =>
          item.bloodType === bloodType,
      );

      return (
        existing ?? {
          bloodType,
          availableUnits: 0,
          reservedUnits: 0,
          totalUsableUnits: 0,
          stockLevel:
            "CRITICAL" as StockLevel,
        }
      );
    });

  /*
   * The blood type with the highest available
   * amount receives a 100% progress bar.
   */
  const maximumAvailable = Math.max(
    1,
    ...sortedBloodTypes.map(
      (item) => item.availableUnits,
    ),
  );

  return (
    <section className="mt-6">
      <div className="mb-4 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <BarChart3 className="h-4 w-4 shrink-0 text-red-600" />

          <h2 className="truncate text-xl font-black tracking-tight text-slate-950">
            Blood Type Overview
          </h2>
        </div>

        <Link
          to="/hospital/inventory/details"
          className="inline-flex w-fit shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-sm font-black text-red-600 transition hover:bg-red-50 hover:text-red-700"
        >
          View all inventory

          <span aria-hidden="true">
            →
          </span>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sortedBloodTypes.map((item) => {
          const styles =
            getStockLevelStyles(
              item.stockLevel,
            );

          const progress =
            item.availableUnits === 0
              ? 0
              : Math.max(
                  8,
                  Math.round(
                    (item.availableUnits /
                      maximumAvailable) *
                      100,
                  ),
                );

          return (
            <article
              key={item.bloodType}
              className={`relative overflow-hidden rounded-xl border px-4 py-3.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${styles.card}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p
                  className={`text-xl font-black tracking-tight ${styles.bloodType}`}
                >
                  {formatBloodType(
                    item.bloodType,
                  )}
                </p>

                <span
                  className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wide ${styles.badge}`}
                >
                  {item.stockLevel}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-slate-500">
                <p>
                  Available:{" "}
                  <span
                    className={`font-black ${styles.availableValue}`}
                  >
                    {item.availableUnits}
                  </span>
                </p>

                <p>
                  Reserved:{" "}
                  <span className="font-black text-slate-600">
                    {item.reservedUnits}
                  </span>
                </p>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  style={{
                    width: `${progress}%`,
                  }}
                  className={`h-full rounded-full transition-all duration-700 ${styles.bar}`}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default BloodTypeOverview;