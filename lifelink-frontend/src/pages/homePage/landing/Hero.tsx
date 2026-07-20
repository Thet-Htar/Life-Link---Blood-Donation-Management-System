import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  Droplet,
  Heart,
  LoaderCircle,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
} from "lucide-react";
import { getPublicDonationEvents } from "@/services/hospital/hospitalDonationService";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAJIMvFUt_Eoa4mP4Zb2ZkcfG3Fb5cwyJJXdVMbuvKnRp_x-W0f_iZqfgV2aEhr1MAvDFdrmRzz4JnPCj_dPol1SG7lS1tKAeKcRv68W3Z4F5527tJTxjue6HbQWUEHH_-sm0-3qg_tDf_M8JQDWTsGYNiHRIOV91SWUrndpK6Y6yXFrOozY-ljYnohQ_67F-hO-nT-Ze0HEGT_j0aO-mWVkQxQ12YVn2VSmeSl3vlv8BO-Sta7cmGA";

interface Statistic {
  value: string;
  label: string;
}

interface PublicDonationEvent {
  id: number;

  hospitalName?: string | null;
  eventTitle?: string | null;
  description?: string | null;

  eventDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;

  status?: string | null;

  requiredBloodTypes?: string[];

  targetDonorCount?: number | null;
  registeredDonorCount?: number | null;
  remainingSlots?: number | null;

  street?: string | null;
  township?: string | null;
  city?: string | null;

  address?: {
    street?: string | null;
    township?: string | null;
    city?: string | null;
  } | null;
}

const statistics: Statistic[] = [
  {
    value: "12k+",
    label: "Active Donors",
  },
  {
    value: "50k+",
    label: "Lives Impacted",
  },
  {
    value: "240+",
    label: "Partner Hospitals",
  },
  {
    value: "100%",
    label: "Safety Rating",
  },
];

const BLOOD_TYPE_LABELS: Record<string, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
};

