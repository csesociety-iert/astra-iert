"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesCombined, CircleHelp, Flame, House, Brain, CalendarCheck, Headset, Menu, X } from "lucide-react";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { NotificationNavLink } from "@/components/notification-nav-link";
import { apiRequest } from "@/lib/api";

type DashboardTopbarProps = {
  name?: string;
  accountType?: string;
  avatarUrl?: string | null;
  activeHome?: boolean;
  onSignOut?: () => void | Promise<void>;
};

export function DashboardTopbar({
  name,
  accountType,
  avatarUrl,
  activeHome = false,
  onSignOut,
}: DashboardTopbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);
  const [streakError, setStreakError] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const hasAccount = name !== undefined && accountType !== undefined && onSignOut !== undefined;
  const account = name !== undefined && accountType !== undefined && onSignOut
    ? { name, accountType, onSignOut }
    : null;

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 48);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (!hasAccount) return;

    let active = true;
    apiRequest<{ current_streak: number }>("/api/streak")
      .then(({ current_streak: currentStreak }) => {
        if (active) setStreak(currentStreak);
      })
      .catch(() => {
        if (active) setStreakError(true);
      });

    return () => {
      active = false;
    };
  }, [hasAccount]);

  return (
    <header className={`dashboard-topbar${isScrolled ? " is-scrolled" : ""}${mobileMenuOpen ? " is-mobile-menu-open" : ""}`}>
      <button
        className="dashboard-mobile-menu-toggle"
        type="button"
        aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileMenuOpen}
        aria-controls="dashboard-navigation"
        onClick={() => setMobileMenuOpen((open) => !open)}
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <Link className="dashboard-brand" href="/dashboard" onClick={closeMobileMenu} aria-label="ASTRA home">
        <span>ASTRA</span>
        <small>CSE SOCIETY</small>
      </Link>
      <nav
        className="dashboard-nav"
        id="dashboard-navigation"
        aria-label="Main navigation"
      >
        <Link href="/dashboard" aria-current={activeHome || pathname === "/dashboard" ? "page" : undefined} onClick={closeMobileMenu}><House size={15} aria-hidden="true" />Home</Link>
        <Link href="/problems" aria-current={pathname.startsWith("/problems") ? "page" : undefined} onClick={closeMobileMenu}><CircleHelp size={15} aria-hidden="true" />Questions</Link>
        <Link href="/profile" aria-current={pathname === "/profile" ? "page" : undefined} onClick={closeMobileMenu}><ChartNoAxesCombined size={15} aria-hidden="true" />Progress</Link>
        <Link href="/dpp" aria-current={pathname === "/dpp" ? "page" : undefined} onClick={closeMobileMenu}><CalendarCheck size={15} aria-hidden="true" />DPP</Link>
        <Link href="/quiz" aria-current={pathname === "/quiz" ? "page" : undefined} onClick={closeMobileMenu}><Brain size={15} aria-hidden="true" />Quiz</Link>
        <NotificationNavLink onClick={closeMobileMenu} />
        <a href="mailto:csesociety.iert@gmail.com?subject=ASTRA%20Doubt%20and%20Support" onClick={closeMobileMenu}><Headset size={15} aria-hidden="true" />Doubt and support</a>
      </nav>
      {account ? (
        <div className="dashboard-account">
          <span
            className={`dashboard-streak${streak !== null && streak > 0 ? " is-active" : ""}`}
            aria-label={streakError ? "Streak unavailable" : `${streak ?? "Loading"} day streak`}
            title={streakError ? "Could not load your streak" : `${streak ?? "Loading"} day streak`}
          >
            <Flame size={14} aria-hidden="true" />
            <span>{streakError ? "!" : streak ?? "…"}</span>
          </span>
          <ProfileDropdown
            name={account.name}
            accountType={account.accountType}
            avatarUrl={avatarUrl}
            onSignOut={account.onSignOut}
          />
        </div>
      ) : (
        <div className="dashboard-account dashboard-account-placeholder" aria-hidden="true" />
      )}
    </header>
  );
}
