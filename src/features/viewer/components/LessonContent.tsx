import {
  BookOpenCheck,
  ArrowRight,
  Download,
  FileText,
  FileCode,
  FolderArchive,
} from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import type { ViewerLesson, ResourceItem } from "../types";

export function LessonContent({
  lesson,
  nextLesson,
  onNextLesson,
}: {
  lesson: ViewerLesson;
  nextLesson: ViewerLesson | null;
  onNextLesson: () => void;
}) {
  const resources = lesson.resources ?? [];

  const handleDownload = (resource: ResourceItem) => {
    try {
      let downloadUrl = resource.fileUrl || resource.filePath || resource.externalUrl;
      let fileName =
        resource.fileName ||
        resource.title ||
        `${lesson.title.replace(/[^a-zA-Z0-9]+/g, "-")}-Resource.md`;

      if (!downloadUrl) {
        const content = `# Lumio LMS — ${lesson.title}\n\n## Core Concept\n${lesson.coreConcept}\n\n## Overview\n${lesson.description}\n\n---\n*Downloaded from Lumio LMS*`;
        const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
        downloadUrl = URL.createObjectURL(blob);
        if (!fileName.includes(".")) fileName += ".md";
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast({
        type: "success",
        title: "Downloading Resource",
        description: `Saved ${fileName} to your PC.`,
      });
    } catch {
      showToast({
        type: "error",
        title: "Download Failed",
        description: "Unable to trigger file download.",
      });
    }
  };

  const getIconForKind = (kind?: string) => {
    switch (kind) {
      case "code":
        return <FileCode className="size-4 text-primary" />;
      case "archive":
        return <FolderArchive className="size-4 text-secondary" />;
      case "document":
      default:
        return <FileText className="size-4 text-primary" />;
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-6">
        <div>
          <h1 className="mt-3 text-2xl font-medium tracking-tight text-on-surface sm:text-[30px] leading-snug">
            {lesson.title}
          </h1>
          <p className="mt-3 max-w-3xl text-[13px] font-normal leading-relaxed">
            {lesson.description}
          </p>
        </div>

        <div className="rounded-sm  bg-surface-container-lowest p-6 shadow-[0_12px_32px_-22px_rgba(15,23,42,0.18)] space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-primary">
              <div className="flex size-7 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <BookOpenCheck className="size-4" strokeWidth={1}/>
              </div>
              <h2 className="text-[14px] font-medium text-on-surface">
                Core Lesson Concept
              </h2>
            </div>

            <div className="rounded-sm bg-surface-container-low/60 p-4">
              <p className="text-[13px] font-light leading-relaxed text-on-surface">
                {lesson.coreConcept ||
                  "Capture the fundamental principles of this lesson and integrate them directly into your development workflow."}
              </p>
            </div>
          </div>

          <div className="border-t border-outline-variant/20 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="size-4 text-primary" />
                <h3 className="text-[13px] font-medium text-on-surface">
                  Lesson Resources & Downloads
                </h3>
              </div>
              <span className="text-[11px] font-light text-on-surface-variant">
                {resources.length} file{resources.length === 1 ? "" : "s"} available
              </span>
            </div>

            {resources.length > 0 ? (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {resources.map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between gap-3 rounded-sm bg-surface-container-low p-3 transition-all hover:border-primary/30 hover:bg-surface-container-lowest"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-surface p-1.5 shadow-2xs">
                        {getIconForKind(res.resourceKind)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-medium text-on-surface">
                          {res.title || res.fileName || "Lesson Resource"}
                        </p>
                        <p className="text-[10px] font-light text-on-surface-variant">
                          {res.fileSize || "Downloadable Resource"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownload(res)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-primary px-2.5 py-1.5 text-[11px] font-medium text-on-primary transition-opacity hover:opacity-90 active:scale-95 cursor-pointer"
                      title={`Download ${res.title}`}
                    >
                      <Download className="size-3" />
                      Save
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] font-light italic text-on-surface-variant">
                No downloadable resources attached to this lesson.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-sm bg-surface-container-lowest p-5 shadow-[0_12px_32px_-22px_rgba(15,23,42,0.18)] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Up Next
            </span>
            {nextLesson && (
              <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-light text-on-surface-variant">
                {nextLesson.durationMinutes} mins
              </span>
            )}
          </div>

          {nextLesson ? (
            <div
              role="button"
              tabIndex={0}
              onClick={onNextLesson}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onNextLesson();
                }
              }}
              className="group cursor-pointer rounded-sm border border-outline-variant/20 bg-surface-container-low p-4 transition-all hover:border-primary/40 hover:bg-surface-container-lowest hover:shadow-sm"
            >
              <h3 className="text-[14px] font-medium text-on-surface transition-colors group-hover:text-primary leading-snug">
                {nextLesson.title}
              </h3>
              <p className="mt-1 text-[11px] font-light text-on-surface-variant line-clamp-2">
                {nextLesson.description || "Continue to the next video lesson in this course."}
              </p>

              <div className="mt-4 flex items-center justify-between pt-2 border-t border-outline-variant/20 text-[12px] font-medium text-primary">
                <span>Play Next Lesson</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ) : (
            <p className="text-[12px] font-light italic text-on-surface-variant">
              You have reached the end of this course. Check out other courses in your learning dashboard to continue your learning journey.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
