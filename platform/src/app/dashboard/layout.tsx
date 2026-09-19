import { redirect } from "next/navigation";
import AppShell from "@/components/app/AppShell";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth/session";
import { getCourseData, hasCourseAccess } from "@/lib/course/data";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const [profile, hasAccess, course] = await Promise.all([
    getCurrentProfile(user.id),
    hasCourseAccess(user.id),
    getCourseData(user.id),
  ]);

  return (
    <AppShell
      name={profile?.full_name || ""}
      email={profile?.email || user.email || ""}
      isAdmin={Boolean(profile?.is_admin)}
      hasAccess={hasAccess}
      progressPercent={course.totals.percent}
    >
      {children}
    </AppShell>
  );
}
