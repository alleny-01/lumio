import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";
import {
  createCourseDraft,
  deleteCourseModule,
  deleteLesson,
  setCourseStatus,
  updateCourse,
  upsertCourseModules,
  upsertLessons,
} from "@/shared/api/courses";
import {
  createResource,
  deleteResource,
  getPublicStorageUrl,
  updateResource,
  uploadCourseThumbnail,
  uploadResourceFile,
} from "@/shared/api/resources";
import { getProfile, upsertProfile } from "@/shared/api/profiles";
import type { CourseStatus, ResourceKind } from "@/shared/types/database";
import type { CourseBuilderDraft } from "../types";
import {
  courseCategories,
  createEmptyDraft,
  createEmptyLesson,
  createEmptyModule,
  createId,
  isValidYoutubeUrl,
  moveItem,
  slugify,
} from "../utils";

interface CourseBuilderDialogProps {
  instructorId: string;
  instructorEmail?: string;
  initialDraft?: CourseBuilderDraft;
  onClose: () => void;
  onSaved: () => void;
}

function fieldClass() {
  return "w-full rounded-sm bg-surface-container-low px-3 py-2 text-xs outline-none ring-1 ring-transparent transition focus:bg-surface-container-lowest focus:ring-primary/20";
}

const characterLimits = {
  courseTitle: 80,
  courseDescription: 600,
  url: 2048,
  moduleTitle: 90,
  lessonTitle: 100,
  lessonDescription: 500,
  coreConcept: 240,
  resourceTitle: 80,
  outcome: 120,
} as const;

const acceptedThumbnailTypes = "image/png,image/jpeg,image/webp";
const acceptedResourceTypes = [
  ".pdf",
  ".doc",
  ".docx",
  ".md",
  ".txt",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/markdown",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/webp",
].join(",");
const maxThumbnailSize = 5 * 1024 * 1024;
const maxResourceSize = 10 * 1024 * 1024;
const recoveryDraftVersion = 1;

function CharacterCount({
  value,
  max,
}: {
  value: string;
  max: number;
}): React.JSX.Element {
  return (
    <span className="block pt-1 text-right text-[10px] font-light text-on-surface-variant">
      {value.length}/{max}
    </span>
  );
}

function storageSafeName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "");
}

function resourceKindFromFile(file: File): ResourceKind {
  return file.type.startsWith("image/") ? "image" : "document";
}

function isAllowedResourceFile(file: File) {
  const isAllowedDocument =
    [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/markdown",
      "text/plain",
    ].includes(file.type) || /\.(pdf|doc|docx|md|txt)$/i.test(file.name);
  const isAllowedImage =
    ["image/png", "image/jpeg", "image/webp"].includes(file.type) &&
    file.size <= maxThumbnailSize;

  return file.size <= maxResourceSize && (isAllowedDocument || isAllowedImage);
}

async function ensureInstructorProfile(instructorId: string, email?: string) {
  const profileResult = await getProfile(instructorId);
  if (profileResult.data) return;
  if (!email) throw profileResult.error ?? new Error("Instructor profile is missing.");

  const createProfileResult = await upsertProfile({
    id: instructorId,
    email,
  });
  if (createProfileResult.error) throw createProfileResult.error;
}

function getRecoveryKey(instructorId: string, courseId?: string) {
  return `lumio_course_builder_recovery_${instructorId}_${courseId ?? "new"}`;
}

function stripFilesFromDraft(draft: CourseBuilderDraft): CourseBuilderDraft {
  return {
    ...draft,
    thumbnailFile: null,
    modules: draft.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        resources: lesson.resources.map((resource) => ({
          ...resource,
          file: null,
        })),
      })),
    })),
  };
}

function draftSignature(draft: CourseBuilderDraft) {
  return JSON.stringify(stripFilesFromDraft(draft));
}

function formatRecoveryTime(value: number | null) {
  if (!value) return "Not saved yet";
  return `Recovered ${new Date(value).toLocaleString()}`;
}

interface StoredRecoveryDraft {
  version: number;
  savedAt: number;
  draft: CourseBuilderDraft;
}

