import type { Course } from "../types/types";
import type { Category, SortOption } from "../types/types";
import { catalogCategories } from "@/shared/constants/courseOptions";

export const courses: Course[] = [];

export const categories: Category[] = [...catalogCategories];

export const sortOptions: SortOption[] = [
  "default",
  "newest",
  "oldest",
];
