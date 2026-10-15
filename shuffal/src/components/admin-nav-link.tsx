"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/api";

type AdminNavLinkProps = {
  onClick?: () => void;
};

export function AdminNavLink({ onClick }: AdminNavLinkProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest<{ is_admin: boolean }>("/api/auth/access")
      .then(({ is_admin: admin }) => {
        if (active) setIsAdmin(admin);
      })
      .catch(() => {
        if (active) setIsAdmin(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      aria-current={pathname === "/admin" ? "page" : undefined}
      onClick={onClick}
    >
      <ShieldCheck size={15} aria-hidden="true" />
      Create questions
    </Link>
  );
}
