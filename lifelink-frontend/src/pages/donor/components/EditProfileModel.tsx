import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { useForm, type SubmitHandler } from "react-hook-form";
import { updateDonorProfile } from "@/services/donorServices";

interface DonorAddress {
  city: string;
  township: string;
  street?: string | null;
}

interface DonorProfile {
  fullName: string;
  email: string;
  phone: string;
  bloodType: string;

  gender?: string | null;
  weightKg?: number | null;
  lastDonationDate?: string | null;
  donationHistoryType?: string | null;

  donationCount?: number;
  eligible?: boolean;

  address: DonorAddress | null;
}

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: DonorProfile;

  onProfileUpdated: (updatedProfile: DonorProfile) => void;
}

interface EditProfileFormData {
  fullName: string;
  phone: string;
  weightKg: string;

  city: string;
  township: string;
  street: string;
}

export interface DonorProfileUpdateRequest {
  fullName: string;
  phone: string;
  weightKg: number;

  address: {
    city: string;
    township: string;
    street: string | null;
  };
}

interface BackendErrorResponse {
  errorMessage?: string;
  validationErrors?: Record<string, string>;
}

const createFormValues = (profile: DonorProfile): EditProfileFormData => ({
  fullName: profile.fullName ?? "",
  phone: profile.phone ?? "",

  weightKg:
    profile.weightKg !== null && profile.weightKg !== undefined
      ? String(profile.weightKg)
      : "",

  city: profile.address?.city ?? "",
  township: profile.address?.township ?? "",
  street: profile.address?.street ?? "",
});

const getApiErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return "Please try again.";
  }

  const responseData = error.response?.data as BackendErrorResponse | undefined;

  if (responseData?.validationErrors) {
    const firstValidationError = Object.values(
      responseData.validationErrors,
    )[0];

    if (firstValidationError) {
      return firstValidationError;
    }
  }

  if (responseData?.errorMessage) {
    return responseData.errorMessage;
  }

  if (error.response?.status === 409) {
    return "This phone number is already in use.";
  }

  if (error.response?.status === 400) {
    return "Update failed.Please check your staus";
  }

  return "Please try again.";
};

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100";

const errorInputClass =
  "border-red-400 bg-red-50/60 focus:border-red-500 focus:ring-red-100";

