import {
  getCourse,
  listPublishedCourseEnrollmentCounts,
  listPublishedCourses,
} from "@/shared/api/courses";
import type { Tables } from "@/shared/types/database";
import type { Course } from "../catalog/types/types";
import type { SortOption } from "../catalog/types/types";
import { COURSE_DETAIL } from "../detail/constants";
import type {
  CourseDetail,
  CourseLesson,
  CourseModule,
  Instructor,
} from "../detail/types/types";
import { courseChapters } from "@/features/viewer/constants";
import type { ResourceItem, ViewerData, ViewerLesson } from "@/features/viewer/types";

const fallbackImage =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

interface CourseWithProfile extends Tables<"courses"> {
  profiles?: Tables<"profiles"> | null;
}

interface LessonRow extends Tables<"lessons"> {
  isCompleted?: boolean;
}

interface ModuleWithLessons extends Tables<"course_modules"> {
  lessons?: LessonRow[] | null;
}

interface DetailCourseRow extends CourseWithProfile {
  course_modules?: ModuleWithLessons[] | null;
  lesson_resources?: Tables<"lesson_resources">[] | null;
}

const NEW_COURSE_WINDOW_DAYS = 14;
const HOT_COURSE_PERCENTILE = 0.1;
const HOT_COURSE_MIN_ENROLLMENTS = 20;

