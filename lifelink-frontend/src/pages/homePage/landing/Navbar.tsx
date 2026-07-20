import { useEffect, useState } from "react";

import { Link, useLocation } from "react-router-dom";

import { Droplet, Menu, X } from "lucide-react";

interface NavigationItem {
  label: string;
  href: string;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Find a Drive",
    href: "#drives",
  },
  {
    label: "About Us",
    href: "/about",
  },
];

const Navbar = () => {
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = (): void => {
    setMenuOpen(false);
  };

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = (): void => {
      if (window.innerWidth >= 768) {
        closeMenu();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        {/* Brand */}
        <a
          href="#top"
          onClick={closeMenu}
          aria-label="LifeLink home"
          className="group flex items-center gap-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm shadow-red-600/20 transition group-hover:scale-105">
            <Droplet className="h-5 w-5 fill-current" />
          </span>

          <span className="text-xl font-black tracking-[-0.04em] text-slate-950">
            Life
            <span className="text-red-600">Link</span>
          </span>
        </a>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs font-bold text-slate-600 transition hover:text-red-600"
            >
              {item.label}
            </a>
          ))}

          <Link
            to="/login"
            className="text-xs font-bold text-slate-600 transition hover:text-red-600"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-5 text-xs font-black text-white shadow-md shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700"
          >
            Register
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((current) => !current)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile navigation */}
      <div
        id="mobile-navigation"
        className={[
          "overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 md:hidden",
          menuOpen
            ? "max-h-[420px] opacity-100"
            : "max-h-0 border-transparent opacity-0",
        ].join(" ")}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-600"
            >
              {item.label}
            </a>
          ))}

          <Link
            to="/login"
            onClick={closeMenu}
            className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-600"
          >
            Login
          </Link>

          <Link
            to="register"
            onClick={closeMenu}
            className="mt-3 inline-flex h-12 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
