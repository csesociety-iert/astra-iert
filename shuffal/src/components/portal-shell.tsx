import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";

export function PortalShell({ children }: { children: ReactNode }) {
  return (
    <div className="portal-shell">
      <SiteHeader />
      {children}
    </div>
  );
}
