import type { CourseDetail } from "../types/types";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { getYoutubeEmbedUrl } from "@/features/courses/api/courseData";
import { motion, type Variants } from "framer-motion";

interface CourseHeroProps {
  course: CourseDetail;
  isEnrolled: boolean;
  isEnrolling: boolean;
  onEnroll: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export const CourseHero: React.FC<CourseHeroProps> = ({
  course,
  isEnrolled,
  isEnrolling,
  onEnroll,
}) => {
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons, 0);
  const previewVideoEmbed = course.previewVideoUrl
    ? getYoutubeEmbedUrl(course.previewVideoUrl)
    : "https://www.youtube.com/embed/dQw4w9WgXcQ";

  return (
    <section className="bg-surface px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/courses"
          className="mb-6 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to catalog
        </Link>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="inline-flex items-center text-[11px] font-medium uppercase tracking-wider">
              Category: {course.category}
            </div>

            <h1 className="text-2xl font-light leading-snug tracking-tight text-foreground sm:text-[32px]">
              {course.title}
            </h1>

            <p className="text-[11px] leading-relaxed">{course.description}</p>

            {course.courseImage && (
              <div className="group relative overflow-hidden rounded-sm border border-outline-variant/30 bg-surface-container-lowest shadow-[0_12px_32px_-22px_rgba(15,23,42,0.2)] transition-all hover:shadow-[0_18px_40px_-20px_rgba(15,23,42,0.28)]">
                <div className="relative aspect-[21/9] w-full overflow-hidden bg-surface-container-low">
                  <img
                    src={course.courseImage}
                    alt={`${course.title} thumbnail`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="rounded-full bg-black/40 backdrop-blur-md px-2.5 py-1 text-[10px] text-white/90 border border-white/10">
                      Featured Course
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
              <span className="rounded-sm bg-surface-container-low px-2.5 py-1">
                {course.duration}
              </span>
              <span>•</span>
              <span className="rounded-sm bg-surface-container-low px-2.5 py-1">
                Updated {course.lastUpdated}
              </span>
              <span>•</span>
              <span className="rounded-sm bg-surface-container-low px-2.5 py-1">
                {totalLessons} lessons
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="space-y-4 bg-surface-container-lowest shadow-[0_12px_30px_-24px_rgba(15,23,42,0.15)]"
          >
            <div className="overflow-hidden rounded-sm bg-surface-container-low">
              <iframe
                src={previewVideoEmbed}
                title={`${course.title} Preview`}
                className="aspect-video w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 p-3 w-full">
              <Button
                variant="default"
                size="lg"
                disabled={isEnrolling}
                onClick={onEnroll}
                className="w-full sm:flex-1 h-10 text-[13px]"
              >
                {isEnrolled
                  ? "Continue Learning"
                  : isEnrolling
                    ? "Enrolling..."
                    : "Enroll Now"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:flex-1 h-10 text-[13px]"
                onClick={() =>
                  document
                    .getElementById("course-syllabus")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Preview Syllabus
              </Button>
            </div>

            <p className="text-center p-2 text-[12px] text-muted-foreground">
              {course.enrolledCount} people clicked on enroll
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
