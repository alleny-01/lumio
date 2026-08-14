import { BookOpenCheck, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { DashboardCourse } from "../types";

interface CoursesSectionProps {
  courses: DashboardCourse[];
  title?: string;
  showAllLink?: boolean;
}

export function CoursesSection({
  courses,
  title = "My courses",
  showAllLink = true,
}: CoursesSectionProps) {
  const courseGridClassName =
    courses.length === 1
      ? "grid gap-3"
      : courses.length === 2
        ? "grid gap-3 md:grid-cols-2"
        : "grid gap-3 md:grid-cols-2 xl:grid-cols-3";
  const shouldUseCompactWideCards = courses.length < 3;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-normal">{title}</h2>
        {showAllLink && courses.length > 0 && (
          <Link
            to="/learning"
            className="inline-flex items-center gap-1 rounded-sm text-[13px] font-normal text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            All courses
            <ChevronRight className="size-3.5" />
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-sm  bg-surface-container-lowest px-5 py-8 text-center shadow-[0_8px_20px_-18px_rgba(15,23,42,0.35)]"
        >
          <div className="mx-auto flex size-11 items-center justify-center rounded-sm bg-primary-fixed text-primary">
            <BookOpenCheck className="size-5" />
          </div>
          <h3 className="mt-4 text-[14px] font-normal text-on-surface">
            You don&apos;t have any enrolled courses
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-[12px] font-light leading-6 text-on-surface-variant">
            Enroll in a course now and your learning progress will appear here.
          </p>
          <Link
            to="/courses"
            className="mt-5 inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-[12px] font-medium text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            Browse course catalog
            <ChevronRight className="size-3.5" />
          </Link>
        </motion.div>
      ) : (
        <div className={courseGridClassName}>
          {courses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.25 }}
            >
              <Link
                to={course.href}
                className={`block overflow-hidden rounded-sm bg-surface-container-lowest shadow-[0_8px_20px_-18px_rgba(15,23,42,0.35)] transition-all hover:bg-surface-container-low hover:shadow-[0_18px_36px_-26px_rgba(53,37,205,0.45)] focus-visible:outline-none ${
                  shouldUseCompactWideCards
                    ? "md:grid md:min-h-44 md:grid-cols-[180px_1fr] xl:grid-cols-[220px_1fr]"
                    : ""
                }`}
              >
                <div
                  className={`overflow-hidden bg-surface-container-low ${
                    shouldUseCompactWideCards
                      ? "aspect-4/3 md:aspect-auto md:h-full"
                      : "aspect-4/3"
                  }`}
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>

                <div className="space-y-3 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-light">
                      {course.module}
                    </p>
                    <h3 className="mt-1 text-[12px] font-normal leading-tight text-on-surface">
                      {course.title}
                    </h3>
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
                      <div
                        className="h-full rounded-full bg-primary-container"
                        style={{ width: `${Math.round(course.progress * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 text-[10px] font-light">
                      <p>{course.completedLessons}</p>
                      <span className="capitalize">
                        {course.status.replace("-", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