const EditProfileModal = ({
  open,
  onClose,
  profile,
  onProfileUpdated,
}: EditProfileModalProps) => {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,

    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormData>({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: createFormValues(profile),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(createFormValues(profile));
    setApiError(null);
  }, [open, profile, reset]);

  if (!open) {
    return null;
  }

  const closeModal = (): void => {
    reset(createFormValues(profile));
    setApiError(null);
    onClose();
  };

  const onSubmit: SubmitHandler<EditProfileFormData> = async (data) => {
    setApiError(null);

    const profileUpdateRequest: DonorProfileUpdateRequest = {
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      weightKg: Number(data.weightKg),

      address: {
        city: data.city.trim(),
        township: data.township.trim(),
        street: data.street.trim() || null,
      },
    };

    console.log("Profile update payload:", profileUpdateRequest);

    try {
      const responseData = await updateDonorProfile(profileUpdateRequest);

      const updatedProfile: DonorProfile = {
        ...profile,
        ...responseData,

        fullName: responseData?.fullName ?? profileUpdateRequest.fullName,

        phone: responseData?.phone ?? profileUpdateRequest.phone,

        weightKg: responseData?.weightKg ?? profileUpdateRequest.weightKg,

        address: responseData?.address ?? profileUpdateRequest.address,
      };

      onProfileUpdated(updatedProfile);
      onClose();
    } catch (error) {
      console.error("Profile update failed:", error);

      setApiError(getApiErrorMessage(error));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_30px_100px_-30px_rgba(15,23,42,0.65)]">
        <header className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="edit-profile-title"
              className="text-xl font-black tracking-[-0.03em] text-slate-950"
            >
              Edit Profile
            </h2>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Update your name, phone, weight, and address
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close edit profile"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            {apiError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-700"
              >
                {apiError}
              </div>
            )}

            <div className="space-y-4">
              <FieldGroup label="Full Name" error={errors.fullName?.message}>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className={`${inputClass} ${
                    errors.fullName ? errorInputClass : ""
                  }`}
                  {...register("fullName", {
                    required: "Full name is required.",

                    minLength: {
                      value: 2,
                      message: "Full name must contain at least 2 characters.",
                    },

                    maxLength: {
                      value: 100,
                      message: "Full name must not exceed 100 characters.",
                    },
                  })}
                />
              </FieldGroup>

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldGroup label="Phone Number" error={errors.phone?.message}>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="09XXXXXXXXX"
                    className={`${inputClass} ${
                      errors.phone ? errorInputClass : ""
                    }`}
                    {...register("phone", {
                      required: "Phone number is required.",

                      pattern: {
                        value: /^09\d{7,9}$/,
                        message:
                          "Enter a valid Myanmar phone number beginning with 09.",
                      },
                    })}
                  />
                </FieldGroup>

                <FieldGroup
                  label="Weight (kg)"
                  error={errors.weightKg?.message}
                >
                  <input
                    type="number"
                    inputMode="decimal"
                    min="1"
                    max="300"
                    step="0.1"
                    placeholder="e.g. 64"
                    className={`${inputClass} ${
                      errors.weightKg ? errorInputClass : ""
                    }`}
                    {...register("weightKg", {
                      required: "Weight is required.",

                      validate: (value) => {
                        const weight = Number(value);

                        if (Number.isNaN(weight) || weight <= 0) {
                          return "Enter a valid weight.";
                        }

                        if (weight > 300) {
                          return "Weight must not exceed 300 kg.";
                        }

                        return true;
                      },
                    })}
                  />
                </FieldGroup>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.16em] text-red-600">
                  Address information
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldGroup label="City" error={errors.city?.message}>
                    <input
                      type="text"
                      autoComplete="address-level2"
                      placeholder="e.g. Yangon"
                      className={`${inputClass} ${
                        errors.city ? errorInputClass : ""
                      }`}
                      {...register("city", {
                        required: "City is required.",

                        minLength: {
                          value: 2,
                          message: "Enter a valid city.",
                        },

                        maxLength: {
                          value: 100,
                          message: "City must not exceed 100 characters.",
                        },
                      })}
                    />
                  </FieldGroup>

                  <FieldGroup label="Township" error={errors.township?.message}>
                    <input
                      type="text"
                      autoComplete="address-level3"
                      placeholder="e.g. Hlaing"
                      className={`${inputClass} ${
                        errors.township ? errorInputClass : ""
                      }`}
                      {...register("township", {
                        required: "Township is required.",

                        minLength: {
                          value: 2,
                          message: "Enter a valid township.",
                        },

                        maxLength: {
                          value: 100,
                          message: "Township must not exceed 100 characters.",
                        },
                      })}
                    />
                  </FieldGroup>
                </div>

                <FieldGroup
                  label="Street Address"
                  error={errors.street?.message}
                >
                  <input
                    type="text"
                    autoComplete="street-address"
                    placeholder="e.g. Avenue St."
                    className={`${inputClass} ${
                      errors.street ? errorInputClass : ""
                    }`}
                    {...register("street", {
                      maxLength: {
                        value: 255,
                        message:
                          "Street address must not exceed 255 characters.",
                      },
                    })}
                  />
                </FieldGroup>
              </div>
            </div>
          </div>

          <footer className="border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="h-12 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 flex-1 items-center justify-center rounded-lg bg-red-600 text-sm font-extrabold text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

const FieldGroup = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-extrabold text-slate-600">
        {label}
      </label>

      {children}

      <p className="min-h-4 pt-1 text-[10px] font-semibold text-red-600">
        {error}
      </p>
    </div>
  );
};

export default EditProfileModal;
