import { NotificationsPage } from "@/components/notifications-page";
import { PortalShell } from "@/components/portal-shell";

export default function NotificationsRoute() {
  return (
    <PortalShell>
      <NotificationsPage />
    </PortalShell>
  );
}