export function CourseBuilderDialog({
  instructorId,
  instructorEmail,
  initialDraft,
  onClose,
  onSaved,
}: CourseBuilderDialogProps): React.JSX.Element {
  const [draft, setDraft] = useState<CourseBuilderDraft>(
    initialDraft ?? createEmptyDraft(),
  );
  const initialDraftSignatureRef = useRef(draftSignature(draft));
  const initialPersistedModuleIds = useMemo(
    () =>
      new Set(
        (initialDraft?.modules ?? [])
          .map((module) => module.persistedId)
          .filter((id): id is string => Boolean(id)),
      ),
    [initialDraft],
  );
  const initialPersistedLessonIds = useMemo(
    () =>
      new Set(
        (initialDraft?.modules ?? [])
          .flatMap((module) => module.lessons)
          .map((lesson) => lesson.persistedId)
          .filter((id): id is string => Boolean(id)),
      ),
    [initialDraft],
  );
  const initialPersistedResourceIds = useMemo(
    () =>
      new Set(
        (initialDraft?.modules ?? [])
          .flatMap((module) => module.lessons)
          .flatMap((lesson) => lesson.resources)
          .map((resource) => resource.persistedId)
          .filter((id): id is string => Boolean(id)),
      ),
    [initialDraft],
  );
  const [step, setStep] = useState<"info" | "content">("info");
  const [isSaving, setIsSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState<CourseStatus | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [recoveredDraft, setRecoveredDraft] = useState<StoredRecoveryDraft | null>(
    null,
  );
  const [lastRecoverySaveAt, setLastRecoverySaveAt] = useState<number | null>(
    null,
  );
  const recoveryKey = useMemo(
    () => getRecoveryKey(instructorId, initialDraft?.id),
    [instructorId, initialDraft?.id],
  );
  const isPublishedCourse = draft.status === "published";
  const currentDraftSignature = useMemo(() => draftSignature(draft), [draft]);
  const hasUnsavedChanges =
    currentDraftSignature !== initialDraftSignatureRef.current;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(recoveryKey);
      if (!stored) return;

      const parsed = JSON.parse(stored) as StoredRecoveryDraft;
      if (
        parsed.version !== recoveryDraftVersion ||
        !parsed.draft ||
        draftSignature(parsed.draft) === initialDraftSignatureRef.current
      ) {
        return;
      }

      setRecoveredDraft(parsed);
      setLastRecoverySaveAt(parsed.savedAt);
    } catch (error) {
      console.warn("Unable to read course builder recovery draft:", error);
    }
  }, [recoveryKey]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handle = window.setTimeout(() => {
      try {
        const savedAt = Date.now();
        const recoveryDraft: StoredRecoveryDraft = {
          version: recoveryDraftVersion,
          savedAt,
          draft: stripFilesFromDraft(draft),
        };
        localStorage.setItem(recoveryKey, JSON.stringify(recoveryDraft));
        setLastRecoverySaveAt(savedAt);
      } catch (error) {
        console.warn("Unable to save course builder recovery draft:", error);
      }
    }, 600);

    return () => window.clearTimeout(handle);
  }, [draft, hasUnsavedChanges, recoveryKey]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const clearRecoveryDraft = () => {
    try {
      localStorage.removeItem(recoveryKey);
    } catch (error) {
      console.warn("Unable to clear course builder recovery draft:", error);
    }
    setRecoveredDraft(null);
    setLastRecoverySaveAt(null);
  };

  const validationMessage = useMemo(() => {
    if (!isValidYoutubeUrl(draft.previewVideoUrl)) {
      return "Preview video must be a valid YouTube URL.";
    }

    const hasInvalidLessonUrl = draft.modules.some((module) =>
      module.lessons.some((lesson) => !isValidYoutubeUrl(lesson.youtubeUrl)),
    );

    if (hasInvalidLessonUrl) {
      return "Lesson videos must use valid YouTube URLs.";
    }

    return null;
  }, [draft]);

  const notifyError = (message: string, title = "Action Failed") => {
    showToast({
      type: "error",
      title,
      description: message,
    });
  };

  const getValidationError = (status: CourseStatus, shouldPublish = false) => {
    if (validationMessage) return validationMessage;

    if (status === "draft") return null;

    if (!shouldPublish) return null;

    if (!draft.title.trim()) {
      return "Course title is required before publishing.";
    }

    if (!draft.category.trim()) {
      return "Course category is required before publishing.";
    }

    if (!draft.difficulty) {
      return "Course difficulty is required before publishing.";
    }

    if (!draft.thumbnailUrl && !draft.thumbnailFile) {
      return "Course thumbnail is required before publishing.";
    }

    if (!draft.previewVideoUrl.trim()) {
      return "Preview YouTube URL is required before publishing.";
    }

    if (!draft.description.trim()) {
      return "Course description is required before publishing.";
    }

    const hasOutcome = (draft.learningOutcomes || []).some(
      (outcome) => outcome.trim().length > 0,
    );
    if (!hasOutcome) {
      return "At least one learning outcome is required before publishing.";
    }

    if (!draft.modules.length) {
      return "At least one module is required before publishing.";
    }

    for (const [moduleIndex, module] of draft.modules.entries()) {
      if (!module.title.trim()) {
        return `Module ${moduleIndex + 1} title is required before publishing.`;
      }
      if (!module.lessons.length) {
        return `Module ${moduleIndex + 1} needs at least one lesson before publishing.`;
      }
      for (const [lessonIndex, lesson] of module.lessons.entries()) {
        const label = `Module ${moduleIndex + 1}, lesson ${lessonIndex + 1}`;
        if (!lesson.title.trim()) return `${label} title is required before publishing.`;
        if (!lesson.youtubeUrl.trim()) return `${label} YouTube URL is required before publishing.`;
        if (!lesson.description.trim()) return `${label} description is required before publishing.`;
        if (!lesson.coreConcept.trim()) return `${label} core concept is required before publishing.`;
        if (!Number(lesson.durationMinutes)) return `${label} duration is required before publishing.`;
      }
    }

    return null;
  };

  const formatSaveError = (saveError: unknown) => {
    if (saveError instanceof Error) return saveError.message;
    if (
      typeof saveError === "object" &&
      saveError !== null &&
      "message" in saveError &&
      typeof saveError.message === "string"
    ) {
      return saveError.message;
    }
    return "Unable to save this course.";
  };

  const saveDraft = async (
    status: CourseStatus = draft.status,
    shouldPublish = false,
  ) => {
    if (draft.status === "published" && status === "draft") {
      notifyError(
        "Published courses must be updated directly so enrolled learners keep access.",
        "Use Update Published Course",
      );
      return;
    }

    const nextError = getValidationError(status, shouldPublish);
    if (nextError) {
      notifyError(nextError, "Validation Required");
      return;
    }

    if (isSaving) return;
    setIsSaving(true);
    setSavingStatus(status);

    try {
      await ensureInstructorProfile(instructorId, instructorEmail);

      const courseTitle = draft.title.trim() || "Untitled course";
      const courseSlug =
        draft.id && draft.slug
          ? draft.slug
          : `${slugify(courseTitle) || "course"}-${Date.now()}`;
      const duration = draft.modules.reduce(
        (sum, module) =>
          sum +
          module.lessons.reduce(
            (lessonSum, lesson) => lessonSum + Number(lesson.durationMinutes || 0),
            0,
          ),
        0,
      );
      const cleanedOutcomes = (draft.learningOutcomes || [])
        .map((o) => o.trim())
        .filter(Boolean)
        .slice(0, 6);

      const coursePayload = {
        instructor_id: instructorId,
        title: courseTitle,
        slug: courseSlug,
        description: draft.description.trim(),
        thumbnail_url: draft.thumbnailUrl || null,
        category: draft.category,
        difficulty: draft.difficulty,
        preview_video_url: draft.previewVideoUrl || null,
        duration_minutes: duration,
        status,
        published_at: status === "draft" ? null : undefined,
        learning_outcomes: cleanedOutcomes,
      };

      const courseResult = draft.id
        ? await updateCourse(draft.id, coursePayload)
        : await createCourseDraft(coursePayload);

      if (courseResult.error || !courseResult.data) {
        throw courseResult.error ?? new Error("Unable to save course.");
      }

      const courseId = courseResult.data.id;
      try {
        localStorage.setItem(
          `lumio_course_outcomes_${courseId}`,
          JSON.stringify(cleanedOutcomes),
        );
      } catch (storageError) {
        console.warn("Unable to cache course outcomes locally:", storageError);
      }
      let thumbnailUrl = draft.thumbnailUrl;

      if (draft.thumbnailFile) {
        const thumbnailPath = `${instructorId}/${courseId}/${createId("thumbnail")}-${storageSafeName(
          draft.thumbnailFile.name,
        )}`;
        const thumbnailResult = await uploadCourseThumbnail(
          thumbnailPath,
          draft.thumbnailFile,
        );
        if (thumbnailResult.error) throw thumbnailResult.error;
        thumbnailUrl = getPublicStorageUrl("course-thumbnails", thumbnailPath);
        const thumbnailUpdate = await updateCourse(courseId, {
          thumbnail_url: thumbnailUrl,
        });
        if (thumbnailUpdate.error) throw thumbnailUpdate.error;
      }

      const moduleRows = draft.modules.map((module, index) => ({
        ...(module.persistedId ? { id: module.persistedId } : {}),
        course_id: courseId,
        title: module.title.trim() || `Module ${index + 1}`,
        sort_order: index + 1,
      }));
      const modulesResult = await upsertCourseModules(moduleRows);
      if (modulesResult.error) throw modulesResult.error;

      const savedModules = modulesResult.data ?? [];
      const savedModuleBySortOrder = new Map(
        savedModules.map((module) => [module.sort_order, module]),
      );
      const lessonRefs: Array<{
        moduleIndex: number;
        lessonIndex: number;
        lesson: CourseBuilderDraft["modules"][number]["lessons"][number];
      }> = [];
      const lessons = draft.modules.flatMap((module, moduleIndex) => {
        const savedModule = savedModuleBySortOrder.get(moduleIndex + 1);
        if (!savedModule) return [];
        return module.lessons.map((lesson, lessonIndex) => {
          lessonRefs.push({ moduleIndex, lessonIndex, lesson });
          return {
            ...(lesson.persistedId ? { id: lesson.persistedId } : {}),
            module_id: savedModule.id,
            title: lesson.title.trim() || `Lesson ${lessonIndex + 1}`,
            description: lesson.description || null,
            youtube_url: lesson.youtubeUrl || draft.previewVideoUrl,
            duration_minutes: Number(lesson.durationMinutes || 0),
            core_concept: lesson.coreConcept || null,
            sort_order: lessonIndex + 1,
          };
        });
      });

      let savedLessons: Array<{ id: string; module_id: string; sort_order: number }> = [];
      if (lessons.length) {
        const lessonsResult = await upsertLessons(courseId, lessons);
        if (lessonsResult.error) throw lessonsResult.error;
        savedLessons = lessonsResult.data ?? [];
        const savedLessonByModuleAndSortOrder = new Map(
          savedLessons.map((lesson) => [
            `${lesson.module_id}:${lesson.sort_order}`,
            lesson,
          ]),
        );

        const savedResourceIds = new Set<string>();
        for (const lessonRef of lessonRefs) {
          const savedModule = savedModuleBySortOrder.get(lessonRef.moduleIndex + 1);
          const savedLesson = savedModule
            ? savedLessonByModuleAndSortOrder.get(
                `${savedModule.id}:${lessonRef.lessonIndex + 1}`,
              )
            : null;
          if (!savedLesson) continue;

          for (const resource of lessonRef.lesson.resources) {
            if (
              !resource.title ||
              (!resource.file && !resource.externalUrl && !resource.filePath)
            ) {
              continue;
            }

            let filePath = resource.filePath ?? null;
            let externalUrl = resource.externalUrl || null;
            let resourceKind = resource.resourceKind;

            if (resource.file) {
              filePath = `${instructorId}/${courseId}/${savedLesson.id}/${resource.id}-${storageSafeName(
                resource.file.name,
              )}`;
              const uploadResult = await uploadResourceFile(filePath, resource.file);
              if (uploadResult.error) throw uploadResult.error;
              externalUrl = getPublicStorageUrl("lesson-resources", filePath);
              resourceKind = resourceKindFromFile(resource.file);
            }

            const resourcePayload = {
              title: resource.title,
              file_path: filePath,
              external_url: externalUrl,
              resource_kind: resourceKind,
            };
            const resourceResult = resource.persistedId
              ? await updateResource(resource.persistedId, resourcePayload)
              : await createResource({
                  course_id: courseId,
                  lesson_id: savedLesson.id,
                  ...resourcePayload,
                });
            if (resourceResult.error) throw resourceResult.error;
            if (resourceResult.data?.id) savedResourceIds.add(resourceResult.data.id);
          }
        }

        await Promise.all(
          [
            ...initialPersistedResourceIds,
            ...(draft.resourceIdsToDelete ?? []),
          ]
            .filter((resourceId) => !savedResourceIds.has(resourceId))
            .map((resourceId) => deleteResource(resourceId)),
        );
      }

      if (shouldPublish) {
        const statusResult = await setCourseStatus(courseId, status);
        if (statusResult.error) throw statusResult.error;
      }

      const savedModuleIds = new Set(savedModules.map((module) => module.id));
      const savedLessonIds = new Set(
        (lessons.length ? savedLessons : []).map((lesson) => lesson.id),
      );
      await Promise.all(
        [...initialPersistedLessonIds]
          .filter((lessonId) => !savedLessonIds.has(lessonId))
          .map((lessonId) => deleteLesson(lessonId)),
      );
      await Promise.all(
        [...initialPersistedModuleIds]
          .filter((moduleId) => !savedModuleIds.has(moduleId))
          .map((moduleId) => deleteCourseModule(moduleId)),
      );

      setDraft((current) => ({
        ...current,
        id: courseId,
        slug: courseSlug,
        thumbnailUrl,
        thumbnailFile: null,
        resourceIdsToDelete: [],
        status,
      }));
      clearRecoveryDraft();
      showToast({
        type: "success",
        title:
          status === "published"
            ? draft.id
              ? "Course Updated"
              : "Course Published"
            : status === "draft"
              ? "Draft Saved"
              : "Course Saved",
        description:
          status === "published"
            ? "Your published course has been updated."
            : "Your course changes have been saved.",
      });
      onSaved();
    } catch (saveError) {
      notifyError(formatSaveError(saveError));
    } finally {
      setIsSaving(false);
      setSavingStatus(null);
    }
  };

  const updateModule = (moduleId: string, title: string) => {
    setDraft((current) => ({
      ...current,
      modules: current.modules.map((module) =>
        module.id === moduleId ? { ...module, title } : module,
      ),
    }));
  };

  const updateLesson = (
    moduleId: string,
    lessonId: string,
    values: Partial<CourseBuilderDraft["modules"][number]["lessons"][number]>,
  ) => {
    setDraft((current) => ({
      ...current,
      modules: current.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, ...values } : lesson,
              ),
            }
          : module,
      ),
    }));
  };

  const handleThumbnailChange = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > maxThumbnailSize) {
      notifyError("Thumbnail must be a PNG, JPG, or WebP image under 5MB.");
      return;
    }

    setDraft((current) => ({
      ...current,
      thumbnailFile: file,
      thumbnailUrl: "",
    }));
  };

  const removeThumbnail = () => {
    setDraft((current) => ({
      ...current,
      thumbnailFile: null,
      thumbnailUrl: "",
    }));
  };

  const updateResourceFile = (
    moduleId: string,
    lessonId: string,
    resourceId: string,
    file: File | undefined,
  ) => {
    if (!file) return;
    if (!isAllowedResourceFile(file)) {
      notifyError(
        "Resources must be PDFs, docs, Markdown/text files, or PNG/JPG/WebP images. Videos are not supported.",
      );
      return;
    }

    updateLesson(moduleId, lessonId, {
      resources: draft.modules
        .find((module) => module.id === moduleId)
        ?.lessons.find((lesson) => lesson.id === lessonId)
        ?.resources.map((resource) =>
          resource.id === resourceId
            ? {
                ...resource,
                title: resource.title === "Resource" ? file.name : resource.title,
                resourceKind: resourceKindFromFile(file),
                file,
                fileName: file.name,
                externalUrl: "",
              }
            : resource,
        ) ?? [],
    });
  };

  const removeResourceFile = (
    moduleId: string,
    lessonId: string,
    resourceId: string,
  ) => {
    const lesson = draft.modules
      .find((module) => module.id === moduleId)
      ?.lessons.find((item) => item.id === lessonId);

    if (!lesson) return;

    updateLesson(moduleId, lessonId, {
      resources: lesson.resources.map((resource) =>
        resource.id === resourceId
          ? {
              ...resource,
              file: null,
              fileName: "",
              filePath: "",
              externalUrl: "",
            }
          : resource,
      ),
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-builder-title"
        className="flex max-h-[92vh] w-full max-w-5xl flex-col rounded-sm border border-outline-variant/30 bg-surface-container-lowest shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-outline-variant/30 px-5 py-4">
          <div>
            <p className="text-[10px] font-light uppercase tracking-[0.24em]">
              Course Builder
            </p>
            <h2 id="course-builder-title" className="mt-1 text-sm font-medium">
              {draft.id ? "Edit course" : "Create course"}
            </h2>
            {hasUnsavedChanges ? (
              <p className="mt-1 text-[10px] font-light text-on-surface-variant">
                {formatRecoveryTime(lastRecoverySaveAt)}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="rounded-sm p-2 text-on-surface-variant hover:bg-surface-container"
            onClick={() => setShowCancelConfirm(true)}
            aria-label="Close course builder"
          >
            <X size={18} strokeWidth={1.3} />
          </button>
        </header>

        <div className="flex gap-2 border-b border-outline-variant/30 px-5 py-3">
          {(["info", "content"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStep(item)}
              className={`rounded-sm px-3 py-2 text-xs capitalize ${
                step === item
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-on-surface-variant"
              }`}
            >
              {item === "info" ? "Course info" : "Course content"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {step === "info" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5 text-xs">
                Title
                <input
                  className={fieldClass()}
                  value={draft.title}
                  maxLength={characterLimits.courseTitle}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
                <CharacterCount
                  value={draft.title}
                  max={characterLimits.courseTitle}
                />
              </label>
              <label className="space-y-1.5 text-xs">
                Category
                <select
                  className={fieldClass()}
                  value={draft.category}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                >
                  {courseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-xs">
                Difficulty
                <select
                  className={fieldClass()}
                  value={draft.difficulty}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      difficulty: event.target.value as CourseBuilderDraft["difficulty"],
                    }))
                  }
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
              <label className="space-y-1.5 text-xs">
                Thumbnail upload
                <input
                  key={draft.thumbnailFile?.name || draft.thumbnailUrl || "empty-thumbnail"}
                  className={`${fieldClass()} file:mr-3 file:rounded-sm file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-[11px] file:text-on-primary`}
                  type="file"
                  accept={acceptedThumbnailTypes}
                  onChange={(event) =>
                    handleThumbnailChange(event.target.files?.[0])
                  }
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="block text-[10px] font-light text-on-surface-variant">
                    {draft.thumbnailFile?.name ||
                      (draft.thumbnailUrl
                        ? "Existing thumbnail selected"
                        : "PNG, JPG, or WebP under 5MB")}
                  </span>
                  {(draft.thumbnailFile || draft.thumbnailUrl) && (
                    <button
                      type="button"
                      className="text-[10px] font-medium text-error transition hover:underline"
                      onClick={removeThumbnail}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </label>
              <label className="space-y-1.5 text-xs md:col-span-2">
                Short preview YouTube URL
                <input
                  className={fieldClass()}
                  value={draft.previewVideoUrl}
                  maxLength={characterLimits.url}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      previewVideoUrl: event.target.value,
                    }))
                  }
                />
                <CharacterCount
                  value={draft.previewVideoUrl}
                  max={characterLimits.url}
                />
              </label>
              <label className="space-y-1.5 text-xs md:col-span-2">
                Description
                <textarea
                  className={`${fieldClass()} min-h-28 resize-y`}
                  value={draft.description}
                  maxLength={characterLimits.courseDescription}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
                <CharacterCount
                  value={draft.description}
                  max={characterLimits.courseDescription}
                />
              </label>
              
              <div className="space-y-3 text-xs md:col-span-2 rounded-sm border border-border/40 bg-surface-container-low p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-on-surface">What you'll learn</span>
                    <p className="text-[11px] font-light text-on-surface-variant">
                      List key outcomes students will master in this course (max 6).
                    </p>
                  </div>
                  <span className="text-[11px] font-light text-on-surface-variant">
                    {(draft.learningOutcomes || []).length}/6 outcomes
                  </span>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {(draft.learningOutcomes || []).map((outcome, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                        {idx + 1}
                      </span>
                      <input
                        className={fieldClass()}
                        placeholder={`Outcome #${idx + 1}`}
                        value={outcome}
                        maxLength={characterLimits.outcome}
                        onChange={(event) => {
                          const val = event.target.value;
                          setDraft((current) => {
                            const list = [...(current.learningOutcomes || ["", "", "", ""])];
                            list[idx] = val;
                            return { ...current, learningOutcomes: list };
                          });
                        }}
                      />
                      {(draft.learningOutcomes || []).length > 1 && (
                        <button
                          type="button"
                          className="p-1 text-on-surface-variant hover:text-error transition shrink-0"
                          title="Remove outcome"
                          onClick={() => {
                            setDraft((current) => {
                              const list = [...(current.learningOutcomes || [])];
                              list.splice(idx, 1);
                              return { ...current, learningOutcomes: list };
                            });
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {(draft.learningOutcomes || []).length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1 inline-flex items-center gap-1.5"
                    onClick={() => {
                      setDraft((current) => {
                        const list = [...(current.learningOutcomes || [])];
                        if (list.length < 6) list.push("");
                        return { ...current, learningOutcomes: list };
                      });
                    }}
                  >
                    <Plus size={14} />
                    Add outcome
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {draft.modules.map((module, moduleIndex) => (
                <section
                  key={module.id}
                  className="rounded-sm border border-border/40 bg-surface-container-low p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="flex-1 text-xs">
                      Module title
                      <input
                        className={`${fieldClass()} mt-1.5`}
                        value={module.title}
                        maxLength={characterLimits.moduleTitle}
                        onChange={(event) =>
                          updateModule(module.id, event.target.value)
                        }
                      />
                      <CharacterCount
                        value={module.title}
                        max={characterLimits.moduleTitle}
                      />
                    </label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            modules: moveItem(current.modules, moduleIndex, -1),
                          }))
                        }
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            modules: moveItem(current.modules, moduleIndex, 1),
                          }))
                        }
                      >
                        <ArrowDown />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            modules: current.modules.filter(
                              (item) => item.id !== module.id,
                            ),
                          }))
                        }
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <article
                        key={lesson.id}
                        className="rounded-sm bg-surface-container-lowest p-3"
                      >
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="text-xs">
                            Lesson title
                            <input
                              className={`${fieldClass()} mt-1.5`}
                              value={lesson.title}
                              maxLength={characterLimits.lessonTitle}
                              onChange={(event) =>
                                updateLesson(module.id, lesson.id, {
                                  title: event.target.value,
                                })
                              }
                            />
                            <CharacterCount
                              value={lesson.title}
                              max={characterLimits.lessonTitle}
                            />
                          </label>
                          <label className="text-xs">
                            YouTube video URL
                            <input
                              className={`${fieldClass()} mt-1.5`}
                              value={lesson.youtubeUrl}
                              placeholder="YouTube video URL"
                              maxLength={characterLimits.url}
                              onChange={(event) =>
                                updateLesson(module.id, lesson.id, {
                                  youtubeUrl: event.target.value,
                                })
                              }
                            />
                            <CharacterCount
                              value={lesson.youtubeUrl}
                              max={characterLimits.url}
                            />
                          </label>
                          <label className="text-xs md:col-span-2">
                            Lesson description
                            <textarea
                              className={`${fieldClass()} mt-1.5 min-h-20`}
                              value={lesson.description}
                              placeholder="Lesson description"
                              maxLength={characterLimits.lessonDescription}
                              onChange={(event) =>
                                updateLesson(module.id, lesson.id, {
                                  description: event.target.value,
                                })
                              }
                            />
                            <CharacterCount
                              value={lesson.description}
                              max={characterLimits.lessonDescription}
                            />
                          </label>
                          <div className="flex items-center gap-2">
                            <label className="text-xs">Duration(Minutes)</label>
                             <input
                            className={fieldClass()}
                            type="number"
                            min={0}
                            value={lesson.durationMinutes}
                            onChange={(event) =>
                              updateLesson(module.id, lesson.id, {
                                durationMinutes: Number(event.target.value),
                              })
                            }
                          />
                          </div>
                          <label className="text-xs">
                            Core concept
                            <input
                              className={`${fieldClass()} mt-1.5`}
                              value={lesson.coreConcept}
                              placeholder="Core concept summary"
                              maxLength={characterLimits.coreConcept}
                              onChange={(event) =>
                                updateLesson(module.id, lesson.id, {
                                  coreConcept: event.target.value,
                                })
                              }
                            />
                            <CharacterCount
                              value={lesson.coreConcept}
                              max={characterLimits.coreConcept}
                            />
                          </label>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateLesson(module.id, lesson.id, {
                                resources: [
                                  ...lesson.resources,
                                  {
                                    id: createId("resource"),
                                    title: "Resource",
                                    resourceKind: "document",
                                    file: null,
                                    fileName: "",
                                    externalUrl: "",
                                  },
                                ],
                              })
                            }
                          >
                            <Plus /> Resource
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                modules: current.modules.map((item) =>
                                  item.id === module.id
                                    ? {
                                        ...item,
                                        lessons: moveItem(
                                          item.lessons,
                                          lessonIndex,
                                          -1,
                                        ),
                                      }
                                    : item,
                                ),
                              }))
                            }
                          >
                            <ArrowUp />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                modules: current.modules.map((item) =>
                                  item.id === module.id
                                    ? {
                                        ...item,
                                        lessons: moveItem(
                                          item.lessons,
                                          lessonIndex,
                                          1,
                                        ),
                                      }
                                    : item,
                                ),
                              }))
                            }
                          >
                            <ArrowDown />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                modules: current.modules.map((item) =>
                                  item.id === module.id
                                    ? {
                                        ...item,
                                        lessons: item.lessons.filter(
                                          (row) => row.id !== lesson.id,
                                        ),
                                      }
                                    : item,
                                ),
                              }))
                            }
                          >
                            <Trash2 />
                          </Button>
                        </div>
                        {lesson.resources.map((resource) => (
                          <div
                            key={resource.id}
                            className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]"
                          >
                            <label className="text-xs">
                              Resource title
                              <input
                                className={`${fieldClass()} mt-1.5`}
                                value={resource.title}
                                maxLength={characterLimits.resourceTitle}
                                onChange={(event) =>
                                  updateLesson(module.id, lesson.id, {
                                    resources: lesson.resources.map((item) =>
                                      item.id === resource.id
                                        ? { ...item, title: event.target.value }
                                        : item,
                                    ),
                                  })
                                }
                              />
                              <CharacterCount
                                value={resource.title}
                                max={characterLimits.resourceTitle}
                              />
                            </label>
                            <label className="text-xs">
                              Resource file
                              <input
                                key={
                                  resource.fileName ||
                                  resource.externalUrl ||
                                  `${resource.id}-empty-file`
                                }
                                className={`${fieldClass()} mt-1.5 file:mr-3 file:rounded-sm file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-[11px] file:text-on-primary`}
                                type="file"
                                accept={acceptedResourceTypes}
                                onChange={(event) =>
                                  updateResourceFile(
                                    module.id,
                                    lesson.id,
                                    resource.id,
                                    event.target.files?.[0],
                                  )
                                }
                              />
                              <div className="flex items-center justify-between gap-3 pt-1">
                                <span className="block text-[10px] font-light text-on-surface-variant">
                                  {resource.fileName ||
                                    (resource.externalUrl
                                      ? "Existing resource selected"
                                      : "PDF, DOC, DOCX, MD, TXT, or small image. No videos.")}
                                </span>
                                {(resource.fileName || resource.externalUrl) && (
                                  <button
                                    type="button"
                                    className="text-[10px] font-medium text-error transition hover:underline"
                                    onClick={() =>
                                      removeResourceFile(
                                        module.id,
                                        lesson.id,
                                        resource.id,
                                      )
                                    }
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </label>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() =>
                                updateLesson(module.id, lesson.id, {
                                  resources: lesson.resources.filter(
                                    (item) => item.id !== resource.id,
                                  ),
                                })
                              }
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        ))}
                      </article>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        modules: current.modules.map((item) =>
                          item.id === module.id
                            ? {
                                ...item,
                                lessons: [...item.lessons, createEmptyLesson()],
                              }
                            : item,
                        ),
                      }))
                    }
                  >
                    <Plus /> Add lesson
                  </Button>
                </section>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    modules: [...current.modules, createEmptyModule()],
                  }))
                }
              >
                <Plus /> Add module
              </Button>
            </div>
          )}

        </div>

        <footer className="flex flex-col gap-2 border-t border-outline-variant/30 px-5 py-4 sm:flex-row sm:justify-end">
          {!isPublishedCourse ? (
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => saveDraft("draft")}
            >
              <Save /> Save as Draft
            </Button>
          ) : null}
          <Button
            type="button"
            disabled={isSaving}
            onClick={() => saveDraft("published", true)}
          >
            {savingStatus === "published"
              ? isPublishedCourse
                ? "Updating..."
                : "Publishing..."
              : isPublishedCourse
                ? "Update Published Course"
                : "Save & Publish"}
          </Button>
        </footer>
      </section>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-sm rounded-sm bg-surface-container-lowest p-5">
            <h3 className="text-sm font-medium">Discard changes?</h3>
            <p className="mt-2 text-xs font-light leading-6 text-on-surface-variant">
              Unsaved builder changes will be lost.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep editing
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  clearRecoveryDraft();
                  onClose();
                }}
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}

      {recoveredDraft && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-sm rounded-sm border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-2xl">
            <h3 className="text-sm font-medium text-on-surface">
              Restore unsaved course?
            </h3>
            <p className="mt-2 text-xs font-light leading-6 text-on-surface-variant">
              Lumio found an autosaved builder recovery from{" "}
              {new Date(recoveredDraft.savedAt).toLocaleString()}.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  clearRecoveryDraft();
                }}
              >
                Ignore
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setDraft(recoveredDraft.draft);
                  setRecoveredDraft(null);
                  setLastRecoverySaveAt(recoveredDraft.savedAt);
                  showToast({
                    type: "success",
                    title: "Draft Restored",
                    description: "Your unsaved course builder progress is back.",
                  });
                }}
              >
                Restore
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
