"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const items = [
  { href: "/", label: "Sign in" },
  { href: "/register", label: "Create account" },
  { href: "/problems", label: "Explore problems" },
];

export function AuthMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="auth-menu">
      <button
        className="auth-menu-button"
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      {open && (
        <nav className="auth-menu-popover" aria-label="Main navigation">
          {items.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
