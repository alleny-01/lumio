import { motion } from "framer-motion";
import { ArrowRight, BookOpenCheck, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { DashboardCourse } from "../types";

interface ContinueLearningCardProps {
  courses: DashboardCourse[];
}

function pickNextCourse(courses: DashboardCourse[]) {
  return (
    courses.find((course) => course.status === "in-progress") ??
    courses.find((course) => course.status === "not-started") ??
    courses[0]
  );
}

export function ContinueLearningCard({
  courses,
}: ContinueLearningCardProps): React.JSX.Element {
  const nextCourse = pickNextCourse(courses);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="overflow-hidden rounded-sm  bg-surface-container-lowest shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] transition-colors hover:border-primary/25"
    >
      {nextCourse ? (
        <Link to={nextCourse.href} className="group grid h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:grid-cols-[150px_1fr]">
          <div className="relative min-h-32 overflow-hidden bg-surface-container-low">
            <img
              src={nextCourse.image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute left-3 top-3 flex size-8 items-center justify-center rounded-sm bg-surface-container-lowest/90 text-primary">
              <PlayCircle className="size-4" />
            </div>
          </div>

          <div className="flex min-w-0 flex-col justify-between p-4">
            <div>
              <p className="text-[10px] font-light uppercase tracking-[0.2em] text-on-surface-variant">
                Continue learning
              </p>
              <h2 className="mt-2 line-clamp-2 text-[14px] font-medium leading-5 text-on-surface">
                {nextCourse.title}
              </h2>
              <p className="mt-1 text-[11px] font-light text-on-surface-variant">
                {nextCourse.completedLessons}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{
                    width: `${Math.round(nextCourse.progress * 100)}%`,
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-light text-on-surface-variant">
                <span>{Math.round(nextCourse.progress * 100)}% complete</span>
                <span className="inline-flex items-center gap-1 text-primary">
                  Resume
                  <ArrowRight className="size-3" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex h-full items-center gap-4 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-primary-fixed text-primary">
            <BookOpenCheck className="size-5" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-on-surface">
              No active course yet
            </p>
            <Link
              to="/courses"
              className="mt-1 inline-flex items-center gap-1 rounded-sm text-[11px] font-light text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              Find a course
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      )}
    </motion.article>
  );
}
