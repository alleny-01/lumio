import { useCallback, useContext, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import { motion } from "framer-motion";
import { LMSContext } from "@/contexts/LMSContext";
import {
  deleteCourse,
  getCourseForBuilder,
  listInstructorCourses,
} from "@/shared/api/courses";
import type { Tables } from "@/shared/types/database";
import { CourseBuilderDialog } from "../components/CourseBuilderDialog";
import type { CourseBuilderDraft, InstructorCourse } from "../types";
import { draftFromCourse } from "../utils";

function statusClass(status: Tables<"courses">["status"]) {
  if (status === "published") return "bg-secondary-container text-on-secondary-container";
  if (status === "saved") return "bg-primary-fixed text-on-primary-fixed";
  return "bg-surface-container-high text-on-surface-variant";
}

function InstructorCoursesPage(): React.JSX.Element {
  const { session, setAuthError } = useContext(LMSContext);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [builderDraft, setBuilderDraft] = useState<CourseBuilderDraft | null>(
    null,
  );
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InstructorCourse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCourses = useCallback(async () => {
    if (!session?.user.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await listInstructorCourses(session.user.id);
      if (error) throw error;
      setCourses((data as InstructorCourse[] | null) ?? []);
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Unable to load your authored courses.",
      );
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user.id, setAuthError]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const openBuilder = async (course?: InstructorCourse) => {
    if (course) {
      const { data, error } = await getCourseForBuilder(course.id);
      if (error || !data) {
        setAuthError(error?.message ?? "Unable to load this course for editing.");
        showToast({
          type: "error",
          title: "Edit Failed",
          description: error?.message ?? "Unable to load this course for editing.",
        });
        return;
      }
      setBuilderDraft(draftFromCourse(data));
    } else {
      setBuilderDraft(null);
    }
    setIsBuilderOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const { error } = await deleteCourse(deleteTarget.id);
    if (error) {
      setAuthError(error.message);
      showToast({
        type: "error",
        title: "Delete Failed",
        description: error.message,
      });
      setIsDeleting(false);
      return;
    }
    setCourses((current) =>
      current.filter((course) => course.id !== deleteTarget.id),
    );
    showToast({
      type: "success",
      title: "Course Deleted",
      description: `"${deleteTarget.title}" was removed.`,
    });
    setDeleteTarget(null);
    setIsDeleting(false);
  };

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-6">
      <header className="mb-5 flex flex-col gap-4 rounded-sm border border-border/40 bg-surface-container-lowest p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-light uppercase tracking-[0.24em]">
            Instructor Studio
          </p>
          <h1 className="mt-2 text-[20px] font-light text-on-surface">
            Your courses
          </h1>
          <p className="mt-2 max-w-2xl text-[12px] font-light leading-6 text-on-surface-variant">
            Create, edit, and publish your Lumio courses.
          </p>
        </div>
        <Button type="button" size="lg" onClick={() => openBuilder()}>
          <Plus /> New course
        </Button>
      </header>

      <section>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <article
                key={index}
                className="rounded-sm border border-border/40 bg-surface-container-lowest"
              >
                <Skeleton className="aspect-[4/3] w-full" />
                <Skeleton className="mt-4 h-4 w-3/4" />
                <Skeleton className="mt-3 h-3 w-full" />
                <div className="mt-5 flex gap-2">
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-7 w-24" />
                </div>
              </article>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-sm border border-border/40 bg-surface-container-lowest p-8 text-center">
            <h2 className="text-sm font-medium">No authored courses yet</h2>
            <p className="mt-2 text-xs text-on-surface-variant">
              Start with a draft, then add modules and YouTube lessons.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <motion.article
                key={course.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.25 }}
                className="rounded-sm border border-border/40 bg-surface-container-lowest shadow-[0_8px_20px_-18px_rgba(15,23,42,0.35)] transition-shadow hover:shadow-[0_18px_36px_-28px_rgba(53,37,205,0.35)]"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-tl-sm rounded-tr-sm bg-surface-container-low">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-on-surface-variant">
                      No thumbnail
                    </div>
                  )}
                </div>
                <div className="mt-4 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-medium text-on-surface">
                        {course.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-xs font-light text-on-surface-variant">
                        {course.description}
                      </p>
                    </div>
                    <span
                      className={`rounded-sm px-2 py-1 text-[10px] capitalize ${statusClass(course.status)}`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-on-surface-variant">
                    <span>{course.category}</span>
                    <span className="capitalize">{course.difficulty}</span>
                    <span>{course.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openBuilder(course)}
                    >
                      <Pencil /> Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget(course)}
                    >
                      <Trash2 /> Delete
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {isBuilderOpen && session?.user.id && (
        <CourseBuilderDialog
          instructorId={session.user.id}
          instructorEmail={session.user.email}
          initialDraft={builderDraft ?? undefined}
          onClose={() => setIsBuilderOpen(false)}
          onSaved={() => {
            setIsBuilderOpen(false);
            loadCourses();
          }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-sm border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-2xl">
            <h2 className="text-sm font-medium text-on-surface">
              Delete course?
            </h2>
            <p className="mt-2 text-xs font-light leading-6 text-on-surface-variant">
              This will permanently delete "{deleteTarget.title}" and its course
              content.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstructorCoursesPage;
