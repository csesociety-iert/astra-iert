"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, Menu, X } from "lucide-react";
import { ProfileDropdown } from "@/components/profile-dropdown";

type DashboardTopbarProps = {
  name: string;
  accountType: string;
  avatarUrl?: string | null;
  activeHome?: boolean;
  onSignOut: () => void | Promise<void>;
};

export function DashboardTopbar({
  name,
  accountType,
  avatarUrl,
  activeHome = false,
  onSignOut,
}: DashboardTopbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className={`dashboard-topbar${mobileMenuOpen ? " is-mobile-menu-open" : ""}`}>
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
      <nav
        className="dashboard-nav"
        id="dashboard-navigation"
        aria-label="Main navigation"
      >
        <Link href="/dashboard" aria-current={activeHome ? "page" : undefined} onClick={closeMobileMenu}>Home</Link>
        <a href="/courses/rohit-negi-dsa-gen-ai-courses.pdf" target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu}>
          Courses
        </a>
        <Link href="/problems" onClick={closeMobileMenu}>Practice</Link>
        <Link href="/problems" onClick={closeMobileMenu}>CodeArena</Link>
        <span className="dashboard-nav-unavailable" aria-disabled="true" title="Coming soon">Quiz</span>
        <span className="dashboard-nav-unavailable" aria-disabled="true" title="Coming soon">System Design</span>
        <Link href="/contests" onClick={closeMobileMenu}>Contests</Link>
      </nav>
      <div className="dashboard-account">
        <span className="dashboard-streak" aria-label="0 day streak">
          <Flame size={14} aria-hidden="true" />
          <span>0</span>
        </span>
        <ProfileDropdown
          name={name}
          accountType={accountType}
          avatarUrl={avatarUrl}
          onSignOut={onSignOut}
        />
      </div>
    </header>
  );
}
