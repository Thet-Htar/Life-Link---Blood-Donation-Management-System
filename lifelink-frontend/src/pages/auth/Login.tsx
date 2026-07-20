import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Droplet,
  Eye,
  EyeOff,
  HeartPulse,
  LockKeyhole,
  Mail,
  ShieldCheck,
  TriangleAlert,
  UsersRound,
} from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { useAuthStore } from "@/store/authState";
import type { LoginApiError, LoginRequest } from "@/types/auth/Auth";
import type { AccountModalType } from "@/types/User";
import authService from "@/services/authService";

const LOGIN_HERO_IMAGE =
  "https://images.pexels.com/photos/6129141/pexels-photo-6129141.jpeg?auto=compress&cs=tinysrgb&w=1600";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100";

const errorInputClass =
  "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-100";

const getDashboardRoute = (role: string): string => {
  const routedRole = role.trim().toUpperCase();

  switch (routedRole) {
    case "HOSPITAL":
      return "/hospital";

    case "ADMIN":
      return "/admin/dashboard";

    case "DONOR":
      return "/donor";

    default:
      return "/";
  }
};

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const [serverError, setServerError] = useState("");

  const [accountModalType, setAccountModalType] =
    useState<AccountModalType>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginRequest> = async (data) => {
    setServerError("");
    setAccountModalType(null);

    const requestData: LoginRequest = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    };

    try {
      const response = await authService.login(requestData);

      /*
       * Backend response:
       * {
       *   accessToken,
       *   refreshToken,
       *   role
       * }
       *
       * There is no response.user.
       */
      useAuthStore.setState({
        accessToken: response.accessToken,
      });

      const dashboardRoute = getDashboardRoute(response.role);

      navigate(dashboardRoute, {
        replace: true,
      });
    } catch (error) {
      console.error("Login failed:", error);

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as LoginApiError | undefined;

        const errorCode = responseData?.code ?? responseData?.errorCode;

        const errorMessage =
          responseData?.message ?? responseData?.errorMessage;

        if (
          error.response?.status === 403 &&
          errorCode === "ACCOUNT_UNDER_REVIEW"
        ) {
          setAccountModalType("UNDER_REVIEW");

          return;
        }

        if (
          error.response?.status === 403 &&
          errorCode === "ACCOUNT_REJECTED"
        ) {
          setAccountModalType("REJECTED");

          return;
        }

        if (error.response?.status === 403 && errorCode === "ACCOUNT_LOCKED") {
          setServerError(
            errorMessage ??
              "Your account has been locked. Please contact the LifeLink administrator.",
          );

          return;
        }

        if (error.response?.status === 403) {
          const normalizedMessage = errorMessage?.toLowerCase() ?? "";

          if (normalizedMessage.includes("reject")) {
            setAccountModalType("REJECTED");
          } else {
            setAccountModalType("UNDER_REVIEW");
          }

          return;
        }

        if (
          error.response?.status === 401 ||
          errorCode === "INVALID_CREDENTIALS"
        ) {
          setServerError(
            errorMessage ??
              "Email or password is incorrect. Please check your details and try again.",
          );
          return;
        }

        if (error.response?.status === 400) {
          setServerError(
            errorMessage ??
              "The login information is invalid. Please check your details.",
          );
          return;
        }

        setServerError(errorMessage ?? "Login failed. Please try again.");
        return;
      }

      setServerError("Unable to connect to the server. Please try again.");
    }
  };

  const handleBackHome = (): void => {
    setAccountModalType(null);

    navigate("/", {
      replace: true,
    });
  };

  return (
    <>
      <main className="min-h-screen bg-white text-slate-950 selection:bg-red-200 lg:grid lg:grid-cols-[60%_40%]">
        {/* Left image panel */}
        <aside className="relative hidden min-h-screen overflow-hidden bg-slate-950 lg:block">
          <img
            src={LOGIN_HERO_IMAGE}
            alt="LifeLink hospital care team"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-black/5" />

          <div className="absolute inset-0 bg-gradient-to-t from-red-950/80 via-transparent to-black/20" />

          <div className="relative z-10 flex min-h-screen flex-col p-9 xl:p-12">
            <Link
              to="/"
              aria-label="LifeLink home"
              className="inline-flex w-fit items-center gap-2 text-sm font-black tracking-tight text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-lg">
                <Droplet className="h-4 w-4 fill-current" />
              </span>
              LifeLink
            </Link>

            <div className="mt-auto max-w-lg pb-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                <HeartPulse className="h-3.5 w-3.5" />
                Care that connects
              </div>

              <h1 className="max-w-md text-4xl font-black leading-[1.05] tracking-[-0.05em] text-white xl:text-5xl">
                Saving lives,
                <span className="block">one drop at a time.</span>
              </h1>

              <p className="mt-5 max-w-md text-sm font-medium leading-6 text-white/80">
                Access blood donation events, private appointments, emergency
                requests, certificates, and hospital resources through LifeLink.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold text-white backdrop-blur-md">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure account access
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-bold text-white backdrop-blur-md">
                  <UsersRound className="h-3.5 w-3.5" />
                  Donor and hospital network
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] font-semibold text-white/70">
              <span>Educational healthcare prototype</span>

              <span>© 2026 LifeLink</span>
            </div>
          </div>
        </aside>

        {/* Login panel */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8 sm:px-8 lg:px-10 xl:px-14">
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-red-50 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-slate-100 blur-3xl" />

          <div className="relative z-10 w-full max-w-[390px]">
            {/* Mobile header */}
            <div className="mb-10 flex items-center justify-between lg:hidden">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-black tracking-tight"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white">
                  <Droplet className="h-4 w-4 fill-current" />
                </span>

                <span>
                  Life
                  <span className="text-red-600">Link</span>
                </span>
              </Link>

              <Link
                to="/register"
                className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 transition hover:text-red-600"
              >
                Create account
              </Link>
            </div>

            <header>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-600">
                Secure portal
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] text-slate-950">
                Welcome back
              </h2>

              <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
                Sign in to access your LifeLink account and continue managing
                donations, bookings, requests, and care.
              </p>
            </header>

            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="mt-7 space-y-4"
            >
              {/* Email */}
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
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="name@example.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={`${inputClass} ${
                      errors.email ? errorInputClass : ""
                    }`}
                    {...register("email", {
                      required: "Email address is required.",

                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

                        message: "Enter a valid email address.",
                      },

                      setValueAs: (value: unknown) =>
                        typeof value === "string"
                          ? value.trim().toLowerCase()
                          : value,
                    })}
                  />
                </div>

                <p
                  id="email-error"
                  className="min-h-4 pt-1 text-[10px] font-semibold text-red-600"
                >
                  {errors.email?.message}
                </p>
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[11px] font-bold text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-[10px] font-bold text-red-600 transition hover:text-red-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    className={`${inputClass} pr-10 ${
                      errors.password ? errorInputClass : ""
                    }`}
                    {...register("password", {
                      required: "Password is required.",

                      minLength: {
                        value: 8,

                        message: "Password must contain at least 8 characters.",
                      },
                    })}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <p
                  id="password-error"
                  className="min-h-4 pt-1 text-[10px] font-semibold text-red-600"
                >
                  {errors.password?.message}
                </p>
              </div>

              {/* Server error */}
              {serverError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-[10px] font-semibold leading-4 text-red-700"
                >
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>{serverError}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-extrabold text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="my-6 h-px bg-slate-100" />

            <p className="text-center text-xs font-medium text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-red-600 transition hover:text-red-700 hover:underline"
              >
                Sign up
              </Link>
            </p>

            <footer className="mt-12 flex flex-col items-center justify-between gap-3 text-[9px] font-semibold text-slate-400 sm:flex-row">
              <span>© 2026 LifeLink</span>

              <div className="flex items-center gap-4">
                <Link to="/privacy" className="transition hover:text-red-600">
                  Privacy
                </Link>

                <Link to="/support" className="transition hover:text-red-600">
                  Support
                </Link>
              </div>
            </footer>
          </div>
        </section>
      </main>

      {accountModalType && (
        <AccountStatusModal
          type={accountModalType}
          onBackHome={handleBackHome}
        />
      )}
    </>
  );
};

interface AccountStatusModalProps {
  type: "UNDER_REVIEW" | "REJECTED";

  onBackHome: () => void;
}

const AccountStatusModal = ({ type, onBackHome }: AccountStatusModalProps) => {
  const isRejected = type === "REJECTED";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-status-title"
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/70 bg-white p-6 text-center shadow-[0_30px_100px_-30px_rgba(15,23,42,0.8)] sm:p-8">
        <div
          className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full ${
            isRejected ? "bg-red-50" : "bg-amber-50"
          }`}
        />

        <div className="pointer-events-none absolute -bottom-16 -left-14 h-36 w-36 rounded-full bg-slate-50" />

        <div className="relative z-10">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg ${
              isRejected
                ? "bg-red-500 shadow-red-500/25"
                : "bg-amber-500 shadow-amber-500/25"
            }`}
          >
            {isRejected ? (
              <TriangleAlert className="h-8 w-8" strokeWidth={2.7} />
            ) : (
              <Clock3 className="h-8 w-8" strokeWidth={2.7} />
            )}
          </div>

          <h2
            id="account-status-title"
            className="mt-5 text-2xl font-black tracking-[-0.04em] text-slate-950"
          >
            {isRejected ? (
              <>
                Application
                <br />
                Not Approved
              </>
            ) : (
              <>
                Application
                <br />
                Under Review
              </>
            )}
          </h2>

          <p className="mx-auto mt-3 max-w-[290px] text-xs font-medium leading-5 text-slate-500">
            {isRejected
              ? "Your application was not approved. Please contact LifeLink support for more information."
              : "Your application has not been approved yet. Our administrator is currently reviewing it."}
          </p>

          <div
            className={`mt-5 rounded-xl border px-4 py-3 ${
              isRejected
                ? "border-red-100 bg-red-50"
                : "border-amber-100 bg-amber-50"
            }`}
          >
            <p
              className={`text-[11px] font-bold leading-5 ${
                isRejected ? "text-red-800" : "text-amber-800"
              }`}
            >
              {isRejected
                ? "Please contact the LifeLink administration team before trying to sign in again."
                : "Please wait for administrator approval. You will be able to access your dashboard after your application is approved."}
            </p>
          </div>

          <button
            type="button"
            onClick={onBackHome}
            className="group mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#c90b27] to-[#730010] px-4 text-sm font-extrabold text-white shadow-lg shadow-red-700/20 transition hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-red-200"
          >
            Back to Home
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-semibold text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            LifeLink account verification
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
