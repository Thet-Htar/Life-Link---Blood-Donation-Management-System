import {
  ArrowRight,
  Award,
  Building2,
  CalendarClock,
  CalendarDays,
  Droplet,
  HeartHandshake,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { Link } from "react-router-dom";
import Navbar from "./landing/Navbar";

const AboutUsPage = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
      <Navbar />

      <main className="relative pt-20">
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-red-100/60 blur-3xl" />

        <div className="pointer-events-none absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-red-50 blur-3xl" />

        <section className="relative mx-auto flex min-h-[calc(100dvh-5rem)] max-w-7xl items-center px-4 py-8 sm:px-6 lg:h-[calc(100dvh-5rem)] lg:min-h-[620px] lg:overflow-hidden lg:px-8 lg:py-7">
          <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            {/* Left side */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-100 bg-white px-3 py-2 shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <Droplet className="h-3.5 w-3.5 fill-current" />
                </span>

                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-600">
                  About LifeLink
                </span>
              </div>

              <h1 className="mt-5 max-w-xl text-4xl font-black leading-[1.02] tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-[54px]">
                Connecting donors,
                <span className="block text-red-600">hospitals and hope.</span>
              </h1>

              <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-slate-600">
                LifeLink is an educational healthcare platform designed to
                organize blood donation activities between volunteer donors and
                approved hospitals. It brings donation events, private
                appointments, blood inventory and verified certificates into one
                connected system.
              </p>

              <div className="mt-6 grid max-w-xl grid-cols-3 gap-3">
                <MiniStat
                  value="Donors"
                  label="Community"
                  icon={<UsersRound className="h-4 w-4" />}
                />

                <MiniStat
                  value="Hospitals"
                  label="Partners"
                  icon={<Building2 className="h-4 w-4" />}
                />

                <MiniStat
                  value="Secure"
                  label="Access"
                  icon={<ShieldCheck className="h-4 w-4" />}
                />
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-xs font-black text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700"
                >
                  Join LifeLink
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-red-200 bg-white px-5 text-xs font-black text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                >
                  Back to Home
                </Link>
              </div>

              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                  <div>
                    <p className="text-[10px] font-black text-amber-900">
                      Educational Prototype
                    </p>

                    <p className="mt-1 text-[9px] font-medium leading-4 text-amber-800/80">
                      LifeLink is not a production clinical system and does not
                      replace medical judgment, hospital procedures or official
                      blood-bank verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-rows-[auto_minmax(0,1fr)]">
              <article className="relative overflow-hidden rounded-3xl border border-red-100 bg-gradient-to-br from-red-600 to-red-500 p-6 text-white shadow-xl shadow-red-600/15 sm:col-span-2">
                <div className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full border-[28px] border-white/10" />

                <div className="relative">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                    <HeartHandshake className="h-5 w-5" />
                  </span>

                  <p className="mt-5 text-[9px] font-black uppercase tracking-[0.18em] text-white/75">
                    Our Mission
                  </p>

                  <h2 className="mt-2 max-w-lg text-2xl font-black tracking-[-0.04em]">
                    Make blood donation coordination clear, organized and
                    accessible.
                  </h2>

                  <p className="mt-3 max-w-2xl text-[11px] font-medium leading-5 text-white/80">
                    LifeLink reduces fragmented communication by giving donors,
                    hospitals and administrators clearly defined workflows for
                    every stage of donation management.
                  </p>
                </div>
              </article>

              <RoleCard
                icon={<UsersRound className="h-5 w-5" />}
                title="For Donors"
                description="Discover published events, request private bookings, track eligibility and receive certificates."
              />

              <RoleCard
                icon={<Building2 className="h-5 w-5" />}
                title="For Hospitals"
                description="Create donation events, manage bookings, issue certificates and maintain blood inventory."
              />

              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-red-600">
                      Donation Journey
                    </p>

                    <h2 className="mt-1 text-lg font-black tracking-[-0.03em] text-slate-950">
                      How LifeLink connects each step
                    </h2>
                  </div>

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Award className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <JourneyStep
                    number="01"
                    icon={<CalendarDays className="h-4 w-4" />}
                    title="Find an event"
                    description="Review published hospital donation drives."
                  />

                  <JourneyStep
                    number="02"
                    icon={<CalendarClock className="h-4 w-4" />}
                    title="Book privately"
                    description="Arrange a hospital appointment when needed."
                  />

                  <JourneyStep
                    number="03"
                    icon={<Award className="h-4 w-4" />}
                    title="Get recognized"
                    description="Receive a verifiable donation certificate."
                  />
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const MiniStat = ({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
}) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <span className="text-red-600">{icon}</span>

      <p className="mt-3 text-xs font-black text-slate-950">{value}</p>

      <p className="mt-0.5 text-[8px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </article>
  );
};

const RoleCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
        {icon}
      </span>

      <h2 className="mt-4 text-base font-black text-slate-950">{title}</h2>

      <p className="mt-2 text-[10px] font-medium leading-5 text-slate-500">
        {description}
      </p>
    </article>
  );
};

const JourneyStep = ({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <article className="rounded-2xl bg-slate-50 p-3.5">
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm">
          {icon}
        </span>

        <span className="text-[9px] font-black text-red-200">{number}</span>
      </div>

      <h3 className="mt-3 text-[11px] font-black text-slate-900">{title}</h3>

      <p className="mt-1 text-[9px] font-medium leading-4 text-slate-500">
        {description}
      </p>
    </article>
  );
};

export default AboutUsPage;
