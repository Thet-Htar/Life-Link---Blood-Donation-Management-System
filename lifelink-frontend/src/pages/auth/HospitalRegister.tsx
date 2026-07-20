import { useState, type ReactNode } from "react";
import { useForm, type FieldPath, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  CircleCheck,
  Eye,
  EyeOff,
  HeartPulse,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type { HospitalRegisterRequest } from "@/types/auth/Auth";
import authService from "@/services/authService";

type HospitalRegisterFormData = HospitalRegisterRequest & {
  confirmPassword: string;
};

type RegistrationStep = 1 | 2;

const HOSPITAL_IMAGE_URL =
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=85";

const EMAIL_PATTERN =
  /^(?!.*\.\.)(?!\.)[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

const STEP_FIELDS: Record<
  RegistrationStep,
  FieldPath<HospitalRegisterFormData>[]
> = {
  1: [
    "hospitalName",
    "hospitalLicenseCode",
    "email",
    "phone",
    "representativeStaffName",
  ],
  2: [
    "password",
    "confirmPassword",
    "address.township",
    "address.city",
    "address.street",
  ],
};

const fieldClass =
  "h-11 rounded-md border-[#ecd3d7] bg-white pl-10 text-sm text-slate-900 shadow-none transition placeholder:text-slate-400 hover:border-[#dcaeb5] focus-visible:border-[#c60b26] focus-visible:ring-2 focus-visible:ring-[#c60b26]/10";

const errorFieldClass =
  "border-red-500 bg-red-50/40 focus-visible:border-red-500 focus-visible:ring-red-100";

const validateEmail = (rawValue: string): true | string => {
  const value = rawValue.trim();

  if (value.length > 254) {
    return "Email must not exceed 254 characters.";
  }

  return EMAIL_PATTERN.test(value) || "Enter a valid hospital email address.";
};

const HospitalRegister = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<RegistrationStep>(1);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [registrationSuccessful, setRegistrationSuccessful] = useState(false);

  const [registeredEmail, setRegisteredEmail] = useState("");

  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,

    formState: { errors, isSubmitting, touchedFields },
  } = useForm<HospitalRegisterFormData>({
    mode: "onTouched",
    reValidateMode: "onChange",

    defaultValues: {
      hospitalName: "",
      email: "",
      phone: "",
      password: "",
      hospitalLicenseCode: "",
      representativeStaffName: "",
      confirmPassword: "",

      address: {
        township: "",
        city: "",
        street: "",
      },
    },
  });

  const password = watch("password");

  const email = watch("email");

  const emailIsValid = Boolean(
    touchedFields.email &&
    email &&
    !errors.email &&
    validateEmail(email) === true,
  );

  const goNext = async (): Promise<void> => {
    setSubmitError(null);

    const isValid = await trigger(STEP_FIELDS[1], {
      shouldFocus: true,
    });

    if (isValid) {
      setStep(2);
    }
  };

  const goBack = (): void => {
    setSubmitError(null);
    setStep(1);
  };

  const onSubmit: SubmitHandler<HospitalRegisterFormData> = async (
    formData,
  ) => {
    setSubmitError(null);

    const { confirmPassword: _confirmPassword, ...requestData } = formData;

    const normalizedRequestData: HospitalRegisterRequest = {
      ...requestData,

      hospitalName: requestData.hospitalName.trim(),

      hospitalLicenseCode: requestData.hospitalLicenseCode.trim(),

      email: requestData.email.trim().toLowerCase(),

      phone: requestData.phone.trim(),

      representativeStaffName: requestData.representativeStaffName.trim(),

      address: {
        city: requestData.address.city.trim(),

        township: requestData.address.township.trim(),

        street: requestData.address.street?.trim() || "",
      },
    };

    try {
      await authService.registerHospital(normalizedRequestData);

      setRegisteredEmail(normalizedRequestData.email);

      setRegistrationSuccessful(true);
    } catch (error) {
      console.error("Hospital registration failed:", error);

      setSubmitError(
        "Hospital registration failed. Please check your information and try again.",
      );
    }
  };

  const handleBackHome = (): void => {
    navigate("/", {
      replace: true,
    });
  };

  return (
    <>
      <main className="relative min-h-[100dvh] overflow-hidden bg-[#f7f8fb] px-4 py-8 text-slate-900 selection:bg-red-100 sm:px-6 lg:px-8 lg:py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-32 h-72 w-72 rounded-full bg-[#f3dfe2]/80 blur-2xl" />

          <div className="absolute -bottom-32 left-[18%] h-64 w-64 rounded-full bg-[#f7e8ea]/80 blur-2xl" />

          <div className="absolute -right-24 top-[38%] h-72 w-72 rounded-full bg-[#f5dfe4]/70 blur-2xl" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-6xl flex-col justify-center">
          <section className="overflow-hidden rounded-lg border border-[#edcfd4] bg-white shadow-[0_20px_55px_-26px_rgba(45,13,18,0.35)]">
            <div className="grid lg:grid-cols-[1.55fr_0.95fr]">
              <div className="p-5 sm:p-8 lg:p-10">
                <header className="mb-6">
                  <div className="mb-2 flex items-center gap-2 text-[#c70c28]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c70c28]/10">
                      <HeartPulse className="h-4 w-4" strokeWidth={2.5} />
                    </div>

                    <span className="text-lg font-black tracking-[-0.04em]">
                      LifeLink
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-800">
                    Hospital Registration
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Join our premium medical care network.
                  </p>
                </header>

                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#c70c28]">
                      Step {step} of 2
                    </span>

                    <span className="text-[10px] font-semibold text-slate-500">
                      {step === 1
                        ? "Organization Details"
                        : "Verification & Location"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="h-1 rounded-full bg-[#c70c28]" />

                    <div
                      className={`h-1 rounded-full transition-colors ${
                        step === 2 ? "bg-[#c70c28]" : "bg-slate-200"
                      }`}
                    />
                  </div>
                </div>

                {submitError && (
                  <div
                    role="alert"
                    className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"
                  >
                    {submitError}
                  </div>
                )}

                <form noValidate onSubmit={handleSubmit(onSubmit)}>
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FieldShell
                          label="Hospital Name"
                          error={errors.hospitalName?.message}
                        >
                          <Building2 className="field-icon" />

                          <input
                            id="hospitalName"
                            autoComplete="organization"
                            placeholder="e.g. Central Grace Medical"
                            aria-invalid={Boolean(errors.hospitalName)}
                            className={`${fieldClass} ${
                              errors.hospitalName ? errorFieldClass : ""
                            }`}
                            {...register("hospitalName", {
                              required: "Hospital name is required.",

                              minLength: {
                                value: 2,
                                message:
                                  "Hospital name must be at least 2 characters.",
                              },

                              maxLength: {
                                value: 150,
                                message:
                                  "Hospital name must not exceed 150 characters.",
                              },
                            })}
                          />
                        </FieldShell>

                        <FieldShell
                          label="Medical License Number"
                          error={errors.hospitalLicenseCode?.message}
                        >
                          <BadgeCheck className="field-icon" />

                          <input
                            id="hospitalLicenseCode"
                            placeholder="HOSP-882"
                            aria-invalid={Boolean(errors.hospitalLicenseCode)}
                            className={`${fieldClass} ${
                              errors.hospitalLicenseCode ? errorFieldClass : ""
                            }`}
                            {...register("hospitalLicenseCode", {
                              required: "Medical license number is required.",

                              minLength: {
                                value: 3,
                                message:
                                  "License number must be at least 3 characters.",
                              },

                              maxLength: {
                                value: 20,
                                message:
                                  "License number must not exceed 20 characters.",
                              },
                            })}
                          />
                        </FieldShell>
                      </div>

                      <FieldShell
                        label="Official Hospital Email"
                        error={errors.email?.message}
                        success={
                          emailIsValid
                            ? "Email address looks valid."
                            : undefined
                        }
                      >
                        <Mail
                          className={`field-icon ${
                            errors.email
                              ? "text-red-500"
                              : emailIsValid
                                ? "text-emerald-500"
                                : ""
                          }`}
                        />

                        <input
                          id="email"
                          type="email"
                          inputMode="email"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          autoComplete="email"
                          placeholder="admin@hospital.org"
                          aria-invalid={Boolean(errors.email)}
                          className={`${fieldClass} pr-10 ${
                            errors.email
                              ? errorFieldClass
                              : emailIsValid
                                ? "border-emerald-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-100"
                                : ""
                          }`}
                          {...register("email", {
                            required: "Official hospital email is required.",

                            setValueAs: (value: unknown) =>
                              typeof value === "string"
                                ? value.trim().toLowerCase()
                                : value,

                            validate: validateEmail,
                          })}
                        />

                        {emailIsValid && (
                          <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                        )}
                      </FieldShell>

                      <FieldShell
                        label="Emergency Contact Phone"
                        error={errors.phone?.message}
                      >
                        <Phone className="field-icon" />

                        <input
                          id="phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="09XXXXXXXXX"
                          aria-invalid={Boolean(errors.phone)}
                          className={`${fieldClass} ${
                            errors.phone ? errorFieldClass : ""
                          }`}
                          {...register("phone", {
                            required: "Emergency contact phone is required.",

                            pattern: {
                              value: /^09\d{7,9}$/,

                              message:
                                "Enter a valid Myanmar phone number beginning with 09.",
                            },
                          })}
                        />
                      </FieldShell>

                      <FieldShell
                        label="Authorized Representative Name"
                        error={errors.representativeStaffName?.message}
                      >
                        <UserRound className="field-icon" />

                        <input
                          id="hospitalStaff"
                          autoComplete="name"
                          placeholder="Dr. Sarah Jenkins"
                          aria-invalid={Boolean(errors.representativeStaffName)}
                          className={`${fieldClass} ${
                            errors.representativeStaffName
                              ? errorFieldClass
                              : ""
                          }`}
                          {...register("representativeStaffName", {
                            required:
                              "Authorized representative name is required.",

                            minLength: {
                              value: 2,
                              message: "Name must be at least 2 characters.",
                            },

                            maxLength: {
                              value: 50,
                              message: "Name must not exceed 50 characters.",
                            },
                          })}
                        />
                      </FieldShell>

                      <button
                        type="button"
                        onClick={goNext}
                        className="group mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-extrabold text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-4
                         focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                      >
                        Continue to Verification
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="rounded-md border border-[#f0d8dc] bg-[#fff8f9] p-3.5">
                        <div className="flex items-start gap-2.5">
                          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#c70c28]" />

                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              Secure account setup
                            </p>

                            <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
                              Create your login credentials and provide the
                              hospital location.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FieldShell
                          label="Password"
                          error={errors.password?.message}
                        >
                          <LockKeyhole className="field-icon" />

                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Minimum 8 characters"
                            aria-invalid={Boolean(errors.password)}
                            className={`${fieldClass} pr-10 ${
                              errors.password ? errorFieldClass : ""
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
                                message:
                                  "Password must not exceed 64 characters.",
                              },

                              pattern: {
                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,

                                message:
                                  "Use uppercase, lowercase, and at least one number.",
                              },
                            })}
                          />

                          <PasswordToggle
                            show={showPassword}
                            onToggle={() =>
                              setShowPassword((current) => !current)
                            }
                            label="password"
                          />
                        </FieldShell>

                        <FieldShell
                          label="Confirm Password"
                          error={errors.confirmPassword?.message}
                        >
                          <LockKeyhole className="field-icon" />

                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Repeat your password"
                            aria-invalid={Boolean(errors.confirmPassword)}
                            className={`${fieldClass} pr-10 ${
                              errors.confirmPassword ? errorFieldClass : ""
                            }`}
                            {...register("confirmPassword", {
                              required: "Please confirm your password.",

                              validate: (value) =>
                                value === password || "Passwords do not match.",
                            })}
                          />

                          <PasswordToggle
                            show={showConfirmPassword}
                            onToggle={() =>
                              setShowConfirmPassword((current) => !current)
                            }
                            label="confirmed password"
                          />
                        </FieldShell>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FieldShell
                          label="Township"
                          error={errors.address?.township?.message}
                        >
                          <MapPin className="field-icon" />

                          <input
                            id="township"
                            autoComplete="address-level3"
                            placeholder="e.g. Hlaing"
                            aria-invalid={Boolean(errors.address?.township)}
                            className={`${fieldClass} ${
                              errors.address?.township ? errorFieldClass : ""
                            }`}
                            {...register("address.township", {
                              required: "Township is required.",

                              minLength: {
                                value: 2,
                                message: "Enter a valid township.",
                              },

                              maxLength: {
                                value: 100,
                                message:
                                  "Township must not exceed 100 characters.",
                              },
                            })}
                          />
                        </FieldShell>

                        <FieldShell
                          label="City"
                          error={errors.address?.city?.message}
                        >
                          <Building2 className="field-icon" />

                          <input
                            id="city"
                            autoComplete="address-level2"
                            placeholder="e.g. Yangon"
                            aria-invalid={Boolean(errors.address?.city)}
                            className={`${fieldClass} ${
                              errors.address?.city ? errorFieldClass : ""
                            }`}
                            {...register("address.city", {
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
                        </FieldShell>
                      </div>

                      <FieldShell
                        label="Street Address"
                        optional
                        error={errors.address?.street?.message}
                      >
                        <MapPin className="field-icon" />

                        <input
                          id="street"
                          autoComplete="street-address"
                          placeholder="Street name and building number"
                          aria-invalid={Boolean(errors.address?.street)}
                          className={`${fieldClass} ${
                            errors.address?.street ? errorFieldClass : ""
                          }`}
                          {...register("address.street", {
                            maxLength: {
                              value: 255,
                              message:
                                "Street address must not exceed 255 characters.",
                            },
                          })}
                        />
                      </FieldShell>

                      <div className="flex gap-3 pt-1">
                        <button
                          type="button"
                          onClick={goBack}
                          disabled={isSubmitting}
                          className="h-12 rounded-md border-[#e6c8cd] px-4 text-[#8d1427] hover:bg-[#fff6f7]"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="group mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-extrabold text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                          {isSubmitting ? (
                            <>
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                              Submitting registration...
                            </>
                          ) : (
                            <>
                              Submit Registration
                              <CircleCheck className="h-4 w-4 transition-transform group-hover:scale-110" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>

                <div className="mt-6 border-t border-[#f0d9dd] pt-4 text-center text-[11px] text-slate-500">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="font-bold text-[#c70c28] hover:underline"
                  >
                    Login to LifeLink
                  </a>
                </div>
              </div>

              <aside className="relative hidden min-h-[650px] overflow-hidden bg-[#edf0f3] p-8 lg:flex lg:flex-col lg:items-center lg:justify-center">
                <div className="pointer-events-none absolute -left-48 top-16 h-[430px] w-[430px] rounded-full border border-[#c70c28]/15" />

                <div className="pointer-events-none absolute -left-40 top-36 h-[430px] w-[430px] rounded-full border border-[#c70c28]/10" />

                <div className="pointer-events-none absolute -left-36 top-56 h-[430px] w-[430px] rounded-full border border-[#c70c28]/10" />

                <div className="relative z-10 w-full max-w-[310px] text-center">
                  <img
                    src={HOSPITAL_IMAGE_URL}
                    alt="Modern hospital building"
                    className="h-56 w-full rounded-lg object-cover shadow-[0_16px_30px_-14px_rgba(15,23,42,0.45)]"
                  />

                  <div className="mt-5 flex justify-center -space-x-2">
                    <AvatarBadge label="DR" className="bg-slate-800" />

                    <AvatarBadge label="RN" className="bg-[#b28b68]" />

                    <AvatarBadge
                      label="+5K"
                      className="bg-[#c70c28] text-[9px]"
                    />
                  </div>

                  <h2 className="mt-4 text-xl font-extrabold tracking-[-0.035em] text-[#c70c28]">
                    Trust in Every Drop
                  </h2>

                  <p className="mx-auto mt-2 max-w-[250px] text-xs leading-5 text-slate-500">
                    LifeLink manages the most complex blood inventory logistics
                    for top-tier medical institutions worldwide.
                  </p>

                  <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500 shadow-sm">
                    <BadgeCheck className="h-3.5 w-3.5 text-[#c70c28]" />
                    ISO 9001 Certified Network
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <footer className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[10px] text-slate-400">
            <a href="/privacy" className="hover:text-slate-600">
              Privacy Policy
            </a>

            <a href="/terms" className="hover:text-slate-600">
              Terms of Service
            </a>

            <a href="/security" className="hover:text-slate-600">
              Security Standards
            </a>

            <a href="/contact" className="hover:text-slate-600">
              Contact Support
            </a>
          </footer>
        </div>
      </main>

      {registrationSuccessful && (
        <RegistrationSuccessModal
          email={registeredEmail}
          onBackHome={handleBackHome}
        />
      )}
    </>
  );
};

type RegistrationSuccessModalProps = {
  email: string;
  onBackHome: () => void;
};

//to show successful
const RegistrationSuccessModal = ({
  email,
  onBackHome,
}: RegistrationSuccessModalProps) => {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-success-title"
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/70 bg-white p-6 text-center shadow-[0_30px_100px_-30px_rgba(15,23,42,0.75)] sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-50" />

        <div className="pointer-events-none absolute -bottom-16 -left-14 h-36 w-36 rounded-full bg-red-50" />

        <div className="relative z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="h-8 w-8" strokeWidth={3} />
          </div>

          <h2
            id="registration-success-title"
            className="mt-5 text-2xl font-black tracking-[-0.04em] text-slate-950"
          >
            Registration
            <br />
            Successful!
          </h2>

          <p className="mx-auto mt-3 max-w-[280px] text-xs font-medium leading-5 text-slate-500">
            Your hospital registration has been submitted successfully. Please
            wait for administrator approval.
          </p>

          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-semibold leading-4 text-slate-500">
              A confirmation email will be sent to
            </p>

            <p className="mt-1 break-all text-xs font-black text-slate-800">
              {email}
            </p>
          </div>

          <button
            type="button"
            onClick={onBackHome}
            className="group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#c90b27] to-[#730010] text-sm font-extrabold text-white shadow-lg shadow-red-700/20 transition hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-red-200"
          >
            Back to Home
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-semibold text-red-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified secure submission
          </div>
        </div>
      </div>
    </div>
  );
};

type FieldShellProps = {
  label: string;
  error?: string;
  success?: string;
  optional?: boolean;
  children: ReactNode;
};

const FieldShell = ({
  label,
  error,
  success,
  optional = false,
  children,
}: FieldShellProps) => {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold text-slate-700">
        {label}

        {optional && (
          <span className="ml-1 font-normal text-slate-400">(Optional)</span>
        )}
      </label>

      <div className="relative [&_.field-icon]:pointer-events-none [&_.field-icon]:absolute [&_.field-icon]:left-3.5 [&_.field-icon]:top-1/2 [&_.field-icon]:h-4 [&_.field-icon]:w-4 [&_.field-icon]:-translate-y-1/2 [&_.field-icon]:text-slate-400">
        {children}
      </div>

      <p
        className={`min-h-4 pt-1 text-[10px] font-medium ${
          error
            ? "text-red-600"
            : success
              ? "text-emerald-600"
              : "text-transparent"
        }`}
      >
        {error || success || "."}
      </p>
    </div>
  );
};

type PasswordToggleProps = {
  show: boolean;
  onToggle: () => void;
  label: string;
};

const PasswordToggle = ({ show, onToggle, label }: PasswordToggleProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${show ? "Hide" : "Show"} ${label}`}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
};

type AvatarBadgeProps = {
  label: string;
  className?: string;
};

const AvatarBadge = ({ label, className = "" }: AvatarBadgeProps) => {
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#edf0f3] text-[10px] font-black text-white shadow-sm ${className}`}
    >
      {label}
    </div>
  );
};

export default HospitalRegister;
