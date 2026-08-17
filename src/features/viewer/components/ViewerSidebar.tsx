import { useState } from "react";
import {
  ChevronDown,
  Check,
  Lock,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChapterItem } from "../types";

interface ViewerSidebarProps {
  courseTitle: string;
  chapters: ChapterItem[];
  activeLessonId: string;
  completedLessonIds: Set<string>;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  onLessonSelect: (lessonId: string) => void;
  onExitCourse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function ViewerSidebar({
  courseTitle,
  chapters,
  activeLessonId,
  completedLessonIds,
  progressPercent,
  completedLessons,
  totalLessons,
  onLessonSelect,
  onExitCourse,
  isMobileOpen,
  onCloseMobile,
}: ViewerSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const chapter of chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.id === activeLessonId || lesson.active) {
          initial.add(chapter.id);
          break;
        }
      }
    }
    if (initial.size === 0 && chapters.length > 0) {
      initial.add(chapters[0].id);
    }
    return initial;
  });
  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const getModuleDuration = (chapter: ChapterItem) => {
    return chapter.lessons.reduce(
      (sum, l) => sum + (l.durationMinutes ?? 0),
      0,
    );
  };

  const getModuleCompletedCount = (chapter: ChapterItem) => {
    return chapter.lessons.filter(
      (l) => l.completed || completedLessonIds.has(l.id),
    ).length;
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/35 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          isMobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
        onClick={onCloseMobile}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-full flex-col border-r border-outline-variant/30 bg-surface-container-lowest shadow-[8px_0_30px_-28px_rgba(15,23,42,0.45)] transition-transform duration-300 ease-out lg:relative lg:w-80 lg:shrink-0 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-outline-variant/30 px-4">
          <h1 className="min-w-0 truncate text-[13px] font-medium tracking-wide text-on-surface">
            {courseTitle}
          </h1>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-sm text-outline transition-colors hover:bg-surface-container hover:text-on-surface lg:hidden"
            aria-label="Close sidebar"
            onClick={onCloseMobile}
          >
            <X size={17} strokeWidth={1.4} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
            Course Content
          </p>

          <div className="space-y-1">
            {chapters.map((chapter) => {
              const isExpanded = expandedModules.has(chapter.id);
              const moduleDuration = getModuleDuration(chapter);
              const moduleCompleted = getModuleCompletedCount(chapter);
              const moduleTotal = chapter.lessons.length;
              const isModuleLocked = Boolean(chapter.locked);

              return (
                <div key={chapter.id}>
                  <button
                    type="button"
                    onClick={() => toggleModule(chapter.id)}
                    className="group flex w-full items-center gap-2 rounded-sm px-3 py-2.5 text-left transition-colors hover:bg-surface-container"
                  >
                    <ChevronDown
                      size={14}
                      strokeWidth={1.5}
                      className={cn(
                        "shrink-0 text-on-surface-variant transition-transform duration-200",
                        isExpanded ? "rotate-0" : "-rotate-90",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-on-surface">
                        {chapter.title}
                      </p>
                      <p className="mt-0.5 text-[10px] font-light text-on-surface-variant">
                        {moduleCompleted}/{moduleTotal} lessons
                        {moduleDuration > 0 && ` · ${moduleDuration} min`}
                      </p>
                    </div>
                    {isModuleLocked && (
                      <Lock
                        size={13}
                        strokeWidth={1.5}
                        className="shrink-0 text-outline"
                      />
                    )}
                  </button>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-200 ease-out",
                      isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-0.5 pb-1 pl-4 pr-1 pt-1">
                        {chapter.lessons.map((lesson) => {
                          const isActive = lesson.id === activeLessonId;
                          const isCompleted =
                            lesson.completed ||
                            completedLessonIds.has(lesson.id);
                          const isLocked =
                            Boolean(lesson.locked) || isModuleLocked;

                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              disabled={isLocked}
                              onClick={() => {
                                onLessonSelect(lesson.id);
                                onCloseMobile();
                              }}
                              className={cn(
                                "group relative flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left text-[12px] transition-colors",
                                isActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                                isLocked && "opacity-50 cursor-not-allowed",
                              )}
                            >
                              {isActive && (
                                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
                              )}

                              <span
                                className={cn(
                                  "flex size-5 shrink-0 items-center justify-center rounded-full transition-all",
                                  isCompleted
                                    ? "bg-primary text-white"
                                    : isActive
                                      ? "border-2 border-primary"
                                      : "border border-outline-variant",
                                )}
                              >
                                {isCompleted && (
                                  <Check
                                    size={11}
                                    strokeWidth={2.5}
                                    className="animate-in fade-in zoom-in duration-200"
                                  />
                                )}
                              </span>

                              <span className="min-w-0 flex-1 truncate font-light leading-tight tracking-[-0.01em]">
                                {lesson.title}
                              </span>

                              {!isLocked && lesson.durationMinutes && (
                                <span className="shrink-0 text-[10px] font-light text-on-surface-variant">
                                  {lesson.durationMinutes}m
                                </span>
                              )}

                              {isLocked && (
                                <Lock
                                  size={12}
                                  strokeWidth={1.5}
                                  className="shrink-0 text-outline"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-outline-variant/30 p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                Progress
              </p>
              <p className="text-[11px] font-medium text-on-surface">
                {progressPercent}%
              </p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] font-light text-on-surface-variant">
              {completedLessons} of {totalLessons} lessons completed
            </p>
          </div>

          <button
            type="button"
            onClick={onExitCourse}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-outline-variant/30 text-[12px] font-light text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <LogOut size={15} strokeWidth={1.3} />
            Exit Course
          </button>
        </div>
      </aside>
    </>
  );
}
