export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CourseStatus = "draft" | "saved" | "published";
export type CourseDifficulty = "beginner" | "intermediate" | "advanced";
export type ResourceKind = "document" | "image" | "link" | "archive" | "other";
export type ThemePreference = "light" | "dark" | "system";
export type AuthProvider = "email" | "google";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          date_of_birth: string | null;
          bio: string | null;
          auth_provider: AuthProvider;
          theme_preference: ThemePreference;
          language: "en";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          bio?: string | null;
          auth_provider?: AuthProvider;
          theme_preference?: ThemePreference;
          language?: "en";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          bio?: string | null;
          auth_provider?: AuthProvider;
          theme_preference?: ThemePreference;
          language?: "en";
          updated_at?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          instructor_id: string;
          title: string;
          slug: string;
          description: string;
          learning_outcomes: string[];
          thumbnail_url: string | null;
          category: string;
          difficulty: CourseDifficulty;
          preview_video_url: string | null;
          status: CourseStatus;
          duration_minutes: number;
          rating: number;
          enrolled_count: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          instructor_id: string;
          title: string;
          slug: string;
          description?: string;
          learning_outcomes?: string[];
          thumbnail_url?: string | null;
          category?: string;
          difficulty?: CourseDifficulty;
          preview_video_url?: string | null;
          status?: CourseStatus;
          duration_minutes?: number;
          rating?: number;
          enrolled_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          description?: string;
          learning_outcomes?: string[];
          thumbnail_url?: string | null;
          category?: string;
          difficulty?: CourseDifficulty;
          preview_video_url?: string | null;
          status?: CourseStatus;
          duration_minutes?: number;
          rating?: number;
          enrolled_count?: number;
          published_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      course_modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          sort_order: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          module_id: string;
          title: string;
          description: string | null;
          youtube_url: string;
          duration_minutes: number;
          core_concept: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          module_id: string;
          title: string;
          description?: string | null;
          youtube_url: string;
          duration_minutes?: number;
          core_concept?: string | null;
          sort_order: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          youtube_url?: string;
          duration_minutes?: number;
          core_concept?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      lesson_resources: {
        Row: {
          id: string;
          course_id: string;
          lesson_id: string | null;
          title: string;
          file_path: string | null;
          external_url: string | null;
          resource_kind: ResourceKind;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          lesson_id?: string | null;
          title: string;
          file_path?: string | null;
          external_url?: string | null;
          resource_kind?: ResourceKind;
          created_at?: string;
        };
        Update: {
          title?: string;
          file_path?: string | null;
          external_url?: string | null;
          resource_kind?: ResourceKind;
        };
        Relationships: [];
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          progress_percent: number;
          completed_at: string | null;
          last_watched_lesson_id: string | null;
          last_watched_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          progress_percent?: number;
          completed_at?: string | null;
          last_watched_lesson_id?: string | null;
          last_watched_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          progress_percent?: number;
          completed_at?: string | null;
          last_watched_lesson_id?: string | null;
          last_watched_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          lesson_id: string;
          is_completed: boolean;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          lesson_id: string;
          is_completed?: boolean;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          is_completed?: boolean;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      study_activity: {
        Row: {
          id: string;
          user_id: string;
          activity_date: string;
          minutes_studied: number;
          lessons_completed: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_date: string;
          minutes_studied?: number;
          lessons_completed?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          minutes_studied?: number;
          lessons_completed?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      course_status: CourseStatus;
      course_difficulty: CourseDifficulty;
      resource_kind: ResourceKind;
      theme_preference: ThemePreference;
      auth_provider: AuthProvider;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
