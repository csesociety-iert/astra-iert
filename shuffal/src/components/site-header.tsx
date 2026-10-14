"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  CalendarCheck,
  ChartNoAxesCombined,
  CircleHelp,
  Headset,
  House,
  Menu,
  X,
} from "lucide-react";
import { NotificationNavLink } from "@/components/notification-nav-link";

const navItems = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/problems", label: "Questions", icon: CircleHelp },
  { href: "/profile", label: "Progress", icon: ChartNoAxesCombined },
  { href: "/dpp", label: "DPP", icon: CalendarCheck },
  { href: "/quiz", label: "Quiz", icon: Brain },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 48);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <header className={`site-header sticky top-0 z-50 border-b border-slate-800/90 bg-slate-950/80 backdrop-blur-xl${isScrolled ? " is-scrolled" : ""}${mobileMenuOpen ? " is-mobile-menu-open" : ""}`}>
      <div className="site-header-inner mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="dashboard-brand site-header-brand" aria-label="ASTRA home">
          <span>ASTRA</span>
          <small>CSE SOCIETY</small>
        </Link>
        <button
          className="site-header-menu-toggle"
          type="button"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="site-header-navigation"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>

        <nav className="site-header-nav flex items-center gap-6 text-sm text-slate-300" id="site-header-navigation" aria-label="Main navigation">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href || (href === "/problems" && pathname.startsWith("/problems")) || (href === "/profile" && pathname.startsWith("/profile")) ? "page" : undefined}
              className="transition hover:text-cyan-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </Link>
          ))}
          <NotificationNavLink onClick={() => setMobileMenuOpen(false)} />
          <a href="mailto:csesociety.iert@gmail.com?subject=ASTRA%20Doubt%20and%20Support" onClick={() => setMobileMenuOpen(false)}><Headset size={15} aria-hidden="true" />Doubt and support</a>
        </nav>
      </div>
    </header>
  );
}
