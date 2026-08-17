import { useState } from "react";
import { Menu } from "lucide-react";
import { ViewerSidebar } from "./ViewerSidebar";
import { ViewerHeader } from "./ViewerHeader";
import { LessonVideo } from "./LessonVideo";
import { LessonContent } from "./LessonContent";
import type { ViewerData } from "../types";

interface ViewerShellProps {
  data: ViewerData;
  completedLessonIds: Set<string>;
  onLessonSelect: (lessonId: string) => void;
  onMarkComplete: () => void;
  onNextLesson: () => void;
  onExitCourse: () => void;
  isCompleting: boolean;
}

export function ViewerShell({
  data,
  completedLessonIds,
  onLessonSelect,
  onMarkComplete,
  onNextLesson,
  onExitCourse,
  isCompleting,
}: ViewerShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-on-background antialiased">
      <div className="mx-auto flex min-h-screen max-w-374 flex-col lg:flex-row">
        <ViewerSidebar
          courseTitle={data.courseTitle}
          chapters={data.chapters}
          activeLessonId={data.activeLesson.id}
          completedLessonIds={completedLessonIds}
          progressPercent={data.progressPercent}
          completedLessons={data.completedLessons}
          totalLessons={data.totalLessons}
          onLessonSelect={onLessonSelect}
          onExitCourse={onExitCourse}
          isMobileOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-4">
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex items-center gap-2 rounded-sm border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-[12px] font-light text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface lg:hidden"
            >
              <Menu size={15} strokeWidth={1.3} />
              Course Content
            </button>

            <ViewerHeader
              lesson={data.activeLesson}
              onMarkComplete={onMarkComplete}
              isCompleting={isCompleting}
            />
            <LessonVideo
              youtubeUrl={data.activeLesson.youtubeUrl}
              title={data.activeLesson.title}
            />
            <LessonContent
              lesson={data.activeLesson}
              nextLesson={data.nextLesson}
              onNextLesson={onNextLesson}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
