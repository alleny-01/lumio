import type {
  CourseDifficulty,
  CourseStatus,
  ResourceKind,
  Tables,
} from "@/shared/types/database";

export interface BuilderResource {
  id: string;
  persistedId?: string;
  title: string;
  resourceKind: ResourceKind;
  file?: File | null;
  fileName?: string;
  filePath?: string;
  externalUrl: string;
}

export interface BuilderLesson {
  id: string;
  persistedId?: string;
  title: string;
  description: string;
  youtubeUrl: string;
  durationMinutes: number;
  coreConcept: string;
  resources: BuilderResource[];
}

export interface BuilderModule {
  id: string;
  persistedId?: string;
  title: string;
  lessons: BuilderLesson[];
}

export interface CourseBuilderDraft {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailFile?: File | null;
  category: string;
  difficulty: CourseDifficulty;
  previewVideoUrl: string;
  status: CourseStatus;
  learningOutcomes?: string[];
  resourceIdsToDelete?: string[];
  modules: BuilderModule[];
}

export interface InstructorCourse extends Tables<"courses"> {
  course_modules?: { count: number }[];
  lessons?: { count: number }[];
}
