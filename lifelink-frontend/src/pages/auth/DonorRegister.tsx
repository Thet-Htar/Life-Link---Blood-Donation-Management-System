import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Droplet,
  Eye,
  EyeOff,
  HeartPulse,
  History,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Scale,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useForm, type FieldPath, type SubmitHandler } from "react-hook-form";

import {
  BLOOD_TYPES,
  type DonationHistoryType,
  type Gender,
  type RegisterRequest,
} from "@/types/auth/Auth";
import authService from "@/services/authService";

type DonorRegisterFormData = RegisterRequest & {
  acceptTerms: boolean;
};

type FormStep = 1 | 2 | 3;

const GENDER_OPTIONS: {
  label: string;
  value: Gender;
}[] = [
  {
    label: "Male",
    value: "MALE",
  },
  {
    label: "Female",
    value: "FEMALE",
  },
  {
    label: "Other",
    value: "OTHER",
  },
  {
    label: "Prefer not to say",
    value: "PREFER_NOT_TO_SAY",
  },
];

const DONATION_HISTORY_OPTIONS: {
  title: string;
  description: string;
  value: DonationHistoryType;
}[] = [
  {
    title: "I have never donated",
    description: "No previous blood donation record.",
    value: "NEVER_DONATED",
  },
  {
    title: "I remember the date",
    description: "Enter the exact date of your most recent donation.",
    value: "EXACT_DATE",
  },
  {
    title: "More than 4 months ago",
    description: "I donated before but do not remember the exact date.",
    value: "OVER_FOUR_MONTHS_NO_DATE",
  },
];

const DONOR_HERO_IMAGE =
  "https://images.pexels.com/photos/18523230/pexels-photo-18523230.jpeg?auto=compress&cs=tinysrgb&w=1600";
const STEP_ONE_FIELDS: FieldPath<DonorRegisterFormData>[] = [
  "fullName",
  "email",
  "phone",
  "password",
  "dateOfBirth",
  "weightKg",
  "gender",
];

const STEP_TWO_FIELDS: FieldPath<DonorRegisterFormData>[] = [
  "bloodType",
  "donationHistoryType",
];

const STEP_THREE_FIELDS: FieldPath<DonorRegisterFormData>[] = [
  "address.township",
  "address.city",
  "acceptTerms",
];

const inputClass =
  "h-11 rounded-lg border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-none transition placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-red-500 focus-visible:ring-4 focus-visible:ring-red-100";

const errorInputClass =
  "border-red-400 bg-red-50/40 focus-visible:border-red-500 focus-visible:ring-red-100";

const formatDateInput = (date: Date): string => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
};

