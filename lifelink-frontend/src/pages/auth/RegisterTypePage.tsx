import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  CheckCircle2,
  Clock3,
  Droplets,
  HeartHandshake,
  HeartPulse,
  Hospital,
  ShieldCheck,
} from "lucide-react";
import type { AccountType } from "@/types/auth/Auth";

interface RegisterTypePageProps {
  onSelect: (type: AccountType) => void;
}

const RegisterTypePage = ({ onSelect }: RegisterTypePageProps) => {
  const [selected, setSelected] = useState<AccountType>(null);

  const handleSelect = (type: Exclude<AccountType, null>): void => {
    setSelected(type);
    onSelect(type);
  };

  const handleCardKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    type: Exclude<AccountType, null>,
  ): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(type);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fafc] text-slate-950">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-rose-100/70 blur-3xl" />

        <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-red-50/90 blur-3xl" />

        <div className="absolute bottom-[-11rem] left-1/2 h-[28rem] w-[46rem] -translate-x-1/2 rounded-full bg-slate-200/50 blur-3xl" />

        {/* Subtle hospital silhouette */}
        <div className="absolute bottom-0 right-0 hidden h-[38%] w-[43%] opacity-[0.055] lg:block">
          <div className="absolute bottom-0 right-0 h-[72%] w-[86%] border border-slate-900 bg-white" />

          <div className="absolute bottom-[72%] right-[7%] h-[13%] w-[62%] border border-slate-900 bg-white" />

          <div className="absolute bottom-[85%] right-[29%] h-[8%] w-14 border border-slate-900 bg-white" />

          <div className="absolute bottom-[87%] right-[33.5%] h-8 w-1 bg-slate-900" />

          <div className="absolute bottom-8 right-8 grid w-[74%] grid-cols-7 gap-3">
            {Array.from({
              length: 28,
            }).map((_, index) => (
              <span
                key={index}
                className="h-6 border border-slate-900 bg-slate-100"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between px-5 sm:px-8 lg:px-12">
          <a
            href="/"
            aria-label="LifeLink home"
            className="inline-flex items-center gap-2 font-black tracking-tight text-slate-950"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-sm shadow-red-200">
              <Droplets className="h-3.5 w-3.5 fill-current" />
            </span>

            <span className="text-sm">
              Life
              <span className="text-red-600">Link</span>
            </span>
          </a>

          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 transition-colors hover:text-red-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </a>
        </header>

        {/* Hero and account cards */}
        <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-6 pt-8 sm:px-6 lg:pt-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
              <HeartPulse className="h-5 w-5" />
            </div>

            <h1 className="text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">
              Choose your path to impact
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-xs font-medium leading-5 text-slate-500 sm:text-sm">
              Whether you&apos;re looking to donate and save lives or manage
              blood donation resources, LifeLink provides the tools you need.
            </p>
          </div>

          <div className="mx-auto mt-8 grid w-full max-w-4xl gap-5 md:grid-cols-2">
            {/* Donor option */}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={selected === "DONOR"}
              onClick={() => handleSelect("DONOR")}
              onKeyDown={(event) => handleCardKeyDown(event, "DONOR")}
              className={`group relative cursor-pointer overflow-hidden rounded-[1.6rem] border bg-white p-6 text-center shadow-[0_20px_55px_-34px_rgba(15,23,42,0.36)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-34px_rgba(220,38,38,0.28)] focus:outline-none focus:ring-4 focus:ring-red-500/10 sm:p-8 ${
                selected === "DONOR"
                  ? "border-red-500 ring-4 ring-red-500/10"
                  : "border-slate-100 hover:border-red-200"
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 ring-8 ring-red-50/60 transition-transform duration-300 group-hover:scale-105">
                <Droplets className="h-6 w-6 fill-current" />
              </div>

              <h2 className="mt-6 text-xl font-black tracking-tight text-slate-950">
                Join as a Donor
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-xs font-medium leading-5 text-slate-500">
                Register to find donation requests, schedule donations, receive
                certificates, and support your community.
              </p>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleSelect("DONOR");
                }}
                className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-extrabold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20"
              >
                Continue as Donor
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-semibold text-slate-400">
                <CheckCircle2 className="h-3 w-3" />
                Support patients through blood donation
              </div>
            </div>

            {/* Hospital option */}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={selected === "HOSPITAL"}
              onClick={() => handleSelect("HOSPITAL")}
              onKeyDown={(event) => handleCardKeyDown(event, "HOSPITAL")}
              className={`group relative cursor-pointer overflow-hidden rounded-[1.6rem] border bg-white p-6 text-center shadow-[0_20px_55px_-34px_rgba(15,23,42,0.36)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-34px_rgba(220,38,38,0.2)] focus:outline-none focus:ring-4 focus:ring-red-500/10 sm:p-8 ${
                selected === "HOSPITAL"
                  ? "border-red-500 ring-4 ring-red-500/10"
                  : "border-slate-100 hover:border-red-200"
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-700 ring-8 ring-slate-100/60 transition-transform duration-300 group-hover:scale-105">
                <Hospital className="h-6 w-6" />
              </div>

              <h2 className="mt-6 text-xl font-black tracking-tight text-slate-950">
                Register as a Hospital
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-xs font-medium leading-5 text-slate-500">
                Manage donation events, private bookings, certificates, blood
                inventory, and emergency blood requests.
              </p>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleSelect("HOSPITAL");
                }}
                className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-500 bg-white px-4 text-xs font-extrabold text-red-600 transition-all hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/10"
              >
                Register as Hospital
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-semibold text-slate-400">
                <ShieldCheck className="h-3 w-3" />
                Secure hospital resource management
              </div>
            </div>
          </div>

          {/* Benefits strip */}
          <div className="mx-auto mt-7 grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-100 bg-white/90 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.45)] backdrop-blur md:grid-cols-3">
            <div className="flex items-start gap-3 px-5 py-4 md:border-r md:border-slate-100">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <HeartHandshake className="h-4 w-4" />
              </div>

              <div>
                <p className="text-[11px] font-extrabold text-slate-900">
                  Donor Focused
                </p>

                <p className="mt-1 text-[9px] font-medium leading-4 text-slate-500">
                  Connect eligible donors with hospitals and donation
                  opportunities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-y border-slate-100 px-5 py-4 md:border-y-0 md:border-r">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Clock3 className="h-4 w-4" />
              </div>

              <div>
                <p className="text-[11px] font-extrabold text-slate-900">
                  Updated Status
                </p>

                <p className="mt-1 text-[9px] font-medium leading-4 text-slate-500">
                  Follow event registrations, bookings, and inventory status.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 px-5 py-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <BellRing className="h-4 w-4" />
              </div>

              <div>
                <p className="text-[11px] font-extrabold text-slate-900">
                  Clear Management
                </p>

                <p className="mt-1 text-[9px] font-medium leading-4 text-slate-500">
                  Simple workflows for donation events, bookings, certificates,
                  and inventory.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 bg-white/40 px-5 py-4 text-[9px] font-semibold text-slate-400 backdrop-blur sm:flex-row sm:px-8 lg:px-12">
          <span>© 2026 LifeLink. Educational prototype.</span>

          <div className="flex items-center gap-4">
            <a href="/privacy" className="transition-colors hover:text-red-600">
              Privacy Policy
            </a>

            <a href="/terms" className="transition-colors hover:text-red-600">
              Terms of Service
            </a>

            <a
              href="/security"
              className="transition-colors hover:text-red-600"
            >
              Security Standards
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default RegisterTypePage;