function formatDuration(minutes: number) {
  if (!minutes) return "Self-paced";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins}m`;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

function profileName(profile?: Tables<"profiles"> | null) {
  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ");
  return fullName || profile?.email?.split("@")[0] || "Lumio Instructor";
}

function isNewCourse(publishedAt: string | null) {
  if (!publishedAt) return false;
  const publishedTime = new Date(publishedAt).getTime();
  if (Number.isNaN(publishedTime)) return false;
  const windowMs = NEW_COURSE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - publishedTime <= windowMs;
}

function getHotEnrollmentThreshold(
  rows: Array<Pick<Tables<"courses">, "enrolled_count">>,
) {
  const counts = rows
    .map((row) => row.enrolled_count)
    .filter((count) => count >= HOT_COURSE_MIN_ENROLLMENTS)
    .sort((a, b) => b - a);
  if (!counts.length) return Number.POSITIVE_INFINITY;
  const index = Math.max(0, Math.ceil(counts.length * HOT_COURSE_PERCENTILE) - 1);
  return counts[index] ?? Number.POSITIVE_INFINITY;
}

function toCatalogCourse(course: CourseWithProfile, hotThreshold: number): Course {
  const tags: Course["tags"] = [];
  if (isNewCourse(course.published_at)) tags.push("New");
  if (
    course.enrolled_count >= HOT_COURSE_MIN_ENROLLMENTS &&
    course.enrolled_count >= hotThreshold
  ) {
    tags.push("Hot");
  }

  return {
    id: course.id,
    title: course.title,
    instructor: profileName(course.profiles),
    rating: Number(course.rating || 0),
    reviews: `${course.enrolled_count}`,
    enrolledCount: course.enrolled_count,
    category: course.category,
    difficulty: course.difficulty,
    duration: formatDuration(course.duration_minutes),
    description: course.description,
    imageUrl: course.thumbnail_url ?? fallbackImage,
    imageAlt: `${course.title} thumbnail`,
    tags,
    publishedAt: course.published_at,
  };
}

export async function loadCatalogCourses(params: {
  search: string;
  category: string;
  difficulty: string;
  publishDateSort: SortOption;
  page: number;
  pageSize: number;
}) {
  try {
    const [coursesResult, enrollmentResult] = await Promise.all([
      listPublishedCourses({
        search: params.search || undefined,
        category:
          params.category && params.category !== "All Categories"
            ? params.category
            : undefined,
        difficulty:
          params.difficulty === "all"
            ? undefined
            : (params.difficulty as Course["difficulty"]),
        publishDateSort: params.publishDateSort,
        page: params.page,
        pageSize: params.pageSize,
      }),
      listPublishedCourseEnrollmentCounts(),
    ]);

    if (coursesResult.error) throw coursesResult.error;
    if (enrollmentResult.error) throw enrollmentResult.error;

    const hotThreshold = getHotEnrollmentThreshold(enrollmentResult.data ?? []);
    const catalogList = ((coursesResult.data ?? []) as CourseWithProfile[]).map(
      (course) => toCatalogCourse(course, hotThreshold),
    );
    return {
      courses: catalogList,
      total: coursesResult.count ?? catalogList.length,
      isFallback: false,
    };
  } catch {
    return { courses: [], total: 0, isFallback: false };
  }
}

function toCourseModules(modules: ModuleWithLessons[] = []): CourseModule[] {
  return modules
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((module, index) => {
      const lessons = (module.lessons ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order);
      const duration = lessons.reduce(
        (sum, lesson) => sum + lesson.duration_minutes,
        0,
      );
      const lessonItems: CourseLesson[] = lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        duration: formatDuration(lesson.duration_minutes),
      }));

      return {
        id: module.id,
        number: index + 1,
        title: module.title,
        lessons: lessons.length,
        duration: formatDuration(duration),
        lessonItems,
        isExpanded: index === 0,
      };
    });
}

function toInstructor(profile?: Tables<"profiles"> | null): Instructor {
  return {
    id: profile?.id ?? "instructor",
    name: profileName(profile),
    title: "Lumio Instructor",
    bio:
      profile?.bio ??
      "A Lumio instructor focused on practical, project-led learning.",
    image:
      profile?.avatar_url ??
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    studentsCount: 0,
    yearsExperience: 3,
    rating: 4.8,
  };
}

export async function loadCourseDetail(courseId: string): Promise<CourseDetail> {
  if (/^\d+$/.test(courseId)) return COURSE_DETAIL;

  try {
    const { data, error } = await getCourse(courseId);
    if (error || !data) throw error;
    const course = data as DetailCourseRow;
    const modules = toCourseModules(course.course_modules ?? []);

    let rawOutcomes: string[] = course.learning_outcomes || [];
    if (!rawOutcomes.length) {
      try {
        const cached = localStorage.getItem(`lumio_course_outcomes_${courseId}`);
        if (cached) rawOutcomes = JSON.parse(cached);
      } catch {
        rawOutcomes = [];
      }
    }

    const outcomes = rawOutcomes.length > 0
      ? rawOutcomes.filter((t) => t.trim().length > 0).map((title, idx) => ({ id: `outcome-${idx + 1}`, title }))
      : COURSE_DETAIL.learningOutcomes;

    return {
      id: course.id,
      title: course.title,
      category: course.category,
      rating: Number(course.rating || 0),
      reviews: course.enrolled_count,
      lastUpdated: new Date(course.updated_at).toLocaleDateString(),
      duration: formatDuration(course.duration_minutes),
      description: course.description,
      overview: course.description,
      learningOutcomes: outcomes,
      modules,
      instructor: toInstructor(course.profiles),
      enrolledCount: course.enrolled_count,
      price: 0,
      courseImage: course.thumbnail_url ?? fallbackImage,
      previewVideoUrl: course.preview_video_url,
    };
  } catch {
    return COURSE_DETAIL;
  }
}

const defaultLessonResources: Record<string, ResourceItem[]> = {
  foundations: [
    {
      id: "res-1",
      title: "Lumio-Foundations-Cheatsheet.md",
      fileName: "Lumio-Foundations-Cheatsheet.md",
      fileSize: "Markdown • 18 KB",
      resourceKind: "document",
    },
    {
      id: "res-2",
      title: "System-Architecture-Overview.pdf",
      fileName: "System-Architecture-Overview.pdf",
      fileSize: "PDF • 1.4 MB",
      resourceKind: "document",
    },
  ],
  "tonal-depth": [
    {
      id: "res-3",
      title: "Tonal-Depth-Execution-Guide.pdf",
      fileName: "Tonal-Depth-Execution-Guide.pdf",
      fileSize: "PDF • 2.1 MB",
      resourceKind: "document",
    },
    {
      id: "res-4",
      title: "Surface-Container-Tokens.json",
      fileName: "Surface-Container-Tokens.json",
      fileSize: "JSON • 8 KB",
      resourceKind: "code",
    },
    {
      id: "res-5",
      title: "UI-Palette-Assets.zip",
      fileName: "UI-Palette-Assets.zip",
      fileSize: "ZIP • 4.8 MB",
      resourceKind: "archive",
    },
  ],
  "visual-rhythm": [
    {
      id: "res-6",
      title: "Visual-Rhythm-Design-Specs.pdf",
      fileName: "Visual-Rhythm-Design-Specs.pdf",
      fileSize: "PDF • 3.2 MB",
      resourceKind: "document",
    },
  ],
};

function toViewerLesson(lesson: LessonRow & { resources?: ResourceItem[] }): ViewerLesson {
  const resources = lesson.resources || defaultLessonResources[lesson.id] || [
    {
      id: `res-def-${lesson.id}-1`,
      title: `${lesson.title.replace(/[^a-zA-Z0-9]+/g, "-")}-Notes.md`,
      fileName: `${lesson.title.replace(/[^a-zA-Z0-9]+/g, "-")}-Notes.md`,
      fileSize: "Markdown • 12 KB",
      resourceKind: "document",
    },
    {
      id: `res-def-${lesson.id}-2`,
      title: "Lesson-Summary-Guide.pdf",
      fileName: "Lesson-Summary-Guide.pdf",
      fileSize: "PDF • 1.2 MB",
      resourceKind: "document",
    },
  ];

  return {
    id: lesson.id,
    courseId: lesson.course_id,
    title: lesson.title,
    description: lesson.description ?? "This lesson is ready to watch.",
    youtubeUrl: lesson.youtube_url,
    durationMinutes: lesson.duration_minutes,
    coreConcept:
      lesson.core_concept ??
      "Capture the main idea, then apply it in the next practical step.",
    completed: Boolean(lesson.isCompleted),
    resources,
  };
}

function toResourceItem(resource: Tables<"lesson_resources">): ResourceItem {
  return {
    id: resource.id,
    title: resource.title,
    filePath: resource.file_path ?? undefined,
    externalUrl: resource.external_url ?? undefined,
    fileName: resource.title,
    fileSize: "Downloadable resource",
    resourceKind: resource.resource_kind,
  };
}

export async function loadViewerData(
  courseId: string,
  activeLessonId: string | null,
  completedLessonIds: Set<string>,
): Promise<ViewerData> {
  const { data, error } = await getCourse(courseId);
  if (error || !data) throw error ?? new Error("Unable to load course viewer.");

  const course = data as DetailCourseRow;
  const resourcesByLesson = new Map<string, ResourceItem[]>();
  for (const resource of course.lesson_resources ?? []) {
    if (!resource.lesson_id) continue;
    const current = resourcesByLesson.get(resource.lesson_id) ?? [];
    current.push(toResourceItem(resource));
    resourcesByLesson.set(resource.lesson_id, current);
  }

  const modules = (course.course_modules ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  const lessons = modules.flatMap((module) =>
    (module.lessons ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((lesson) => ({
        ...lesson,
        isCompleted: completedLessonIds.has(lesson.id),
        resources: resourcesByLesson.get(lesson.id) ?? [],
      })),
  );

  if (!lessons.length) {
    throw new Error("This course has no lessons available yet.");
  }

  const activeIndex = Math.max(
    0,
    lessons.findIndex((lesson) => lesson.id === activeLessonId),
  );
  const activeLesson = toViewerLesson(lessons[activeIndex] ?? lessons[0]);
  const nextLesson = lessons[activeIndex + 1]
    ? toViewerLesson(lessons[activeIndex + 1])
    : null;
  const completedCount = lessons.filter((lesson) =>
    completedLessonIds.has(lesson.id),
  ).length;

  return {
    courseTitle: course.title,
    chapters: modules.map((module) => {
      const moduleLessons = (module.lessons ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order);
      return {
        id: module.id,
        title: module.title,
        lessonsLabel: `${moduleLessons.length} lessons`,
        lessons: moduleLessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          durationMinutes: lesson.duration_minutes,
          completed: completedLessonIds.has(lesson.id),
          active: lesson.id === activeLesson.id,
        })),
      };
    }),
    activeLesson,
    nextLesson,
    progressPercent: Math.round((completedCount / lessons.length) * 100),
    completedLessons: completedCount,
    totalLessons: lessons.length,
  };
}

export function buildFallbackViewerData(activeLessonId = "tonal-depth"): ViewerData {
  const demoLessons: LessonRow[] = [
    {
      id: "foundations",
      course_id: "demo-course",
      module_id: "chapter-1",
      title: "Foundations of Lumio",
      description: "Get oriented with the course structure and learning goals.",
      youtube_url: "",
      duration_minutes: 10,
      core_concept: "Clear learning paths make progress visible and motivating.",
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isCompleted: true,
    },
    {
      id: "tonal-depth",
      course_id: "demo-course",
      module_id: "chapter-2",
      title: "Tonal Depth Execution",
      description:
        "Understand how surface hierarchy creates depth without heavy borders.",
      youtube_url: "",
      duration_minutes: 12,
      core_concept:
        "Depth in a learning interface should come from tonal shifts, spacing, and clear hierarchy.",
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isCompleted: false,
    },
    {
      id: "visual-rhythm",
      course_id: "demo-course",
      module_id: "chapter-2",
      title: "Asymmetric Visual Rhythm",
      description: "Use contrast and spacing to keep complex layouts readable.",
      youtube_url: "",
      duration_minutes: 15,
      core_concept:
        "Visual rhythm guides attention by creating intentional pauses and emphasis.",
      sort_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isCompleted: false,
    },
  ];
  const activeIndex = Math.max(
    0,
    demoLessons.findIndex((lesson) => lesson.id === activeLessonId),
  );
  const activeLesson = toViewerLesson(demoLessons[activeIndex] ?? demoLessons[0]);
  const next = demoLessons[activeIndex + 1];

  return {
    courseTitle: "Advanced UI Architecture",
    chapters: courseChapters.map((chapter) => ({
      ...chapter,
      lessons: chapter.lessons.map((lesson) => ({
        ...lesson,
        active: lesson.id === activeLesson.id,
      })),
    })),
    activeLesson,
    nextLesson: next ? toViewerLesson(next) : null,
    progressPercent: 42,
    completedLessons: 6,
    totalLessons: 14,
  };
}

export function getYoutubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    if (host === "youtu.be") {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }
    if (host === "youtube.com" && parsed.pathname === "/watch") {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    if (host === "youtube.com" && parsed.pathname.startsWith("/embed/")) {
      return url;
    }
    return url;
  } catch {
    return url;
  }
}
