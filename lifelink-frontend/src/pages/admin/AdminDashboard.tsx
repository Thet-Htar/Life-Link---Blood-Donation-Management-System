import { useEffect, useState, type ComponentType } from "react";

import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import type { LucideProps } from "lucide-react";

import {
  Bell,
  Building2,
  ChevronRight,
  Droplet,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
  X,
} from "lucide-react";

import { useAuthStore } from "@/store/authState";

type SidebarIcon = ComponentType<LucideProps>;

interface AdminNavigationItem {
  label: string;
  description: string;
  to: string;
  icon: SidebarIcon;
  end?: boolean;
}

interface SectionInformation {
  title: string;
  description: string;
}

const navigationItems: AdminNavigationItem[] = [
  {
    label: "Dashboard",
    description: "System overview",
    to: "/admin/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Hospital Approvals",
    description: "Pending registrations",
    to: "/admin/approvals",
    icon: UserRoundCheck,
  },
  {
    label: "Hospitals",
    description: "Manage hospital accounts",
    to: "/admin/hospitals",
    icon: Building2,
  },
  {
    label: "Donors",
    description: "Manage donor accounts",
    to: "/admin/donors",
    icon: UsersRound,
  },
];

const getCurrentSection = (pathname: string): SectionInformation => {
  if (pathname.startsWith("/admin/approvals")) {
    return {
      title: "Hospital Approvals",
      description:
        "Review pending hospital registrations and approve trusted organizations.",
    };
  }

  if (pathname.startsWith("/admin/hospitals")) {
    return {
      title: "Hospital Accounts",
      description: "View registered hospitals and control account access.",
    };
  }

  if (pathname.startsWith("/admin/donors")) {
    return {
      title: "Donor Accounts",
      description: "View registered donors and control account access.",
    };
  }

  return {
    title: "Dashboard Overview",
    description:
      "Monitor hospital approvals, registered accounts, and administrative activity.",
  };
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentSection = getCurrentSection(location.pathname);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = (): void => {
  navigate("/logout", {
    replace: true,
  });
};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden print:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-all duration-300 print:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarCollapsed ? "lg:w-20" : "lg:w-72"} lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="flex h-24 shrink-0 items-center justify-between border-b border-slate-100 px-5">
          <NavLink
            to="/admin/dashboard"
            className="flex min-w-0 items-center gap-3"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/20">
              <Droplet className="h-6 w-6 fill-current" />
            </span>

            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-2xl font-black tracking-[-0.045em] text-slate-950">
                  Life
                  <span className="text-red-600">Link</span>
                </p>

                <p className="mt-0.5 truncate text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Administration
                </p>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            aria-label="Close navigation"
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
              Admin navigation
            </p>
          )}

          <div className="space-y-1.5">
            {navigationItems.map(
              ({ label, description, to, icon: Icon, end }) => (
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
                            <ChevronRight className="h-4 w-4 shrink-0 text-red-100" />
                          )}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              ),
            )}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            title={sidebarCollapsed ? "Log out" : undefined}
            className={`flex w-full items-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-700 ${
              sidebarCollapsed ? "justify-center p-3.5" : "gap-3.5 px-3.5 py-3"
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0" />

            {!sidebarCollapsed && (
              <div className="text-left">
                <p className="text-sm font-extrabold">Log Out</p>

                <p className="mt-1 text-[10px] font-medium text-slate-400">
                  End current session
                </p>
              </div>
            )}
          </button>

          <button
            type="button"
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
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

      {/* Main area */}
      <div
        className={`min-h-screen transition-all duration-300 print:pl-0 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        {/* Top navigation */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl print:hidden">
          <div className="flex min-h-24 items-center justify-between gap-5 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setMobileSidebarOpen(true)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-red-100 hover:bg-red-50 hover:text-red-600 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  <span>Administration</span>

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

            {/* Header status */}
            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 sm:block">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                    <ShieldCheck className="h-5 w-5" />
                  </span>

                  <div>
                    <p className="text-sm font-black text-slate-950">
                      Administrator
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />

                      <span className="text-[11px] font-bold text-emerald-700">
                        Secure session
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                aria-label="Open notifications"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-red-100 hover:bg-red-50 hover:text-red-600"
              >
                <Bell className="h-5 w-5" />

                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
              </button>
            </div>
          </div>
        </header>

        {/* Nested page content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-7 print:p-0">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
