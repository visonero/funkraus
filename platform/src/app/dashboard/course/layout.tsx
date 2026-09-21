import CourseSidebar from "@/components/app/CourseSidebar";
import { getCurrentUser } from "@/lib/auth/session";
import { getCourseData } from "@/lib/course/data";

export default async function CourseLayout({ children }: LayoutProps<"/dashboard/course">) {
  const user = (await getCurrentUser())!;
  const course = await getCourseData(user.id);

  return (
    <div className="course-layout">
      <CourseSidebar modules={course.modules} hasFullAccess={course.hasFullAccess} percent={course.totals.percent} />
      <div className="course-main">{children}</div>
    </div>
  );
}
