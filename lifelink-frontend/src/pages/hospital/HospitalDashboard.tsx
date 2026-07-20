import { useEffect, useState, type ComponentType } from "react";

import { matchPath, Outlet, useLocation, useNavigate } from "react-router-dom";

import type { LucideProps } from "lucide-react";

import {
  Award,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageOpen,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";

import HospitalDashboardOverview from "./HospitalDashboardOverview";

import HospitalProfileCard from "./components/HospitalProfileCard";

import HospitalDonationEventsPage from "./components/HospitalDonationEventsPage";

import CreateDonationEventPage from "./components/CreateDonationEventPage";

import HospitalCertificatesPage from "./components/HospitalCertificatePage";

import HospitalInventoryPage from "./components/HospitalInventoryPage";

import HospitalPrivateBookingPage from "./components/HospitalPrivateBookingPage";

import { useAuthStore } from "@/store/authState";

import type { HospitalProfileResponse } from "@/types/profile";

import { getHospitalProfile } from "@/services/hospital/hospitalProfileService";

type DashboardSection =
  | "overview"
  | "bookings"
  | "events"
  | "create-event"
  | "inventory"
  | "certificates"
  | "profile";

type SidebarIcon = ComponentType<LucideProps>;

interface NavigationItem {
  id: Exclude<DashboardSection, "create-event">;

  label: string;
  description: string;
  icon: SidebarIcon;
  badge?: number;
}

const navigationItems: NavigationItem[] = [
  {
    id: "overview",
    label: "Dashboard",
    description: "Hospital overview",
    icon: LayoutDashboard,
  },
  {
    id: "events",
    label: "Donation Events",
    description: "Manage blood drives",
    icon: CalendarDays,
  },
  {
    id: "bookings",
    label: "Bookings",
    description: "Manage private donations",
    icon: CalendarClock,
  },
  {
    id: "inventory",
    label: "Blood Inventory",
    description: "Available blood units",
    icon: PackageOpen,
  },
  {
    id: "certificates",
    label: "Certificates",
    description: "Donor certificates",
    icon: Award,
  },
  {
    id: "profile",
    label: "Hospital Profile",
    description: "Organization details",
    icon: Building2,
  },
];

const sectionInformation: Record<
  DashboardSection,
  {
    title: string;
    description: string;
  }
> = {
  overview: {
    title: "Dashboard Overview",
    description:
      "Monitor hospital activity, blood supply, and donor operations.",
  },

  bookings: {
    title: "Private Bookings",
    description: "Manage private blood donation appointments.",
  },

  events: {
    title: "Donation Events",
    description: "Create, edit, and monitor published donation events.",
  },

  "create-event": {
    title: "Create Donation Event",
    description:
      "Save an incomplete event as a draft or publish a completed event.",
  },

  inventory: {
    title: "Blood Inventory",
    description: "Manage available blood units by blood type and expiry date.",
  },

  certificates: {
    title: "Donor Certificates",
    description: "Review certificates generated from completed donations.",
  },

  profile: {
    title: "Hospital Profile",
    description: "Review and update hospital organization information.",
  },
};

const HospitalDashboard = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const [activeSection, setActiveSection] =
    useState<DashboardSection>("overview");

  const [profile, setProfile] = useState<HospitalProfileResponse | null>(null);

  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    let ignoreResult = false;

    const fetchHospitalProfile = async (): Promise<void> => {
      try {
        const profileData = await getHospitalProfile();

        if (!ignoreResult) {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Failed to load hospital profile:", error);
      }
    };

    void fetchHospitalProfile();

    return () => {
      ignoreResult = true;
    };
  }, []);

  const isEventListRoute = Boolean(
    matchPath(
      {
        path: "/hospital/events",
        end: true,
      },
      location.pathname,
    ),
  );

  const isEventDetailsRoute = Boolean(
    matchPath(
      {
        path: "/hospital/events/:eventId",
        end: true,
      },
      location.pathname,
    ),
  );

  const isBookingRoute = Boolean(
    matchPath(
      {
        path: "/hospital/bookings",
        end: true,
      },
      location.pathname,
    ),
  );

  const isEventRoute = isEventListRoute || isEventDetailsRoute;

  const isCertificateListRoute = Boolean(
    matchPath(
      {
        path: "/hospital/certificates",
        end: true,
      },
      location.pathname,
    ),
  );

  const isCertificateDetailsRoute = Boolean(
    matchPath(
      {
        path: "/hospital/certificates/:certificateId",
        end: true,
      },
      location.pathname,
    ),
  );

  const isCertificateRoute =
    isCertificateListRoute || isCertificateDetailsRoute;

  const isInventoryListRoute = Boolean(
    matchPath(
      {
        path: "/hospital/inventory",
        end: true,
      },
      location.pathname,
    ),
  );

  const isInventoryDetailsRoute = Boolean(
    matchPath(
      {
        path: "/hospital/inventory/details",
        end: true,
      },
      location.pathname,
    ),
  );

  const isInventoryRoute = isInventoryListRoute || isInventoryDetailsRoute;

  useEffect(() => {
    if (isBookingRoute) {
      setActiveSection("bookings");
      return;
    }

    if (isEventRoute) {
      setActiveSection("events");
      return;
    }

    if (isCertificateRoute) {
      setActiveSection("certificates");
      return;
    }

    if (isInventoryRoute) {
      setActiveSection("inventory");
      return;
    }

    if (location.pathname === "/hospital/profile") {
      setActiveSection("profile");
      return;
    }

    if (location.pathname === "/hospital/dashboard") {
  
      setActiveSection((currentSection) =>
        currentSection === "create-event" ? currentSection : "overview",
      );
    }
  }, [
    isBookingRoute,
    isEventRoute,
    isCertificateRoute,
    isInventoryRoute,
    location.pathname,
  ]);

  const currentSection = isEventDetailsRoute
    ? {
        title: "Donation Event Details",

        description:
          "Review event information and manage registered donor outcomes.",
      }
    : isCertificateDetailsRoute
      ? {
          title: "Certificate Details",

          description: "Review, print, or revoke this donation certificate.",
        }
      : isInventoryDetailsRoute
        ? {
            title: "Detailed Inventory",

            description:
              "Search, filter, and review individual blood inventory units.",
          }
        : isBookingRoute
          ? {
              title: "Private Bookings",

              description: "Manage private blood donations.",
            }
          : sectionInformation[activeSection];

  const openSection = (section: DashboardSection): void => {
    setActiveSection(section);

    setMobileSidebarOpen(false);

    if (section === "create-event") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (section === "bookings") {
      navigate("/hospital/bookings");
    } else if (section === "events") {
      navigate("/hospital/events");
    } else if (section === "certificates") {
      navigate("/hospital/certificates");
    } else if (section === "inventory") {
      navigate("/hospital/inventory");
    } else if (section === "profile") {
      navigate("/hospital/profile");
    } else {
      navigate("/hospital/dashboard");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openCreateDonationEvent = (): void => {
    setEditingEventId(null);

    openSection("create-event");
  };

  const openEditDonationEvent = (eventId: number): void => {
    setEditingEventId(eventId);

    openSection("create-event");
  };

  const finishDonationEventForm = (): void => {
    setEditingEventId(null);

    openSection("events");
  };

 const handleLogout = (): void => {
  navigate("/logout", {
    replace: true,
  });
};

  const renderDashboardContent = () => {
    switch (activeSection) {
      case "overview":
        return <HospitalDashboardOverview />;

      case "bookings":
        return <HospitalPrivateBookingPage />;

      case "events":
        return (
          <HospitalDonationEventsPage
            onCreateEvent={openCreateDonationEvent}
            onEditEvent={openEditDonationEvent}
          />
        );

      case "create-event":
        return (
          <CreateDonationEventPage
            eventId={editingEventId}
            onCancel={finishDonationEventForm}
            onSaved={finishDonationEventForm}
          />
        );

      case "inventory":
        return <HospitalInventoryPage />;

      case "certificates":
        return <HospitalCertificatesPage />;

      case "profile":
        return <HospitalProfileCard />;

      default:
        return null;
    }
  };

  const shouldRenderOutlet =
    isEventDetailsRoute || isCertificateDetailsRoute || isInventoryDetailsRoute;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden print:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-all duration-300 print:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarCollapsed ? "lg:w-20" : "lg:w-72"} lg:translate-x-0`}
      >
        {/* Sidebar branding */}
        <div className="flex h-24 items-center justify-between border-b border-slate-100 px-5">
          <button
            type="button"
            onClick={() => openSection("overview")}
            className="flex min-w-0 items-center gap-3"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/20">
              <HeartPulse className="h-6 w-6" />
            </span>

            {!sidebarCollapsed && (
              <div className="min-w-0 text-left">
                <p className="text-2xl font-black tracking-[-0.045em] text-slate-950">
                  Life
                  <span className="text-red-600">Link</span>
                </p>

                <p className="mt-0.5 truncate text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Hospital Portal
                </p>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {!sidebarCollapsed && (
            <p className="mb-3 px-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Hospital management
            </p>
          )}

          <div className="space-y-1.5">
            {navigationItems.map(
              ({ id, label, description, icon: Icon, badge }) => {
                let isActive = activeSection === id;

                if (id === "events") {
                  isActive =
                    isEventRoute ||
                    activeSection === "events" ||
                    activeSection === "create-event";
                }

                if (id === "certificates") {
                  isActive =
                    isCertificateRoute || activeSection === "certificates";
                }

                if (id === "bookings") {
                  isActive = isBookingRoute || activeSection === "bookings";
                }

                if (id === "inventory") {
                  isActive = isInventoryRoute || activeSection === "inventory";
                }

                return (
                  <button
                    key={id}
                    type="button"
                    title={sidebarCollapsed ? label : undefined}
                    onClick={() => openSection(id)}
                    className={`group relative flex w-full items-center rounded-xl text-left transition ${
                      sidebarCollapsed
                        ? "justify-center px-2 py-3.5"
                        : "gap-3.5 px-3.5 py-3"
                    } ${
                      isActive
                        ? "bg-red-600 text-white shadow-md shadow-red-600/15"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
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

                        {badge !== undefined && (
                          <span
                            className={`flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-black ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {badge}
                          </span>
                        )}

                        {isActive && (
                          <ChevronRight className="h-4 w-4 text-red-100" />
                        )}
                      </>
                    )}

                    {sidebarCollapsed && badge !== undefined && (
                      <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </button>
                );
              },
            )}
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

      {/* Main dashboard area */}
      <div
        className={`min-h-screen transition-all duration-300 print:pl-0 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        {/* Dashboard header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl print:hidden">
          <div className="flex min-h-24 items-center justify-between gap-5 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open sidebar"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-red-600 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <span>Hospital</span>

                  <ChevronRight className="h-3.5 w-3.5" />

                  <span className="truncate text-red-600">
                    {currentSection.title}
                  </span>
                </div>

                <h1 className="mt-1.5 truncate text-2xl font-black tracking-[-0.035em] text-slate-950">
                  {currentSection.title}
                </h1>

                <p className="mt-1 hidden truncate text-sm font-medium text-slate-500 sm:block">
                  {currentSection.description}
                </p>
              </div>
            </div>

            {/* Hospital information */}
            <div className="flex items-center gap-2">
              <div className="hidden rounded-2xl border border-red-100 bg-red-50/70 px-4 py-3.5 sm:block">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm ring-1 ring-red-100">
                    <Building2 className="h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <p className="max-w-[220px] truncate text-sm font-black text-slate-950">
                      {profile?.hospitalName ?? "Hospital Account"}
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />

                      <span className="text-[11px] font-bold text-emerald-700">
                        Approved hospital
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-7 print:p-0">
          {shouldRenderOutlet ? <Outlet /> : renderDashboardContent()}
        </main>
      </div>
    </div>
  );
};

export default HospitalDashboard;
