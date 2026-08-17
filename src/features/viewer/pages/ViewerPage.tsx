import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LMSContext } from "@/contexts/LMSContext";
import {
  buildFallbackViewerData,
  loadViewerData,
} from "@/features/courses/api/courseData";
import { updateEnrollmentProgress } from "@/shared/api/enrollments";
import {
  listLessonProgress,
  markLessonComplete,
  recordLessonCompletionActivity,
} from "@/shared/api/progress";
import { ViewerShell } from "../components";
import type { ViewerData } from "../types";

interface PendingNavigation {
  href: string;
  to: string;
  isInternal: boolean;
}

export default function ViewerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session, setAuthError } = useContext(LMSContext);
  const [viewerData, setViewerData] = useState<ViewerData | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    () => new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigation | null>(null);
  const [isExitPromptOpen, setIsExitPromptOpen] = useState(false);
  const allowPageUnloadRef = useRef(false);
  const activeLessonId = searchParams.get("lesson");
  const courseId = searchParams.get("course") ?? "demo-course";

  const requestViewerExit = (navigation: PendingNavigation | null = null) => {
    setPendingNavigation(navigation);
    setIsExitPromptOpen(true);
  };

  const cancelViewerExit = () => {
    setIsExitPromptOpen(false);
    setPendingNavigation(null);
  };

  const confirmViewerExit = () => {
    const navigation = pendingNavigation;
    setIsExitPromptOpen(false);
    setPendingNavigation(null);

    if (!navigation) {
      navigate("/learning");
      return;
    }

    if (navigation.isInternal) {
      navigate(navigation.to);
      return;
    }

    allowPageUnloadRef.current = true;
    window.location.href = navigation.href;
  };

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link || (link.target && link.target !== "_self")) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname === "/viewer") {
        return;
      }

      event.preventDefault();
      requestViewerExit({
        href: url.href,
        to: `${url.pathname}${url.search}${url.hash}`,
        isInternal: url.origin === window.location.origin,
      });
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (allowPageUnloadRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProgress() {
      if (!session?.user.id || courseId === "demo-course") return;
      const { data, error } = await listLessonProgress(session.user.id, courseId);
      if (error) {
        setAuthError(error.message);
        return;
      }
      if (!isMounted) return;
      setCompletedLessons(
        new Set(
          (data ?? [])
            .filter((item) => item.is_completed)
            .map((item) => item.lesson_id),
        ),
      );
    }

    void loadProgress();
    return () => {
      isMounted = false;
    };
  }, [courseId, session?.user.id, setAuthError]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const data =
          courseId === "demo-course"
            ? buildFallbackViewerData(activeLessonId ?? undefined)
            : await loadViewerData(courseId, activeLessonId, completedLessons);
        if (!isMounted) return;
        setViewerData(data);
        if (!activeLessonId) {
          setSearchParams((params) => {
            params.set("course", courseId);
            params.set("lesson", data.activeLesson.id);
            return params;
          });
        }
      } catch (error) {
        setAuthError(
          error instanceof Error ? error.message : "Unable to load course viewer.",
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadData();
    return () => {
      isMounted = false;
    };
  }, [activeLessonId, completedLessons, courseId, setAuthError, setSearchParams]);

  const data = useMemo(() => {
    const currentViewerData =
      viewerData ?? buildFallbackViewerData(activeLessonId ?? undefined);
    const allLessons = currentViewerData.chapters.flatMap((c) => c.lessons);
    const totalLessons = allLessons.length;
    const completedCount = allLessons.filter(
      (l) => l.completed || completedLessons.has(l.id),
    ).length;
    const progressPercent =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      ...currentViewerData,
      completedLessons: completedCount,
      totalLessons,
      progressPercent,
      activeLesson: {
        ...currentViewerData.activeLesson,
        completed:
          currentViewerData.activeLesson.completed ||
          completedLessons.has(currentViewerData.activeLesson.id),
      },
    };
  }, [activeLessonId, completedLessons, viewerData]);

  const selectLesson = (lessonId: string) => {
    setSearchParams((params) => {
      params.set("course", courseId);
      params.set("lesson", lessonId);
      return params;
    });

    if (session?.user.id && courseId !== "demo-course") {
      void updateEnrollmentProgress(session.user.id, courseId, {
        last_watched_lesson_id: lessonId,
      });
    }
  };

  const handleMarkComplete = async () => {
    const wasAlreadyCompleted = completedLessons.has(data.activeLesson.id);
    setIsCompleting(true);
    try {
      if (session?.user.id && courseId !== "demo-course") {
        const { error } = await markLessonComplete(
          session.user.id,
          courseId,
          data.activeLesson.id,
        );
        if (error) {
          setAuthError(error.message);
          return;
        }
        if (!wasAlreadyCompleted) {
          const activityResult = await recordLessonCompletionActivity(
            session.user.id,
            data.activeLesson.durationMinutes,
          );
          if (activityResult.error) {
            setAuthError(activityResult.error.message);
            return;
          }
        }
      }
      setCompletedLessons((current) =>
        new Set(current).add(data.activeLesson.id),
      );
      if (session?.user.id && courseId !== "demo-course") {
        const nextCompleted = new Set(completedLessons).add(data.activeLesson.id);
        const progressPercent =
          data.totalLessons > 0
            ? Math.round((nextCompleted.size / data.totalLessons) * 100)
            : 0;
        await updateEnrollmentProgress(session.user.id, courseId, {
          progress_percent: progressPercent,
          last_watched_lesson_id: data.activeLesson.id,
          completed_at: progressPercent >= 100 ? new Date().toISOString() : null,
        });
      }

      // Auto-advance to next lesson after marking complete
      if (data.nextLesson) {
        setTimeout(() => selectLesson(data.nextLesson!.id), 600);
      }
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading && !viewerData) {
    return (
      <div className="min-h-screen bg-surface px-6 py-8 text-sm text-on-surface-variant">
        Loading course viewer...
      </div>
    );
  }

  return (
    <>
      <ViewerShell
        data={data}
        completedLessonIds={completedLessons}
        onLessonSelect={selectLesson}
        onMarkComplete={handleMarkComplete}
        onNextLesson={() => {
          if (data.nextLesson) selectLesson(data.nextLesson.id);
        }}
        onExitCourse={() => requestViewerExit()}
        isCompleting={isCompleting}
      />

      {isExitPromptOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-sm border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex size-12 items-center justify-center rounded-sm bg-primary/10">
              <LogOut size={17} strokeWidth={1.3} className="text-primary" />
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-sm font-medium text-on-surface">
                Exit Course
              </h2>
              <p className="mt-2 text-xs font-light leading-6 text-on-surface-variant">
                Are you sure you want to leave the course viewer? Your progress
                has been saved and you can resume anytime.
              </p>
            </div>
            <div className="mt-5 flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={cancelViewerExit}
              >
                Continue Learning
              </Button>
              <Button
                type="button"
                size="lg"
                className="flex-1"
                onClick={confirmViewerExit}
              >
                Exit Course
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
