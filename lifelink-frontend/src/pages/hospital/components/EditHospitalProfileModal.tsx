import { useEffect } from "react";
import {
  Building2,
  FileBadge2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  HospitalProfileResponse,
  HospitalProfileUpdateRequest,
} from "@/types/profile";

interface EditHospitalProfileModalProps {
  open: boolean;
  profile: HospitalProfileResponse;
  onClose: () => void;

  onProfileUpdated: (updatedProfile: HospitalProfileResponse) => void;
}

const inputClass =
  "h-11 rounded-xl border-slate-200 bg-white text-sm text-slate-900 shadow-none transition placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-red-500 focus-visible:ring-4 focus-visible:ring-red-100";

const errorInputClass =
  "border-red-400 bg-red-50/40 focus-visible:border-red-500 focus-visible:ring-red-100";

const EditHospitalProfileModal = ({
  open,
  profile,
  onClose,
  onProfileUpdated,
}: EditHospitalProfileModalProps) => {
  const {
    register,
    handleSubmit,
    reset,

    formState: { errors, isSubmitting, isDirty },
  } = useForm<HospitalProfileUpdateRequest>({
    mode: "onTouched",
    reValidateMode: "onChange",

    defaultValues: {
      hospitalName: profile.hospitalName,

      representativeStaffName: profile.representativeStaffName,

      phone: profile.phone,

      address: {
        street: profile.address.street,

        township: profile.address.township,

        city: profile.address.city,
      },
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      hospitalName: profile.hospitalName,

      representativeStaffName: profile.representativeStaffName,

      phone: profile.phone,

      address: {
        street: profile.address.street,

        township: profile.address.township,

        city: profile.address.city,
      },
    });
  }, [open, profile, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const onSubmit: SubmitHandler<HospitalProfileUpdateRequest> = async (
    data,
  ) => {
    const updatedProfile: HospitalProfileResponse = {
      ...profile,

      hospitalName: data.hospitalName.trim(),

      representativeStaffName: data.representativeStaffName.trim(),

      phone: data.phone.trim(),

      address: {
        street: data.address.street.trim(),

        township: data.address.township.trim(),

        city: data.address.city.trim(),
      },
    };

    onProfileUpdated(updatedProfile);
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-hospital-profile-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close edit profile modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <section className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/70 bg-white shadow-[0_30px_100px_-30px_rgba(15,23,42,0.8)]">
        <header className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 py-5 backdrop-blur-xl sm:px-7">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
              <Building2 className="h-5 w-5" />
            </span>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-red-600">
                Hospital profile
              </p>

              <h2
                id="edit-hospital-profile-title"
                className="mt-1 text-xl font-black tracking-[-0.04em] text-slate-950"
              >
                Edit Profile Information
              </h2>

              <p className="mt-1 text-[10px] font-medium leading-4 text-slate-500">
                Update your hospital contact and organization details.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="p-5 sm:p-7"
        >
          {/* Read-only information */}
          <div className="grid gap-3 sm:grid-cols-2">
            <ReadOnlyField
              label="Hospital license code"
              value={profile.hospitalLicenseCode}
              icon={<FileBadge2 className="h-4 w-4" />}
            />

            <ReadOnlyField
              label="Login email"
              value={profile.email}
              icon={<Mail className="h-4 w-4" />}
            />
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-3">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

            <p className="text-[10px] font-semibold leading-4 text-amber-800">
              Hospital license code and login email cannot be changed from this
              profile form.
            </p>
          </div>

          {/* Organization fields */}
          <div className="mt-6">
            <p className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
              Organization details
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField
                label="Hospital name"
                error={errors.hospitalName?.message}
              >
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    type="text"
                    placeholder="Central Medical Center"
                    className={`${inputClass} pl-10 ${
                      errors.hospitalName ? errorInputClass : ""
                    }`}
                    {...register("hospitalName", {
                      required: "Hospital name is required.",

                      minLength: {
                        value: 3,
                        message:
                          "Hospital name must contain at least 3 characters.",
                      },

                      maxLength: {
                        value: 150,
                        message: "Hospital name cannot exceed 150 characters.",
                      },
                    })}
                  />
                </div>
              </FormField>

              <FormField
                label="Representative staff name"
                error={errors.representativeStaffName?.message}
              >
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    type="text"
                    placeholder="Dr. Aung Min"
                    className={`${inputClass} pl-10 ${
                      errors.representativeStaffName ? errorInputClass : ""
                    }`}
                    {...register("representativeStaffName", {
                      required: "Representative staff name is required.",

                      minLength: {
                        value: 2,
                        message:
                          "Staff name must contain at least 2 characters.",
                      },

                      maxLength: {
                        value: 150,
                        message: "Staff name cannot exceed 150 characters.",
                      },
                    })}
                  />
                </div>
              </FormField>

              <FormField label="Phone number" error={errors.phone?.message}>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    type="tel"
                    inputMode="tel"
                    placeholder="09123456789"
                    className={`${inputClass} pl-10 ${
                      errors.phone ? errorInputClass : ""
                    }`}
                    {...register("phone", {
                      required: "Phone number is required.",

                      pattern: {
                        value: /^09\d{7,9}$/,

                        message: "Enter a valid Myanmar phone number.",
                      },
                    })}
                  />
                </div>
              </FormField>
            </div>
          </div>

          {/* Address fields */}
          <div className="mt-7">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-600" />

              <p className="text-[9px] font-black uppercase tracking-[0.17em] text-slate-400">
                Hospital address
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField label="Street" error={errors.address?.street?.message}>
                <Input
                  type="text"
                  placeholder="No. 24, Pyay Road"
                  className={`${inputClass} ${
                    errors.address?.street ? errorInputClass : ""
                  }`}
                  {...register("address.street", {
                    required: "Street address is required.",

                    maxLength: {
                      value: 200,
                      message: "Street address is too long.",
                    },
                  })}
                />
              </FormField>

              <FormField
                label="Township"
                error={errors.address?.township?.message}
              >
                <Input
                  type="text"
                  placeholder="Kamayut"
                  className={`${inputClass} ${
                    errors.address?.township ? errorInputClass : ""
                  }`}
                  {...register("address.township", {
                    required: "Township is required.",

                    maxLength: {
                      value: 100,
                      message: "Township name is too long.",
                    },
                  })}
                />
              </FormField>

              <FormField label="City" error={errors.address?.city?.message}>
                <Input
                  type="text"
                  placeholder="Yangon"
                  className={`${inputClass} ${
                    errors.address?.city ? errorInputClass : ""
                  }`}
                  {...register("address.city", {
                    required: "City is required.",

                    maxLength: {
                      value: 100,
                      message: "City name is too long.",
                    },
                  })}
                />
              </FormField>
            </div>
          </div>

          <footer className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 rounded-xl border-slate-200 px-5 text-xs font-bold text-slate-600"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="h-11 rounded-xl bg-red-600 px-5 text-xs font-black text-white shadow-md shadow-red-600/20 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
};

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

const FormField = ({ label, error, children }: FormFieldProps) => {
  return (
    <div>
      <Label className="mb-1.5 block text-[10px] font-bold text-slate-700">
        {label}
      </Label>

      {children}

      <p
        className={`min-h-4 pt-1 text-[9px] font-semibold ${
          error ? "text-red-600" : "text-transparent"
        }`}
      >
        {error || "."}
      </p>
    </div>
  );
};

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const ReadOnlyField = ({ label, value, icon }: ReadOnlyFieldProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
          {icon}
        </span>

        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-[11px] font-bold text-slate-700">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditHospitalProfileModal;
