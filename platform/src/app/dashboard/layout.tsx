import { redirect } from "next/navigation";
import AppShell from "@/components/app/AppShell";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";
import { getCourseData, hasCourseAccess } from "@/lib/course/data";
import { countUnreadTickets, getFlaggedIds } from "@/lib/course/study";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const [profile, hasAccess, course, unreadTickets, flagged] = await Promise.all([
    getCurrentProfile(user.id),
    hasCourseAccess(user.id),
    getCourseData(user.id),
    countUnreadTickets(user.id),
    getFlaggedIds(user.id),
  ]);

  return (
    <AppShell
      name={profile?.full_name || ""}
      email={profile?.email || user.email || ""}
      isAdmin={Boolean(profile?.is_admin)}
      hasAccess={hasAccess}
      progressPercent={course.totals.percent}
      unreadTickets={unreadTickets}
      flaggedCount={flagged.length}
    >
      {children}
    </AppShell>
  );
}
