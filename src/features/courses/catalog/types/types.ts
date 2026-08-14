export interface Course {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  reviews: string;
  enrolledCount: number;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  badge?: string;
  badgeColor?: "tertiary" | "secondary";
  tags?: Array<"New" | "Hot">;
  publishedAt?: string | null;
}

export type Category = string;
export type SortOption = "default" | "newest" | "oldest";
