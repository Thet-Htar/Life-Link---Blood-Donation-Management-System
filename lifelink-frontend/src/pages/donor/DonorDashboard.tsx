import { useCallback, useEffect, useState, type ComponentType } from "react";

import axios from "axios";

import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import type { LucideProps } from "lucide-react";

import {
  Award,
  Bell,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Droplet,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCcw,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";

import { useAuthStore } from "@/store/authState";

import type { DonorEventResponse } from "@/types/donorEvents";

import type { BloodType, DonationHistoryType, Gender } from "@/types/auth/Auth";

import {
  cancelDonorEventRegistration,
  getDonorProfile,
  getRecommendedDonorEvents,
  registerDonorForEvent,
} from "@/services/donorServices";

import DashboardOverview from "./components/DashboardOverview";

import EventMissionCard from "./components/EventMissionCard";

import AlertModal from "../alertModel";

export interface DonorProfileResponse {
  id: number;

  donorCode: string;

  fullName: string;

  email: string;

  phone: string;

  bloodType: BloodType;

  dateOfBirth: string;

  weightKg: number;

  gender: Gender;

  donationHistoryType?: DonationHistoryType;

  lastDonationDate?: string | null;

  eligible: boolean;

  donationCount: number;

  address: {
    city: string;

    township: string;

    street?: string | null;
  };
}

type SidebarIcon = ComponentType<LucideProps>;

interface DonorNavigationItem {
  label: string;

  to: string;

  icon: SidebarIcon;

  description: string;

  end?: boolean;
}

type DonorEventWithPossibleIds = DonorEventResponse & {
  id?: number;

  eventId?: number;
};

const sidebarLinks: DonorNavigationItem[] = [
  {
    label: "Dashboard",
    to: "/donor",
    icon: LayoutDashboard,
    description: "Donation overview",
    end: true,
  },
  {
    label: "Private Booking",
    to: "/donor/private-bookings",
    icon: CalendarClock,
    description: "Book a hospital donation",
  },
  {
    label: "Events",
    to: "/donor/events",
    icon: CalendarDays,
    description: "Donation campaigns",
  },
  {
    label: "Certificates",
    to: "/donor/certificates",
    icon: Award,
    description: "Donation certificates",
  },
  {
    label: "Profile",
    to: "/donor/profile",
    icon: UserRound,
    description: "Personal information",
  },
];

const DonorDashboard = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const [profile, setProfile] = useState<DonorProfileResponse | null>(null);

  const [recommendedEvents, setRecommendedEvents] = useState<
    DonorEventResponse[]
  >([]);

  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [isEventLoading, setIsEventLoading] = useState(true);

  const [processingEventId, setProcessingEventId] = useState<number | null>(
    null,
  );

  const [profileError, setProfileError] = useState("");

  const [eventError, setEventError] = useState("");

  const [eventSuccess, setEventSuccess] = useState("");

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isDashboardOverview =
    location.pathname === "/donor" || location.pathname === "/donor/";

  const currentNavigationItem =
    sidebarLinks.find((item) => {
      if (item.end) {
        return (
          location.pathname === item.to || location.pathname === `${item.to}/`
        );
      }

      return location.pathname.startsWith(item.to);
    }) ?? sidebarLinks[0];

  const loadProfile = useCallback(async (): Promise<void> => {
    try {
      setIsProfileLoading(true);

      setProfileError("");

      const data = await getDonorProfile();

      setProfile(data);
    } catch (error) {
      console.error("Error fetching donor profile:", error);

      setProfile(null);

      setProfileError(
        getApiErrorMessage(error, "Unable to load your donor profile."),
      );
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  const loadRecommendedEvents = useCallback(async (): Promise<void> => {
    try {
      setIsEventLoading(true);

      setEventError("");

      const response = await getRecommendedDonorEvents();

      console.log("Recommended donor events:", response);

      setRecommendedEvents(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching recommended donor events:", error);

      setRecommendedEvents([]);

      setEventError(
        getApiErrorMessage(error, "Unable to load donation events."),
      );
    } finally {
      setIsEventLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isDashboardOverview) {
      return;
    }

    void loadProfile();

    void loadRecommendedEvents();
  }, [isDashboardOverview, loadProfile, loadRecommendedEvents]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!eventSuccess) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setEventSuccess("");
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [eventSuccess]);

  const handleRegisterEvent = async (
    event: DonorEventResponse,
  ): Promise<void> => {
    const eventId = getEventId(event);

    if (eventId === null) {
      setEventError("This donation event does not have a valid ID.");

      return;
    }

    try {
      setProcessingEventId(eventId);

      setEventError("");

      setEventSuccess("");

      await registerDonorForEvent(eventId);

      setEventSuccess(`You successfully registered for "${event.eventTitle}".`);

      await loadRecommendedEvents();
    } catch (error) {
      console.error("Failed to register for donation event:", error);

      setEventError(
        getApiErrorMessage(
          error,
          "Unable to register for this donation event.",
        ),
      );
    } finally {
      setProcessingEventId(null);
    }
  };

  const handleCancelEvent = async (
    event: DonorEventResponse,
  ): Promise<void> => {
    const eventId = getEventId(event);

    if (eventId === null) {
      setEventError("This donation event does not have a valid ID.");

      return;
    }

    try {
      setProcessingEventId(eventId);

      setEventError("");

      setEventSuccess("");

      await cancelDonorEventRegistration(eventId);

      setEventSuccess(
        `Your registration for "${event.eventTitle}" was cancelled.`,
      );

      await loadRecommendedEvents();
    } catch (error) {
      console.error("Failed to cancel event registration:", error);

      setEventError(
        getApiErrorMessage(error, "Unable to cancel this registration."),
      );
    } finally {
      setProcessingEventId(null);
    }
  };

  const handleLogout = (): void => {
  navigate("/logout", {
    replace: true,
  });
};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarCollapsed ? "lg:w-20" : "lg:w-72"} lg:translate-x-0`}
      >
        {/* Sidebar branding */}
        <div className="flex h-24 items-center justify-between border-b border-slate-100 px-5">
          <NavLink to="/donor" className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/20">
              <Droplet className="h-6 w-6 fill-current" />
            </span>

            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-2xl font-black tracking-[-0.045em] text-slate-950">
                  Life
                  <span className="text-red-600">Link</span>
                </p>

                <p className="mt-0.5 truncate text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Donor Portal
                </p>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {!sidebarCollapsed && (
            <p className="mb-3 px-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Donor navigation
            </p>
          )}

          <div className="space-y-1.5">
            {sidebarLinks.map(({ label, to, icon: Icon, description, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={sidebarCollapsed ? label : undefined}
                className={({ isActive }) =>
                  `group relative flex w-full items-center rounded-xl text-left transition ${
                    sidebarCollapsed
                      ? "justify-center px-2 py-3.5"
                      : "gap-3.5 px-3.5 py-3"
                  } ${
                    isActive
                      ? "bg-red-600 text-white shadow-md shadow-red-600/15"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 shrink-0 ${
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-red-600"
                      }`}
                    />

                    {!sidebarCollapsed && (
                      <>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-extrabold">
                            {label}
                          </span>

                          <span
                            className={`mt-1 block truncate text-[11px] font-medium ${
                              isActive ? "text-red-100" : "text-slate-400"
                            }`}
                          >
                            {description}
                          </span>
                        </span>

                        {isActive && (
                          <ChevronRight className="h-4 w-4 text-red-100" />
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            title={sidebarCollapsed ? "Logout" : undefined}
            className={`flex w-full items-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-700 ${
              sidebarCollapsed ? "justify-center p-3.5" : "gap-3.5 px-3.5 py-3"
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0" />

            {!sidebarCollapsed && (
              <div className="text-left">
                <p className="text-sm font-extrabold">Logout</p>

                <p className="mt-1 text-[10px] font-medium text-slate-400">
                  End current session
                </p>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSidebarCollapsed((current) => !current)}
            className="mt-2 hidden w-full items-center justify-center rounded-xl border border-slate-200 py-3 text-slate-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600 lg:flex"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <div className="flex items-center gap-2">
                <PanelLeftClose className="h-5 w-5" />

                <span className="text-[11px] font-bold">Collapse sidebar</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main dashboard */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-24 items-center justify-between gap-5 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <button
                type="button"
                aria-label="Open sidebar"
                onClick={() => setMobileSidebarOpen(true)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-red-600 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <span>Donor</span>

                  <ChevronRight className="h-3.5 w-3.5" />

                  <span className="truncate text-red-600">
                    {currentNavigationItem.label}
                  </span>
                </div>

                <h1 className="mt-1.5 truncate text-2xl font-black tracking-[-0.035em] text-slate-950">
                  {currentNavigationItem.label}
                </h1>

                <p className="mt-1 hidden truncate text-sm font-medium text-slate-500 sm:block">
                  {currentNavigationItem.description}
                </p>
              </div>
            </div>

            {/* Header account details */}
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3.5 py-2 text-[11px] font-black text-red-700 sm:inline-flex">
                <Droplet className="h-4 w-4 fill-current" />

                {formatBloodType(profile?.bloodType)}
              </span>

              <div className="hidden  min-w-0 sm:block">
                <p className="max-w-[200px] truncate px-5 py-2 text-sm font-black text-slate-900">
                  {profile?.fullName ?? "LifeLink Donor"}
                </p>

                <p className="mt-1 text-[10px]  font-bold uppercase tracking-wider text-slate-400">
                  Donor ID {profile?.donorCode ?? "--"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main page content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-[1380px]">
            {isDashboardOverview ? (
              isProfileLoading ? (
                <DashboardLoadingState />
              ) : profileError ? (
                <DashboardErrorState
                  message={profileError}
                  onRetry={() => void loadProfile()}
                />
              ) : profile ? (
                <>
                  <DashboardOverview
                    donorCode={profile.donorCode}
                    eligible={profile.eligible}
                    donationCount={profile.donationCount ?? 0}
                    lastDonationDate={profile.lastDonationDate ?? null}
                    donationHistoryType={profile.donationHistoryType}
                  />

                  <section className="mt-7 space-y-5">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.17em] text-red-600">
                          Nearby opportunities
                        </p>

                        <h2 className="mt-1.5 text-2xl font-black tracking-[-0.035em] text-slate-950">
                          Requests and Donation Missions
                        </h2>

                        <p className="mt-1.5 text-sm font-medium text-slate-500">
                          {isEventLoading
                            ? "Loading matching donation events..."
                            : `${recommendedEvents.length} matching donation event${
                                recommendedEvents.length === 1 ? "" : "s"
                              } available.`}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => void loadRecommendedEvents()}
                          disabled={isEventLoading}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <RefreshCcw
                            className={`h-4 w-4 ${
                              isEventLoading ? "animate-spin" : ""
                            }`}
                          />
                          Refresh Events
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate("/donor/private-bookings")}
                          disabled={!profile?.eligible}
                          title={
                            profile?.eligible
                              ? "Book a private hospital donation"
                              : "You are not currently eligible to donate"
                          }
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-black text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          <CalendarClock className="h-4 w-4" />

                          {profile?.eligible
                            ? "Book a Donation"
                            : "Not Eligible"}
                        </button>
                      </div>
                    </header>

                    {eventSuccess && (
                      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                        <p className="text-sm font-bold text-emerald-800">
                          {eventSuccess}
                        </p>
                      </div>
                    )}

                    <div className="grid items-start gap-5 xl:grid-cols-2">
                      {isEventLoading && (
                        <EventMissionCard
                          event={null}
                          isLoading
                          onRegister={() => undefined}
                          onCancel={() => undefined}
                        />
                      )}

                      {isEventLoading && (
                        <EventMissionCard
                          event={null}
                          isLoading
                          onRegister={() => undefined}
                          onCancel={() => undefined}
                        />
                      )}

                      {!isEventLoading && recommendedEvents.length === 0 && (
                        <EventMissionCard
                          event={null}
                          onRegister={handleRegisterEvent}
                          onCancel={handleCancelEvent}
                        />
                      )}

                      {!isEventLoading &&
                        recommendedEvents.map((event) => {
                          const eventId = getEventId(event);

                          return (
                            <EventMissionCard
                              key={
                                eventId ??
                                `${event.eventTitle}-${event.eventDate}-${event.startTime}`
                              }
                              event={event}
                              isSubmitting={
                                eventId !== null &&
                                processingEventId === eventId
                              }
                              onRegister={handleRegisterEvent}
                              onCancel={handleCancelEvent}
                            />
                          );
                        })}
                    </div>
                  </section>
                </>
              ) : null
            ) : (
              <Outlet />
            )}
          </div>
        </main>

        <AlertModal
          open={Boolean(eventError)}
          type="error"
          title="Event Operation Failed"
          message={eventError}
          buttonLabel="Close"
          onClose={() => setEventError("")}
        />
      </div>
    </div>
  );
};

const DashboardLoadingState = () => {
  return (
    <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
      <div className="text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-red-100 border-t-red-600" />

        <p className="mt-4 text-sm font-bold text-slate-500">
          Loading donor dashboard...
        </p>
      </div>
    </div>
  );
};

const DashboardErrorState = ({
  message,
  onRetry,
}: {
  message: string;

  onRetry: () => void;
}) => {
  return (
    <div className="flex min-h-[350px] items-center justify-center rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
      <div>
        <TriangleAlert className="mx-auto h-10 w-10 text-red-600" />

        <p className="mt-4 text-lg font-black text-red-700">
          Unable to load dashboard
        </p>

        <p className="mt-2 text-sm font-medium text-red-600">{message}</p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-xs font-black text-white transition hover:bg-red-700"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
};

const getEventId = (event: DonorEventResponse): number | null => {
  const eventWithId = event as DonorEventWithPossibleIds;

  const eventId = eventWithId.id ?? eventWithId.eventId;

  return typeof eventId === "number" && Number.isInteger(eventId) && eventId > 0
    ? eventId
    : null;
};

const formatBloodType = (bloodType?: string): string => {
  if (!bloodType) {
    return "--";
  }

  const labels: Record<string, string> = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
  };

  return labels[bloodType] ?? bloodType;
};

const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const responseData = error.response?.data as
    | {
        detail?: string;

        message?: string;

        error?: string;
      }
    | undefined;

  return (
    responseData?.detail ||
    responseData?.message ||
    responseData?.error ||
    fallbackMessage
  );
};

export default DonorDashboard;