const DonorRegister = () => {
  const [step, setStep] = useState<FormStep>(1);

  const [showPassword, setShowPassword] = useState(false);

  const [registrationSuccessful, setRegistrationSuccessful] = useState(false);

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<DonorRegisterFormData>({
    mode: "onTouched",
    reValidateMode: "onChange",

    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",

      dateOfBirth: "",
      lastDonationDate: null,

      address: {
        township: "",
        city: "",
        street: "",
      },

      acceptTerms: false,
    },
  });

  const selectedBloodType = watch("bloodType");

  const selectedDonationHistory = watch("donationHistoryType");

  const today = new Date();

  //to check the user age between 18 - 56
  const maximumBirthDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );

  const minimumBirthDate = new Date(
    today.getFullYear() - 56,
    today.getMonth(),
    today.getDate() + 1,
  );

  const goNext = async (): Promise<void> => {
    setServerError(null);

    if (step === 1) {
      const isValid = await trigger(STEP_ONE_FIELDS, {
        shouldFocus: true,
      });

      if (isValid) {
        setStep(2);
      }

      return;
    }

    if (step === 2) {
      const fields: FieldPath<DonorRegisterFormData>[] = [...STEP_TWO_FIELDS];

      if (selectedDonationHistory === "EXACT_DATE") {
        fields.push("lastDonationDate");
      }

      const isValid = await trigger(fields, {
        shouldFocus: true,
      });

      if (isValid) {
        setStep(3);
      }
    }
  };

  const goBack = (): void => {
    setServerError(null);

    setStep((currentStep) => {
      if (currentStep === 3) {
        return 2;
      }

      return 1;
    });
  };

  const selectDonationHistory = (value: DonationHistoryType): void => {
    setValue("donationHistoryType", value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    if (value !== "EXACT_DATE") {
      setValue("lastDonationDate", null, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const onSubmit: SubmitHandler<DonorRegisterFormData> = async (formData) => {
    setServerError(null);

    const { acceptTerms: _acceptTerms, ...donorData } = formData;

    const requestData: RegisterRequest = {
      ...donorData,

      fullName: donorData.fullName.trim(),

      email: donorData.email.trim().toLowerCase(),

      phone: donorData.phone.trim(),

      weightKg: Number(donorData.weightKg),

      lastDonationDate:
        donorData.donationHistoryType === "EXACT_DATE"
          ? donorData.lastDonationDate
          : null,

      address: {
        township: donorData.address.township.trim(),

        city: donorData.address.city.trim(),

        street: donorData.address.street?.trim() || undefined,
      },
    };

    try {
      await authService.registerDonor(requestData);

      setServerError("");
      setRegistrationSuccessful(true);
    } catch (error) {
      console.error("Donor registration failed:", error);

      setServerError(
        "Account registration failed. The email or phone number may already be registered.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-950 selection:bg-red-200 lg:grid lg:grid-cols-[54%_46%]">
      {/* Left visual section */}
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#8f101d] lg:block">
        <div className="absolute inset-0 grid grid-rows-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="relative bg-cover bg-center"
              style={{
                backgroundImage: `url("${DONOR_HERO_IMAGE}")`,

                backgroundPosition:
                  item === 0
                    ? "center 22%"
                    : item === 1
                      ? "center 50%"
                      : "center 78%",
              }}
            >
              <div
                className={`absolute inset-0 ${
                  item === 0
                    ? "bg-white/8"
                    : item === 1
                      ? "bg-gradient-to-b from-black/5 via-red-800/15 to-red-900/45"
                      : "bg-red-900/58"
                }`}
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/10" />

        <div className="relative z-10 flex min-h-screen flex-col p-8 xl:p-10">
          <a
            href="/"
            className="inline-flex w-fit items-center gap-2 text-sm font-black tracking-tight text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-lg">
              <Droplet className="h-4 w-4 fill-current" />
            </span>
            LifeLink
          </a>

          <div className="mt-auto max-w-lg pb-8">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white backdrop-blur-md">
              <HeartPulse className="h-3.5 w-3.5" />
              Give blood. Give hope.
            </div>

            <h1 className="max-w-md text-4xl font-black leading-[1.05] tracking-[-0.05em] text-white xl:text-5xl">
              Every drop tells a story of survival.
            </h1>

            <p className="mt-5 max-w-md text-sm font-medium leading-6 text-white/82">
              Join LifeLink&apos;s donor network and receive nearby emergency
              requests when your blood type is needed most.
            </p>

            <div className="mt-8 grid max-w-md grid-cols-3 gap-5 border-y border-white/20 py-5 text-white">
              <div>
                <p className="text-2xl font-black">12K+</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-white/65">
                  Active donors
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">50K+</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-white/65">
                  Lives supported
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">24/7</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-white/65">
                  Emergency access
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] font-semibold text-white/75">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure health-data protection
            </span>

            <span>© 2026 LifeLink</span>
          </div>
        </div>
      </aside>

      {/* Form section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-8 lg:px-10 xl:px-16">
        <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-red-50 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-36 -left-24 h-80 w-80 rounded-full bg-slate-100 blur-3xl" />

        <div className="relative z-10 w-full max-w-[500px]">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm font-black tracking-tight"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white">
                <Droplet className="h-4 w-4 fill-current" />
              </span>
              Life
              <span className="-ml-2 text-red-600">Link</span>
            </a>

            <a
              href="/"
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </a>
          </div>

          <header>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-600">
              Donor registration
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] text-slate-950">
              Create your account
            </h2>

            <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
              Register your personal, health, donation, and location details.
            </p>
          </header>

          {/* Step indicator */}
          <div className="mt-6 grid grid-cols-3 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex h-10 items-center justify-center gap-1.5 rounded-md text-[9px] font-extrabold transition ${
                step === 1
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <UserRound className="h-3.5 w-3.5" />
              Personal
            </button>

            <button
              type="button"
              disabled={step < 2}
              onClick={() => setStep(2)}
              className={`flex h-10 items-center justify-center gap-1.5 rounded-md text-[9px] font-extrabold transition disabled:cursor-not-allowed ${
                step === 2
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <Droplet className="h-3.5 w-3.5" />
              Donation
            </button>

            <button
              type="button"
              disabled={step < 3}
              onClick={() => setStep(3)}
              className={`flex h-10 items-center justify-center gap-1.5 rounded-md text-[9px] font-extrabold transition disabled:cursor-not-allowed ${
                step === 3
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              Address
            </button>
          </div>

          <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-1.5 block text-[11px] font-bold text-slate-700"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="fullName"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      aria-invalid={Boolean(errors.fullName)}
                      className={`${inputClass} pl-10 ${
                        errors.fullName ? errorInputClass : ""
                      }`}
                      {...register("fullName", {
                        required: "Full name is required.",

                        minLength: {
                          value: 2,
                          message:
                            "Full name must contain at least 2 characters.",
                        },

                        maxLength: {
                          value: 100,
                          message: "Full name must not exceed 100 characters.",
                        },
                      })}
                    />
                  </div>

                  <p className="min-h-4 pt-1 text-[10px] font-semibold text-red-600">
                    {errors.fullName?.message}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-[11px] font-bold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      aria-invalid={Boolean(errors.email)}
                      className={`${inputClass} pl-10 ${
                        errors.email ? errorInputClass : ""
                      }`}
                      {...register("email", {
                        required: "Email address is required.",

                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email address.",
                        },
                      })}
                    />
                  </div>

                  <p className="min-h-4 pt-1 text-[10px] font-semibold text-red-600">
                    {errors.email?.message}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1.5 block text-[11px] font-bold text-slate-700"
                    >
                      Phone number
                    </label>

                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        placeholder="09XXXXXXXXX"
                        aria-invalid={Boolean(errors.phone)}
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

                    <p className="min-h-4 pt-1 text-[10px] font-semibold text-red-600">
                      {errors.phone?.message}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-[11px] font-bold text-slate-700"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        aria-invalid={Boolean(errors.password)}
                        className={`${inputClass} pl-10 pr-10 ${
                          errors.password ? errorInputClass : ""
                        }`}
                        {...register("password", {
                          required: "Password is required.",

                          minLength: {
                            value: 8,
                            message:
                              "Password must contain at least 8 characters.",
                          },

                          maxLength: {
                            value: 64,
                            message: "Password must not exceed 64 characters.",
                          },

                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,

                            message:
                              "Use uppercase, lowercase, and at least one number.",
                          },
                        })}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <p className="min-h-4 pt-1 text-[10px] font-semibold text-red-600">
                      {errors.password?.message}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="dateOfBirth"
                      className="mb-1.5 block text-[11px] font-bold text-slate-700"
                    >
                      Date of birth
                    </label>

                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="dateOfBirth"
                        type="date"
                        min={formatDateInput(minimumBirthDate)}
                        max={formatDateInput(maximumBirthDate)}
                        aria-invalid={Boolean(errors.dateOfBirth)}
                        className={`${inputClass} pl-10 ${
                          errors.dateOfBirth ? errorInputClass : ""
                        }`}
                        {...register("dateOfBirth", {
                          required: "Date of birth is required.",

                          validate: (value) => {
                            const age = getAge(value);

                            if (age < 18) {
                              return "You must be at least 18 years old.";
                            }

                            if (age > 55) {
                              return "Donors must be 55 years old or younger.";
                            }

                            return true;
                          },
                        })}
                      />
                    </div>

                    <p className="min-h-4 pt-1 text-[10px] font-semibold text-red-600">
                      {errors.dateOfBirth?.message}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="weightKg"
                      className="mb-1.5 block text-[11px] font-bold text-slate-700"
                    >
                      Weight in kilograms
                    </label>

                    <div className="relative">
                      <Scale className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="weightKg"
                        type="number"
                        inputMode="decimal"
                        min="54.5"
                        max="300"
                        step="0.1"
                        placeholder="Minimum 54.5 kg"
                        aria-invalid={Boolean(errors.weightKg)}
                        className={`${inputClass} pl-10 ${
                          errors.weightKg ? errorInputClass : ""
                        }`}
                        {...register("weightKg", {
                          required: "Weight is required.",

                          valueAsNumber: true,

                          min: {
                            value: 54.5,
                            message:
                              "Minimum weight is 54.5 kg, approximately 120 lb.",
                          },

                          max: {
                            value: 300,
                            message: "Enter a valid weight.",
                          },
                        })}
                      />
                    </div>

                    <p className="min-h-4 pt-1 text-[10px] font-semibold text-red-600">
                      {errors.weightKg?.message}
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="mb-1.5 block text-[11px] font-bold text-slate-700"
                  >
                    Gender
                  </label>

                  <select
                    id="gender"
                    aria-invalid={Boolean(errors.gender)}
                    className={`${inputClass} w-full ${
                      errors.gender ? errorInputClass : ""
                    }`}
                    {...register("gender", {
                      required: "Please select your gender.",
                    })}
                  >
                    <option value="">Select gender</option>

                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <p className="min-h-4 pt-1 text-[10px] font-semibold text-red-600">
                    {errors.gender?.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={goNext}
                  className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-extrabold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20"
                >
                  Continue
                  <span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                      <Droplet className="h-3.5 w-3.5 fill-red-600 text-red-600" />
                      Blood type
                    </label>

                    <span className="text-[9px] font-semibold text-slate-400">
                      Select one
                    </span>
                  </div>

                  <input
                    type="hidden"
                    {...register("bloodType", {
                      required: "Please select your blood type.",
                    })}
                  />

                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_TYPES.map((type) => {
                      const isSelected = selectedBloodType === type.value;

                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setValue("bloodType", type.value, {
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true,
                            })
                          }
                          className={`h-11 rounded-lg border text-sm font-black transition ${
                            isSelected
                              ? "border-red-600 bg-red-50 text-red-600 ring-4 ring-red-100"
                              : "border-slate-200 bg-white text-slate-700 hover:border-red-300"
                          }`}
                        >
                          {type.label}
                        </button>
                      );
                    })}
                  </div>

                  <p className="min-h-4 pt-1 text-[10px] font-semibold text-red-600">
                    {errors.bloodType?.message}
                  </p>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                    <History className="h-3.5 w-3.5 text-red-600" />
                    Previous donation history
                  </label>

                  <input
                    type="hidden"
                    {...register("donationHistoryType", {
                      required: "Please select your donation history.",
                    })}
                  />

                  <div className="space-y-2">
                    {DONATION_HISTORY_OPTIONS.map((option) => {
                      const isSelected =
                        selectedDonationHistory === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => selectDonationHistory(option.value)}
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            isSelected
                              ? "border-red-600 bg-red-50 ring-4 ring-red-100"
                              : "border-slate-200 bg-white hover:border-red-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                isSelected
                                  ? "border-red-600 bg-red-600 text-white"
                                  : "border-slate-300"
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </span>

                            <span>
                              <span className="block text-xs font-extrabold text-slate-800">
                                {option.title}
                              </span>

                              <span className="mt-0.5 block text-[10px] font-medium leading-4 text-slate-500">
                                {option.description}
                              </span>
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <p className="min-h-4 pt-1 text-[10px] font-semibold text-red-600">
                    {errors.donationHistoryType?.message}
                  </p>
                </div>

                {selectedDonationHistory === "EXACT_DATE" && (
                  <div>
                    <label
                      htmlFor="lastDonationDate"
                      className="mb-1.5 block text-[11px] font-bold text-slate-700"
                    >
                      Last donation date
                    </label>

                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="lastDonationDate"
                        type="date"
                        max={formatDateInput(today)}
                        aria-invalid={Boolean(errors.lastDonationDate)}
                        className={`${inputClass} pl-10 ${
                          errors.lastDonationDate ? errorInputClass : ""
                        }`}
                        {...register("lastDonationDate", {
                          required: "Last donation date is required.",

                          validate: (value) => {
                            if (!value) {
                              return "Last donation date is required.";
                            }

                            const donationDate = new Date(`${value}T00:00:00`);

                            if (donationDate > today) {
                              return "Last donation date cannot be in the future.";
                            }

                            return true;
                          },
                        })}
                      />
                    </div>

                    <p className="min-h-4 pt-1 text-[10px] font-semibold text-red-600">
                      {errors.lastDonationDate?.message}
                    </p>

                    <p className="text-[10px] leading-4 text-slate-500">
                      Your eligibility will be calculated from this date.
                    </p>
                  </div>
                )}

                {selectedDonationHistory === "OVER_FOUR_MONTHS_NO_DATE" && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[10px] font-medium leading-4 text-emerald-800">
                    The last donation date will be stored as empty. You are
                    confirming that your last donation was more than four months
                    ago.
                  </div>
                )}

                {selectedDonationHistory === "NEVER_DONATED" && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-[10px] font-medium leading-4 text-blue-800">
                    Your last donation date will be stored as empty because you
                    have never donated before.
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={goBack}
                    className="h-12 rounded-lg border-slate-200 px-4"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-extrabold text-white shadow-lg 
                    shadow-red-600/20 transition-all hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="township"
                      className="mb-1.5 block text-[11px] font-bold text-slate-700"
                    >
                      Township
                    </label>

                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="township"
                        placeholder="e.g. Hlaing"
                        aria-invalid={Boolean(errors.address?.township)}
                        className={`${inputClass} pl-10 ${
                          errors.address?.township ? errorInputClass : ""
                        }`}
                        {...register("address.township", {
                          required: "Township is required.",

                          minLength: {
                            value: 2,
                            message: "Enter a valid township.",
                          },
                        })}
                      />
                    </div>

                    <p className="min-h-4 pt-1 text-[10px] font-semibold text-red-600">
                      {errors.address?.township?.message}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="mb-1.5 block text-[11px] font-bold text-slate-700"
                    >
                      City
                    </label>

                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        id="city"
                        placeholder="e.g. Yangon"
                        aria-invalid={Boolean(errors.address?.city)}
                        className={`${inputClass} pl-10 ${
                          errors.address?.city ? errorInputClass : ""
                        }`}
                        {...register("address.city", {
                          required: "City is required.",

                          minLength: {
                            value: 2,
                            message: "Enter a valid city.",
                          },
                        })}
                      />
                    </div>

                    <p className="min-h-4 pt-1 text-[10px] font-semibold text-red-600">
                      {errors.address?.city?.message}
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="street"
                    className="mb-1.5 block text-[11px] font-bold text-slate-700"
                  >
                    Street address
                    <span className="ml-1 font-medium text-slate-400">
                      Optional
                    </span>
                  </label>

                  <input
                    id="street"
                    placeholder="Street name or house number"
                    className={inputClass}
                    {...register("address.street", {
                      maxLength: {
                        value: 255,
                        message:
                          "Street address must not exceed 255 characters.",
                      },
                    })}
                  />

                  <p className="min-h-4 pt-1 text-[10px] font-semibold text-red-600">
                    {errors.address?.street?.message}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-red-600"
                      {...register("acceptTerms", {
                        required:
                          "You must accept the Terms of Service and Privacy Policy.",
                      })}
                    />

                    <span className="text-[10px] font-medium leading-4 text-slate-500">
                      I agree to LifeLink&apos;s{" "}
                      <a
                        href="/terms"
                        className="font-bold text-red-600 hover:underline"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        className="font-bold text-red-600 hover:underline"
                      >
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>

                  <p className="min-h-4 pt-1 text-[10px] font-semibold text-red-600">
                    {errors.acceptTerms?.message}
                  </p>
                </div>

                {serverError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                    {serverError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={isSubmitting}
                    className="h-12 rounded-lg border-slate-200 px-4"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={async (event) => {
                      const isValid = await trigger(STEP_THREE_FIELDS, {
                        shouldFocus: true,
                      });

                      if (!isValid) {
                        event.preventDefault();
                      }
                    }}
                    className="group mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-extrabold text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200
                     disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create donor account
                        <Check className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-[9px] font-semibold text-slate-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-red-600" />
                    Secure data
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-[9px] font-semibold text-slate-500">
                    <Clock3 className="h-3.5 w-3.5 text-red-600" />
                    24/7 alerts
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-[9px] font-semibold text-slate-500">
                    <UsersRound className="h-3.5 w-3.5 text-red-600" />
                    Donor network
                  </div>
                </div>
              </div>
            )}
          </form>

          <p className="mt-8 text-center text-[9px] font-semibold text-slate-400">
            © 2026 LifeLink Healthcare. All rights reserved.
          </p>
        </div>
      </section>
      {registrationSuccessful && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="registration-success-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-8 w-8"
              >
                <path
                  d="m5 12.5 4.2 4.2L19 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2
              id="registration-success-title"
              className="mt-5 text-2xl font-black text-slate-950"
            >
              Registration Successful
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Your donor account has been created. Please log in again using
              your registered email and password.
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/login";
              }}
              className="mt-7 h-12 w-full rounded-xl bg-red-600 text-sm font-black text-white transition hover:bg-red-700"
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default DonorRegister;
