import type { BloodType } from "@/types/auth/Auth";
import { Droplets } from "lucide-react";

interface BloodTypeSelectorProps {
  selectedBloodTypes: BloodType[];
  onChange: (bloodTypes: BloodType[]) => void;
  error?: string;
}

const bloodTypeOptions: {
  label: string;
  value: BloodType;
}[] = [
  {
    label: "A+",
    value: "A_POSITIVE",
  },
  {
    label: "A-",
    value: "A_NEGATIVE",
  },
  {
    label: "B+",
    value: "B_POSITIVE",
  },
  {
    label: "B-",
    value: "B_NEGATIVE",
  },
  {
    label: "AB+",
    value: "AB_POSITIVE",
  },
  {
    label: "AB-",
    value: "AB_NEGATIVE",
  },
  {
    label: "O+",
    value: "O_POSITIVE",
  },
  {
    label: "O-",
    value: "O_NEGATIVE",
  },
];

const BloodTypeSelector = ({
  selectedBloodTypes,
  onChange,
  error,
}: BloodTypeSelectorProps) => {
  const toggleBloodType = (bloodType: BloodType): void => {
    const isSelected = selectedBloodTypes.includes(bloodType);

    if (isSelected) {
      onChange(selectedBloodTypes.filter((selected) => selected !== bloodType));

      return;
    }

    onChange([...selectedBloodTypes, bloodType]);
  };

  return (
    <section className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
          <Droplets className="h-4 w-4" />
        </span>

        <h2 className="text-sm font-black text-slate-950">
          Required Blood Types
        </h2>
      </div>

      <p className="mt-3 text-[10px] font-medium leading-4 text-slate-500">
        Select all blood types needed for this event.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {bloodTypeOptions.map(({ label, value }) => {
          const isSelected = selectedBloodTypes.includes(value);

          return (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 transition ${
                isSelected
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:bg-red-50/40"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleBloodType(value)}
                className="h-4 w-4 accent-red-600"
              />

              <span className="text-[11px] font-black">{label}</span>
            </label>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-[10px] font-bold text-red-600">
          {error}
        </p>
      )}
    </section>
  );
};

export default BloodTypeSelector;