const Hero = () => {
  const navigate = useNavigate();

  const [donationEvents, setDonationEvents] = useState<PublicDonationEvent[]>(
    [],
  );

  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const [eventLoadError, setEventLoadError] = useState("");

  useEffect(() => {
    let ignoreResult = false;

    const loadDonationEvents = async (): Promise<void> => {
      try {
        setIsLoadingEvents(true);
        setEventLoadError("");

        const response = await getPublicDonationEvents(3);

        if (ignoreResult) {
          return;
        }

        const events = Array.isArray(response)
          ? (response as PublicDonationEvent[])
          : [];

        const publishedEvents = events
          .filter((event) => {
            if (!event.status) {
              return true;
            }

            return event.status.trim().toUpperCase() === "PUBLISHED";
          })
          .slice(0, 3);

        setDonationEvents(publishedEvents);
      } catch (error) {
        console.error("Failed to load public donation events:", error);

        if (!ignoreResult) {
          setDonationEvents([]);

          setEventLoadError("Donation events are temporarily unavailable.");
        }
      } finally {
        if (!ignoreResult) {
          setIsLoadingEvents(false);
        }
      }
    };

    void loadDonationEvents();

    return () => {
      ignoreResult = true;
    };
  }, []);

  const handleOpenEvent = (eventId: number): void => {
    navigate("/login", {
      state: {
        redirectTo: "/donor/events",
        selectedEventId: eventId,
      },
    });
  };

  const handlePrivateBooking = (): void => {
    navigate("/login", {
      state: {
        redirectTo: "/donor/private-bookings",
      },
    });
  };

  return (
    <>
      <main className="overflow-x-hidden bg-slate-50 text-slate-950">
        {/* Hero */}
        <section
          id="top"
          className="relative overflow-hidden border-b border-slate-200 pt-5"
        >
          <div className="absolute -left-40 top-24 h-96 w-96 rounded-full bg-red-100/50 blur-3xl" />

          <div className="absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-red-50 blur-3xl" />

          <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
            {/* Hero content */}
            <div id="about" className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-white px-3 py-2 shadow-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>

                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-600">
                  Trusted Partnership in Modern Healthcare
                </span>
              </div>

              <h1 className="mt-7 text-[42px] font-black leading-[1.08] tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-[58px]">
                Connecting Donors
                <br />
                <span className="text-red-600">to Hospitals.</span>
              </h1>

              <p className="mt-6 max-w-xl text-sm font-medium leading-7 text-slate-600 sm:text-base">
                LifeLink streamlines collaboration between volunteer donors and
                trusted medical institutions. We support a sustainable blood
                supply through technology-driven coordination and community
                engagement.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#drives"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700"
                >
                  Find a Donation Drive
                  <ChevronRight className="h-4 w-4" />
                </a>

                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-6 py-3.5 text-sm font-black text-slate-800 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                >
                  <Building2 className="h-4 w-4" />
                  Partner With Us
                </Link>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative mx-auto w-full max-w-[590px]">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-red-100/40 blur-3xl" />

              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-slate-200 shadow-2xl shadow-slate-900/20">
                <img
                  src={heroImage}
                  alt="Healthcare professional supporting a donor during blood donation"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

                <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/50 bg-white/85 p-4 shadow-lg backdrop-blur-xl sm:inset-x-7 sm:bottom-7">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-md shadow-red-600/30">
                      <Heart className="h-5 w-5 fill-current" />
                    </span>

                    <div>
                      <p className="text-sm font-black text-slate-900">
                        Impact Community Health
                      </p>

                      <p className="mt-1 text-[10px] font-medium leading-4 text-slate-500 sm:text-xs">
                        Your regular contributions support trusted local
                        healthcare institutions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section
          id="impact"
          className="border-b border-slate-200 bg-white py-14 sm:py-16"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            {statistics.map((statistic) => (
              <article key={statistic.label} className="text-center">
                <p className="text-4xl font-black tracking-[-0.05em] text-red-600 sm:text-5xl">
                  {statistic.value}
                </p>

                <p className="mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {statistic.label}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Donation drives */}
        <section id="drives" className="bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:px-8">
            {/* Drive information */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">
                Community events
              </p>

              <h2 className="mt-2 text-3xl font-black leading-tight tracking-[-0.045em] text-slate-950 sm:text-4xl">
                Upcoming Community
                <br />
                Donation Drives
              </h2>

              <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-slate-600">
                Explore current donation events created by approved LifeLink
                hospitals. Sign in to review your eligibility and register for a
                suitable event.
              </p>

              <div className="mt-8 rounded-3xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <CalendarDays className="h-5 w-5" />
                  </span>

                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Hospital Donation Events
                    </h3>

                    <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                      Events shown here are published by registered hospitals
                      and available to eligible donors.
                    </p>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-red-600 bg-white px-5 text-xs font-black text-red-600 transition hover:bg-red-600 hover:text-white"
                >
                  Sign In to Participate
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Actual donation-event list */}
            <div className="space-y-4">
              {isLoadingEvents && <DonationEventsLoading />}

              {!isLoadingEvents &&
                donationEvents.map((event) => (
                  <DonationDriveCard
                    key={event.id}
                    event={event}
                    onOpen={() => handleOpenEvent(event.id)}
                  />
                ))}

              {!isLoadingEvents && donationEvents.length === 0 && (
                <PrivateBookingCard
                  message={eventLoadError}
                  onOpen={handlePrivateBooking}
                />
              )}
            </div>
          </div>
        </section>

        {/* Registration call to action */}
        <section className="bg-slate-50 px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-red-600 px-6 py-14 text-center text-white shadow-xl shadow-red-600/15 sm:px-12 sm:py-16">
            <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full border border-white/10" />

            <div className="absolute -bottom-32 -right-20 h-72 w-72 rounded-full border border-white/10" />

            <div className="relative">
              <h2 className="text-3xl font-black tracking-[-0.045em] sm:text-4xl">
                Join the Vitality Network
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-6 text-white/80 sm:text-base">
                Registration is simple and secure. Connect with hospitals in
                your area and contribute to your community&apos;s healthcare
                infrastructure.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-7 text-sm font-black text-red-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-red-50"
                >
                  Register as a Donor
                </Link>

                <Link
                  to="/register"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/40 bg-white/5 px-7 text-sm font-black text-white transition hover:bg-white/10"
                >
                  Hospital Partnership
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#2d3133] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8 lg:py-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white">
                <Droplet className="h-5 w-5 fill-current" />
              </span>

              <span className="text-xl font-black tracking-[-0.04em]">
                LifeLink
              </span>
            </div>

            <p className="mt-5 max-w-xs text-xs font-medium leading-5 text-white/55">
              Supporting healthcare systems through innovative donor management
              and hospital partnership programs.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">
              Resources
            </h3>

            <ul className="mt-5 space-y-3 text-xs font-medium text-white/55">
              <li>
                <a href="#drives" className="transition hover:text-white">
                  Donation Events
                </a>
              </li>

              <li>
                <Link to="/about" className="transition hover:text-white">
                  About LifeLink
                </Link>
              </li>

              <li>
                <Link to="/login" className="transition hover:text-white">
                  Hospital Portal
                </Link>
              </li>

              <li>
                <a href="#impact" className="transition hover:text-white">
                  Community Impact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">
              Contact
            </h3>

            <ul className="mt-5 space-y-3 text-xs font-medium text-white/55">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                lifelinkadmintesting@gmail.com
              </li>

              <li>+1 (800) LIFE-LINK</li>

              <li>Corporate Headquarters</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80">
              Newsletter
            </h3>

            <p className="mt-5 text-xs font-medium leading-5 text-white/55">
              Stay updated with local drives and hospital partnerships.
            </p>

            <div className="mt-4 flex">
              <input
                type="email"
                aria-label="Newsletter email address"
                placeholder="Email address"
                className="h-11 min-w-0 flex-1 rounded-l-xl border border-white/10 bg-white/5 px-4 text-xs text-white outline-none placeholder:text-white/30 focus:border-red-500"
              />

              <button
                type="button"
                aria-label="Subscribe to newsletter"
                className="flex h-11 w-12 items-center justify-center rounded-r-xl bg-red-600 text-white transition hover:bg-red-700"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 text-[9px] font-medium text-white/35 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <p>© 2026 LifeLink Healthcare. All rights reserved.</p>

            <div className="flex flex-wrap gap-5">
              <a href="#" className="transition hover:text-white/70">
                Privacy Policy
              </a>

              <a href="#" className="transition hover:text-white/70">
                Terms of Service
              </a>

              <a href="#" className="transition hover:text-white/70">
                Compliance
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

const DonationDriveCard = ({
  event,
  onOpen,
}: {
  event: PublicDonationEvent;
  onOpen: () => void;
}) => {
  const dateParts = getEventDateParts(event.eventDate);

  const street = event.address?.street ?? event.street;

  const township = event.address?.township ?? event.township;

  const city = event.address?.city ?? event.city;

  const location = [street, township, city].filter(Boolean).join(", ");

  const bloodTypes = event.requiredBloodTypes ?? [];

  const targetDonorCount = event.targetDonorCount ?? 0;

  const registeredDonorCount = event.registeredDonorCount ?? 0;

  const remainingSlots =
    event.remainingSlots ??
    Math.max(targetDonorCount - registeredDonorCount, 0);

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50">
            <span className="text-[8px] font-black uppercase tracking-wide text-red-500">
              {dateParts.month}
            </span>

            <span className="mt-0.5 text-2xl font-black tracking-[-0.05em] text-red-600">
              {dateParts.day}
            </span>
          </div>

          <div className="min-w-0">
            <p className="truncate text-[9px] font-black uppercase tracking-[0.14em] text-red-600">
              {event.hospitalName || "LifeLink Hospital"}
            </p>

            <h3 className="mt-1 truncate text-sm font-black text-slate-900 sm:text-lg">
              {event.eventTitle || "Donation Event"}
            </h3>

            <div className="mt-2 flex flex-col gap-1 text-[9px] font-bold text-slate-500 sm:flex-row sm:items-center sm:text-[10px]">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-red-500" />

                {formatEventTime(event.startTime, event.endTime)}
              </span>

              {location && (
                <>
                  <span className="hidden sm:inline">•</span>

                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" />

                    <span className="truncate">{location}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpen}
          aria-label={`Sign in to view ${event.eventTitle ?? "donation event"}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition group-hover:border-red-200 group-hover:bg-red-600 group-hover:text-white"
        >
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {(bloodTypes.length > 0 || targetDonorCount > 0) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap gap-1.5">
            {bloodTypes.slice(0, 6).map((bloodType) => (
              <span
                key={bloodType}
                className="rounded-md border border-red-100 bg-red-50 px-2 py-1 text-[8px] font-black text-red-700"
              >
                {BLOOD_TYPE_LABELS[bloodType] ?? bloodType}
              </span>
            ))}

            {bloodTypes.length > 6 && (
              <span className="rounded-md bg-slate-100 px-2 py-1 text-[8px] font-black text-slate-600">
                +{bloodTypes.length - 6}
              </span>
            )}
          </div>

          {targetDonorCount > 0 && (
            <span className="text-[9px] font-black text-emerald-700">
              {remainingSlots} places remaining
            </span>
          )}
        </div>
      )}
    </article>
  );
};

const PrivateBookingCard = ({
  message,
  onOpen,
}: {
  message?: string;
  onOpen: () => void;
}) => {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-red-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-50" />

      <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-slate-50" />

      <div className="relative">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20">
          <CalendarClock className="h-5 w-5" />
        </span>

        <p className="mt-6 text-[9px] font-black uppercase tracking-[0.18em] text-red-600">
          Private donation option
        </p>

        <h3 className="mt-2 max-w-md text-2xl font-black leading-tight tracking-[-0.04em] text-slate-950">
          Would you like to contribute through a private booking?
        </h3>

        <p className="mt-3 max-w-lg text-xs font-medium leading-6 text-slate-500">
          {message ||
            "There are no published donation events available right now. Sign in to arrange a private donation appointment with an available hospital."}
        </p>

        <button
          type="button"
          onClick={onOpen}
          className="group mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-xs font-black text-white shadow-md shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700"
        >
          Continue to Login
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
};

const DonationEventsLoading = () => {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="text-center">
        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-red-600" />

        <p className="mt-3 text-xs font-bold text-slate-500">
          Loading hospital donation events...
        </p>
      </div>
    </div>
  );
};

const getEventDateParts = (
  value?: string | null,
): {
  month: string;
  day: string;
} => {
  if (!value) {
    return {
      month: "TBA",
      day: "--",
    };
  }

  const dateValue = value.slice(0, 10);

  const [year, month, day] = dateValue.split("-").map(Number);

  const date =
    year && month && day ? new Date(year, month - 1, day) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      month: "TBA",
      day: "--",
    };
  }

  return {
    month: new Intl.DateTimeFormat("en-US", {
      month: "short",
    })
      .format(date)
      .toUpperCase(),

    day: new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
    }).format(date),
  };
};

const formatEventTime = (
  startTime?: string | null,
  endTime?: string | null,
): string => {
  const formattedStart = formatTime(startTime);

  const formattedEnd = formatTime(endTime);

  if (formattedStart && formattedEnd) {
    return `${formattedStart} - ${formattedEnd}`;
  }

  if (formattedStart) {
    return formattedStart;
  }

  return "Time to be announced";
};

const formatTime = (value?: string | null): string => {
  if (!value) {
    return "";
  }

  const [hourText, minuteText] = value.slice(0, 5).split(":");

  const hour = Number(hourText);

  const minute = Number(minuteText);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return value.slice(0, 5);
  }

  const date = new Date();

  date.setHours(hour, minute, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

export default Hero;
