import type { CourseBuilderDraft, BuilderModule } from "./types";
import type { Tables } from "@/shared/types/database";
import { courseCategories } from "@/shared/constants/courseOptions";

export { courseCategories };

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function createEmptyLesson() {
  return {
    id: createId("lesson"),
    title: "Untitled lesson",
    description: "",
    youtubeUrl: "",
    durationMinutes: 0,
    coreConcept: "",
    resources: [],
  };
}

export function createEmptyModule(): BuilderModule {
  return {
    id: createId("module"),
    title: "Untitled module",
    lessons: [createEmptyLesson()],
  };
}

export function createEmptyDraft(): CourseBuilderDraft {
  return {
    title: "",
    description: "",
    thumbnailUrl: "",
    category: courseCategories[0],
    difficulty: "beginner",
    previewVideoUrl: "",
    status: "draft",
    learningOutcomes: ["", "", "", ""],
    modules: [createEmptyModule()],
  };
}

interface LessonWithResources extends Tables<"lessons"> {
  resources?: Tables<"lesson_resources">[];
}

interface ModuleWithLessons extends Tables<"course_modules"> {
  lessons?: LessonWithResources[] | null;
}

export interface CourseWithBuilderRelations extends Tables<"courses"> {
  course_modules?: ModuleWithLessons[] | null;
  lesson_resources?: Tables<"lesson_resources">[] | null;
  learningOutcomes?: string[];
}

export function draftFromCourse(course: CourseWithBuilderRelations): CourseBuilderDraft {
  let storedOutcomes: string[] =
    course.learning_outcomes || course.learningOutcomes || [];
  if (!storedOutcomes.length) {
    try {
      const cached = localStorage.getItem(`lumio_course_outcomes_${course.id}`);
      if (cached) storedOutcomes = JSON.parse(cached);
    } catch {
      storedOutcomes = [];
    }
  }

  const resourceIdsToDelete: string[] = [];
  const modules = draftModulesFromCourse(course, resourceIdsToDelete);

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    thumbnailUrl: course.thumbnail_url ?? "",
    category: course.category,
    difficulty: course.difficulty,
    previewVideoUrl: course.preview_video_url ?? "",
    status: course.status,
    learningOutcomes: storedOutcomes.length > 0 ? storedOutcomes.slice(0, 6) : ["", "", "", ""],
    resourceIdsToDelete,
    modules,
  };
}

function resourceDedupeKey(resource: Tables<"lesson_resources">) {
  return [
    resource.lesson_id ?? "",
    resource.resource_kind,
    resource.title.trim().toLowerCase(),
    resource.file_path ?? "",
    resource.external_url ?? "",
  ].join("|");
}

function draftModulesFromCourse(
  course: CourseWithBuilderRelations,
  resourceIdsToDelete: string[],
): BuilderModule[] {
  const resourcesByLesson = new Map<string, Tables<"lesson_resources">[]>();
  const resourceKeysByLesson = new Map<string, Set<string>>();
  for (const resource of course.lesson_resources ?? []) {
    if (!resource.lesson_id) continue;
    const dedupeKey = resourceDedupeKey(resource);
    const lessonKeys = resourceKeysByLesson.get(resource.lesson_id) ?? new Set();
    if (lessonKeys.has(dedupeKey)) {
      resourceIdsToDelete.push(resource.id);
      continue;
    }
    lessonKeys.add(dedupeKey);
    resourceKeysByLesson.set(resource.lesson_id, lessonKeys);

    const current = resourcesByLesson.get(resource.lesson_id) ?? [];
    current.push(resource);
    resourcesByLesson.set(resource.lesson_id, current);
  }

  const modules = (course.course_modules ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((module) => ({
      id: module.id,
      persistedId: module.id,
      title: module.title,
      lessons: (module.lessons ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((lesson) => ({
          id: lesson.id,
          persistedId: lesson.id,
          title: lesson.title,
          description: lesson.description ?? "",
          youtubeUrl: lesson.youtube_url,
          durationMinutes: lesson.duration_minutes,
          coreConcept: lesson.core_concept ?? "",
          resources: (resourcesByLesson.get(lesson.id) ?? []).map((resource) => ({
            id: resource.id,
            persistedId: resource.id,
            title: resource.title,
            resourceKind: resource.resource_kind,
            file: null,
            fileName: resource.title,
            filePath: resource.file_path ?? "",
            externalUrl: resource.external_url ?? "",
          })),
        })),
    }));

  return modules.length > 0 ? modules : [createEmptyModule()];
}

export function isValidYoutubeUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    const host = url.hostname.replace("www.", "");
    return host === "youtube.com" || host === "youtu.be";
  } catch {
    return false;
  }
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  if (item) next.splice(target, 0, item);
  return next;
}
